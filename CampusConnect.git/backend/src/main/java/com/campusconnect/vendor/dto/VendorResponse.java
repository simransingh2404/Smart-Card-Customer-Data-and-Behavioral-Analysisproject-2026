package com.campusconnect.vendor.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class VendorResponse {
    private Long id;
    private String companyName;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String phone;
    private String gstNumber;
    private String businessType;
    private Integer yearsOfExperience;
    private String description;
    private String verificationStatus;
    private String email;
    private LocalDateTime createdAt;
}