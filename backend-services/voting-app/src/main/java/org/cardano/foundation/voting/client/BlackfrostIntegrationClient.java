package org.cardano.foundation.voting.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.vavr.control.Either;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.cardano.foundation.voting.domain.web3.WalletType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.zalando.problem.Problem;
import org.zalando.problem.Status;
import org.zalando.problem.spring.common.HttpStatusAdapter;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Component
@Slf4j
@RequiredArgsConstructor
public class BlackfrostIntegrationClient {

    private final RestTemplate restTemplate;

    @Value("${blockfrost.url}")
    private String blackfrostUrl;

    @Value("${blockfrost.api.key}")
    private String blackfrostApiKey;

    @Value("${l1.transaction.metadata.label}")
    private String label;

    public Either<Problem, String> getDRepIdByTx(String txHash) {
        try {

            String utxoUrl = String.format("%s/txs/%s/utxos", blackfrostUrl, txHash);
            HttpHeaders headers = new HttpHeaders();
            headers.set("project_id", blackfrostApiKey);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<UtxoResponse> utxoResponse = restTemplate.exchange(
                    utxoUrl,
                    HttpMethod.GET,
                    entity,
                    UtxoResponse.class
            );

            if (utxoResponse.getBody() == null || utxoResponse.getBody().getInputs().isEmpty()) {
                return Either.left(Problem.builder()
                        .withTitle("TX_INPUTS_NOT_FOUND")
                        .withDetail("No inputs found for transaction: " + txHash)
                        .withStatus(Status.NOT_FOUND)
                        .build());
            }

            String address = utxoResponse.getBody().getInputs().get(0).getAddress();


            String addressUrl = String.format("%s/addresses/%s", blackfrostUrl, address);
            ResponseEntity<AddressResponse> addressResponse = restTemplate.exchange(
                    addressUrl,
                    HttpMethod.GET,
                    entity,
                    AddressResponse.class
            );

            if (addressResponse.getBody() == null || addressResponse.getBody().getStake_address() == null) {
                return Either.left(Problem.builder()
                        .withTitle("STAKE_ADDRESS_NOT_FOUND")
                        .withDetail("No stake address found for address: " + address)
                        .withStatus(Status.NOT_FOUND)
                        .build());
            }

            String stakeAddress = addressResponse.getBody().getStake_address();


            String accountUrl = String.format("%s/accounts/%s", blackfrostUrl, stakeAddress);
            ResponseEntity<AccountResponse> accountResponse = restTemplate.exchange(
                    accountUrl,
                    HttpMethod.GET,
                    entity,
                    AccountResponse.class
            );

            if (accountResponse.getBody() == null || accountResponse.getBody().getDrep_id() == null) {
                return Either.left(Problem.builder()
                        .withTitle("DREP_ID_NOT_FOUND")
                        .withDetail("No DRep ID found for stake address: " + stakeAddress)
                        .withStatus(Status.NOT_FOUND)
                        .build());
            }

            return Either.right(accountResponse.getBody().getDrep_id());

        } catch (HttpClientErrorException e) {
            return Either.left(Problem.builder()
                    .withTitle("BLACKFROST_API_ERROR")
                    .withDetail("Failed to fetch DRep ID from Blackfrost: " + e.getMessage())
                    .withStatus(new HttpStatusAdapter(e.getStatusCode()))
                    .build());
        } catch (Exception e) {
            return Either.left(Problem.builder()
                    .withTitle("UNEXPECTED_ERROR")
                    .withDetail("Unexpected error occurred: " + e.getMessage())
                    .withStatus(Status.INTERNAL_SERVER_ERROR)
                    .build());
        }
    }

    public Either<Problem, Long> getSlotByTx(String txHash) {
        try {
            String url = String.format("%s/txs/%s", blackfrostUrl, txHash);

            HttpHeaders headers = new HttpHeaders();
            headers.set("project_id", blackfrostApiKey);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<TransactionSlotResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    TransactionSlotResponse.class
            );

            if (response.getBody() == null || response.getBody().getSlot() == null) {
                return Either.left(Problem.builder()
                        .withTitle("SLOT_NOT_FOUND")
                        .withDetail("No slot found for transaction: " + txHash)
                        .withStatus(Status.NOT_FOUND)
                        .build());
            }

            return Either.right(response.getBody().getSlot());

        } catch (HttpClientErrorException e) {
            return Either.left(Problem.builder()
                    .withTitle("BLACKFROST_API_ERROR")
                    .withDetail("Failed to fetch slot from Blackfrost: " + e.getMessage())
                    .withStatus(new HttpStatusAdapter(e.getStatusCode()))
                    .build());
        } catch (Exception e) {
            return Either.left(Problem.builder()
                    .withTitle("UNEXPECTED_ERROR")
                    .withDetail("Unexpected error occurred: " + e.getMessage())
                    .withStatus(Status.INTERNAL_SERVER_ERROR)
                    .build());
        }
    }

    public Either<Problem, List<BlackfrostTransactionResponse>> getCastVoteTransactions(String eventId, String categoryId) {
        List<BlackfrostTransactionResponse> allTransactions = new ArrayList<>();
        int page = 1;

        while (true) {
            String url = String.format("%s/metadata/txs/labels/%s?page=%d", blackfrostUrl, label, page);

            HttpHeaders headers = new HttpHeaders();
            headers.set("project_id", blackfrostApiKey);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            try {
                ResponseEntity<BlackfrostTransactionResponse[]> response = restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        entity,
                        BlackfrostTransactionResponse[].class
                );

                BlackfrostTransactionResponse[] transactions = response.getBody();
                if (transactions == null || transactions.length == 0) {
                    break;
                }

                for (BlackfrostTransactionResponse transaction : transactions) {
                    if (transaction != null &&
                            transaction.getJson_metadata() != null &&
                            "cast_vote".equals(transaction.getJson_metadata().getAction()) &&
                            transaction.getJson_metadata().getData() != null &&
                            Objects.equals(transaction.getJson_metadata().getData().getEvent(), eventId) &&
                            Objects.equals(transaction.getJson_metadata().getData().getCategory(), categoryId)) {
                        allTransactions.add(transaction);
                    }
                }

                page++;

            } catch (HttpClientErrorException.NotFound e) {
                break; // No more pages
            } catch (HttpClientErrorException e) {
                return Either.left(Problem.builder()
                        .withTitle("GET_TRANSACTIONS_ERROR")
                        .withDetail("Unable to get transactions by label from blackfrost-integration-service, reason: " + e.getMessage())
                        .withStatus(new HttpStatusAdapter(e.getStatusCode()))
                        .build());
            }
        }

        return Either.right(allTransactions);
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class BlackfrostTransactionResponse {
        private String tx_hash;
        private JsonMetadata json_metadata;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class JsonMetadata {
        private DData data;
        private String action;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DData {
        private String id;
        private String event;
        private String network;
        private String category;
        private String proposal;
        private WalletType walletType;
        private List<Long> votes;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class UtxoResponse {
        private List<Input> inputs;

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Input {
            private String address;
        }
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AddressResponse {
        private String stake_address;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AccountResponse {
        private String drep_id;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TransactionSlotResponse {
        private Long slot;
    }

}
