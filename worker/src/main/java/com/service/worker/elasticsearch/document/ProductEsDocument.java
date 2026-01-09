package com.service.worker.elasticsearch.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(indexName = "product")
@Setting(settingPath = "elastic/product-setting.json")
@Mapping(mappingPath = "elastic/product-mapping.json")
public class ProductEsDocument {
    @Id
    private Long id;

    private String productName;

    private BigDecimal currentPrice;

    @Field(type = FieldType.Date)
    // Neu khong thi spring elastic search se ko parse ra duoc type mac du co mapping.json
    // Xong thi cung khong luu duoc field endAt trong es luon
    private OffsetDateTime endAt;

    private List<Integer> categoryIds;
}
