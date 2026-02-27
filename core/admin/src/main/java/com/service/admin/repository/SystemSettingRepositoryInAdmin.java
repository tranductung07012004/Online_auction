package com.service.admin.repository;

import com.service.admin.entity.SystemSettingInAdmin;
import com.service.admin.entity.SystemSettingInAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SystemSettingRepositoryInAdmin extends JpaRepository<SystemSettingInAdmin, Long> {

    Optional<SystemSettingInAdmin> findByKey(String key);
}
