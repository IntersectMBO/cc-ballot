plugins {
	application
	java
}

group = "org.cardano.foundation.ccballotcli"
version = "1.0"

java {
	sourceCompatibility = JavaVersion.VERSION_21
	targetCompatibility = JavaVersion.VERSION_21
}

application {
	mainClass.set("org.cardano.foundation.ccballotcli.CcBallotCli")
}

repositories {
	mavenCentral()
}

dependencies {
	implementation("com.fasterxml.jackson.core:jackson-databind:2.17.0")
}

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
