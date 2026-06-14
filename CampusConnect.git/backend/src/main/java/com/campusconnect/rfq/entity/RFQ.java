package com.campusconnect.rfq.entity;

import com.campusconnect.school.entity.School;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "rfqs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RFQ {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String uniformType; // Shirt, Trouser, Blazer etc.
    private Integer quantity;
    private String sizes; // S,M,L,XL,XXL
    private Double budget;
    private LocalDate deadline;
    private String deliveryAddress;

    @Enumerated(EnumType.STRING)
    private RFQStatus status = RFQStatus.OPEN;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum RFQStatus {
        OPEN, CLOSED, AWARDED
    }
}