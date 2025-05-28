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
