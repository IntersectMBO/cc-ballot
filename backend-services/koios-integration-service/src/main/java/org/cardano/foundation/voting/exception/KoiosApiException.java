package org.cardano.foundation.voting.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@Getter
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class KoiosApiException extends RuntimeException {
    private final String code;
    private final String hint;
    private final String details;

    public KoiosApiException(String message, String code, String hint, String details) {
        super(message);
        this.code = code;
        this.hint = hint;
        this.details = details;
    }
}
