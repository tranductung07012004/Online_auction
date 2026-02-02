package com.service.common.utils;

import com.service.common.constants.ErrorCodes;
import com.service.common.exception.ApplicationException;
import org.springframework.data.domain.Sort;

public final class SortUtils {

    private SortUtils() {
        // ngan khong cho initialize
        throw new UnsupportedOperationException("sortUtils cannot be instantiated");
    }

    public static Sort parseSort(String sortString) {
        if (sortString == null || sortString.trim().isEmpty()) {
            return Sort.unsorted();
        }

        String[] parts = sortString.split(",");
        for (String a : parts) {
            System.out.println(a);
        }
        if (parts.length == 1) {
            throw new ApplicationException(
                    ErrorCodes.VALIDATION_FAILED,
                    "Sort format from request is not in correct format: " + sortString
            );
        } else if (parts.length == 2) {
            String field = parts[0].trim();
            String direction = parts[1].trim().toLowerCase();
            
            Sort.Direction sortDirection = direction.equals("desc") 
                    ? Sort.Direction.DESC 
                    : Sort.Direction.ASC;
            
            return Sort.by(sortDirection, field);
        } else {
            return Sort.unsorted();
        }
    }
}















