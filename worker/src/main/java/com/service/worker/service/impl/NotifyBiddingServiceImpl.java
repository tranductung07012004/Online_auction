package com.service.worker.service.impl;

import com.service.worker.dto.BlackListEvent;
import com.service.worker.dto.CreateAnswerEvent;
import com.service.worker.dto.CreateQuestionEvent;
import com.service.worker.dto.ProductCurrentPriceUpdatedEvent;
import com.service.worker.dto.ProductEndedEvent;
import com.service.worker.dto.UpdateProductDescriptionEvent;
import com.service.worker.dto.UserEmailItemResponse;
import com.service.worker.service.NotifyBiddingService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

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

    @Override
    public void notifyQuestionCreated(CreateQuestionEvent event) {
        if (event.getSellerEmail() == null || event.getSellerEmail().trim().isEmpty()) {
            logger.warn("Seller email is null or empty for productId: {}. Skipping email notification.",
                    event.getProductId());
            return;
        }

        Long productId = event.getProductId();
        String productLink = String.format("%s/product-page/%d", frontendBaseUrl, productId);
        String maskedBidderEmail = maskEmail(event.getBidderEmail());

        sendQuestionCreatedEmailToSeller(event.getSellerEmail(), productId, event.getContent(), maskedBidderEmail, productLink);
    }

    private void sendQuestionCreatedEmailToSeller(String sellerEmail, Long productId, String questionContent, String maskedBidderEmail, String productLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(sellerEmail);
            message.setSubject("New Question on Your Product");
            message.setText(String.format(
                    "Hello,\n\n" +
                    "You have received a new question on your product.\n\n" +
                    "Question: %s\n\n" +
                    "Asked by: %s\n\n" +
                    "View product details at: %s\n\n" +
                    "Best regards,\n" +
                    "Tung Tran Online Auction",
                    questionContent, maskedBidderEmail, productLink
            ));

            mailSender.send(message);
            logger.info("Question created notification email sent to seller: {} for productId: {}", sellerEmail, productId);
        } catch (Exception e) {
            logger.error("Failed to send question created notification email to seller: {} for productId: {}",
                    sellerEmail, productId, e);
        }
    }

    @Override
    public void notifyAnswerCreated(CreateAnswerEvent event) {
        if (event.getUsers() == null || event.getUsers().isEmpty()) {
            logger.warn("User list is empty for productId: {}. Skipping email notification.",
                    event.getProductId());
            return;
        }

        Long productId = event.getProductId();
        String productLink = String.format("%s/product-page/%d", frontendBaseUrl, productId);
        String maskedSellerFullname = maskFullname(event.getSellerFullname());

        for (UserEmailItemResponse user : event.getUsers()) {
            if (user.getEmail() != null && !user.getEmail().trim().isEmpty()) {
                sendAnswerCreatedEmailToUser(user.getEmail(), productId, productLink, maskedSellerFullname, event.getContent());
            }
        }
    }

    private void sendAnswerCreatedEmailToUser(String userEmail, Long productId, String productLink, String maskedSellerFullname, String answerContent) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(userEmail);
            message.setSubject("Seller has replied to a question");
            message.setText(String.format(
                    "Hello,\n\n" +
                    "The seller (%s) has replied to a question.\n\n" +
                    "Answer: %s\n\n" +
                    "View product details at: %s\n\n" +
                    "Best regards,\n" +
                    "Tung Tran Online Auction",
                    maskedSellerFullname, productId, answerContent, productLink
            ));

            mailSender.send(message);
            logger.info("Answer created notification email sent to user: {} for productId: {}", userEmail, productId);
        } catch (Exception e) {
            logger.error("Failed to send answer created notification email to user: {} for productId: {}",
                    userEmail, productId, e);
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

    /**
     * Masks the fullname by masking some characters of each word
     * Example: "nguyen van aabcc" -> "nguy*e v** a**cc"
     * @param fullname fullname to mask (can be null)
     */
    private String maskFullname(String fullname) {
        if (fullname == null || fullname.trim().isEmpty()) {
            return "**";
        }
        
        String trimmed = fullname.trim();
        if (trimmed.isEmpty()) {
            return "**";
        }
        
        // Split by spaces to get words
        String[] words = trimmed.split("\\s+");
        StringBuilder masked = new StringBuilder();
        
        for (int i = 0; i < words.length; i++) {
            if (i > 0) {
                masked.append(" ");
            }
            masked.append(maskWord(words[i]));
        }
        
        return masked.toString();
    }
    
    /**
     * Masks a single word by keeping some characters at the beginning and end,
     * masking the middle part with *
     * @param word the word to mask
     * @return masked word
     */
    private String maskWord(String word) {
        if (word == null || word.isEmpty()) {
            return "**";
        }
        
        int length = word.length();
        
        if (length <= 2) {
            // If word is too short, mask completely
            return "**";
        } else if (length == 3) {
            // Keep first character, mask the rest
            return word.charAt(0) + "**";
        } else if (length == 4) {
            // Keep first 2 characters, mask 1, keep last 1
            return word.substring(0, 2) + "*" + word.charAt(length - 1);
        } else if (length == 5) {
            // Keep first 1 character, mask 2, keep last 2
            return word.charAt(0) + "**" + word.substring(length - 2);
        } else {
            // For longer words: keep first 4 characters, mask middle, keep last 1-2 characters
            int keepStart = 4;
            int keepEnd = length >= 7 ? 2 : 1;
            int maskLength = length - keepStart - keepEnd;
            
            StringBuilder masked = new StringBuilder();
            masked.append(word.substring(0, keepStart));
            for (int i = 0; i < maskLength; i++) {
                masked.append("*");
            }
            masked.append(word.substring(length - keepEnd));
            
            return masked.toString();
        }
    }

    @Override
    public void notifyProductDescriptionUpdated(UpdateProductDescriptionEvent event) {
        if (event.getTopBidderEmail() == null || event.getTopBidderEmail().trim().isEmpty()) {
            logger.warn("TopBidder email is null or empty for productId: {}. Skipping email notification in worker",
                    event.getProductId());
            return;
        }

        Long productId = event.getProductId();
        String productLink = String.format("%s/product-page/%d", frontendBaseUrl, productId);
        
        sendProductDescriptionUpdatedEmailToTopBidder(
                event.getTopBidderEmail(),
                event.getProductName(),
                event.getContent(),
                event.getCreatedAt(),
                productId,
                productLink
        );
    }

    private void sendProductDescriptionUpdatedEmailToTopBidder(
            String topBidderEmail,
            String productName,
            String descriptionContent,
            OffsetDateTime createdAt,
            Long productId,
            String productLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(topBidderEmail);
            helper.setSubject("New Description Added to Product You're Bidding On");
            
            // Format createdAt date
            String formattedDate = createdAt != null 
                    ? createdAt.toString() 
                    : "recently";
            
            // Build HTML content - descriptionContent from event payload will be rendered as HTML
            String htmlContent = String.format(
                    "<html><body style=\"font-family: Arial, sans-serif; line-height: 1.6; color: #333;\">" +
                    "<p>Hello,</p>" +
                    "<p><strong>%s</strong> has new description:</p>" +
                    "<div style=\"background-color: #f5f5f5; padding: 15px; border-left: 4px solid #007bff; margin: 15px 0;\">%s</div>" +
                    "<p><strong>Updated at:</strong> %s</p>" +
                    "<p><a href=\"%s\" style=\"display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;\">View product details</a></p>" +
                    "<p>Best regards,<br>Tung Tran Online Auction</p>" +
                    "</body></html>",
                    escapeHtml(productName), descriptionContent, formattedDate, productLink
            );
            
            helper.setText(htmlContent, true); // true = HTML mode
            
            mailSender.send(message);
            logger.info("Product description updated notification email sent to topBidder: {} for productId: {}",
                    topBidderEmail, productId);
        } catch (Exception e) {
            logger.error("Failed to send product description updated notification email to topBidder: {} for productId: {}",
                    topBidderEmail, productId, e);
        }
    }

    /**
     * Escape HTML special characters to prevent XSS attacks
     * Only escape productName, not descriptionContent (which should be HTML)
     */
    private String escapeHtml(String text) {
        if (text == null) {
            return "";
        }
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&#39;");
    }
}
