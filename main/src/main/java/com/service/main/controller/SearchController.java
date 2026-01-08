package com.service.main.controller;

import com.service.main.dto.ApiResponse;
import com.service.main.dto.ProductResponse;
import com.service.main.service.SearchService;
import com.service.main.utils.SortUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/main/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public ResponseEntity<?> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) List<Integer> categoryIds,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "endAt,asc", required = false) String sort
    ) {
        Sort sortObj = SortUtils.parseSort(sort);
        
        Pageable pageable = PageRequest.of(page, size, sortObj);
        
        Page<ProductResponse> results = this.searchService.search(keyword, categoryIds, pageable, sortObj);
        
        return ResponseEntity
                .status(200)
                .body(new ApiResponse<>("Search completed successfully", results));
    }

}
