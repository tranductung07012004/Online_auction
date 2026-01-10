package com.service.worker.service.impl;

import com.service.worker.dto.BlackListEvent;
import com.service.worker.dto.ProductCurrentPriceUpdatedEvent;
import com.service.worker.dto.ProductEndedEvent;
import com.service.worker.service.NotifyBiddingService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class NotifyBiddingServiceImpl implements NotifyBiddingService {

    private static final Logger logger = LoggerFactory.getLogger(NotifyBiddingServiceImpl.class);

    @Value("${frontend.base-url}")
    private String frontendBaseUrl;

    private final JavaMailSender mailSender;

    @Override
    public void notifyBiddingPriceChange(ProductCurrentPriceUpdatedEvent event) {
        Long productId = event.getProductId();
        BigDecimal newCurrentPrice = event.getNewCurrentPrice();
        String productLink = String.format("%s/product-page/%d", frontendBaseUrl, productId);

        // 1. Gửi email cho seller
        if (event.getSellerEmail() != null && !event.getSellerEmail().trim().isEmpty()) {
            sendEmailToSeller(event.getSellerEmail(), productId, newCurrentPrice, productLink);
        }

        // 2. Gửi email cho userCreateBidId
        if (event.getUserCreateBidEmail() != null && !event.getUserCreateBidEmail().trim().isEmpty()) {
            sendEmailToBidder(event.getUserCreateBidEmail(), productId, newCurrentPrice, productLink);
        }

        // 3. Gửi email cho oldTopBidder (nếu cần)
        if (event.getOldTopBidderId() != null 
                && event.getOldTopBidderEmail() != null 
                && !event.getOldTopBidderEmail().trim().isEmpty()
                && !event.getOldTopBidderId().equals(event.getNewTopBidderId())) {
            String newTopBidderMaskedEmail = maskEmail(event.getUserCreateBidEmail());
            sendEmailToOldTopBidder(
                    event.getOldTopBidderEmail(), 
                    productId, 
                    newTopBidderMaskedEmail, 
                    productLink
            );
        }
    }

    private void sendEmailToSeller(String sellerEmail, Long productId, BigDecimal newPrice, String productLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(sellerEmail);
            message.setSubject("Your Product Price Has Changed");
            message.setText(String.format(
                    "Hello,\n\n" +
                    "Your product (ID: %d) has a new price.\n\n" +
                    "New price: %s\n\n" +
                    "View product details at: %s\n\n" +
                    "Best regards,\n" +
                    "Tung Tran Online Auction",
                    productId, newPrice, productLink
            ));
            
            mailSender.send(message);
            logger.info("Price change notification email sent to seller: {} for productId: {}", sellerEmail, productId);
        } catch (Exception e) {
            logger.error("Failed to send price change notification email to seller: {} for productId: {}", 
                    sellerEmail, productId, e);
        }
    }

    private void sendEmailToBidder(String bidderEmail, Long productId, BigDecimal newPrice, String productLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(bidderEmail);
            message.setSubject("Your Bid Was Successfully Placed");
            message.setText(String.format(
                    "Hello,\n\n" +
                    "Your bid has been successfully placed for product (ID: %d).\n\n" +
                    "New price: %s\n\n" +
                    "View product details at: %s\n\n" +
                    "Best regards,\n" +
                    "Tung Tran Online Auction",
                    productId, newPrice, productLink
            ));
            
            mailSender.send(message);
            logger.info("Bid success notification email sent to bidder: {} for productId: {}", bidderEmail, productId);
        } catch (Exception e) {
            logger.error("Failed to send bid success notification email to bidder: {} for productId: {}", 
                    bidderEmail, productId, e);
        }
    }

    private void sendEmailToOldTopBidder(String oldTopBidderEmail, Long productId, String newTopBidderMaskedEmail, String productLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(oldTopBidderEmail);
            message.setSubject("You Are No Longer the Top Bidder");
            message.setText(String.format(
                    "Hello,\n\n" +
                    "A user with email %s has become the new top bidder for product (ID: %d).\n\n" +
                    "You are no longer the top bidder.\n\n" +
                    "View product details at: %s\n\n" +
                    "Best regards,\n" +
                    "Tung Tran Online Auction",
                    newTopBidderMaskedEmail, productId, productLink
            ));
            
            mailSender.send(message);
            logger.info("Top bidder change notification email sent to old top bidder: {} for productId: {}", 
                    oldTopBidderEmail, productId);
        } catch (Exception e) {
            logger.error("Failed to send top bidder change notification email to old top bidder: {} for productId: {}", 
                    oldTopBidderEmail, productId, e);
        }
    }

    @Override
    public void notifyBlackList(BlackListEvent event) {
        if (event.getBidderEmail() == null || event.getBidderEmail().trim().isEmpty()) {
            logger.warn("Bidder email is null or empty for productId: {}, bidderId: {}. Skipping email notification.",
                    event.getProductId(), event.getBidderId());
            return;
        }

        Long productId = event.getProductId();
        String productLink = String.format("%s/product-page/%d", frontendBaseUrl, productId);
        
        sendBlackListNotificationEmail(event.getBidderEmail(), productId, productLink);
    }

    private void sendBlackListNotificationEmail(String bidderEmail, Long productId, String productLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(bidderEmail);
            message.setSubject("Your Bid Has Been Rejected");
            message.setText(String.format(
                    "Hello,\n\n" +
                    "We regret to inform you that your bid for product (ID: %d) has been rejected by the seller.\n\n" +
                    "You have been blocked from placing bids on this product, and can never bid on it from now on.\n\n" +
                    "View product details at: %s\n\n" +
                    "If you have any questions, please contact our support team.\n\n" +
                    "Best regards,\n" +
                    "Tung Tran Online Auction",
                    productId, productLink
            ));
            
            mailSender.send(message);
            logger.info("Black list notification email sent to bidder: {} for productId: {}", bidderEmail, productId);
        } catch (Exception e) {
            logger.error("Failed to send black list notification email to bidder: {} for productId: {}", 
                    bidderEmail, productId, e);
        }
    }

    @Override
    public void notifyProductEnded(ProductEndedEvent event) {
        // Send email to seller
        if (event.getSellerEmail() != null && !event.getSellerEmail().trim().isEmpty()) {
            sendProductEndedEmailToSeller(event);
        }

        // Send email to winner (top bidder) if exists
        if (event.getTopBidderId() != null 
                && event.getTopBidderEmail() != null 
                && !event.getTopBidderEmail().trim().isEmpty()) {
            sendProductEndedEmailToWinner(event);
        }
    }

    private void sendProductEndedEmailToSeller(ProductEndedEvent event) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(event.getSellerEmail());
            message.setSubject("Your Auction Has Ended");

            String myProductsLink = String.format("%s/my-products", frontendBaseUrl);

            String emailText;
            if (event.getTopBidderId() != null) {
                // Auction ended with winner
                emailText = String.format(
                        "Hello,\n\n" +
                        "Your auction has ended successfully!\n\n" +
                        "Final price: %s\n" +
                        "The winner will proceed with payment. You will be notified once payment is confirmed.\n\n" +
                        "View your products at: %s\n\n" +
                        "Best regards,\n" +
                        "Tung Tran Online Auction",
                        event.getCurrentPrice(), myProductsLink
                );
            } else {
                // Auction ended without bids
                emailText = String.format(
                        "Hello,\n\n" +
                        "Your auction has ended, but unfortunately there were no bids placed.\n\n" +
                        "Starting price: %s\n\n" +
                        "View your products at: %s\n\n" +
                        "Best regards,\n" +
                        "Tung Tran Online Auction",
                        event.getCurrentPrice(), myProductsLink
                );
            }

            message.setText(emailText);
            mailSender.send(message);
            logger.info("Product ended notification email sent to seller: {} for sellerId: {}",
                    event.getSellerEmail(), event.getSellerId());
        } catch (Exception e) {
            logger.error("Failed to send product ended notification email to seller: {} for sellerId: {}",
                    event.getSellerEmail(), event.getSellerId(), e);
        }
    }

    private void sendProductEndedEmailToWinner(ProductEndedEvent event) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(event.getTopBidderEmail());
            message.setSubject("Congratulations! You Won the Auction");
            
            String orderHistoryLink = String.format("%s/order-history", frontendBaseUrl);
            
            message.setText(String.format(
                    "Hello,\n\n" +
                    "Congratulations! You are the winner of this auction!\n\n" +
                    "Winning price: %s\n\n" +
                    "Please proceed with payment to complete your purchase. You can view your order and payment details in your account.\n\n" +
                    "View your order history at: %s\n\n" +
                    "Best regards,\n" +
                    "Tung Tran Online Auction",
                    event.getCurrentPrice(), orderHistoryLink
            ));

            mailSender.send(message);
            logger.info("Product ended winner notification email sent to topBidder: {} for topBidderId: {}",
                    event.getTopBidderEmail(), event.getTopBidderId());
        } catch (Exception e) {
            logger.error("Failed to send product ended winner notification email to topBidder: {} for topBidderId: {}",
                    event.getTopBidderEmail(), event.getTopBidderId(), e);
        }
    }

    private String maskEmail(String email) {
        if (email == null || email.isEmpty()) {
            return "***";
        }
        
        int atIndex = email.indexOf('@');
        if (atIndex <= 0) {
            return "***";
        }
        
        String localPart = email.substring(0, atIndex);
        String domain = email.substring(atIndex);
        
        if (localPart.length() <= 3) {
            // If email is short, show first character and mask the rest
            return localPart.charAt(0) + "***" + domain;
        } else {
            // Show first 3 characters, mask the rest before @
            return localPart.substring(0, 3) + "***" + domain;
        }
    }
}
