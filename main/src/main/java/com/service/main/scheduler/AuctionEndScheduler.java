package com.service.main.scheduler;

import com.service.main.constants.KafkaEventTypes;
import com.service.main.constants.KafkaTopics;
import com.service.main.dto.ProductEndedEvent;
import com.service.main.dto.UserEmailItemResponse;
import com.service.main.entity.Order;
import com.service.main.entity.OrderPayment;
import com.service.main.entity.Product;
import com.service.main.repository.OrderPaymentRepository;
import com.service.main.repository.OrderRepository;
import com.service.main.repository.ProductRepository;
import com.service.main.service.KafkaProducerService;
import com.service.main.service.UserServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuctionEndScheduler {
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderPaymentRepository orderPaymentRepository;
    private final KafkaProducerService kafkaProducerService;
    private final UserServiceClient userServiceClient;

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
        List<Product> endedProductsWithWinner = this.productRepository.findEndedProductsWithWinner(now);
        
        // Find all products that have ended but have no winner (no bids)
        List<Product> endedProductsWithoutWinner = this.productRepository.findEndedProductsWithoutWinner(now);
        
        if (endedProductsWithWinner.isEmpty() && endedProductsWithoutWinner.isEmpty()) {
            log.debug("No ended auctions to process");
            return;
        }
        
        log.info("Found {} ended auctions with winner and {} ended auctions without winner to process", 
                endedProductsWithWinner.size(), endedProductsWithoutWinner.size());
        
        // Process products with winner - create order and send event
        for (Product product : endedProductsWithWinner) {
            try {
                Order order = Order.builder()
                        .productId(product.getId())
                        .buyerId(product.getTopBidderId())
                        .sellerId(product.getSellerId())
                        .amount(product.getCurrentPrice())
                        .createdAt(now)
                        .isCancelled(false)
                        .build();
                
                order = this.orderRepository.save(order);
                
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
                
                // Get user emails
                List<Long> userIds = new ArrayList<>();
                userIds.add(product.getSellerId());
                if (product.getTopBidderId() != null) {
                    userIds.add(product.getTopBidderId());
                }
                
                List<UserEmailItemResponse> emailResponses = userServiceClient.getUserEmails(userIds);
                Map<Long, String> emailMap = emailResponses.stream()
                        .collect(Collectors.toMap(UserEmailItemResponse::getUserId, UserEmailItemResponse::getEmail));
                
                // Send event to worker after successfully creating order
                ProductEndedEvent event = ProductEndedEvent.builder()
                        .sellerId(product.getSellerId())
                        .topBidderId(product.getTopBidderId())
                        .currentPrice(product.getCurrentPrice())
                        .sellerEmail(emailMap.get(product.getSellerId()))
                        .topBidderEmail(product.getTopBidderId() != null ? emailMap.get(product.getTopBidderId()) : null)
                        .endAt(product.getEndAt())
                        .build();
                
                kafkaProducerService.sendMessage(
                        KafkaTopics.BIDDING_PROCESS_SIDE_EVENT,
                        KafkaEventTypes.PRODUCT_ENDED_SECTION,
                        event
                );
                
                log.info("Sent PRODUCT_ENDED_SECTION event for product {} with winner", product.getId());
                
            } catch (Exception e) {
                log.error("Error processing ended auction for product {}: {}", product.getId(), e.getMessage(), e);
            }
        }
        
        // Process products without winner - send event only (no order created)
        for (Product product : endedProductsWithoutWinner) {
            try {
                // Get seller email
                List<Long> userIds = List.of(product.getSellerId());
                List<UserEmailItemResponse> emailResponses = userServiceClient.getUserEmails(userIds);
                Map<Long, String> emailMap = emailResponses.stream()
                        .collect(Collectors.toMap(UserEmailItemResponse::getUserId, UserEmailItemResponse::getEmail));
                
                // Send event to worker for products without winner
                ProductEndedEvent event = ProductEndedEvent.builder()
                        .sellerId(product.getSellerId())
                        .topBidderId(null)
                        .currentPrice(product.getCurrentPrice() != null ? product.getCurrentPrice() : product.getStartPrice())
                        .sellerEmail(emailMap.get(product.getSellerId()))
                        .topBidderEmail(null)
                        .endAt(product.getEndAt())
                        .build();
                
                kafkaProducerService.sendMessage(
                        KafkaTopics.BIDDING_PROCESS_SIDE_EVENT,
                        KafkaEventTypes.PRODUCT_ENDED_SECTION,
                        event
                );
                
                log.info("Sent PRODUCT_ENDED_SECTION event for product {} without winner", product.getId());
            } catch (Exception e) {
                log.error("Error processing ended auction without winner for product {}: {}", product.getId(), e.getMessage(), e);
            }
        }
    }
    
}
