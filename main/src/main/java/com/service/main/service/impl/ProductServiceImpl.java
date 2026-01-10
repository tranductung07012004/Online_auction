package com.service.main.service.impl;

import com.service.main.constants.ErrorCodes;
import com.service.main.constants.KafkaEventTypes;
import com.service.main.constants.KafkaTopics;
import com.service.main.dto.*;
import com.service.main.entity.*;
import com.service.main.exception.ApplicationException;
import com.service.main.repository.AutoBidRepository;
import com.service.main.repository.CategoriesRepository;
import com.service.main.repository.ProductDescriptionRepository;
import com.service.main.repository.ProductRepository;
import com.service.main.repository.ProductSyncEsLimitRepository;
import com.service.main.service.KafkaProducerService;
import com.service.main.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.service.main.service.UserServiceClient;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoriesRepository categoriesRepository;
    private final UserServiceClient userServiceClient;
    private final AutoBidRepository autoBidRepository;
    private final ProductDescriptionRepository productDescriptionRepository;

    private final KafkaProducerService kafkaProducerService;

    private final ProductSyncEsLimitRepository productSyncEsLimitRepository;

    @Override
    public Page<ProductResponse> getProductsByCategory(Integer categoryId, Pageable pageable) {
        Page<Product> productPage = productRepository.findByCategoryId(categoryId, pageable);
        return productPage.map(this::mapToProductResponse);
    }

    @Override
    public Page<ProductResponse> getActiveProductsBySellerId(Long sellerId, Pageable pageable) {
        OffsetDateTime now = OffsetDateTime.now();
        Page<Product> productPage = this.productRepository.findActiveWithFilters(now, null, sellerId, pageable);
        return productPage.map(this::mapToProductResponse);
    }

    @Override
    public Page<ProductResponse> getEndedProductsBySellerId(Long sellerId, Pageable pageable) {
        OffsetDateTime now = OffsetDateTime.now();
        Page<Product> productPage = this.productRepository.findEndedWithFilters(now, null, sellerId, pageable);
        return productPage.map(this::mapToProductResponse);
    }

    @Override
    public Page<ProductResponse> getProductsBySellerId(Long sellerId, Pageable pageable) {
        Page<Product> productPage = this.productRepository.findBySellerIdOrderByCreatedAtDesc(sellerId, pageable);
        return productPage.map(this::mapToProductResponse);
    }

    @Override
    public void createProduct(createProductRequest request) {
        validatePrices(request);

        OffsetDateTime now = OffsetDateTime.now();

        Set<Integer> distinctCategoryIds = new LinkedHashSet<>(request.getCategoryIds());
        List<Integer> distinctCategoriesForEvent = new ArrayList<>();
        List<Categories> categories = this.categoriesRepository.findAllById(distinctCategoryIds);
        if (categories.size() != distinctCategoryIds.size()) {
            throw new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "One or more categories do not exist");
        }

        Product product = buildProduct(request, now);

        // build description
        ProductDescription description = ProductDescription.builder()
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
                ProductPicture picture = ProductPicture.builder()
                        .imageUrl(url)
                        .product(product)
                        .createdAt(now)
                        .build();
                product.getPictures().add(picture);
            }
        }

        // build product-category links
        for (Categories category : categories) {
            // Xu li de gui event only
            distinctCategoriesForEvent.add(category.getId());


            ProductCategory pc = new ProductCategory();
            pc.setProduct(product);
            pc.setCategory(category);
            pc.setCreatedAt(now);

            product.getProductCategories().add(pc);
        }

        Product savedProduct = this.productRepository.save(product);

        ProductSyncEsLimit productLimit = this.buildProductSyncESLimit(savedProduct.getId());

        this.productSyncEsLimitRepository.save(productLimit);

        // Send event to worker
        ProductCreatedEvent productPayload = ProductCreatedEvent.builder()
                .id(savedProduct.getId())
                .product_name(savedProduct.getProductName())
                .current_price(savedProduct.getCurrentPrice())
                .endAt(savedProduct.getEndAt())
                .categoryIds(distinctCategoriesForEvent)
                .build();

        kafkaProducerService.sendMessage(
                KafkaTopics.SYNC_PRODUCT_ENTITY_TO_ES,
                KafkaEventTypes.CREATE_PRODUCT,
                productPayload
        );
    }

    private Product buildProduct(createProductRequest request, OffsetDateTime now) {
        String productName = request.getProductName().trim();
        String thumbnailUrl = request.getThumbnailUrl().trim();

        return Product.builder()
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

    private ProductSyncEsLimit buildProductSyncESLimit(Long productId) {
        return ProductSyncEsLimit.builder()
                .productId(productId)
                .lastCurPriceChangeAt(null)
                .lastEsSyncCurPriceAt(null)
                .build();
    }
    @Override
    public ProductResponse getProductById(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "Product not found"));

        return this.mapToProductResponse(product);
    }

    @Override
    public List<ProductResponse> getTop5EndingSoon() {
        OffsetDateTime now = OffsetDateTime.now();

        List<Product> products = this.productRepository.findTopEndingSoon(now);

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
        List<Product> products = this.productRepository.findTop5MostBidded(now);

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
        List<Product> products = productRepository.findTop5HighestCurrentPrice(now);

        if (products.isEmpty()) {
            throw new ApplicationException("PRODUCT_NOT_FOUND", "No product found");
        }

        return products.stream()
                .limit(5)
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    private ProductResponse mapToProductResponse(Product product) {
        // Map categories
        List<ProductResponse.CategoryInfo> categories = product.getProductCategories().stream()
                .map(pc -> {
                    Categories cat = pc.getCategory();
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

        UserInfoResponse sellerInfoRes = product.getSellerId() == null ? null : userServiceClient.getUserBasicInfo(product.getSellerId());

        UserInfoResponse topBidderInfoRes = product.getTopBidderId() == null ? null : userServiceClient.getUserBasicInfo(product.getTopBidderId());

        UserInfo sellerInfo = formatUserInfo(sellerInfoRes);
        UserInfo topBidderInfo = formatUserInfo(topBidderInfoRes);
        
        // Mask fullname with ** for topBidder
        maskFullname(topBidderInfo);

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

    public static UserInfo formatUserInfo(UserInfoResponse user) {

        if (user == null) {
            return null;
        }

        Double like = user.getLike().doubleValue();
        Double dislike = user.getDislike().doubleValue();

        UserInfo formattedUser = UserInfo
                .builder()
                .id(user.getId())
                .avatar(user.getAvatar())
                .fullname(user.getFullname())
                .build();

        if (like == 0 && dislike == 0) {
            formattedUser.setAssessment(null);
        } else if (dislike == 1  && like == 0) {
            formattedUser.setAssessment(null);
            // First assessment for a user maybe not accurate
            // so let them have another chance by set it to null
            // meaning that they have not received any assessments yet.
        } else {
            formattedUser.setAssessment(like / (like + dislike) * 10);
        }
        return formattedUser;
    }

    /**
     * Masks the fullname field in UserInfo by masking some characters of each word
     * Example: "nguyen van aabcc" -> "nguy*e v** a**cc"
     * @param userInfo UserInfo object to mask (can be null)
     */
    private static void maskFullname(UserInfo userInfo) {
        if (userInfo != null && userInfo.getFullname() != null) {
            String fullname = userInfo.getFullname().trim();
            if (fullname.isEmpty()) {
                userInfo.setFullname("**");
                return;
            }
            
            // Split by spaces to get words
            String[] words = fullname.split("\\s+");
            StringBuilder masked = new StringBuilder();
            
            for (int i = 0; i < words.length; i++) {
                if (i > 0) {
                    masked.append(" ");
                }
                masked.append(maskWord(words[i]));
            }
            
            userInfo.setFullname(masked.toString());
        }
    }
    
    /**
     * Masks a single word by keeping some characters at the beginning and end,
     * masking the middle part with *
     * @param word the word to mask
     * @return masked word
     */
    private static String maskWord(String word) {
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
    public Page<ProductResponse> getActiveProductBasedOnBidderWhoIsBidding(Long bidderId, Pageable pageable) {
        List<AutoBid> autoBids = this.autoBidRepository.findByBidderId(bidderId);
        
        if (autoBids.isEmpty()) {
            throw new ApplicationException(
                ErrorCodes.RESOURCE_NOT_FOUND, 
                "User id" + bidderId + "have not bid any product yet!" );
        }
        
        List<Long> productIds = autoBids.stream()
                .map(AutoBid::getProductId)
                .collect(Collectors.toList());
        
        OffsetDateTime now = OffsetDateTime.now();
        Page<Product> productPage = this.productRepository.findActiveProductsByIds(productIds, now, pageable);
        
        return productPage.map(this::mapToProductResponse);
    }

    @Override
    public void addProductDescription(Long productId, AddProductDescriptionRequest request, Long userId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "Product not found"));

        OffsetDateTime now = OffsetDateTime.now();

        ProductDescription description = ProductDescription.builder()
                .content(request.getDescriptionContent().trim())
                .product(product)
                .createdAt(now)
                .createdBy(userId)
                .build();

        this.productDescriptionRepository.save(description);
    }

    private void validatePrices(createProductRequest request) {
        if (request.getBuyNowPrice() != null &&
                request.getBuyNowPrice().compareTo(request.getStartPrice()) < 0) {
            throw new ApplicationException(ErrorCodes.INVALID_INPUT, "buyNowPrice must be greater than startPrice");
        }
    }
}

