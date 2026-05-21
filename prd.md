# PRODUCT REQUIREMENTS DOCUMENT (PRD)

# LMS RBAC System (Edlink Style)

---

# 1. Project Overview

## Project Name

LMS RBAC System (Edlink Style)

---

## Project Type

Final Project / Tugas Akhir Mata Kuliah

---

## Project Description

Sistem ini merupakan Learning Management System (LMS) sederhana yang mengadopsi konsep RBAC (Role-Based Access Control) seperti platform Edlink.

Sistem memungkinkan:

* manajemen user
* manajemen course
* manajemen assignment
* pengelolaan role berbasis sistem dan course
* pembatasan akses berdasarkan role

---

# 2. Background

Dalam sistem pembelajaran digital modern, setiap pengguna memiliki hak akses yang berbeda sesuai dengan perannya.

Contoh:

* admin mengelola sistem
* dosen mengelola course dan assignment
* mahasiswa mengumpulkan tugas
* asdos membantu proses pembelajaran

Tanpa sistem authorization yang baik, keamanan dan pengelolaan akses akan menjadi sulit.

Karena itu digunakan pendekatan:

```text
Role-Based Access Control (RBAC)
```

agar setiap pengguna hanya dapat mengakses fitur sesuai hak aksesnya.

---

# 3. Objectives

## Tujuan Utama

Membangun LMS sederhana dengan sistem RBAC yang:

* aman
* terstruktur
* scalable
* mudah dikembangkan

---

## Tujuan Teknis

* Implementasi authentication
* Implementasi authorization
* Implementasi role-based system
* Implementasi course membership
* Implementasi assignment workflow

---

# 4. Scope Project

---

# Included Features

## Authentication

* Login
* Logout
* Session management

---

## RBAC System

### Global Role

* Super Admin
* Campus Admin
* IT Support

### Course Role

* Dosen
* Mahasiswa
* Asdos

---

## Course Management

* Create course
* Join course
* View course

---

## Assignment Module

* Create assignment
* Submit assignment
* View submission

---

## Dashboard

* Admin dashboard
* Dosen dashboard
* Mahasiswa dashboard

---

## Permission Middleware

* Route protection
* Feature protection
* Role checking

---

# Excluded Features

Karena keterbatasan waktu:

* video conference
* realtime chat
* analytics
* notification realtime
* AI recommendation
* mobile app
* microservice architecture
* advanced audit log

---

# 5. User Roles

---

# GLOBAL ROLE

## 1. Super Admin

### Description

Role tertinggi dalam sistem.

### Permissions

* manage users
* manage all courses
* manage system
* manage roles

---

## 2. Campus Admin

### Description

Mengelola operasional LMS kampus.

### Permissions

* create course
* manage course
* manage lecturer
* manage student

---

## 3. IT Support

### Description

Membantu troubleshooting teknis.

### Permissions

* reset password
* view logs
* support maintenance

---

# COURSE ROLE

## 1. Dosen

### Description

Pengajar course.

### Permissions

* create assignment
* upload material
* view submission
* grading

---

## 2. Mahasiswa

### Description

Peserta course.

### Permissions

* join course
* submit assignment
* view material

---

## 3. Asdos

### Description

Asisten dosen.

### Permissions

* assist grading
* moderate discussion
* help manage course

---

# 6. Functional Requirements

---

# Authentication

## FR-001 Login

User dapat login menggunakan email dan password.

### Acceptance Criteria

* valid credential berhasil login
* invalid credential ditolak

---

## FR-002 Logout

User dapat logout dari sistem.

---

# User Management

## FR-003 Manage User

Admin dapat membuat user baru.

### Acceptance Criteria

* admin dapat menambah user
* role dapat ditentukan

---

# Course Management

## FR-004 Create Course

Campus Admin atau Dosen dapat membuat course.

---

## FR-005 Join Course

Mahasiswa dapat bergabung ke course.

---

## FR-006 Course Membership

Sistem menyimpan role user dalam course.

---

# Assignment Module

## FR-007 Create Assignment

Dosen dapat membuat assignment.

---

## FR-008 Submit Assignment

Mahasiswa dapat submit assignment.

---

## FR-009 View Submission

Dosen dan Asdos dapat melihat submission.

---

# Authorization

## FR-010 Route Protection

User tidak dapat mengakses halaman tanpa permission.

---

## FR-011 Role Validation

Sistem memvalidasi role user sebelum request diproses.

---

# 7. Non Functional Requirements

---

## Performance

* response API < 2 detik
* mendukung multiple concurrent users

---

## Security

* password hashing
* JWT/session authentication
* route protection
* middleware validation

---

## Maintainability

* modular architecture
* clean folder structure
* reusable middleware

---

## Scalability

Sistem dapat dikembangkan menjadi:

* realtime LMS
* microservice
* mobile app
* enterprise system

---

# 8. System Architecture

```text
Frontend
   ↓
Backend API
   ↓
Authentication Layer
   ↓
RBAC Middleware
   ↓
Course Module
Assignment Module
User Module
   ↓
Database
```

---

# 9. Database Design

---

# users

```sql
users
- id
- name
- email
- password
- created_at
```

---

# global_roles

```sql
global_roles
- id
- name
```

---

# user_global_roles

```sql
user_global_roles
- user_id
- global_role_id
```

---

# courses

```sql
courses
- id
- title
- description
- created_by
```

---

# course_members

```sql
course_members
- id
- user_id
- course_id
- role
```

Role:

* dosen
* mahasiswa
* asdos

---

# assignments

```sql
assignments
- id
- course_id
- title
- description
- created_by
```

---

# submissions

```sql
submissions
- id
- assignment_id
- student_id
- file_url
- submitted_at
```

---

# 10. Backend Architecture

---

# Backend Stack

## Recommended

* Laravel
* MySQL
* JWT/Auth Session

---

# Backend Structure

```text
app/
├── Http/
│    ├── Controllers/
│    ├── Middleware/
│    └── Requests/
│
├── Models/
├── Services/
├── Policies/
└── Helpers/
```

---

# Middleware

## Auth Middleware

Validasi login.

---

## Role Middleware

Validasi role.

---

## Course Middleware

Validasi membership course.

---

# 11. Frontend Architecture

---

# Frontend Stack

## Recommended

* Blade Laravel
* Tailwind CSS

ATAU

* NextJS
* Tailwind

---

# Frontend Structure

```text
src/
├── pages/
├── components/
├── layouts/
├── services/
├── hooks/
└── utils/
```

---

# Frontend Features

## Dynamic Sidebar

Sidebar berubah sesuai role.

---

## Protected Route

Halaman tertentu hanya dapat diakses role tertentu.

---

## Conditional UI

Button dan menu muncul berdasarkan permission.

---

# 12. Authorization Flow

```text
User Login
    ↓
JWT / Session Generated
    ↓
User Access Route
    ↓
Middleware Check
    ↓
Role Validation
    ↓
Course Membership Validation
    ↓
Access Granted / Denied
```

---

# 13. UI Pages

---

# Public Pages

## Login Page

* email
* password

---

# Admin Pages

## Admin Dashboard

* total users
* total courses
* manage users

---

# Dosen Pages

## Dosen Dashboard

* my courses
* create assignment
* submissions

---

# Mahasiswa Pages

## Student Dashboard

* enrolled courses
* assignments
* submissions

---

# Course Pages

## Course Detail

* materials
* assignments
* members

---

# Assignment Pages

## Assignment Detail

* assignment description
* submission form

---

# 14. API Endpoints

---

# Authentication

```http
POST /login
POST /logout
```

---

# User

```http
GET /users
POST /users
```

---

# Course

```http
GET /courses
POST /courses
GET /courses/{id}
```

---

# Assignment

```http
POST /courses/{id}/assignments
GET /assignments/{id}
```

---

# Submission

```http
POST /assignments/{id}/submit
GET /assignments/{id}/submissions
```

---

# 15. Security Design

---

## Password Hashing

Menggunakan bcrypt.

---

## Authentication

Menggunakan JWT atau session.

---

## Authorization

Menggunakan middleware RBAC.

---

## Protected Route

Semua endpoint protected.

---

# 16. Development Timeline

---

# Day 1

* setup project
* authentication
* database schema
* RBAC setup

---

# Day 2

* course module
* dashboard
* middleware

---

# Day 3

* assignment module
* submission module
* frontend integration

---

# Day 4

* testing
* bug fixing
* UI polishing
* presentation preparation

---

# 17. Risks

---

## Time Limitation

Deadline singkat dapat membatasi kompleksitas fitur.

---

## Scope Creep

Penambahan fitur berlebihan dapat menghambat penyelesaian project.

---

## Integration Complexity

Frontend dan backend integration dapat memakan waktu lebih lama.

---

# 18. Future Improvement

Sistem dapat dikembangkan menjadi:

* realtime discussion
* notification system
* analytics dashboard
* AI recommendation
* mobile application
* multi campus support
* microservice architecture

---

# 19. Success Criteria

Project dianggap berhasil jika:

* user dapat login
* RBAC berjalan
* role berbeda memiliki akses berbeda
* dosen dapat membuat assignment
* mahasiswa dapat submit assignment
* middleware authorization berjalan
* frontend menampilkan UI sesuai role

---

# 20. Conclusion

Project ini membangun sistem LMS sederhana berbasis RBAC yang meniru konsep dasar platform LMS modern seperti Edlink.

Sistem dirancang menggunakan:

* Global Role
* Course Role
* Permission-based Access

agar menghasilkan sistem yang:

* aman
* fleksibel
* scalable
* mudah dikembangkan

Meskipun merupakan versi sederhana, arsitektur yang digunakan sudah mengikuti konsep enterprise modern dan dapat dikembangkan lebih lanjut menjadi LMS skala besar.
