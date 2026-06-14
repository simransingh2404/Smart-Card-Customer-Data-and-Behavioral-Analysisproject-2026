package com.campusconnect.rfq.controller;

import com.campusconnect.rfq.dto.RFQRequest;
import com.campusconnect.rfq.dto.RFQResponse;
import com.campusconnect.rfq.service.RFQService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/rfq")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RFQController {

    private final RFQService rfqService;

    @PostMapping
    public ResponseEntity<RFQResponse> createRFQ(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody RFQRequest request) {
        return ResponseEntity.ok(rfqService.createRFQ(email, request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<RFQResponse>> getMyRFQs(
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(rfqService.getMyRFQs(email));
    }

    @GetMapping("/open")
    public ResponseEntity<List<RFQResponse>> getAllOpenRFQs() {
        return ResponseEntity.ok(rfqService.getAllOpenRFQs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RFQResponse> getRFQById(@PathVariable Long id) {
        return ResponseEntity.ok(rfqService.getRFQById(id));
    }

    @PatchMapping("/{id}/close")
    public ResponseEntity<RFQResponse> closeRFQ(
            @AuthenticationPrincipal String email,
            @PathVariable Long id) {
        return ResponseEntity.ok(rfqService.closeRFQ(email, id));
    }
}