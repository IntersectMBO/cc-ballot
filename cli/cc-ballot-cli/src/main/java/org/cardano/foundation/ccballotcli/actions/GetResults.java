package org.cardano.foundation.ccballotcli.actions;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Properties;
import java.io.InputStream;

public class GetResults {

    private static Properties loadConfig() {
        Properties prop = new Properties();
        try (InputStream input = GetResults.class.getClassLoader().getResourceAsStream("config.properties")) {
            if (input == null) {
                System.err.println("⚠️ config.properties not found.");
                return prop;
            }
            prop.load(input);
        } catch (Exception e) {
            System.err.println("⚠️ Error reading config.properties: " + e.getMessage());
        }
        return prop;
    }

    public static void execute(String[] args) {
        Properties config = loadConfig();

        String baseUrl = config.getProperty("api.base_url", "http://localhost:9091");
        String event = config.getProperty("event", "default_event");
        String category = config.getProperty("category", "default_category");

        String endpoint = String.format("/api/leaderboard/candidate/%s/%s/results", event, category);
        String fullUrl = baseUrl + endpoint;

        try {
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(fullUrl))
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                System.out.println("Results fetched successfully.");
                System.out.println("Response Body:\n" + response.body());
            } else {
                System.err.println("❌ Error while fetching vote results.");
                System.err.println("Response Body: " + response.body());
            }

        } catch (Exception e) {
            System.err.println("❌ Error while retrieving results: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
