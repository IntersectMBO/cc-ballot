# 🗳 cc-ballot-cli

A cross-platform command-line tool to interact with a blockchain-based voting API, designed for secure, offline voting with a streamlined user experience.

---

## 🚀 Features

* **Cast a Vote** – Submit signed payloads.
* **View Vote Receipt** – Retrieve your vote confirmation.
* **Get Results** – Query results from a live API.

---

## 🛠 Installation for Users

### 💾 Quick Setup (Linux/macOS)

1. **Java 17+** is required on the client machine.

2. **Download** the latest release `.zip` from [releases page](https://github.com/IntersectMBO/cc-ballot/releases).

2. **Extract** it:

   ```bash
   unzip cc-ballot-cli.zip && cd cc-ballot-cli
   ```

3. **Install** the CLI globally:

   ```bash
   ./install.sh
   ```

4. ✅ Done! Now run commands like:

   ```bash
   cc-ballot-cli cast_vote payload.json SIGNATURE PUBKEY
   ```
   
---

## 🖥️ CLI Usage

---

## 🗳️ How to Vote (for DReps Only)

> ⚠️ **Only DReps can vote using this CLI. You must sign the vote with your official DRep signing key.**

Follow these 4 simple steps to cast your vote in the **2025 Constitutional Committee elections**:

---

### ✅ Step 1: Get Your Vote Payload

1. Visit the official web app: **"2025 Constitutional Committee elections"**
2. Download your personalized **payload.json** — it will look similar to this:

```json
{
  "action": "cast_vote",
  "slot": "<insert current Cardano slot>",
  "data": {
    "event": "2025_06_09_TEST_VOTE",
    "category": "CATEGORY_TEST1_0306",
    "proposal": "0f0904c4-80a5-4be8-bae8-42efce0f3097",
    "id": "7df89449-0fbf-4a8a-b3eb-a9b547bf8e89",
    "votedAt": "<insert current Cardano slot>",
    "timestamp": 1749722588,
    "walletId": "<your DRep ID here>",
    "walletType": "CARDANO",
    "network": "PREPROD",
    "votes": [2, 5, 15]
  }
}
```

Replace:

* `<insert current Cardano slot>` with the actual slot number at the time of voting.
* `<your DRep ID here>` with your **DRep ID** (this is your wallet ID as a DRep).

---

### ✍️ Step 2: Sign the Payload

You need to **sign the payload** using your DRep signing key.

You can use any tool that supports Cardano data signing:

#### Example Option – `cardano-signer`

```bash
./cardano-signer sign --cip8 \
--data '{"action":"cast_vote","data":{"event":"2025_06_09_TEST_VOTE","category":"CATEGORY_TEST1_0306","proposal":"0f0904c4-80a5-4be8-bae8-42efce0f3097","id":"00b63492-1354-4faf-9ac2-f8bb4fe49198","timestamp":1749726430,"votes":[4,7,5,8]}}' \
--secret-key myDrep.drep.skey \
--address myDrep.drep.id --json
```


This will give you:

* a **signature**
* your **public key** (used for verification)

---

### 🚀 Step 3: Cast the Vote

Run the CLI command with your payload file, signature, and public key:

```bash
cc-ballot-cli cast_vote payload.json <signature> <publicKey>
```

For example:

```bash
cc-ballot-cli cast_vote payload.json "abc123signature" "abcdef123456pubkey"
```

✅ If successful, your vote is recorded, and you'll receive a vote receipt.

---

### 🔎 Step 4 (Optional): View Your Vote Receipt

To retrieve and verify your submitted vote:

```bash
cc-ballot-cli view_vote_receipt payload.json <signature> <publicKey>
```

---

## 🧠 Summary

| Step | Action                                                    |
| ---- | --------------------------------------------------------- |
| 1️⃣  | Get `payload.json` from the elections web app             |
| 2️⃣  | Insert your **DRep ID** and Cardano slot into the payload |
| 3️⃣  | Sign it using your **DRep key**                           |
| 4️⃣  | Submit it using `cc-ballot-cli cast_vote`                 |

> 🔐 **Reminder**: Never share your private key. Only the signature and public key are needed.

---

## 🧰 Developer & DevOps Guide

This section explains how to build, package, and publish the CLI for distribution.

---

### 🏗️ 1. Build the JAR

Ensure this block is in your `build.gradle.kts` to create an executable fat JAR:

```kotlin
tasks.register<Jar>("fatJar") {
    group = "build"
    manifest {
        attributes["Main-Class"] = "org.cardano.foundation.ccballotcli.CcBallotCli"
    }
    duplicatesStrategy = DuplicatesStrategy.EXCLUDE
    from(sourceSets.main.get().output)
    dependsOn(configurations.runtimeClasspath)
    from({
        configurations.runtimeClasspath.get().filter { it.name.endsWith("jar") }.map { zipTree(it) }
    })
    archiveClassifier.set("all")
}
```

Then build it:

```bash
./gradlew fatJar
```

The output will be at:
`build/libs/cc-ballot-cli-all.jar`

---

### 📁 2. Prepare Distribution Package

Create a directory like `cc-ballot-cli/` with these contents:

```
cc-ballot-cli/
├── cc-ballot-cli-all.jar
├── cc-ballot-cli.sh         # Linux/macOS launcher
├── cc-ballot-cli.bat        # Windows launcher
├── install.sh               # Linux/macOS installer
└── README.md
```

#### ✅ Example `cc-ballot-cli.sh`

```bash
#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
java -jar "$DIR/cc-ballot-cli-all.jar" "$@"
```

#### ✅ Example `cc-ballot-cli.bat`

```bat
@echo off
set DIR=%~dp0
java -jar "%DIR%cc-ballot-cli-all.jar" %*
```

#### ✅ Example `install.sh`

```bash
#!/bin/bash
INSTALL_DIR="/usr/local/bin"
SCRIPT_NAME="cc-ballot-cli"
TARGET="$INSTALL_DIR/$SCRIPT_NAME"

chmod +x ./cc-ballot-cli.sh
sudo cp ./cc-ballot-cli.sh "$TARGET"
echo "✅ Installed as '$SCRIPT_NAME'. Run it with:"
echo "   $SCRIPT_NAME cast_vote ..."
```

---

### 📦 3. Zip & Distribute

```bash
zip -r cc-ballot-cli.zip cc-ballot-cli/
```

Upload `cc-ballot-cli.zip` to your preferred release channel (GitHub Releases, website, etc.).

---

## ⚙️ Configuration

Edit `src/main/resources/config.properties`:

```properties
api.base_url=http://localhost:9091

event=YOUR_EVENT
category=YOUR_CATEGORY
proposal=YOUR_PROPOSAL

network=YOUR_NETWORK
```

---

## ✅ Notes

* Payload must be valid JSON with actual wallet ID (no placeholders).
* Java 17+ is required on the client machine.
* Only Cardano wallet type is currently supported.

---
