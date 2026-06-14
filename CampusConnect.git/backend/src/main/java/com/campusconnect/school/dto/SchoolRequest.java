package com.campusconnect.school.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SchoolRequest {

    @NotBlank(message = "School name is required")
    private String schoolName;

    @NotBlank(message = "Address is required")
    private String address;

    private String city;
    private String state;
    private String pincode;
    private String phone;
    private String board;
    private Integer studentStrength;
    private String principalName;
}