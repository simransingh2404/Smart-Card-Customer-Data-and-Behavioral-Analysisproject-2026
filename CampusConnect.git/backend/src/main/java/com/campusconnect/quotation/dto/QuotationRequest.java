package com.campusconnect.quotation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuotationRequest {

    @NotNull(message = "Total price is required")
    private Double totalPrice;

    private Integer deliveryDays;
    private String sampleAvailable;
    private String additionalNotes;
    private String termsAndConditions;
}