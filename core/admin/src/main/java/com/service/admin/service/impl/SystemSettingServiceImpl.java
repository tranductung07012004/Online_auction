package com.service.admin.service.impl;

import com.service.admin.entity.SystemSettingInAdmin;
import com.service.common.constants.ErrorCodes;
import com.service.admin.dto.SystemSettingCreateRequest;
import com.service.admin.dto.SystemSettingResponse;
import com.service.common.exception.ApplicationException;
import com.service.admin.repository.SystemSettingRepositoryInAdmin;
import com.service.admin.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class SystemSettingServiceImpl implements SystemSettingService {

    private final SystemSettingRepositoryInAdmin systemSettingRepository;

    @Override
    public SystemSettingResponse createSystemSetting(SystemSettingCreateRequest request) {

        if (systemSettingRepository.findByKey(request.getKey()).isPresent()) {
            throw new ApplicationException(ErrorCodes.DUPLICATE_KEY, "System setting key already exists");
        }

        OffsetDateTime now = OffsetDateTime.now();

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = Long.parseLong(authentication.getName());


        SystemSettingInAdmin setting = SystemSettingInAdmin.builder()
                .key(request.getKey())
                .value(request.getValue())
                .description(request.getDescription())
                .createdAt(now)
                .updatedAt(now)
                .updatedBy(userId)
                .build();

        SystemSettingInAdmin saved = systemSettingRepository.save(setting);

        return mapToResponse(saved);
    }

    @Override
    public SystemSettingResponse getSystemSettingByKey(String key) {
        SystemSettingInAdmin setting = systemSettingRepository.findByKey(key)
                .orElseThrow(() -> new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "System setting not found for key: " + key));

        return mapToResponse(setting);
    }

    private SystemSettingResponse mapToResponse(SystemSettingInAdmin entity) {
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
