package com.service.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecentUserDTO {
    private Long id;
    private String email;
    private String fullname;
    private String avatar;
    private String role;
    private Boolean verified;
    private LocalDateTime createdAt;
}
