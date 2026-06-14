package com.campusconnect.quotation.controller;

import com.campusconnect.quotation.dto.QuotationRequest;
import com.campusconnect.quotation.dto.QuotationResponse;
import com.campusconnect.quotation.service.QuotationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/quotation")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class QuotationController {

    private final QuotationService quotationService;

    @PostMapping("/rfq/{rfqId}")
    public ResponseEntity<QuotationResponse> submitQuotation(
            @AuthenticationPrincipal String email,
            @PathVariable Long rfqId,
            @Valid @RequestBody QuotationRequest request) {
        return ResponseEntity.ok(quotationService.submitQuotation(email, rfqId, request));
    }

    @GetMapping("/rfq/{rfqId}")
    public ResponseEntity<List<QuotationResponse>> getQuotationsForRFQ(
            @AuthenticationPrincipal String email,
            @PathVariable Long rfqId) {
        return ResponseEntity.ok(quotationService.getQuotationsForRFQ(email, rfqId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<QuotationResponse>> getMyQuotations(
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(quotationService.getMyQuotations(email));
    }

    @PatchMapping("/{quotationId}/accept")
    public ResponseEntity<QuotationResponse> acceptQuotation(
            @AuthenticationPrincipal String email,
            @PathVariable Long quotationId) {
        return ResponseEntity.ok(quotationService.acceptQuotation(email, quotationId));
    }
}