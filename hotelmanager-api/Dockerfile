FROM openjdk:17-jdk-slim

# Installer les dépendances nécessaires
RUN apt-get update && apt-get install -y maven curl

# Créer le répertoire de travail
WORKDIR /app

# Copier les scripts Maven Wrapper
COPY mvnw .
COPY .mvn .mvn

# Donner les permissions d’exécution
RUN chmod +x mvnw

# Copier le reste est inutile car on monte tout avec le volume dans docker-compose
