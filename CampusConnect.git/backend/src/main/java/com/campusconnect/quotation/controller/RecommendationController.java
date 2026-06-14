package com.campusconnect.quotation.controller;

import com.campusconnect.quotation.entity.Quotation;
import com.campusconnect.quotation.repository.QuotationRepository;
import com.campusconnect.vendor.entity.Vendor;
import com.campusconnect.vendor.repository.VendorRepository;
import com.campusconnect.entity.User;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.school.entity.School;
import com.campusconnect.school.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/recommend")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RecommendationController {

    private final QuotationRepository quotationRepository;
    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;

    @PostMapping("/rfq/{rfqId}")
    public ResponseEntity<?> recommend(
            @AuthenticationPrincipal String email,
            @PathVariable Long rfqId,
            @RequestBody RecommendRequest weights) {

        // Validate weights sum to 100
        double total = weights.getPriceWeight() + weights.getQualityWeight()
                + weights.getDeliveryWeight() + weights.getPerformanceWeight();
        if (Math.abs(total - 100.0) > 0.01) {
            return ResponseEntity.badRequest().body("Weights must sum to 100");
        }

        // Get all submitted quotations for this RFQ
        List<Quotation> quotations = quotationRepository.findByRfqId(rfqId)
                .stream()
                .filter(q -> q.getStatus() == Quotation.QuotationStatus.SUBMITTED)
                .collect(Collectors.toList());

        if (quotations.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        // Calculate min/max for normalization
        double minPrice = quotations.stream().mapToDouble(Quotation::getTotalPrice).min().orElse(1);
        double maxPrice = quotations.stream().mapToDouble(Quotation::getTotalPrice).max().orElse(1);
        double minDelivery = quotations.stream().mapToInt(q -> q.getDeliveryDays() != null ? q.getDeliveryDays() : 30).min().orElse(1);
        double maxDelivery = quotations.stream().mapToInt(q -> q.getDeliveryDays() != null ? q.getDeliveryDays() : 30).max().orElse(1);

        List<RecommendResult> results = new ArrayList<>();

        for (Quotation q : quotations) {
            Vendor vendor = q.getVendor();

            // 1. Price score (lower price = higher score)
            double priceScore = maxPrice == minPrice ? 100 :
                    ((maxPrice - q.getTotalPrice()) / (maxPrice - minPrice)) * 100;

            // 2. Quality score (years of experience, max 20 years = 100)
            int exp = vendor.getYearsOfExperience() != null ? vendor.getYearsOfExperience() : 0;
            double qualityScore = Math.min((exp / 20.0) * 100, 100);

            // 3. Delivery score (lower days = higher score)
            int days = q.getDeliveryDays() != null ? q.getDeliveryDays() : 30;
            double deliveryScore = maxDelivery == minDelivery ? 100 :
                    ((maxDelivery - days) / (maxDelivery - minDelivery)) * 100;

            // 4. Past performance (accepted quotations count, max 10 = 100)
            long acceptedCount = quotationRepository.findByVendorId(vendor.getId())
                    .stream()
                    .filter(qt -> qt.getStatus() == Quotation.QuotationStatus.ACCEPTED)
                    .count();
            double performanceScore = Math.min((acceptedCount / 10.0) * 100, 100);

            // Weighted final score
            double finalScore = (priceScore * weights.getPriceWeight() / 100)
                    + (qualityScore * weights.getQualityWeight() / 100)
                    + (deliveryScore * weights.getDeliveryWeight() / 100)
                    + (performanceScore * weights.getPerformanceWeight() / 100);

            results.add(new RecommendResult(
                    q.getId(),
                    vendor.getCompanyName(),
                    q.getTotalPrice(),
                    q.getDeliveryDays(),
                    exp,
                    acceptedCount,
                    Math.round(priceScore * 10.0) / 10.0,
                    Math.round(qualityScore * 10.0) / 10.0,
                    Math.round(deliveryScore * 10.0) / 10.0,
                    Math.round(performanceScore * 10.0) / 10.0,
                    Math.round(finalScore * 10.0) / 10.0
            ));
        }

        // Sort by final score descending
        results.sort((a, b) -> Double.compare(b.getFinalScore(), a.getFinalScore()));

        return ResponseEntity.ok(results);
    }

    // ─── Inner classes ────────────────────────────────────────────────────────

    static class RecommendRequest {
        private double priceWeight = 40;
        private double qualityWeight = 25;
        private double deliveryWeight = 20;
        private double performanceWeight = 15;

        public double getPriceWeight() { return priceWeight; }
        public void setPriceWeight(double v) { priceWeight = v; }
        public double getQualityWeight() { return qualityWeight; }
        public void setQualityWeight(double v) { qualityWeight = v; }
        public double getDeliveryWeight() { return deliveryWeight; }
        public void setDeliveryWeight(double v) { deliveryWeight = v; }
        public double getPerformanceWeight() { return performanceWeight; }
        public void setPerformanceWeight(double v) { performanceWeight = v; }
    }

    static class RecommendResult {
        private Long quotationId;
        private String companyName;
        private Double totalPrice;
        private Integer deliveryDays;
        private Integer yearsOfExperience;
        private Long acceptedQuotations;
        private Double priceScore;
        private Double qualityScore;
        private Double deliveryScore;
        private Double performanceScore;
        private Double finalScore;

        public RecommendResult(Long quotationId, String companyName, Double totalPrice,
                               Integer deliveryDays, Integer yearsOfExperience, Long acceptedQuotations,
                               Double priceScore, Double qualityScore, Double deliveryScore,
                               Double performanceScore, Double finalScore) {
            this.quotationId = quotationId;
            this.companyName = companyName;
            this.totalPrice = totalPrice;
            this.deliveryDays = deliveryDays;
            this.yearsOfExperience = yearsOfExperience;
            this.acceptedQuotations = acceptedQuotations;
            this.priceScore = priceScore;
            this.qualityScore = qualityScore;
            this.deliveryScore = deliveryScore;
            this.performanceScore = performanceScore;
            this.finalScore = finalScore;
        }

        public Long getQuotationId() { return quotationId; }
        public String getCompanyName() { return companyName; }
        public Double getTotalPrice() { return totalPrice; }
        public Integer getDeliveryDays() { return deliveryDays; }
        public Integer getYearsOfExperience() { return yearsOfExperience; }
        public Long getAcceptedQuotations() { return acceptedQuotations; }
        public Double getPriceScore() { return priceScore; }
        public Double getQualityScore() { return qualityScore; }
        public Double getDeliveryScore() { return deliveryScore; }
        public Double getPerformanceScore() { return performanceScore; }
        public Double getFinalScore() { return finalScore; }
    }
}