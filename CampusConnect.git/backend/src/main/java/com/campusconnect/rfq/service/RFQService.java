package com.campusconnect.rfq.service;

import com.campusconnect.entity.User;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.rfq.dto.RFQRequest;
import com.campusconnect.rfq.dto.RFQResponse;
import com.campusconnect.rfq.entity.RFQ;
import com.campusconnect.rfq.repository.RFQRepository;
import com.campusconnect.school.entity.School;
import com.campusconnect.school.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RFQService {

    private final RFQRepository rfqRepository;
    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;

    public RFQResponse createRFQ(String email, RFQRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isVerified()) {
            throw new RuntimeException("Your account is not verified yet. Please wait for admin approval.");
        }

        School school = schoolRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("School profile not found. Please create a profile first."));

        RFQ rfq = new RFQ();
        rfq.setSchool(school);
        rfq.setTitle(request.getTitle());
        rfq.setDescription(request.getDescription());
        rfq.setUniformType(request.getUniformType());
        rfq.setQuantity(request.getQuantity());
        rfq.setSizes(request.getSizes());
        rfq.setBudget(request.getBudget());
        rfq.setDeadline(request.getDeadline());
        rfq.setDeliveryAddress(request.getDeliveryAddress());
        rfq.setStatus(RFQ.RFQStatus.OPEN);

        rfqRepository.save(rfq);
        return mapToResponse(rfq);
    }

    public List<RFQResponse> getMyRFQs(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        School school = schoolRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("School profile not found"));

        return rfqRepository.findBySchoolId(school.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<RFQResponse> getAllOpenRFQs() {
        return rfqRepository.findByStatus(RFQ.RFQStatus.OPEN)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public RFQResponse getRFQById(Long id) {
        RFQ rfq = rfqRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("RFQ not found"));
        return mapToResponse(rfq);
    }

    public RFQResponse closeRFQ(String email, Long rfqId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        School school = schoolRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("School profile not found"));

        RFQ rfq = rfqRepository.findById(rfqId)
                .orElseThrow(() -> new RuntimeException("RFQ not found"));

        if (!rfq.getSchool().getId().equals(school.getId())) {
            throw new RuntimeException("Unauthorized to close this RFQ");
        }

        rfq.setStatus(RFQ.RFQStatus.CLOSED);
        rfqRepository.save(rfq);
        return mapToResponse(rfq);
    }

    private RFQResponse mapToResponse(RFQ rfq) {
        RFQResponse response = new RFQResponse();
        response.setId(rfq.getId());
        response.setTitle(rfq.getTitle());
        response.setDescription(rfq.getDescription());
        response.setUniformType(rfq.getUniformType());
        response.setQuantity(rfq.getQuantity());
        response.setSizes(rfq.getSizes());
        response.setBudget(rfq.getBudget());
        response.setDeadline(rfq.getDeadline());
        response.setDeliveryAddress(rfq.getDeliveryAddress());
        response.setStatus(rfq.getStatus().name());
        response.setSchoolName(rfq.getSchool().getSchoolName());
        response.setSchoolCity(rfq.getSchool().getCity());
        response.setCreatedAt(rfq.getCreatedAt());
        return response;
    }
}