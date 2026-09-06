# ── 階段 1：build 前端 ──
FROM node:20-alpine AS frontend
WORKDIR /fe
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ── 階段 2：build 後端，並把前端產物塞進 static/ ──
FROM maven:3.9-eclipse-temurin-17 AS backend
WORKDIR /app
COPY pom.xml ./
RUN mvn -q -B dependency:go-offline || true
COPY src ./src
COPY --from=frontend /fe/dist ./src/main/resources/static
RUN mvn -q -B clean package -DskipTests

# ── 階段 3：runtime ──
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=backend /app/target/*.jar app.jar
# 免費方案只有 512MB，限制 heap 佔比避免 OOM
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=70.0"
ENTRYPOINT ["java","-jar","app.jar"]
