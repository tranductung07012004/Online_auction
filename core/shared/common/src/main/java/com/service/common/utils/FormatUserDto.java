package com.service.common.utils;

import com.service.common.dto.UserInfo;
import com.service.common.dto.UserInfoResponse;

public class FormatUserDto {

    private FormatUserDto() {
        throw new UnsupportedOperationException("formatUserInfo cannot be instantiated");
    }

    public static UserInfo formatUserInfo(UserInfoResponse user) {

        if (user == null) {
            return null;
        }

        Double like = user.getLike().doubleValue();
        Double dislike = user.getDislike().doubleValue();

        UserInfo formattedUser = UserInfo
                .builder()
                .id(user.getId())
                .avatar(user.getAvatar())
                .fullname(user.getFullname())
                .build();

        if (like == 0 && dislike == 0) {
            formattedUser.setAssessment(null);
        } else if (dislike == 1  && like == 0) {
            formattedUser.setAssessment(null);
            // First assessment for a user maybe not accurate
            // so let them have another chance by set it to null
            // meaning that they have not received any assessments yet.
        } else {
            formattedUser.setAssessment(like / (like + dislike) * 10);
        }
        return formattedUser;
    }
}
