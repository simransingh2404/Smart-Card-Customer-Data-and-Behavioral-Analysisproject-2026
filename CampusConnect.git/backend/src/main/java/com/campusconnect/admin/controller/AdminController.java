package com.campusconnect.admin.controller;

import com.campusconnect.vendor.entity.Vendor;
import com.campusconnect.vendor.repository.VendorRepository;
import com.campusconnect.vendor.dto.VendorResponse;
import com.campusconnect.rfq.repository.RFQRepository;
import com.campusconnect.quotation.repository.QuotationRepository;
import com.campusconnect.entity.User;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.school.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;
    private final RFQRepository rfqRepository;
    private final QuotationRepository quotationRepository;
    private final SchoolRepository schoolRepository;

    // Get all vendors
    @GetMapping("/vendors")
    public ResponseEntity<List<VendorResponse>> getAllVendors() {
        List<VendorResponse> vendors = vendorRepository.findAll()
                .stream().map(this::mapVendorToResponse).collect(Collectors.toList());
        return ResponseEntity.ok(vendors);
    }

    // Verify a vendor (verificationStatus)
    @PatchMapping("/vendors/{vendorId}/verify")
    public ResponseEntity<VendorResponse> verifyVendor(@PathVariable Long vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        vendor.setVerificationStatus(Vendor.VerificationStatus.VERIFIED);
        vendorRepository.save(vendor);
        return ResponseEntity.ok(mapVendorToResponse(vendor));
    }

    // Reject a vendor (verificationStatus)
    @PatchMapping("/vendors/{vendorId}/reject")
    public ResponseEntity<VendorResponse> rejectVendor(@PathVariable Long vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        vendor.setVerificationStatus(Vendor.VerificationStatus.REJECTED);
        vendorRepository.save(vendor);
        return ResponseEntity.ok(mapVendorToResponse(vendor));
    }

    // Verify a user (school or vendor) — grants platform access
    @PatchMapping("/users/{userId}/verify")
    public ResponseEntity<?> verifyUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setVerified(true);
        userRepository.save(user);
        return ResponseEntity.ok("User verified successfully");
    }

    // Reject a user — revokes platform access
    @PatchMapping("/users/{userId}/reject")
    public ResponseEntity<?> rejectUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setVerified(false);
        userRepository.save(user);
        return ResponseEntity.ok("User rejected");
    }

    // Get all users
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // Get all schools
    @GetMapping("/schools")
    public ResponseEntity<?> getAllSchools() {
        return ResponseEntity.ok(schoolRepository.findAll());
    }

    // Get all RFQs
    @GetMapping("/rfqs")
    public ResponseEntity<?> getAllRFQs() {
        return ResponseEntity.ok(rfqRepository.findAll());
    }

    // Get all quotations
    @GetMapping("/quotations")
    public ResponseEntity<?> getAllQuotations() {
        return ResponseEntity.ok(quotationRepository.findAll());
    }

    private VendorResponse mapVendorToResponse(Vendor vendor) {
        VendorResponse response = new VendorResponse();
        response.setId(vendor.getId());
        response.setCompanyName(vendor.getCompanyName());
        response.setAddress(vendor.getAddress());
        response.setCity(vendor.getCity());
        response.setState(vendor.getState());
        response.setPincode(vendor.getPincode());
        response.setPhone(vendor.getPhone());
        response.setGstNumber(vendor.getGstNumber());
        response.setBusinessType(vendor.getBusinessType());
        response.setYearsOfExperience(vendor.getYearsOfExperience());
        response.setDescription(vendor.getDescription());
        response.setVerificationStatus(vendor.getVerificationStatus().name());
        response.setEmail(vendor.getUser().getEmail());
        response.setCreatedAt(vendor.getCreatedAt());
        return response;
    }
}