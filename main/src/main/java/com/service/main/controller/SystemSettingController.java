package com.service.main.controller;

import com.service.main.dto.ApiResponse;
import com.service.main.dto.SystemSettingCreateRequest;
import com.service.main.dto.SystemSettingResponse;
import com.service.main.service.SystemSettingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/main/system-settings")
@RequiredArgsConstructor
public class SystemSettingController {

    private final SystemSettingService systemSettingService;


    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> createSystemSetting(
            @Valid @RequestBody SystemSettingCreateRequest request) {

        SystemSettingResponse res = systemSettingService.createSystemSetting(request);
        return ResponseEntity
                .status(201)
                .body(new ApiResponse<>("System setting created successfully", res));
    }


    @GetMapping()
    public ResponseEntity<?> getSystemSettingByKey(
            @RequestParam String key) {

        SystemSettingResponse res = systemSettingService.getSystemSettingByKey(key);
        return ResponseEntity
                .status(200)
                .body(new ApiResponse<>("System setting retrieved successfully", res));
    }
}
