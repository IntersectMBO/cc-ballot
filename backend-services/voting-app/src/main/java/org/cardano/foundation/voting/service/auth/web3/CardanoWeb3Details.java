package org.cardano.foundation.voting.service.auth.web3;

import io.vavr.control.Either;
import lombok.Builder;
import lombok.Getter;
import org.cardano.foundation.voting.domain.web3.CIP93Envelope;
import org.cardano.foundation.voting.domain.web3.SignedCIP30;
import org.cardanofoundation.cip30.MessageFormat;
import org.zalando.problem.Problem;

import java.util.Map;
import java.util.Optional;

@Getter
@Builder
public class CardanoWeb3Details implements Web3ConcreteDetails {

    private Web3CommonDetails web3CommonDetails;

    private CustomCip30VerificationResult cip30VerificationResult;
    private CIP93Envelope<Map<String, Object>> envelope;
    private SignedCIP30 signedCIP30;
    private String payload;

    public String getUri() {
        return envelope.getUri();
    }

    @Override
    public Either<Problem, Long> getRequestSlot() {
        return envelope.getSlotAsLong();
    }

    @Override
    public Map<String, Object> getData() {
        return envelope.getData();
    }

    public String getSignature() {
        return signedCIP30.getSignature();
    }

    public String getPayload() {
        if (cip30VerificationResult.isHashed()) {
            return payload;
        }

        return cip30VerificationResult.getMessage(MessageFormat.TEXT);
    }

    public Optional<String> getPublicKey() {
        return signedCIP30.getPublicKey();
    }

    public Optional<String> getOobi() {
        return Optional.empty();
    }

    @Override
    public String getSignedJson() {
        return cip30VerificationResult.getMessage(MessageFormat.TEXT);
    }

}
