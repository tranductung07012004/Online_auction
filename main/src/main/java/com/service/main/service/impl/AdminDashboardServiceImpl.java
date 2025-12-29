package com.service.main.service.impl;

import com.service.main.dto.AdminDashboardStats;
import com.service.main.dto.RecentProductDTO;
import com.service.main.entity.Product;
import com.service.main.repository.CategoriesRepository;
import com.service.main.repository.ProductRepository;
import com.service.main.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final ProductRepository productRepo;
    private final CategoriesRepository categoriesRepo;

    @Override
    public AdminDashboardStats getDashboardStats() {
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime endingSoon = now.plusHours(24);
        OffsetDateTime startOfToday = now.toLocalDate().atStartOfDay(now.getOffset()).toOffsetDateTime();
        OffsetDateTime startOfWeek = now.minusDays(7);

        // Product/Auction stats
        long totalProducts = productRepo.count();
        long activeAuctions = productRepo.countActiveAuctions(now);
        long endedAuctions = productRepo.countEndedAuctions(now);
        long endingSoonAuctions = productRepo.countEndingSoonAuctions(now, endingSoon);

        // Bidding stats
        long totalBids = productRepo.sumTotalBids();
        BigDecimal highestCurrentPrice = productRepo.findHighestCurrentPrice(now);
        BigDecimal averageStartPrice = productRepo.findAverageStartPrice();

        // Category stats
        long totalCategories = categoriesRepo.count();
        List<AdminDashboardStats.CategoryProductCount> topCategories = getTopCategories(5);

        // Recent activity
        long newProductsToday = productRepo.countProductsCreatedAfter(startOfToday);
        long newProductsThisWeek = productRepo.countProductsCreatedAfter(startOfWeek);

        return AdminDashboardStats.builder()
                .totalProducts(totalProducts)
                .activeAuctions(activeAuctions)
                .endedAuctions(endedAuctions)
                .endingSoonAuctions(endingSoonAuctions)
                .totalBids(totalBids)
                .highestCurrentPrice(highestCurrentPrice)
                .averageStartPrice(averageStartPrice)
                .totalCategories(totalCategories)
                .topCategories(topCategories)
                .newProductsToday(newProductsToday)
                .newProductsThisWeek(newProductsThisWeek)
                .build();
    }

    @Override
    public List<RecentProductDTO> getRecentProducts(int limit) {
        OffsetDateTime now = OffsetDateTime.now();
        List<Product> recentProducts = productRepo.findTop10ByOrderByCreatedAtDesc();

        return recentProducts.stream()
                .limit(limit)
                .map(product -> RecentProductDTO.builder()
                        .id(product.getId())
                        .productName(product.getProductName())
                        .thumbnailUrl(product.getThumbnailUrl())
                        .startPrice(product.getStartPrice())
                        .currentPrice(product.getCurrentPrice())
                        .sellerId(product.getSellerId())
                        .bidCount(product.getBidCount())
                        .endAt(product.getEndAt())
                        .createdAt(product.getCreatedAt())
                        .isActive(product.getEndAt().isAfter(now))
                        .build())
                .collect(Collectors.toList());
    }

    private List<AdminDashboardStats.CategoryProductCount> getTopCategories(int limit) {
        List<Object[]> results = categoriesRepo.findTopCategoriesByProductCount(limit);
        List<AdminDashboardStats.CategoryProductCount> topCategories = new ArrayList<>();

        for (Object[] row : results) {
            Integer categoryId = ((Number) row[0]).intValue();
            String categoryName = (String) row[1];
            long productCount = ((Number) row[2]).longValue();

            topCategories.add(AdminDashboardStats.CategoryProductCount.builder()
                    .categoryId(categoryId)
                    .categoryName(categoryName)
                    .productCount(productCount)
                    .build());
        }

        return topCategories;
    }
}
