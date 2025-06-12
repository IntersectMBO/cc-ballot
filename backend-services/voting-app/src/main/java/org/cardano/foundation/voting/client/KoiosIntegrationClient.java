package org.cardano.foundation.voting.client;

import io.vavr.control.Either;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.zalando.problem.Problem;
import org.zalando.problem.spring.common.HttpStatusAdapter;

@Component
@Slf4j
@RequiredArgsConstructor
public class KoiosIntegrationClient {

    private final RestTemplate restTemplate;

    @Value("${koios.integration.app.base.url}")
    private String koiosIntegrationBaseUrl;

    public Either<Problem, Boolean> isDRep(String stakeAddress) {
        var url = String.format("%s/api/account-info?stakeAddress=" + stakeAddress, koiosIntegrationBaseUrl);

        try {
            val isVerifiedResponse = restTemplate.getForObject(url, KoiosAccountInfoResponse.class);

            return Either.right(isVerifiedResponse != null && isVerifiedResponse.getDelegated_drep() != null
                    && isVerifiedResponse.getDelegated_drep().startsWith("drep1"));
        } catch (HttpClientErrorException e) {
            return Either.left(Problem.builder()
                    .withTitle("VERIFICATION_ERROR")
                    .withDetail("Unable to get DRep status from koios-integration-service, reason:" + e.getMessage())
                    .withStatus(new HttpStatusAdapter(e.getStatusCode()))
                    .build());
        }
    }

    @Data
    public static class KoiosAccountInfoResponse {
        private String stake_address;
        private String status;
        private String delegated_pool;
        private String delegated_drep;
        private String total_balance;
        private String utxo;
        private String rewards;
        private String withdrawals;
        private String rewards_available;
        private String deposit;
        private String reserves;
        private String treasury;
        private String proposal_refund;
    }

}
