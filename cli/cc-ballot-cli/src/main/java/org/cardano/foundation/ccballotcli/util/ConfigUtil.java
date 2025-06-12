package org.cardano.foundation.ccballotcli.util;

import java.io.InputStream;
import java.util.Properties;

public class ConfigUtil {
    public static Properties loadConfig() {
        Properties prop = new Properties();
        try (InputStream input = ConfigUtil.class.getClassLoader().getResourceAsStream("config.properties")) {
            if (input != null) {
                prop.load(input);
            } else {
                System.err.println("⚠️ config.properties not found.");
            }
        } catch (Exception e) {
            System.err.println("⚠️ Error loading config.properties: " + e.getMessage());
        }
        return prop;
    }
}
