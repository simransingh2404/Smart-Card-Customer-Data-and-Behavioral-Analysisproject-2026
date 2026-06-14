package com.campusconnect.vendor.controller;

import com.campusconnect.vendor.dto.VendorRequest;
import com.campusconnect.vendor.dto.VendorResponse;
import com.campusconnect.vendor.service.VendorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/vendor")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VendorController {

    private final VendorService vendorService;

    @PostMapping("/profile")
    public ResponseEntity<VendorResponse> createProfile(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody VendorRequest request) {
        return ResponseEntity.ok(vendorService.createProfile(email, request));
    }

    @GetMapping("/profile")
    public ResponseEntity<VendorResponse> getProfile(
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(vendorService.getProfile(email));
    }

    @PutMapping("/profile")
    public ResponseEntity<VendorResponse> updateProfile(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody VendorRequest request) {
        return ResponseEntity.ok(vendorService.updateProfile(email, request));
    }
}