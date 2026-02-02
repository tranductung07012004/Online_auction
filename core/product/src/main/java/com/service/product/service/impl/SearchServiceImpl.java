package com.service.product.service.impl;

import co.elastic.clients.elasticsearch._types.FieldValue;
import co.elastic.clients.elasticsearch._types.SortOptions;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.QueryBuilders;
import com.service.common.dto.UserInfo;
import com.service.product.dto.product.response.ProductResponse;
import com.service.product.elasticsearch.document.ProductEsDocument;
import com.service.product.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.Query;
import com.service.product.entity.Product;
import com.service.common.entity.Categories;
import com.service.product.repository.ProductRepository;

import com.service.integration.userclient.UserServiceClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {
    private final ElasticsearchOperations elasticsearchOperations;
    private final ProductRepository productRepository;
    private final UserServiceClient userServiceClient;

    @Override
    public Page<ProductResponse> search(
            String keyword,
            List<Integer> categoryIds,
            Pageable pageable,
            Sort sort) {
        BoolQuery.Builder boolQuery = QueryBuilders.bool();
        boolean hasCondition = false;

        // Note for using wildcard:
        // 1. Performance: will not good though, this is the slowest query
        // in elastic search. When the data is huge, it will be bad.
        // 2. Bypass analyzer: wildcard is a Term-level query, It will not
        // go through asciifolding_analyzer in product-setting when searching.
        // When the keyword is "ngãi" (có dấu), it will look for exactly "ngãi" in es.
        // When the keyword is "ngai" (không dấu), it will look for exactly "ngai" in
        // es.
        // But in product-setting we have preserve_original: true so this works fine.
        // ----------------- THE POTENTIAL PREMIUM SOLUTION -----------------
        // return to match, and change in Mapping to edge_ngram
        // edge_ngram will tokenize the "ngãi" word into [n, ng, nga, ngai, ngãi]
        // when being inserted into database, so when using match normally, it will find
        // fast.

        if (keyword != null && !keyword.trim().isEmpty()) {
            String wildcardValue = "*" + keyword.trim().toLowerCase() + "*";
        //     boolQuery.must(m -> m.wildcard(
        //             mm -> mm.field("productName").value(wildcardValue).caseInsensitive(true)));
                boolQuery.must(m -> m.match(
                        mm -> mm.field("productName")
                          .query(keyword)
                ));
            hasCondition = true;
        }

        if (categoryIds != null && !categoryIds.isEmpty()) {
            boolQuery.filter(f -> f.terms(t -> t
                    .field("categoryIds")
                    .terms(v -> v.value(
                            categoryIds.stream().map(FieldValue::of).toList()))));
            hasCondition = true;
        }

        if (!hasCondition) {
            boolQuery.must(m -> m.matchAll(ma -> ma));
        }

        Query query = NativeQuery.builder()
                .withQuery(boolQuery.build()._toQuery())
                .withPageable(pageable)
                .withSort(convertSort(sort))
                .build();

        SearchHits<ProductEsDocument> hits = elasticsearchOperations.search(query, ProductEsDocument.class);

        // Lưu Map từ ES để lấy currentPrice và endAt
        Map<Long, ProductEsDocument> productEsMap = hits.getSearchHits().stream()
                .map(SearchHit::getContent)
                .collect(Collectors.toMap(ProductEsDocument::getId, doc -> doc));

        // Lay ID theo thu tu da duoc sap xep khi dung ES de search
        List<Long> productIdsFromES = hits.getSearchHits().stream()
                .map(hit -> hit.getContent().getId())
                .toList();

        List<Product> productsFromDB = this.productRepository.findByIdIn(productIdsFromES);

        // Trick, tao map de lat nua query theo kieu O(1) thay vi O(n)
        Map<Long, Product> productMapFromDB = productsFromDB.stream()
                .collect(Collectors.toMap(Product::getId, p -> p));

        List<ProductResponse> productResponses = productIdsFromES.stream()
                .map(productId -> {
                    Product productDB = productMapFromDB.get(productId);
                    ProductEsDocument esDoc = productEsMap.get(productId);
                    if (productDB == null || esDoc == null) {
                        return null; // Filter out nếu product không tồn tại trong DB hoặc ES
                    }
                    return mapToProductResponse(productDB, esDoc);
                })
                .filter(p -> p != null)
                .toList();

        return new PageImpl<>(
                productResponses,
                pageable,
                hits.getTotalHits());
    }

    private List<SortOptions> convertSort(Sort sort) {
        if (sort.isUnsorted())
            return List.of();

        return sort.stream()
                .map(order -> SortOptions.of(s -> s
                        .field(f -> f
                                .field(order.getProperty())
                                .order(order.isAscending()
                                        ? SortOrder.Asc
                                        : SortOrder.Desc))))
                .toList();
    }

    private ProductResponse mapToProductResponse(Product product, ProductEsDocument esDoc) {
        // Map categories
        List<ProductResponse.CategoryInfo> categories = product.getProductCategories().stream()
                .map(pc -> {
                    Categories cat = pc.getCategory();
                    return new ProductResponse.CategoryInfo(
                            cat.getId(),
                            cat.getName(),
                            cat.getParent_id());
                })
                .collect(Collectors.toList());

        // Map descriptions
        List<ProductResponse.DescriptionInfo> descriptions = product.getDescriptions().stream()
                .map(d -> new ProductResponse.DescriptionInfo(
                        d.getId(),
                        d.getContent(),
                        d.getCreatedAt(),
                        d.getCreatedBy()))
                .collect(Collectors.toList());

        // Map pictures
        List<ProductResponse.PictureInfo> pictures = product.getPictures().stream()
                .map(pic -> new ProductResponse.PictureInfo(
                        pic.getId(),
                        pic.getImageUrl(),
                        pic.getCreatedAt()))
                .collect(Collectors.toList());

        com.service.common.dto.UserInfoResponse sellerInfoRes = product.getSellerId() == null ? null
                : userServiceClient.getUserBasicInfo(product.getSellerId());

        com.service.common.dto.UserInfoResponse topBidderInfoRes = product.getTopBidderId() == null ? null
                : userServiceClient.getUserBasicInfo(product.getTopBidderId());

        UserInfo sellerInfo = formatUserInfo(sellerInfoRes);
        UserInfo topBidderInfo = formatUserInfo(topBidderInfoRes);
        
        // Mask fullname with ** for seller and topBidder
        maskFullname(sellerInfo);
        maskFullname(topBidderInfo);

        // Lấy currentPrice và endAt từ ES, các field khác từ DB
        return new ProductResponse(
                product.getId(),
                product.getProductName(),
                product.getThumbnailUrl(),
                product.getStartPrice(),
                esDoc.getCurrentPrice(), // Get from ES
                // because all the sort and search and filter are based on currentPrice from ES
                // make it more consistent
                product.getBuyNowPrice(),
                product.getMinimumBidStep(),
                sellerInfo,
                topBidderInfo,
                product.getAutoExtendEnabled(),
                product.getBidCount(),
                product.getCreatedAt(),
                esDoc.getEndAt(), // Get from ES
                // because all the sort and search and filter are based on endAt from ES
                // make it more consistent
                categories,
                descriptions,
                pictures);
    }

    public static UserInfo formatUserInfo(com.service.common.dto.UserInfoResponse user) {

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
        } else if (dislike == 1 && like == 0) {
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
}
