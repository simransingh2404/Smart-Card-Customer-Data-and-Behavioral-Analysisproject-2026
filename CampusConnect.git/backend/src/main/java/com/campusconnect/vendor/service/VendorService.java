package com.campusconnect.vendor.service;

import com.campusconnect.entity.User;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.vendor.dto.VendorRequest;
import com.campusconnect.vendor.dto.VendorResponse;
import com.campusconnect.vendor.entity.Vendor;
import com.campusconnect.vendor.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VendorService {

    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;

    public VendorResponse createProfile(String email, VendorRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (vendorRepository.existsByUserId(user.getId())) {
            throw new RuntimeException("Vendor profile already exists");
        }

        Vendor vendor = new Vendor();
        vendor.setUser(user);
        vendor.setCompanyName(request.getCompanyName());
        vendor.setAddress(request.getAddress());
        vendor.setCity(request.getCity());
        vendor.setState(request.getState());
        vendor.setPincode(request.getPincode());
        vendor.setPhone(request.getPhone());
        vendor.setGstNumber(request.getGstNumber());
        vendor.setBusinessType(request.getBusinessType());
        vendor.setYearsOfExperience(request.getYearsOfExperience());
        vendor.setDescription(request.getDescription());
        vendor.setVerificationStatus(Vendor.VerificationStatus.PENDING);

        vendorRepository.save(vendor);
        return mapToResponse(vendor);
    }

    public VendorResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Vendor vendor = vendorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Vendor profile not found"));

        return mapToResponse(vendor);
    }

    public VendorResponse updateProfile(String email, VendorRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Vendor vendor = vendorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Vendor profile not found"));

        vendor.setCompanyName(request.getCompanyName());
        vendor.setAddress(request.getAddress());
        vendor.setCity(request.getCity());
        vendor.setState(request.getState());
        vendor.setPincode(request.getPincode());
        vendor.setPhone(request.getPhone());
        vendor.setGstNumber(request.getGstNumber());
        vendor.setBusinessType(request.getBusinessType());
        vendor.setYearsOfExperience(request.getYearsOfExperience());
        vendor.setDescription(request.getDescription());

        vendorRepository.save(vendor);
        return mapToResponse(vendor);
    }

    private VendorResponse mapToResponse(Vendor vendor) {
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