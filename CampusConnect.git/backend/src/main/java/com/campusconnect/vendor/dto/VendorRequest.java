package com.campusconnect.vendor.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VendorRequest {

    @NotBlank(message = "Company name is required")
    private String companyName;

    @NotBlank(message = "Address is required")
    private String address;

    private String city;
    private String state;
    private String pincode;
    private String phone;
    private String gstNumber;
    private String businessType;
    private Integer yearsOfExperience;
    private String description;
}