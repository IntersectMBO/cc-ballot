package com.cardano.foundation.candidateapp.controller;

import com.cardano.foundation.candidateapp.controller.candidate.IndividualCandidateController;
import com.cardano.foundation.candidateapp.dto.candidate.CandidateResponseDto;
import com.cardano.foundation.candidateapp.dto.candidate.IndividualCandidateResponseDto;
import com.cardano.foundation.candidateapp.model.candidate.CandidateType;
import com.cardano.foundation.candidateapp.service.candidate.IndividualCandidateService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import jakarta.annotation.Resource;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = IndividualCandidateController.class)
@Import(IndividualCandidateControllerTest.MockedServiceConfig.class)
class IndividualCandidateControllerTest {

    @Resource
    MockMvc mockMvc;

    @Resource
    IndividualCandidateService service;

    @Resource
    ObjectMapper objectMapper;

    @TestConfiguration
    static class MockedServiceConfig {
        @Bean
        public IndividualCandidateService individualCandidateService() {
            return Mockito.mock(IndividualCandidateService.class);
        }
    }

    @Test
    void shouldCreateCandidate() throws Exception {
        CandidateResponseDto candidate = CandidateResponseDto.builder()
                .name("Jane Doe")
                .email("jane@x.com")
                .publicContact("jane@x.com")
                .country("Country")
                .walletAddress("walletAddress")
                .candidateType(CandidateType.individual)
                .build();

        IndividualCandidateResponseDto request = new IndividualCandidateResponseDto(candidate);
        IndividualCandidateResponseDto response = new IndividualCandidateResponseDto(candidate);

        when(service.create(any(), anyBoolean())).thenReturn(response);

        mockMvc.perform(post("/api/individuals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.candidate.name").value("Jane Doe"))
                .andExpect(jsonPath("$.candidate.walletAddress").value("walletAddress"));

        verify(service).create(any(), anyBoolean());
    }
}
