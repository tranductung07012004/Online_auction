package com.service.user.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Builder
@Table(name = "user_details")
public class UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private Long user_id;

    private String fullname;

    private String avatar;

    private String address;

    @Column(nullable = false)
    @Builder.Default
    private Boolean verified = false;

    @Column(nullable = false)
    @Builder.Default
    private Integer like_count = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer dislike_count = 0;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime created_at = LocalDateTime.now();
}

