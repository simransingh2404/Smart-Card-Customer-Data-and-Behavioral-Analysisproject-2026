package com.campusconnect.rfq.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class RFQRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Uniform type is required")
    private String uniformType;

    @NotNull(message = "Quantity is required")
    private Integer quantity;

    private String sizes;
    private Double budget;
    private LocalDate deadline;
    private String deliveryAddress;
}