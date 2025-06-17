package org.cardano.foundation.voting.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class CandidatePayload {
    private CandidatePayloadData data;

    @Data
    @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CandidatePayloadData {
        private List<Long> votes;
    }
}
