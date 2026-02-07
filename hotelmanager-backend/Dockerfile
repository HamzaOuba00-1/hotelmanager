# ===== Build stage (Maven + JDK 24) =====
FROM maven:3.9.10-eclipse-temurin-24 AS build
WORKDIR /app

# Cache deps (plus rapide aux rebuilds)
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline

# Build
COPY src ./src
RUN mvn -q -DskipTests package

# ===== Runtime stage (JRE 24) =====
FROM eclipse-temurin:24-jre
WORKDIR /app

EXPOSE 8080

# Dossier uploads attendu par "static-locations: file:uploads/"
RUN mkdir -p /app/uploads

COPY --from=build /app/target/*.jar /app/app.jar

ENTRYPOINT ["java","-jar","/app/app.jar"]
