package com.campusconnect.quotation.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class QuotationResponse {
    private Long id;
    private Long rfqId;
    private String rfqTitle;
    private String schoolName;
    private Long vendorId;
    private String companyName;
    private Double totalPrice;
    private Integer deliveryDays;
    private String sampleAvailable;
    private String additionalNotes;
    private String termsAndConditions;
    private String status;
    private LocalDateTime createdAt;
}