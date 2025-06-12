package org.cardano.foundation.ccballotcli.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class JsonUtil {
    private static final ObjectMapper mapper = new ObjectMapper();

    public static JsonNode parse(String json) throws Exception {
        return mapper.readTree(json);
    }
}
