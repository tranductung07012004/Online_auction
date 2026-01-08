package com.service.worker.elasticsearch.repository;

import com.service.worker.elasticsearch.document.ProductEsDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface ProductEsRepository extends ElasticsearchRepository<ProductEsDocument, Long> {

}
