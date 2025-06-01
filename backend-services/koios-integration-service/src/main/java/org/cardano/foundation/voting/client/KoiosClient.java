package org.cardano.foundation.voting.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.cardano.foundation.voting.dto.KoiosAccountInfoResponse;
import org.cardano.foundation.voting.dto.KoiosErrorResponse;
import org.cardano.foundation.voting.exception.KoiosApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

@Service
public class KoiosClient {

    @Value("${koios.api.url}")
    private String koiosApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public KoiosAccountInfoResponse getAccountInfo(String stakeAddress) {
        String url = koiosApiUrl + "/api/v1/account_info";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        String requestJson = String.format("{\"_stake_addresses\": [\"%s\"]}", stakeAddress);
        HttpEntity<String> entity = new HttpEntity<>(requestJson, headers);

        try {
            ResponseEntity<KoiosAccountInfoResponse[]> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, KoiosAccountInfoResponse[].class);

            if (response.getBody() != null && response.getBody().length > 0) {
                return response.getBody()[0];
            } else {
                throw new KoiosApiException("Empty response from Koios", "EMPTY", null, null);
            }

        } catch (HttpStatusCodeException ex) {
            try {
                String body = ex.getResponseBodyAsString();
                ObjectMapper mapper = new ObjectMapper();
                KoiosErrorResponse error = mapper.readValue(body, KoiosErrorResponse.class);

                throw new KoiosApiException(
                        error.getMessage(),
                        error.getCode(),
                        error.getHint(),
                        error.getDetails()
                );
            } catch (Exception parseException) {
                // fallback when parsing error response fails
                throw new KoiosApiException("Unexpected error from Koios API", ex.getStatusCode().toString(), null, ex.getResponseBodyAsString());
            }
        }
    }
}