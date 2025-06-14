package com.cardano.foundation.candidateapp.controller;

import com.cardano.foundation.candidateapp.controller.candidate.CompanyCandidateController;
import com.cardano.foundation.candidateapp.service.candidate.CompanyCandidateService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CompanyCandidateController.class)
@Import(CompanyCandidateControllerValidationTest.MockConfig.class)
class CompanyCandidateControllerValidationTest {

    @Resource MockMvc mockMvc;
    @Resource ObjectMapper objectMapper;

    @TestConfiguration
    static class MockConfig {
        @Bean
        public CompanyCandidateService service() {
            return Mockito.mock(CompanyCandidateService.class);
        }
    }

    @Test
    void shouldReturn400ForMissingRequiredFields() throws Exception {
        String json = """
        {
          "candidate": {
            "candidateType": "company",
            "country": "Poland",
            "publicContact": "test handle"
          },
          "keyContactPerson": "CEO"
        }
        """;

        mockMvc.perform(post("/api/companies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.fieldErrors.['candidate.name']").value("must not be blank"))
                .andExpect(jsonPath("$.fieldErrors.['candidate.email']").value("must not be blank"));
    }
}
