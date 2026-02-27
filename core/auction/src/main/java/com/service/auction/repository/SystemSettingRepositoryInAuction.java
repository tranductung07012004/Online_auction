package com.service.auction.repository;

import com.service.auction.entity.SystemSettingInAuction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SystemSettingRepositoryInAuction extends JpaRepository<SystemSettingInAuction, Long> {

    Optional<SystemSettingInAuction> findByKey(String key);
}
