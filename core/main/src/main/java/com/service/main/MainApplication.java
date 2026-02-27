package com.service.main;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = "com.service")
@EnableJpaRepositories(basePackages = {
		"com.service.main.repository",
		"com.service.auction.repository",
		"com.service.product.repository",
		"com.service.admin.repository"
})
@EntityScan(basePackages = "com.service")
@EnableScheduling
public class MainApplication {
	public static void main(String[] args) {
		SpringApplication.run(MainApplication.class, args);
	}
}
