package com.service.admin.service.impl;

import com.service.admin.entity.ProductInAdmin;
import com.service.admin.entity.CategoriesInAdmin;
import com.service.admin.repository.ProductRepositoryInAdmin;
import com.service.common.constants.ErrorCodes;
import com.service.common.dto.UserInfo;
import com.service.common.exception.ApplicationException;
import com.service.common.utils.CharacterUtils;
import com.service.common.utils.FormatUserDto;
import com.service.admin.dto.ProductResponse;
import com.service.admin.service.ProductService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import com.service.integration.userclient.UserServiceClient;

@Service
public class AdminModuleProductServiceImpl implements ProductService {

    private static final Logger logger = LoggerFactory.getLogger(AdminModuleProductServiceImpl.class);

    private final ProductRepositoryInAdmin productRepository;
    private final UserServiceClient userServiceClient;

    public AdminModuleProductServiceImpl(
            ProductRepositoryInAdmin proRepo,
            UserServiceClient userSClient
    ) {
        this.productRepository = proRepo;
        this.userServiceClient = userSClient;
    }

    @Override
    public ProductResponse getProductById(Long productId) {
        ProductInAdmin product = productRepository.findById(productId)
                .orElseThrow(() -> new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "Product not found"));

        return this.mapToProductResponse(product);
    }

    private ProductResponse mapToProductResponse(ProductInAdmin product) {
        // Map categories
        List<ProductResponse.CategoryInfo> categories = product.getProductCategories().stream()
                .map(pc -> {
                    CategoriesInAdmin cat = pc.getCategory();
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
}

