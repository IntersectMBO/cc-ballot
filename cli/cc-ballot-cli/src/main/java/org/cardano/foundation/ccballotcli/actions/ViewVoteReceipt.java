package org.cardano.foundation.ccballotcli.actions;

import com.fasterxml.jackson.databind.JsonNode;
import org.cardano.foundation.ccballotcli.util.ConfigUtil;
import org.cardano.foundation.ccballotcli.util.JsonUtil;

import java.io.IOException;
import java.net.URI;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Properties;

public class ViewVoteReceipt {
    public static void execute(String[] args) {
        if (args.length < 4) {
            System.out.println("Usage: cc-ballot-cli view_vote_receipt <payloadStr> <signature> <publicKey>");
            return;
        }

        String payloadFilePath = args[1];
        String signature = args[2];
        String publicKey = args[3];

        String payloadStr;
        JsonNode payloadJson;
        try {
            payloadStr = Files.readString(Paths.get(payloadFilePath), StandardCharsets.UTF_8);
            payloadJson = JsonUtil.parse(payloadStr);
            payloadStr = payloadJson.toString();
        } catch (IOException e) {
            System.err.println("❌ Could not read payload file: " + e.getMessage());
            return;
        } catch (Exception e) {
            System.err.println("❌ Invalid JSON in payload file: " + e.getMessage());
            return;
        }

        Properties config = ConfigUtil.loadConfig();
        String baseUrl = config.getProperty("api.base_url", "http://localhost:9091");
        String expectedEvent = config.getProperty("event");
        String expectedCategory = config.getProperty("category");
        String expectedProposal = config.getProperty("proposal");
        String expectedNetwork = config.getProperty("network");

        if (!payloadStr.contains("\"event\":\"" + expectedEvent + "\"") ||
                !payloadStr.contains("\"category\":\"" + expectedCategory + "\"") ||
                !payloadStr.contains("\"proposal\":\"" + expectedProposal + "\"") ||
                !payloadStr.contains("\"network\":\"" + expectedNetwork + "\"")) {
            System.err.println("❌ Payload mismatch: network, event, category or proposal is incorrect.");
            return;
        }

        if (payloadStr.contains("\"walletId\":\"<INSERT_YOUR_WALLET_ID>\"")) {
            System.err.println("You must provide your wallet ID in the payload to view your vote receipt.");
            return;
        }

        String endpoint = "/api/vote/candidate/receipt";

        try {
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + endpoint))
                    .header("Content-Type", "application/json")
                    .header("X-Ballot-Signature", signature)
                    .header("X-Ballot-Payload", payloadStr)
                    .header("X-Ballot-Public-Key", publicKey)
                    .header("X-Ballot-Wallet-Type", "CARDANO")
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                System.out.println("Receipt fetched successfully.");
                System.out.println("Response Body:\n" + response.body());
            } else {
                System.err.println("❌ Error while fetching vote receipt.");
                System.err.println("Response Body: " + response.body());
            }

        } catch (Exception e) {
            System.err.println("❌ Error while viewing vote receipt: " + e.getMessage());
            e.printStackTrace();
        }
    }
}