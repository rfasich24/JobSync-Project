# 🚀 JobSync: Smart Career Trajectory Tracker

![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)
![React Native](https://img.shields.io/badge/Frontend-React%20Native-61DAFB?logo=react&logoColor=white)
![Golang](https://img.shields.io/badge/Backend-Go-00ADD8?logo=go&logoColor=white)
![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?logo=supabase&logoColor=white)
![Expo](https://img.shields.io/badge/Framework-Expo-000020?logo=expo&logoColor=white)

**JobSync** adalah aplikasi pelacak lamaran kerja cerdas yang dirancang khusus untuk membantu pencari kerja mengelola proses rekrutmen mereka secara efisien. Proyek ini mengintegrasikan mobile app dengan kalender pribadi untuk memastikan tidak ada jadwal interview yang terlewat.

---

## 🌟 Fitur Utama

- **📊 Dashboard Ringkasan**: Visualisasi status lamaran (Applied, Interview, Rejected) dalam satu tampilan.
- **📝 Manajemen Lamaran (CRUD)**: Pencatatan detail posisi, perusahaan, dan tanggal lamaran yang terorganisir.
- **🗓️ Sinkronisasi Google Calendar**: Otomatis membuat jadwal di Google Calendar saat status lamaran berubah menjadi "Interview".
- **⚡ Smart Interview Pop-up**: Alur otomatis yang memicu form penjadwalan saat pengguna mendapatkan panggilan interview.
- **📱 History Schedule**: Rekam jejak semua jadwal tes dan interview yang pernah dilakukan.

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: React Native (Expo)
- **Styling**: NativeWind (Tailwind CSS for Mobile)
- **Networking**: Axios
- **Auth**: Expo AuthSession (Google OAuth2)

### Backend

- **Language**: Golang (Go)
- **Web Framework**: Gin Gonic
- **Database Driver**: PGX (PostgreSQL Driver)
- **Tools**: Godotenv (Environment Management)

### Database & Cloud

- **Database**: Supabase (PostgreSQL)
- **Auth Service**: Supabase Auth
- **Integration**: Google Cloud Console API (Calendar & OAuth)

---

## 📐 Arsitektur Sistem

Aplikasi ini menggunakan pendekatan arsitektur modern di mana Backend Golang bertindak sebagai jembatan (_bridge_) antara aplikasi mobile dan layanan pihak ketiga (Google API).

---

## 🚀 Roadmap Pengembangan

- [x] **Fase 1: Setup & Koneksi**
  - Inisialisasi Environment (Node.js, Go, Watchman).
  - Konfigurasi Database Supabase.
  - Tes koneksi Backend ke Database (BINGO!).
- [x] **Fase 2: Autentikasi & Integrasi Google**
  - Setup Google Cloud OAuth 2.0.
  - Implementasi Google Sign-In di React Native.
- [x] **Fase 3: CRUD Lamaran**
  - Pembangunan API CRUD di Golang.
  - UI List Lamaran di React Native.
- [ ] **Fase 4: Penjadwalan & Calendar Sync**
  - Integrasi Google Calendar API.
  - Logika otomatisasi status interview.
- [ ] **Fase 5: Finalisasi & Deployment**

---

## 💻 Cara Menjalankan Proyek

### Prasyarat

- Go 1.2x atau lebih tinggi
- Node.js 20.x atau lebih tinggi
- Akun Supabase & Google Cloud Console

### Instalasi Backend

1. Masuk ke folder backend: `cd backend`
2. Install dependencies: `go mod tidy`
3. Buat file `.env` dan masukkan `DB_URL` dari Supabase.
4. Jalankan server: `go run main.go`

### Instalasi Frontend

1. Masuk ke folder frontend: `cd frontend`
2. Install dependencies: `npm install`
3. Jalankan Expo: `npx expo start`

---

## 🤝 Kontribusi

Proyek ini dibuat untuk tujuan portofolio pribadi. Kritik dan saran sangat terbuka bagi siapa saja yang ingin berdiskusi mengenai arsitektur perangkat lunak.

---

**created by [r.fasich24](https://github.com/rfasich24/JobSync-Project)**
