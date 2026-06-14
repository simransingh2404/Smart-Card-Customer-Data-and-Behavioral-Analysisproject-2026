# CampusConnect Deployment Guide

## Live URLs

### Frontend (Vercel)

https://campusconnect-frontend-nine.vercel.app

### Backend (Render)

https://campusconnect-api-o244.onrender.com

---

# Repositories

## Backend Repository

https://github.com/ShivangSourav02/campusconnect

## Frontend Repository

https://github.com/ShivangSourav02/campusconnect-frontend

---

# Tech Stack

Frontend:

* React
* TypeScript
* Vite
* Axios
* Vercel

Backend:

* Spring Boot 3
* Spring Security
* Spring Data JPA
* JWT Authentication
* Maven
* Render

Database:

* MySQL
* Aiven Cloud

---

# Architecture

Frontend (Vercel)
↓
Spring Boot API (Render)
↓
MySQL Database (Aiven)

---

# Backend Environment Variables (Render)

Required Variables:

SPRING_DATASOURCE_URL = *****

SPRING_DATASOURCE_USERNAME = *****

SPRING_DATASOURCE_PASSWORD

APP_JWT_SECRET

Example:

SPRING_DATASOURCE_URL=jdbc:mysql://HOST:PORT/defaultdb?sslMode=REQUIRED

SPRING_DATASOURCE_USERNAME=avnadmin

SPRING_DATASOURCE_PASSWORD=<password>

APP_JWT_SECRET=<jwt-secret>

---

# Frontend Environment Variables (Vercel)

Required Variable:

VITE_API_URL

Production:

VITE_API_URL=https://campusconnect-api-o244.onrender.com/api

Local Development:

VITE_API_URL=http://localhost:8080/api

---

# Backend Local Setup

Clone Repository

```bash
git clone https://github.com/ShivangSourav02/campusconnect.git
cd campusconnect
```

Run Backend

```bash
./mvnw spring-boot:run
```

Backend URL:

```text
http://localhost:8080/api
```

Build Project

```bash
./mvnw clean package
```

---

# Frontend Local Setup

Install Dependencies

```bash
npm install
```

Run Frontend

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

# Deployment Process

## Backend Deployment (Render)

1. Commit changes

```bash
git add .
git commit -m "your message"
git push origin main
```

2. Render automatically detects GitHub push.

3. Build starts automatically.

4. Verify deployment logs.

5. Verify API endpoint.

---

## Frontend Deployment (Vercel)

1. Commit changes

```bash
git add .
git commit -m "your message"
git push origin main
```

2. Vercel automatically deploys.

3. Verify deployment status.

4. Open production URL.

---

# Dockerfile Used For Render

```dockerfile
FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY . .

RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

EXPOSE 8080

CMD ["java", "-jar", "target/campusconnect-0.0.1-SNAPSHOT.jar"]
```

---

# Common Problems

## 1. Render Build Failure

Error:

```text
./mvnw: Permission denied
```

Fix:

```dockerfile
RUN chmod +x mvnw
```

---

## 2. Railway Build Failure

Cause:

Repository root contained:

```text
campusconnect/
 ├─ pom.xml
 ├─ src
```

Railway could not find the project.

Fix:

Move contents to repository root.

---

## 3. Database Authentication Error

Error:

```text
Access denied for user
```

Check:

* SPRING_DATASOURCE_URL
* SPRING_DATASOURCE_USERNAME
* SPRING_DATASOURCE_PASSWORD

---

## 4. CORS Error

Error:

```text
No 'Access-Control-Allow-Origin' header
```

Verify backend CORS configuration allows:

```text
https://campusconnect-frontend-nine.vercel.app
```

---

## 5. API URL Error

Wrong:

```text
https://campusconnect-api-o244.onrender.com/apI
```

Correct:

```text
https://campusconnect-api-o244.onrender.com/api
```

---

# Useful Commands

Check Git Status

```bash
git status
```

Push Changes

```bash
git add .
git commit -m "message"
git push origin main
```

Run Backend

```bash
./mvnw spring-boot:run
```

Build Backend

```bash
./mvnw clean package
```

Run Frontend

```bash
npm run dev
```

---

# Deployment Timeline

Backend Successfully Deployed:
June 2026

Frontend Successfully Deployed:
June 2026

Database Connected:
June 2026

---

# Future Improvements

* Add Swagger/OpenAPI documentation
* Add CI/CD GitHub Actions
* Add custom domain
* Add email verification
* Add password reset flow
* Add monitoring and logging
* Add automated backups
* Add integration tests
