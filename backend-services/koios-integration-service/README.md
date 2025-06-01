# Koios Integration Service

````markdown
# Cardano Koios Integration Service

A lightweight Spring Boot 3.2+ service that exposes a single endpoint to retrieve staking account information from the Cardano blockchain via the [Koios REST API](https://api.koios.rest/).

## 🛠 Technologies Used

- Java 21
- Spring Boot 3.2+
- Gradle Kotlin DSL (`build.gradle.kts`)
- Lombok
- Springdoc OpenAPI (Swagger UI)
- Koios REST API (preprod/prod switch)

---

## 🔧 Configuration

Edit `src/main/resources/application.properties` to define the target Koios environment:

```properties
# Choose preprod or prod (pros is https://api.koios.rest as of writing this readme)
koios.api.url=https://preprod.koios.rest

# CORS allower origins
cors.allowed.origins=${CORS_ALLOWED_ORIGINS:http://localhost:3000}

# Server port
server.port=9096

# Swagger configuration (optional)
springdoc.api-docs.path=/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
````

---

## 🚀 How to Run

1. Build and run the application:

   ```bash
   ./gradlew bootRun
   ```

2. Access Swagger UI (API docs):

   ```
   http://localhost:9096/swagger-ui.html
   ```

---

## 📡 API Endpoint

### `GET /api/account-info`

Fetch staking account information by stake address.

**Query Parameters:**

| Name         | Type   | Required | Description                    |
| ------------ | ------ | -------- | ------------------------------ |
| stakeAddress | string | ✅ yes    | Bech32-formatted stake address |

**Example:**

```bash
curl -X GET "http://localhost:9096/api/account-info?stakeAddress=stake_test1ur4tlkekknpd9vgd7fncwhctunlnadwwvlfzk5nk0u7rkgsdq4xct"
```

**Success Response (HTTP 200):**

```json
{
  "stake_address": "stake_test1...",
  "status": "registered",
  "delegated_pool": "pool1...",
  "total_balance": "9997811971",
  ...
}
```

**Error Response (HTTP 500):**

```json
{
  "error": "Failed to decode Bech32 string: Checksum(InvalidResidue)",
  "code": "XX000",
  "details": null
}
```

---

## 📁 Project Structure

```
src/
 └─ main/
     ├─ java/org/cardano/foundation/voting/
     │   ├─ config/             # Web config
     │   ├─ controller/         # REST controller
     │   ├─ client/             # Koios API client
     │   ├─ dto/                # DTOs and error models
     │   ├─ exception/          # Custom exception types
     │   └─ handler/            # Global error handling
     └─ resources/
         └─ application.properties
```

---
