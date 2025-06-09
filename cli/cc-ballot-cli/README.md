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

1. **Download** the latest release `.zip` from [releases page](#).

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

## 🖥️ CLI Usage

### 🗳 Cast a Vote

```bash
cc-ballot-cli cast_vote <payload.json> <signature> <publicKey>
```

### 📃 View Vote Receipt

```bash
cc-ballot-cli view_vote_receipt <payload.json> <signature> <publicKey>
```

### 📊 Get Results

```bash
cc-ballot-cli get_results
```

---

## 🔐 How to Obtain Signature & Public Key

To interact with `cc-ballot-cli`, you need a **digital signature** and your **public key** to verify your identity when casting or validating a vote. You can obtain both using either:

* A supported Cardano wallet (e.g., Eternl, Yoroi, Nami) — see steps below
* Or the `cardano-signer` CLI tool

---

### ✍️ 1. Using a Cardano Wallet (Eternl, Yoroi, Nami)

1. Open your wallet and navigate to the **Sign Data** or **Sign Message** section.
2. Paste the full contents of your `payload.json` as the message to sign.
3. Click **Sign** and copy the returned **signature** string.
   👉 **Tip**: The payload must exactly match the expected structure, or the signature will be invalid.

---

### 🛠️ 2. Another Option: Using `cardano-signer` CLI Tool

The open‑source [`cardano-signer`](https://github.com/gitmachtl/cardano-signer) tool can generate both a signature and a public key directly from your secret key ([github.com][1], [github.com][2]).

#### 📥 Install `cardano-signer`

```bash
# If you have Rust/Cargo installed:
:contentReference[oaicite:10]{index=10}

# Or use Docker:
:contentReference[oaicite:11]{index=11}
```

#### ⚙️ Sign the Payload

```bash
cardano-signer sign \
  --data-file payload.json \
  --secret-key payment.skey \
  --json
```

The output will include both your `"signature"` and `"publicKey"` in JSON format.

#### 🔐 Verify the Signature (Optional)

To verify your signature:

```bash
cardano-signer verify \
  --data-file payload.json \
  --signature "<your-signature>" \
  --public-key "<your-publicKey>"
```

It will return `true` or `false`, with exit codes 0 or 1 accordingly ([github.com][1]).

---

### 🔑 3. Retrieve Your Public Key

#### From Wallet CLI or Browser

* **Nami** (advanced users):

  ```js
  await window.cardano.nami.getPubKey()
  ```

* **Cardano‑CLI**:

  ```bash
  cardano-cli key verification-key \
    --signing-key-file payment.skey \
    --verification-key-file payment.vkey
  ```

* **Hardware Wallets**: Export via companion apps (e.g., Ledger Live).

#### Or Use `cardano-signer`

The above `cardano-signer sign` command already outputs the public key in hex — no extra steps required.

---

> ⚠️ **Security Reminder**
> Never share your **private key** (`.skey`). Only the **public key** and the **signature** are needed for voting.

[1]: https://github.com/gitmachtl/cardano-signer "gitmachtl/cardano-signer - GitHub"
[2]: https://github.com/cardano-foundation/cardano-verify-datasignature "cardano-foundation/cardano-verify-datasignature - GitHub"

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
