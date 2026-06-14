package com.campusconnect.school.service;

import com.campusconnect.entity.User;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.school.dto.SchoolRequest;
import com.campusconnect.school.dto.SchoolResponse;
import com.campusconnect.school.entity.School;
import com.campusconnect.school.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SchoolService {

    private final SchoolRepository schoolRepository;
    private final UserRepository userRepository;

    public SchoolResponse createProfile(String email, SchoolRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (schoolRepository.existsByUserId(user.getId())) {
            throw new RuntimeException("School profile already exists");
        }

        School school = new School();
        school.setUser(user);
        school.setSchoolName(request.getSchoolName());
        school.setAddress(request.getAddress());
        school.setCity(request.getCity());
        school.setState(request.getState());
        school.setPincode(request.getPincode());
        school.setPhone(request.getPhone());
        school.setBoard(request.getBoard());
        school.setStudentStrength(request.getStudentStrength());
        school.setPrincipalName(request.getPrincipalName());

        schoolRepository.save(school);
        return mapToResponse(school);
    }

    public SchoolResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        School school = schoolRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("School profile not found"));

        return mapToResponse(school);
    }

    public SchoolResponse updateProfile(String email, SchoolRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        School school = schoolRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("School profile not found"));

        school.setSchoolName(request.getSchoolName());
        school.setAddress(request.getAddress());
        school.setCity(request.getCity());
        school.setState(request.getState());
        school.setPincode(request.getPincode());
        school.setPhone(request.getPhone());
        school.setBoard(request.getBoard());
        school.setStudentStrength(request.getStudentStrength());
        school.setPrincipalName(request.getPrincipalName());

        schoolRepository.save(school);
        return mapToResponse(school);
    }

    private SchoolResponse mapToResponse(School school) {
        SchoolResponse response = new SchoolResponse();
        response.setId(school.getId());
        response.setSchoolName(school.getSchoolName());
        response.setAddress(school.getAddress());
        response.setCity(school.getCity());
        response.setState(school.getState());
        response.setPincode(school.getPincode());
        response.setPhone(school.getPhone());
        response.setBoard(school.getBoard());
        response.setStudentStrength(school.getStudentStrength());
        response.setPrincipalName(school.getPrincipalName());
        response.setEmail(school.getUser().getEmail());
        response.setCreatedAt(school.getCreatedAt());
        return response;
    }
}