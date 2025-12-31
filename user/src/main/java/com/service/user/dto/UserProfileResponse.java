package com.service.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {
    private String fullname;
    private String avatar;
    private Double assessment;
    private String email; // masked email
    private String address;
}

