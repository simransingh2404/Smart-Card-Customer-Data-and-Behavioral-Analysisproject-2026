package com.campusconnect.quotation.repository;

import com.campusconnect.quotation.entity.Quotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, Long> {
    List<Quotation> findByRfqId(Long rfqId);
    List<Quotation> findByVendorId(Long vendorId);
    boolean existsByRfqIdAndVendorId(Long rfqId, Long vendorId);
}