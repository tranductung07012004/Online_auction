package com.service.main.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String productName;
    private String thumbnailUrl;
    private BigDecimal startPrice;
    private BigDecimal currentPrice;
    private BigDecimal buyNowPrice;
    private BigDecimal minimumBidStep;
    private UserInfo seller;
    private UserInfo topBidder;
    private Boolean autoExtendEnabled;
    private Integer bidCount;
    private OffsetDateTime createdAt;
    private OffsetDateTime endAt;
    private List<CategoryInfo> categories;
    private List<DescriptionInfo> descriptions;
    private List<PictureInfo> pictures;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryInfo {
        private Integer id;
        private String name;
        private Integer parentId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DescriptionInfo {
        private Integer id;
        private String content;
        private OffsetDateTime createdAt;
        private Long createdBy;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PictureInfo {
        private Integer id;
        private String imageUrl;
        private OffsetDateTime createdAt;
    }


}

