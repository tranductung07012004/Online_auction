package com.service.main.scheduler;

import com.service.main.entity.Order;
import com.service.main.entity.OrderPayment;
import com.service.main.entity.Product;
import com.service.main.repository.OrderPaymentRepository;
import com.service.main.repository.OrderRepository;
import com.service.main.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuctionEndScheduler {
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderPaymentRepository orderPaymentRepository;

    /**
     * Check for ended auctions every 5 seconds (for testing)
     * Change to 60000 (1 minute) in production
     */
    @Scheduled(fixedRate = 60000) // Run every 1 minute
    @Transactional
    public void processEndedAuctions() {
        log.info("Checking for ended auctions...");
        
        OffsetDateTime now = OffsetDateTime.now();
        
        // Find all products that have ended and have a winner (top bidder)
        List<Product> endedProducts = productRepository.findEndedProductsWithWinner(now);
        
        if (endedProducts.isEmpty()) {
            log.debug("No ended auctions to process");
            return;
        }
        
        log.info("Found {} ended auctions to process", endedProducts.size());
        
        for (Product product : endedProducts) {
            try {
                // Query already filters products without orders, so we can directly create order
                Order order = Order.builder()
                        .productId(product.getId())
                        .buyerId(product.getTopBidderId())
                        .sellerId(product.getSellerId())
                        .amount(product.getCurrentPrice())
                        .createdAt(now)
                        .isCancelled(false)
                        .build();
                
                order = orderRepository.save(order);
                
                // Create payment record with PENDING status
                OrderPayment payment = OrderPayment.builder()
                        .orderId(order.getId())
                        .amount(order.getAmount())
                        .paymentStatus("PENDING")
                        .paymentMethod("BANK_TRANSFER")
                        .build();
                orderPaymentRepository.save(payment);
                
                log.info("Created order {} for product {} (seller: {}, buyer: {}, amount: {})",
                        order.getId(), product.getId(), product.getSellerId(), product.getTopBidderId(), product.getCurrentPrice());
                
                // TODO: Send notification emails to buyer and seller
                // sendAuctionEndNotification(product, order);
            } catch (Exception e) {
                log.error("Error processing ended auction for product {}: {}", product.getId(), e.getMessage(), e);
            }
        }
    }
    
    /**
     * Send email notifications when auction ends
     * This method will be implemented when email service is ready
     */
    private void sendAuctionEndNotification(Product product, Order order) {
        // TODO: Implement email notification
        // - Notify seller that auction ended
        // - Notify winner to proceed with payment
        // - Notify other bidders that they didn't win
    }
}
