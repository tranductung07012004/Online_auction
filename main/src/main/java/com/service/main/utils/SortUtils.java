package com.service.main.utils;

import com.service.main.constants.ErrorCodes;
import com.service.main.exception.ApplicationException;
import org.springframework.data.domain.Sort;

public final class SortUtils {
    
    private SortUtils() {
        // ngan khong cho initialize
        throw new UnsupportedOperationException("Utility class cannot be instantiated");
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















