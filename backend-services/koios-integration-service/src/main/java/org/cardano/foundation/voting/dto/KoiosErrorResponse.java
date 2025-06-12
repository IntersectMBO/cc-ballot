package org.cardano.foundation.voting.dto;

import lombok.Data;

@Data
public class KoiosErrorResponse {
    private String code;
    private String message;
    private String hint;
    private String details;
}
