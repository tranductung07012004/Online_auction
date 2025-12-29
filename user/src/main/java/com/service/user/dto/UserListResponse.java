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
public class UserListResponse {
    private Long id;
    private String email;
    private String role;
    private String fullname;
    private String avatar;
    private String address;
    private Boolean verified;
    private Integer likeCount;
    private Integer dislikeCount;
    private LocalDateTime createdAt;
}
