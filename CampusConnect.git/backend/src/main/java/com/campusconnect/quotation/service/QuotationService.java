package com.campusconnect.quotation.service;

import com.campusconnect.entity.User;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.quotation.dto.QuotationRequest;
import com.campusconnect.quotation.dto.QuotationResponse;
import com.campusconnect.quotation.entity.Quotation;
import com.campusconnect.quotation.repository.QuotationRepository;
import com.campusconnect.rfq.entity.RFQ;
import com.campusconnect.rfq.repository.RFQRepository;
import com.campusconnect.vendor.entity.Vendor;
import com.campusconnect.vendor.repository.VendorRepository;
import com.campusconnect.school.repository.SchoolRepository;
import com.campusconnect.school.entity.School;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuotationService {

    private final QuotationRepository quotationRepository;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final RFQRepository rfqRepository;
    private final SchoolRepository schoolRepository;

    public QuotationResponse submitQuotation(String email, Long rfqId, QuotationRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isVerified()) {
            throw new RuntimeException("Your account is not verified yet. Please wait for admin approval.");
        }

        Vendor vendor = vendorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Vendor profile not found"));

        RFQ rfq = rfqRepository.findById(rfqId)
                .orElseThrow(() -> new RuntimeException("RFQ not found"));

        if (rfq.getStatus() != RFQ.RFQStatus.OPEN) {
            throw new RuntimeException("RFQ is not open for quotations");
        }

        if (quotationRepository.existsByRfqIdAndVendorId(rfqId, vendor.getId())) {
            throw new RuntimeException("You have already submitted a quotation for this RFQ");
        }

        Quotation quotation = new Quotation();
        quotation.setRfq(rfq);
        quotation.setVendor(vendor);
        quotation.setTotalPrice(request.getTotalPrice());
        quotation.setDeliveryDays(request.getDeliveryDays());
        quotation.setSampleAvailable(request.getSampleAvailable());
        quotation.setAdditionalNotes(request.getAdditionalNotes());
        quotation.setTermsAndConditions(request.getTermsAndConditions());
        quotation.setStatus(Quotation.QuotationStatus.SUBMITTED);

        quotationRepository.save(quotation);
        return mapToResponse(quotation);
    }

    public List<QuotationResponse> getQuotationsForRFQ(String email, Long rfqId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        School school = schoolRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("School profile not found"));

        RFQ rfq = rfqRepository.findById(rfqId)
                .orElseThrow(() -> new RuntimeException("RFQ not found"));

        if (!rfq.getSchool().getId().equals(school.getId())) {
            throw new RuntimeException("Unauthorized to view these quotations");
        }

        return quotationRepository.findByRfqId(rfqId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<QuotationResponse> getMyQuotations(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Vendor vendor = vendorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Vendor profile not found"));

        return quotationRepository.findByVendorId(vendor.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public QuotationResponse acceptQuotation(String email, Long quotationId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        School school = schoolRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("School profile not found"));

        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));

        if (!quotation.getRfq().getSchool().getId().equals(school.getId())) {
            throw new RuntimeException("Unauthorized to accept this quotation");
        }

        quotation.setStatus(Quotation.QuotationStatus.ACCEPTED);
        quotationRepository.save(quotation);

        List<Quotation> otherQuotations = quotationRepository.findByRfqId(quotation.getRfq().getId());
        otherQuotations.stream()
                .filter(q -> !q.getId().equals(quotationId))
                .forEach(q -> {
                    q.setStatus(Quotation.QuotationStatus.REJECTED);
                    quotationRepository.save(q);
                });

        RFQ rfq = quotation.getRfq();
        rfq.setStatus(RFQ.RFQStatus.AWARDED);
        rfqRepository.save(rfq);

        return mapToResponse(quotation);
    }

    private QuotationResponse mapToResponse(Quotation quotation) {
        QuotationResponse response = new QuotationResponse();
        response.setId(quotation.getId());
        response.setRfqId(quotation.getRfq().getId());
        response.setRfqTitle(quotation.getRfq().getTitle());
        response.setSchoolName(quotation.getRfq().getSchool().getSchoolName());
        response.setVendorId(quotation.getVendor().getId());
        response.setCompanyName(quotation.getVendor().getCompanyName());
        response.setTotalPrice(quotation.getTotalPrice());
        response.setDeliveryDays(quotation.getDeliveryDays());
        response.setSampleAvailable(quotation.getSampleAvailable());
        response.setAdditionalNotes(quotation.getAdditionalNotes());
        response.setTermsAndConditions(quotation.getTermsAndConditions());
        response.setStatus(quotation.getStatus().name());
        response.setCreatedAt(quotation.getCreatedAt());
        return response;
    }
}