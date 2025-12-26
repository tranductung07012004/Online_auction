package com.service.user.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserBasicInfoResponse {
    private Long id;
    private String fullname;
    private String avatar;
}