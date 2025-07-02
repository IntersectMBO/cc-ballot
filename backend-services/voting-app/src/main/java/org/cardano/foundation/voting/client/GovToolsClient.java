package org.cardano.foundation.voting.client;

import io.vavr.control.Either;
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
public class GovToolsClient {

    private final RestTemplate restTemplate;

    @Value("${govtools.api.url}")
    private String govToolsApiUrl;

    public Either<Problem, Long> getDRepVotingPower(String hexDRepId) {
        var url = String.format("%s/drep/get-voting-power/" + hexDRepId, govToolsApiUrl);

        try {
            val votingPower = restTemplate.getForObject(url, Long.class);

            return Either.right(votingPower);
        } catch (HttpClientErrorException e) {
            return Either.left(Problem.builder()
                    .withTitle("VERIFICATION_ERROR")
                    .withDetail("Unable to get DRep voting power from govtools api, reason:" + e.getMessage() + ". Hex DRep id: " + hexDRepId)
                    .withStatus(new HttpStatusAdapter(e.getStatusCode()))
                    .build());
        }
    }
}
