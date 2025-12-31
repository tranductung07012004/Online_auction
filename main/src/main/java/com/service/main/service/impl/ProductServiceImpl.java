package com.service.main.service.impl;

import com.service.main.constants.ErrorCodes;
import com.service.main.dto.ProductResponse;
import com.service.main.dto.UserInfo;
import com.service.main.dto.UserInfoResponse;
import com.service.main.dto.createProductRequest;
import com.service.main.entity.Categories;
import com.service.main.entity.Product;
import com.service.main.entity.ProductCategory;
import com.service.main.entity.ProductDescription;
import com.service.main.entity.ProductPicture;
import com.service.main.exception.ApplicationException;
import com.service.main.repository.CategoriesRepository;
import com.service.main.repository.ProductCategoryRepository;
import com.service.main.repository.ProductRepository;
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
    private final ProductCategoryRepository productCategoryRepository;
    private final UserServiceClient userServiceClient;

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
        List<Categories> categories = categoriesRepository.findAllById(distinctCategoryIds);
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

        Product savedProduct = this.productRepository.save(product);

        // build product-category links
        List<ProductCategory> productCategories = new ArrayList<>();
        for (Categories category : categories) {
            ProductCategory pc = new ProductCategory();
            pc.setProduct(savedProduct);
            pc.setCategory(category);
            pc.setCreatedAt(now);
            productCategories.add(pc);
        }
        if (!productCategories.isEmpty()) {
            productCategoryRepository.saveAll(productCategories);
            savedProduct.setProductCategories(productCategories);
        }
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
            throw new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "All products has ended section");
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
            throw new ApplicationException("PRODUCT_NOT_FOUND", "No product found with current price");
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



        return new ProductResponse(
                product.getId(),
                product.getProductName(),
                product.getThumbnailUrl(),
                product.getStartPrice(),
                product.getCurrentPrice(),
                product.getBuyNowPrice(),
                product.getMinimumBidStep(),
                formatUserInfo(sellerInfoRes),
                formatUserInfo(topBidderInfoRes),
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

    private void validatePrices(createProductRequest request) {
        if (request.getBuyNowPrice() != null &&
                request.getBuyNowPrice().compareTo(request.getStartPrice()) < 0) {
            throw new ApplicationException(ErrorCodes.INVALID_INPUT, "buyNowPrice must be greater than startPrice");
        }
    }
}

