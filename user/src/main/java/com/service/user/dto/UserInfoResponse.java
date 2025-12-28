package com.service.user.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserInfoResponse {
    private Long id;
    private String fullname;
    private String avatar;
    private Integer like;
    private Integer dislike;
}