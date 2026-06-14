package com.campusconnect.rfq.repository;

import com.campusconnect.rfq.entity.RFQ;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RFQRepository extends JpaRepository<RFQ, Long> {
    List<RFQ> findBySchoolId(Long schoolId);
    List<RFQ> findByStatus(RFQ.RFQStatus status);
    List<RFQ> findBySchoolIdAndStatus(Long schoolId, RFQ.RFQStatus status);
}