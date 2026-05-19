# ArtikelKu — Frontend RBAC

Frontend artikel berbasis React + TypeScript + Tailwind CSS, terhubung ke backend RBAC Express/Bun.

## Stack

- **Runtime**: Bun
- **Bundler**: Vite
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS v3
- **Routing**: React Router DOM v6

## Struktur

```
frontend/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── src/
    ├── App.tsx                   # Router utama + layout
    ├── main.tsx                  # Entry point
    ├── index.css                 # Global styles + Tailwind
    ├── pages/
    │   ├── HomePage.tsx          # Daftar semua artikel
    │   ├── LoginPage.tsx         # Form login
    │   ├── RegisterPage.tsx      # Form registrasi
    │   ├── ArticleDetailPage.tsx # Detail artikel
    │   ├── ArticleFormPage.tsx   # Create / Edit artikel
    │   └── NotFoundPage.tsx      # 404
    ├── components/
    │   ├── Navbar.tsx            # Navigasi + role badge
    │   ├── ArticleCard.tsx       # Card artikel di list
    │   ├── ProtectedRoute.tsx    # Guard route by role
    │   └── Toast.tsx             # Notifikasi sementara
    └── services/
        ├── http.ts               # HTTP client (fetch + auth header)
        ├── auth.service.ts       # Login, register, logout, session
        └── article.service.ts    # CRUD artikel
```

## Setup

```bash
# Install dependencies
bun install

# Jalankan dev server (port 3000)
bun run dev
```

## Konfigurasi Backend

Backend diasumsikan berjalan di `http://localhost:5000`. Vite sudah dikonfigurasi proxy `/api` → backend:

```ts
// vite.config.ts
proxy: {
  "/api": {
    target: "http://localhost:5000",
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ""),
  },
},
```

Ubah `target` jika port backend berbeda.

## Endpoint Backend yang Dipakai

| Method | Path | Deskripsi | Akses |
|--------|------|-----------|-------|
| POST | `/auth/login` | Login user | Public |
| POST | `/auth/register` | Registrasi | Public |
| GET | `/articles` | List artikel | Public |
| GET | `/articles/:id` | Detail artikel | Public |
| POST | `/articles` | Buat artikel | ADMIN, EDITOR |
| PUT | `/articles/:id` | Edit artikel | ADMIN, EDITOR |
| DELETE | `/articles/:id` | Hapus artikel | ADMIN, EDITOR |

## Role & Akses

| Role | Lihat | Tulis | Edit | Hapus |
|------|-------|-------|------|-------|
| USER | ✅ | ❌ | ❌ | ❌ |
| EDITOR | ✅ | ✅ | ✅ | ✅ |
| ADMIN | ✅ | ✅ | ✅ | ✅ |
