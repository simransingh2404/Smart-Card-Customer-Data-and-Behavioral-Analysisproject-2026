package com.campusconnect.school.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SchoolResponse {
    private Long id;
    private String schoolName;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String phone;
    private String board;
    private Integer studentStrength;
    private String principalName;
    private String email;
    private LocalDateTime createdAt;
}