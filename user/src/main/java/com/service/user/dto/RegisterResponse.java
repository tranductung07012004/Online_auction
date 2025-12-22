package com.service.user.dto;

import lombok.Data;

@Data
public class RegisterResponse {
    private String email;
    private Long userId;
    private String role;
}
