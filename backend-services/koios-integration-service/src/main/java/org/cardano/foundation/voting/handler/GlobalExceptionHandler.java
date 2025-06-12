package org.cardano.foundation.voting.handler;

import org.cardano.foundation.voting.exception.KoiosApiException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(KoiosApiException.class)
    public ResponseEntity<Map<String, Object>> handleKoiosException(KoiosApiException ex) {
        return ResponseEntity
                .internalServerError()
                .body(Map.of(
                        "error", ex.getMessage(),
                        "code", ex.getCode(),
                        "details", ex.getDetails()
                ));
    }
}
