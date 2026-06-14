# CampusConnect — B2B Uniform Procurement Platform

CampusConnect is a full-stack B2B procurement platform that streamlines the process of school uniform procurement. Schools post their uniform requirements as RFQs (Request for Quotation), vendors submit competitive quotes, and schools select the best vendor — all in one place.

---

## The Problem

Schools spend weeks manually contacting uniform vendors, collecting quotes over phone/email, and comparing them in spreadsheets. There is no centralized system for schools to discover vendors, post requirements, and manage the procurement lifecycle efficiently.

## The Solution

CampusConnect provides a structured digital marketplace where:
- **Schools** post uniform requirements as RFQs with budget, quantity, and deadline
- **Vendors** browse open RFQs and submit competitive quotations
- **Admin** verifies vendors and monitors platform activity

---

## Features

### Authentication
- JWT-based authentication
- Role-based access control (ADMIN, SCHOOL, VENDOR)
- Secure password hashing with BCrypt

### School Portal
- School profile management
- Create and manage RFQs
- View and compare quotations from multiple vendors
- Accept the best quotation

### Vendor Portal
- Vendor profile management
- Admin verification system (PENDING → VERIFIED)
- Browse all open RFQs
- Submit quotations with price, delivery timeline, and terms
- Track quotation status

### Admin Panel
- View and verify/reject vendors
- Monitor all users, RFQs, and quotations
- Platform-wide statistics dashboard

### RFQ & Quotation Flow
- School posts RFQ → Vendors submit quotations → School compares → School accepts → Other quotes auto-rejected → RFQ marked as AWARDED

---

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Java 21 | Primary language |
| Spring Boot 3.5 | Backend framework |
| Spring Security | Authentication & authorization |
| JWT (jjwt 0.12.3) | Token-based auth |
| Spring Data JPA | Database ORM |
| MySQL 8 | Relational database |
| Lombok | Boilerplate reduction |
| Maven | Build tool |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Redux Toolkit | State management |
| Axios | API calls |
| React Router v6 | Client-side routing |
| Vite | Build tool |

---

## Project Structure

```
campusconnect/
├── backend/                        # Spring Boot Backend
│   └── src/main/java/com/campusconnect/
│       ├── entity/                 # User entity
│       ├── repository/             # User repository
│       ├── security/               # JWT filter, JWT util, Security config
│       ├── auth/
│       │   ├── controller/         # Auth endpoints
│       │   ├── dto/                # Request/Response DTOs
│       │   └── service/            # Auth business logic
│       ├── school/
│       │   ├── controller/
│       │   ├── dto/
│       │   ├── entity/
│       │   ├── repository/
│       │   └── service/
│       ├── vendor/
│       │   ├── controller/
│       │   ├── dto/
│       │   ├── entity/
│       │   ├── repository/
│       │   └── service/
│       ├── rfq/
│       │   ├── controller/
│       │   ├── dto/
│       │   ├── entity/
│       │   ├── repository/
│       │   └── service/
│       ├── quotation/
│       │   ├── controller/
│       │   ├── dto/
│       │   ├── entity/
│       │   ├── repository/
│       │   └── service/
│       └── admin/
│           └── controller/
│
└── frontend/                       # React + TypeScript Frontend
    └── src/
        ├── api/                    # Axios instance
        ├── pages/
        │   ├── auth/               # Login, Register
        │   ├── school/             # School dashboard, View quotations
        │   ├── vendor/             # Vendor dashboard
        │   └── admin/              # Admin dashboard
        ├── store/                  # Redux store + auth slice
        └── types/                  # TypeScript interfaces
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |

### School
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/school/profile` | Create school profile |
| GET | `/api/school/profile` | Get school profile |
| PUT | `/api/school/profile` | Update school profile |

### Vendor
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/vendor/profile` | Create vendor profile |
| GET | `/api/vendor/profile` | Get vendor profile |
| PUT | `/api/vendor/profile` | Update vendor profile |

### RFQ
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rfq` | Create new RFQ (School) |
| GET | `/api/rfq/my` | Get my RFQs (School) |
| GET | `/api/rfq/open` | Get all open RFQs (Vendor) |
| GET | `/api/rfq/{id}` | Get RFQ by ID |
| PATCH | `/api/rfq/{id}/close` | Close an RFQ |

### Quotation
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/quotation/rfq/{rfqId}` | Submit quotation (Vendor) |
| GET | `/api/quotation/rfq/{rfqId}` | Get quotations for RFQ (School) |
| GET | `/api/quotation/my` | Get my quotations (Vendor) |
| PATCH | `/api/quotation/{id}/accept` | Accept a quotation (School) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/vendors` | Get all vendors |
| PATCH | `/api/admin/vendors/{id}/verify` | Verify a vendor |
| PATCH | `/api/admin/vendors/{id}/reject` | Reject a vendor |
| GET | `/api/admin/users` | Get all users |
| GET | `/api/admin/rfqs` | Get all RFQs |
| GET | `/api/admin/quotations` | Get all quotations |

---

## Getting Started

### Prerequisites
- Java 21
- Maven
- MySQL 8
- Node.js 20+
- npm

### Backend Setup

1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/campusconnect.git
cd campusconnect
```

2. Create MySQL database
```sql
CREATE DATABASE campusconnect;
```

3. Update `src/main/resources/application.properties`
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/campusconnect
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
app.jwt.secret=your_secret_key_min_256_bits
app.jwt.expiration=86400000
```

4. Run the backend
```bash
mvn spring-boot:run
```

Backend runs at: `http://localhost:8080/api`

### Frontend Setup

1. Navigate to frontend folder
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Usage

### As a School
1. Register with role `SCHOOL`
2. Create your school profile
3. Post an RFQ with uniform requirements, quantity, budget, and deadline
4. Wait for vendors to submit quotations
5. Compare quotations and accept the best one

### As a Vendor
1. Register with role `VENDOR`
2. Create your company profile
3. Wait for admin verification
4. Browse open RFQs
5. Submit quotations with your price and delivery terms

### As Admin
1. Login with admin credentials
2. Verify or reject vendor registrations
3. Monitor all platform activity

---

## Default Admin Account

After running the backend, register an admin via API:

```json
POST /api/auth/register
{
    "email": "admin@campusconnect.com",
    "password": "admin123",
    "role": "ADMIN"
}
```

---

## License

This project is licensed under the MIT License.

---

## Author

Developed as a Final Year Project by **Shivang Sourav**
