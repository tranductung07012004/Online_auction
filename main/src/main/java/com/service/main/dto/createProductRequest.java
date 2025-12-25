package com.service.main.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Data
public class createProductRequest {
    @NotBlank(message = "Product name is required")
    @Size(max = 255, message = "product name cannot exceed 255 characters")
    private String productName;

    @NotBlank(message = "thumbnailUrl is required")
    private String thumbnailUrl;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false, message = "startPrice must be greater than 0.0")
    @Digits(integer = 10, fraction = 5)
    private BigDecimal startPrice;

    @DecimalMin(value = "0.0", inclusive = false)
    @Digits(integer = 10, fraction = 5)
    private BigDecimal buyNowPrice;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false, message = "minimum bid step is required")
    @Digits(integer = 10, fraction = 5)
    private BigDecimal minimumBidStep;

    @NotNull
    @Future(message = "End time must be in the future")
    private OffsetDateTime endAt;

    @NotNull(message = "autoExtendEnabled is required")
    private Boolean autoExtendEnabled;

    @NotBlank
    private String descriptionContent;

    @NotNull(message = "Seller is required")
    private Long sellerId;

    @NotNull(message = "At least one category is required")
    @Size(min = 1, message = "At least one category is required")
    private List<@NotNull Integer> categoryIds;

    @Size(max = 10, message = "Maximum 10 pictures allowed")
    private List<@NotBlank String> pictureUrls;
}
