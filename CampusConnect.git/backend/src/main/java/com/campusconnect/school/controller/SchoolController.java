package com.campusconnect.school.controller;

import com.campusconnect.school.dto.SchoolRequest;
import com.campusconnect.school.dto.SchoolResponse;
import com.campusconnect.school.service.SchoolService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/school")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SchoolController {

    private final SchoolService schoolService;

    @PostMapping("/profile")
    public ResponseEntity<SchoolResponse> createProfile(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody SchoolRequest request) {
        return ResponseEntity.ok(schoolService.createProfile(email, request));
    }

    @GetMapping("/profile")
    public ResponseEntity<SchoolResponse> getProfile(
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(schoolService.getProfile(email));
    }

    @PutMapping("/profile")
    public ResponseEntity<SchoolResponse> updateProfile(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody SchoolRequest request) {
        return ResponseEntity.ok(schoolService.updateProfile(email, request));
    }
}