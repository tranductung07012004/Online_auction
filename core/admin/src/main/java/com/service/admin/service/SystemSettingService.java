package com.service.admin.service;

import com.service.admin.dto.SystemSettingCreateRequest;
import com.service.admin.dto.SystemSettingResponse;

public interface SystemSettingService {

    SystemSettingResponse createSystemSetting(SystemSettingCreateRequest request);

    SystemSettingResponse getSystemSettingByKey(String key);
}
