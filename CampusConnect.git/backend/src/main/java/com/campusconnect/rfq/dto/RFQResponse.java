package com.campusconnect.rfq.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class RFQResponse {
    private Long id;
    private String title;
    private String description;
    private String uniformType;
    private Integer quantity;
    private String sizes;
    private Double budget;
    private LocalDate deadline;
    private String deliveryAddress;
    private String status;
    private String schoolName;
    private String schoolCity;
    private LocalDateTime createdAt;
}