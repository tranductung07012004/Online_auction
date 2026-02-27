package com.service.product.service.impl;

import com.service.common.dto.UserEmailResponse;
import com.service.common.dto.UserInfo;
import com.service.product.entity.AutoBidInProduct;
import com.service.common.constants.ErrorCodes;
import com.service.common.constants.KafkaEventTypes;
import com.service.common.constants.KafkaTopics;
import com.service.product.entity.CategoriesInProduct;
import com.service.common.exception.ApplicationException;
import com.service.product.dto.product.event.ProductCreatedEvent;
import com.service.product.dto.product.event.UpdateProductDescriptionEvent;
import com.service.product.dto.product.request.AddProductDescriptionRequest;
import com.service.product.dto.product.request.createProductRequest;
import com.service.product.dto.product.response.ProductResponse;
import com.service.product.entity.*;
import com.service.product.repository.AutoBidRepositoryInProduct;
import com.service.product.repository.CategoriesRepositoryInProduct;
import com.service.product.repository.ProductDescriptionRepository;
import com.service.product.repository.ProductRepositoryInProduct;
import com.service.product.repository.ProductSyncEsLimitRepositoryInProduct;
import com.service.product.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;


import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import com.service.common.utils.CharacterUtils;
import com.service.common.utils.FormatUserDto;

import com.service.integration.messaging.KafkaProducerService;
import com.service.integration.userclient.UserServiceClient;


@Service
public class ProductProductServiceImpl implements ProductService {

    private static final Logger logger = LoggerFactory.getLogger(ProductProductServiceImpl.class);

    private final ProductRepositoryInProduct productRepository;
    private final CategoriesRepositoryInProduct categoriesRepository;
    private final UserServiceClient userServiceClient;
    private final AutoBidRepositoryInProduct autoBidRepository;
    private final ProductDescriptionRepository productDescriptionRepository;
    private final KafkaProducerService kafkaProducerService;
    private final ProductSyncEsLimitRepositoryInProduct productSyncEsLimitRepository;

    public ProductProductServiceImpl(
            ProductRepositoryInProduct proRepo,
            CategoriesRepositoryInProduct cateRepo,
            UserServiceClient uSClient,
            AutoBidRepositoryInProduct abRepo,
            ProductDescriptionRepository pDRepo,
            KafkaProducerService kPService,
            ProductSyncEsLimitRepositoryInProduct pSERepo) {
        this.productRepository = proRepo;
        this.kafkaProducerService = kPService;
        this.productDescriptionRepository = pDRepo;
        this.userServiceClient = uSClient;
        this.autoBidRepository = abRepo;
        this.productSyncEsLimitRepository = pSERepo;
        this.categoriesRepository = cateRepo;
    }

    @Override
    public Page<ProductResponse> getProductsByCategory(Integer categoryId, Pageable pageable) {
        Page<ProductInProduct> productPage = productRepository.findByCategoryId(categoryId, pageable);
        return productPage.map(this::mapToProductResponse);
    }

    @Override
    public Page<ProductResponse> getActiveProductsBySellerId(Long sellerId, Pageable pageable) {
        OffsetDateTime now = OffsetDateTime.now();
        Page<ProductInProduct> productPage = this.productRepository.findActiveWithFilters(now, null, sellerId, pageable);
        return productPage.map(this::mapToProductResponse);
    }

    @Override
    public Page<ProductResponse> getEndedProductsBySellerId(Long sellerId, Pageable pageable) {
        OffsetDateTime now = OffsetDateTime.now();
        Page<ProductInProduct> productPage = this.productRepository.findEndedWithFilters(now, null, sellerId, pageable);
        return productPage.map(this::mapToProductResponse);
    }

    @Override
    public Page<ProductResponse> getProductsBySellerId(Long sellerId, Pageable pageable) {
        Page<ProductInProduct> productPage = this.productRepository.findBySellerIdOrderByCreatedAtDesc(sellerId, pageable);
        return productPage.map(this::mapToProductResponse);
    }

    @Override
    public void createProduct(createProductRequest request) {
        validatePrices(request);

        OffsetDateTime now = OffsetDateTime.now();

        Set<Integer> distinctCategoryIds = new LinkedHashSet<>(request.getCategoryIds());
        List<Integer> distinctCategoriesForEvent = new ArrayList<>();
        List<CategoriesInProduct> categories = this.categoriesRepository.findAllById(distinctCategoryIds);
        if (categories.size() != distinctCategoryIds.size()) {
            throw new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "One or more categories do not exist");
        }

        ProductInProduct product = buildProduct(request, now);

        // build description
        ProductDescriptionInProduct description = ProductDescriptionInProduct.builder()
                .content(request.getDescriptionContent().trim())
                .product(product)
                .createdAt(now)
                .createdBy(request.getSellerId())
                .build();

        //product.setDescriptions(new ArrayList<>());
        product.getDescriptions().add(description);

        // build pictures
        // product.setPictures(new ArrayList<>());
        List<String> reqPictureUrls = request.getPictureUrls();
        if (reqPictureUrls != null) {
            for (String url : reqPictureUrls) {
                ProductPictureInProduct picture = ProductPictureInProduct.builder()
                        .imageUrl(url)
                        .product(product)
                        .createdAt(now)
                        .build();
                product.getPictures().add(picture);
            }
        }

        // build product-category links
        for (CategoriesInProduct category : categories) {
            // Xu li de gui event only
            distinctCategoriesForEvent.add(category.getId());


            ProductCategoryInProduct pc = new ProductCategoryInProduct();
            pc.setProduct(product);
            pc.setCategory(category);
            pc.setCreatedAt(now);

            product.getProductCategories().add(pc);
        }

        ProductInProduct savedProduct = this.productRepository.save(product);

        ProductSyncEsLimitInProduct productLimit = this.buildProductSyncESLimit(savedProduct.getId());

        this.productSyncEsLimitRepository.save(productLimit);

        // Send event to worker
        ProductCreatedEvent productPayload = ProductCreatedEvent.builder()
                .id(savedProduct.getId())
                .product_name(savedProduct.getProductName())
                .current_price(savedProduct.getCurrentPrice())
                .endAt(savedProduct.getEndAt())
                .categoryIds(distinctCategoriesForEvent)
                .build();

        this.kafkaProducerService.sendMessage(
                KafkaTopics.SYNC_PRODUCT_ENTITY_TO_ES,
                KafkaEventTypes.CREATE_PRODUCT,
                productPayload
        );
    }

    private ProductInProduct buildProduct(createProductRequest request, OffsetDateTime now) {
        String productName = request.getProductName().trim();
        String thumbnailUrl = request.getThumbnailUrl().trim();

        return ProductInProduct.builder()
                .productName(productName)
                .thumbnailUrl(thumbnailUrl)
                .startPrice(request.getStartPrice())
                .currentPrice(request.getStartPrice())
                .buyNowPrice(request.getBuyNowPrice())
                .minimumBidStep(request.getMinimumBidStep())
                .topBidderId(null)
                .sellerId(request.getSellerId())
                .autoExtendEnabled(request.getAutoExtendEnabled())
                .bidCount(0)
                .createdAt(now)
                .endAt(request.getEndAt())
                .descriptions(new ArrayList<>())
                .pictures(new ArrayList<>())
                .productCategories(new ArrayList<>())
                .build();
    }

    private ProductSyncEsLimitInProduct buildProductSyncESLimit(Long productId) {
        return ProductSyncEsLimitInProduct.builder()
                .productId(productId)
                .lastCurPriceChangeAt(null)
                .lastEsSyncCurPriceAt(null)
                .build();
    }
    @Override
    public ProductResponse getProductById(Long productId) {
        ProductInProduct product = productRepository.findById(productId)
                .orElseThrow(() -> new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "Product not found"));

        return this.mapToProductResponse(product);
    }

    @Override
    public List<ProductResponse> getTop5EndingSoon() {
        OffsetDateTime now = OffsetDateTime.now();

        List<ProductInProduct> products = this.productRepository.findTopEndingSoon(now);

        if (products.isEmpty()) {
            throw new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "All products has ended");
        }

        // only take the first 5 product
        return products.stream()
                .limit(5)
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponse> getTop5MostBidded() {
        OffsetDateTime now = OffsetDateTime.now();
        List<ProductInProduct> products = this.productRepository.findTop5MostBidded(now);

        if (products.isEmpty()) {
            throw new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "No product found");
        }

        return products.stream()
                .limit(5)
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponse> getTop5HighestCurrentPrice() {
        OffsetDateTime now = OffsetDateTime.now();
        List<ProductInProduct> products = productRepository.findTop5HighestCurrentPrice(now);

        if (products.isEmpty()) {
            throw new ApplicationException("PRODUCT_NOT_FOUND", "No product found");
        }

        return products.stream()
                .limit(5)
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    private ProductResponse mapToProductResponse(ProductInProduct product) {
        // Map categories
        List<ProductResponse.CategoryInfo> categories = product.getProductCategories().stream()
                .map(pc -> {
                    CategoriesInProduct cat = pc.getCategory();
                    return new ProductResponse.CategoryInfo(
                            cat.getId(),
                            cat.getName(),
                            cat.getParent_id()
                    );
                })
                .collect(Collectors.toList());

        // Map descriptions
        List<ProductResponse.DescriptionInfo> descriptions = product.getDescriptions().stream()
                .map(d -> new ProductResponse.DescriptionInfo(
                        d.getId(),
                        d.getContent(),
                        d.getCreatedAt(),
                        d.getCreatedBy()
                ))
                .collect(Collectors.toList());

        // Map pictures
        List<ProductResponse.PictureInfo> pictures = product.getPictures().stream()
                .map(pic -> new ProductResponse.PictureInfo(
                        pic.getId(),
                        pic.getImageUrl(),
                        pic.getCreatedAt()
                ))
                .collect(Collectors.toList());

        com.service.common.dto.UserInfoResponse sellerInfoRes = product.getSellerId() == null ? null : userServiceClient.getUserBasicInfo(product.getSellerId());

        com.service.common.dto.UserInfoResponse topBidderInfoRes = product.getTopBidderId() == null ? null : userServiceClient.getUserBasicInfo(product.getTopBidderId());

        UserInfo sellerInfo = FormatUserDto.formatUserInfo(sellerInfoRes);
        UserInfo topBidderInfo = FormatUserDto.formatUserInfo(topBidderInfoRes);
        
        // Mask fullname with ** for topBidder
        topBidderInfo.setFullname(CharacterUtils.maskFullname(topBidderInfo.getFullname()));

        return new ProductResponse(
                product.getId(),
                product.getProductName(),
                product.getThumbnailUrl(),
                product.getStartPrice(),
                product.getCurrentPrice(),
                product.getBuyNowPrice(),
                product.getMinimumBidStep(),
                sellerInfo,
                topBidderInfo,
                product.getAutoExtendEnabled(),
                product.getBidCount(),
                product.getCreatedAt(),
                product.getEndAt(),
                categories,
                descriptions,
                pictures
        );
    }

    @Override
    public Page<ProductResponse> getActiveProductBasedOnBidderWhoIsBidding(Long bidderId, Pageable pageable) {
        List<AutoBidInProduct> autoBids = this.autoBidRepository.findByBidderId(bidderId);
        
        if (autoBids.isEmpty()) {
            throw new ApplicationException(
                ErrorCodes.RESOURCE_NOT_FOUND, 
                "User id" + bidderId + "have not bid any product yet!" );
        }
        
        List<Long> productIds = autoBids.stream()
                .map(AutoBidInProduct::getProductId)
                .collect(Collectors.toList());
        
        OffsetDateTime now = OffsetDateTime.now();
        Page<ProductInProduct> productPage = this.productRepository.findActiveProductsByIds(productIds, now, pageable);
        
        return productPage.map(this::mapToProductResponse);
    }

    @Override
    public void addProductDescription(Long productId, AddProductDescriptionRequest request, Long userId) {
        ProductInProduct product = productRepository.findById(productId)
                .orElseThrow(() -> new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "Product not found"));

        OffsetDateTime now = OffsetDateTime.now();

        ProductDescriptionInProduct description = ProductDescriptionInProduct.builder()
                .content(request.getDescriptionContent().trim())
                .product(product)
                .createdAt(now)
                .createdBy(userId)
                .build();

        this.productDescriptionRepository.save(description);

        // Early return if no topBidderId - no need to send event
        if (product.getTopBidderId() == null) {
            logger.info("Product id: " 
            + productId 
            + "has no top bidder id, will not send event UPDATE_PRODUCT_DESCRIPTION");
            return;
        }

        // Send event to worker
        try {
            UserEmailResponse emailResponse = userServiceClient.getUserEmail(product.getTopBidderId());
            if (emailResponse == null || emailResponse.getEmail() == null) {
                logger.info("No email in response from user service with userId: " 
                + product.getTopBidderId() 
                + ", will return early");
                return;
            }

            String topBidderEmail = emailResponse.getEmail();

            UpdateProductDescriptionEvent eventPayload = UpdateProductDescriptionEvent.builder()
                    .productId(productId)
                    .productName(product.getProductName())
                    .content(request.getDescriptionContent().trim())
                    .createdAt(now)
                    .topBidderEmail(topBidderEmail)
                    .build();

            kafkaProducerService.sendMessage(
                    KafkaTopics.BIDDING_PROCESS_SIDE_EVENT,
                    KafkaEventTypes.UPDATE_PRODUCT_DESCRIPTION,
                    eventPayload
            );
        } catch (Exception e) {
            logger.error("Failed to send UPDATE_PRODUCT_DESCRIPTION event for productId: {}", productId, e);
            // Don't throw exception to avoid failing the request
        }
    }

    private void validatePrices(createProductRequest request) {
        if (request.getBuyNowPrice() != null &&
                request.getBuyNowPrice().compareTo(request.getStartPrice()) < 0) {
            throw new ApplicationException(ErrorCodes.INVALID_INPUT, "buyNowPrice must be greater than startPrice");
        }
    }
}

