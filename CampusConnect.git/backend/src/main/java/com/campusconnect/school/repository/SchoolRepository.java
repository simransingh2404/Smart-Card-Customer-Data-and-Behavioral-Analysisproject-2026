package com.campusconnect.school.repository;

import com.campusconnect.school.entity.School;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SchoolRepository extends JpaRepository<School, Long> {
    Optional<School> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
}