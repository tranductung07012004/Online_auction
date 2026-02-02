package com.service.main.service;

import com.service.main.dto.SystemSettingCreateRequest;
import com.service.main.dto.SystemSettingResponse;

public interface SystemSettingService {

    SystemSettingResponse createSystemSetting(SystemSettingCreateRequest request);

    SystemSettingResponse getSystemSettingByKey(String key);
}
