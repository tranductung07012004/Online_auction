package com.service.main.service.impl;

import com.service.main.constants.ErrorCodes;
import com.service.main.dto.SystemSettingCreateRequest;
import com.service.main.dto.SystemSettingResponse;
import com.service.main.entity.SystemSetting;
import com.service.main.exception.ApplicationException;
import com.service.main.repository.SystemSettingRepository;
import com.service.main.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class SystemSettingServiceImpl implements SystemSettingService {

    private final SystemSettingRepository systemSettingRepository;

    @Override
    public SystemSettingResponse createSystemSetting(SystemSettingCreateRequest request) {

        if (systemSettingRepository.findByKey(request.getKey()).isPresent()) {
            throw new ApplicationException(ErrorCodes.DUPLICATE_KEY, "System setting key already exists");
        }

        OffsetDateTime now = OffsetDateTime.now();

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = Long.parseLong(authentication.getName());


        SystemSetting setting = SystemSetting.builder()
                .key(request.getKey())
                .value(request.getValue())
                .description(request.getDescription())
                .createdAt(now)
                .updatedAt(now)
                .updatedBy(userId)
                .build();

        SystemSetting saved = systemSettingRepository.save(setting);

        return mapToResponse(saved);
    }

    @Override
    public SystemSettingResponse getSystemSettingByKey(String key) {
        SystemSetting setting = systemSettingRepository.findByKey(key)
                .orElseThrow(() -> new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "System setting not found for key: " + key));

        return mapToResponse(setting);
    }

    private SystemSettingResponse mapToResponse(SystemSetting entity) {
        SystemSettingResponse response = new SystemSettingResponse();
        response.setId(entity.getId());
        response.setKey(entity.getKey());
        response.setValue(entity.getValue());
        response.setDescription(entity.getDescription());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        response.setUpdatedBy(entity.getUpdatedBy());
        return response;
    }
}
