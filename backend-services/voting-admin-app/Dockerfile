FROM openjdk:20-jdk-slim AS build
WORKDIR /app
COPY . /app
RUN ./gradlew clean build

FROM openjdk:20-jdk-slim AS runtime
WORKDIR /app
COPY --from=build /app/build/libs/*SNAPSHOT.jar /app/app.jar
ENV EVENT_COMMAND="echo no command provided"
ENTRYPOINT ["sh", "-c", "echo \"$EVENT_COMMAND\" | java -jar app.jar"]
