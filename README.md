# Amvibe

Amvibe adalah platform web berbasis AI untuk membantu proses perancangan produk digital dari tahap ide sampai siap dieksekusi developer. Fokus utamanya adalah mengubah deskripsi kebutuhan menjadi tiga artefak kerja yang saling terhubung:

- PRD yang terstruktur dan bisa direvisi
- implementation plan bertahap melalui Next Step Planner
- coding prompts yang siap dipakai di AI coding agent

Amvibe ditujukan untuk founder, mahasiswa, product team, dan developer yang ingin mempercepat fase analisis, dokumentasi, dan handoff teknis tanpa mengubah visi produk.

## Developer Team

- Tatryan Kautsar Alfirdaus (24.01.53.0019)
- Amelia Riski Kurniawati (24.01.55.0014)
- Raflian Taofiq Z.M (24.01.53.0008)
- Rafif Naraya (24.01.53.0009)

## Fitur Utama

### 1. PRD Generator

Menghasilkan Product Requirements Document secara otomatis dari prompt pengguna. Hasil PRD disusun ke dalam format dokumen yang panjang, detail, dan cocok untuk kebutuhan analisis sistem maupun diskusi product development.

Kemampuan utama:

- membuat PRD baru dari ide mentah
- merevisi PRD existing secara iteratif
- menyimpan version history per project
- menampilkan hasil dalam viewer yang nyaman dibaca
- menjaga keterkaitan PRD dengan project yang sama

### 2. Next Step Planner

Mengubah PRD menjadi rencana implementasi teknis bertahap. Planner ini menyusun fase kerja mulai dari setup awal sampai deployment dan monitoring.

Kemampuan utama:

- memilih project yang sudah memiliki PRD
- memilih AI coding agent tujuan
- menghasilkan implementation plan multi-phase
- menyimpan planner history per project
- membuka kembali plan lama untuk review atau reuse

### 3. Coding Prompts

Mengambil isi planner lalu mengekstrak prompt yang siap ditempel ke AI coding tools seperti Codex CLI, Cursor, Claude Code, Windsurf, Copilot, Kiro, dan Antigravity.

Kemampuan utama:

- membaca planner versions per project
- mengekstrak prompt per phase
- menampilkan acceptance criteria dan verification commands
- copy prompt langsung dari UI
- fallback cache lokal untuk menjaga hasil planner tetap bisa dipakai saat persistence server belum sinkron

### 4. Global Search

Pencarian workspace untuk membantu user menelusuri project, PRD terbaru, planner history, dan coding prompts dari satu pintu.

Kemampuan utama:

- mencari berdasarkan nama project
- mencari berdasarkan isi PRD
- mencari berdasarkan planner content
- mencari berdasarkan prompt hasil ekstraksi
- mengelompokkan hasil per kategori agar mudah dinavigasi

### 5. Dashboard Authenticated

Dashboard owner menampilkan ringkasan workspace dan pintasan cepat ke modul utama.

Kemampuan utama:

- statistik project dan PRD
- shortcut ke PRD Generator, Next Step Planner, dan Coding Prompts
- recent PRDs
- recent planners
- recent prompts
- command palette dan sidebar workflow

### 6. Admin Panel

Panel admin dipakai untuk kontrol konfigurasi AI dan pengelolaan user.

Kemampuan utama:

- melihat daftar user
- melihat statistik user
- ban / unban user
- hapus user
- mengatur API key AI aktif
- memilih model AI aktif

## Operasional Sistem

Secara operasional, alur kerja Amvibe dibangun agar pengguna bergerak dari ide ke eksekusi dengan urutan yang jelas.

### Alur Pengguna

1. User login melalui Google OAuth dengan Supabase Auth.
2. User membuat atau membuka project.
3. User menulis ide produk pada PRD Generator.
4. Sistem menghasilkan PRD dan menyimpannya sebagai version history.
5. User membuka Next Step Planner untuk project yang sama.
6. Sistem membaca PRD terbaru lalu menyusun implementation plan bertahap.
7. Planner history disimpan agar bisa dibuka kembali.
8. User masuk ke Coding Prompts untuk mengambil prompt hasil ekstraksi dari planner.
9. Prompt dipakai ke AI coding agent pilihan untuk implementasi codebase.

### Alur Data

- `projects` menjadi entitas induk workspace
- `prd_versions` menyimpan riwayat PRD per project
- `planner_versions` menyimpan riwayat planner per project
- `ai_config` menyimpan konfigurasi model AI aktif untuk admin
- `users` menyimpan profil internal yang terhubung ke `auth.users`

### Alur Admin

1. Admin login menggunakan akun yang memiliki hak akses admin.
2. Admin membuka `/admin`.
3. Admin dapat mengelola AI config aktif.
4. Admin dapat memantau dan mengelola user yang terdaftar.
5. Policy database dan route protection memastikan endpoint sensitif tidak bisa diakses user biasa.

## Operasional Desain

Amvibe tidak dibangun sebagai dashboard enterprise putih-abu standar. Arah desainnya dibuat selaras dengan positioning produk sebagai AI orchestration workspace.

### Karakter Visual

- dark premium interface
- aksen emerald sebagai primary accent
- ambience violet/teal pada background mesh
- tipografi serif besar untuk headline
- glass panel dan card gelap untuk depth
- gaya futuristik, fokus, dan editorial

### Prinsip UX

- satu project, banyak artefak: PRD, planner, dan prompts tetap terhubung
- output AI harus tetap bisa dibaca manusia dengan nyaman
- history harus mudah dibuka kembali, bukan hanya sekali generate lalu hilang
- admin tools dipisah dari user flow biasa
- perceived performance diprioritaskan pada area authenticated

### Pola Interaksi

- sidebar untuk navigasi utama
- card-based layout untuk modul penting
- streaming output untuk PRD dan planner
- viewer markdown untuk membaca dokumen panjang
- search-first retrieval untuk workspace yang mulai tumbuh

## Arsitektur Aplikasi

Amvibe saat ini menggunakan arsitektur full-stack web modern berbasis Next.js App Router.

### Layer Utama

- landing page publik
- login flow dan auth callback
- authenticated user app
- admin area
- server routes untuk AI generation, planner history, project management, dan admin actions
- Supabase untuk auth, database, dan RLS

### Modul Aplikasi

- `/` landing page
- `/login` halaman login
- `/app` dashboard utama user
- `/app/prd` generator PRD
- `/app/prd/[id]` histori PRD per project
- `/app/planner` generator implementation plan
- `/app/prompts` hasil coding prompts
- `/app/search` pencarian workspace
- `/admin` dashboard admin
- `/admin/configs` konfigurasi AI
- `/admin/users` manajemen user

## Teknologi yang Digunakan

### Frontend

- Next.js 16
- React 19
- TypeScript
- App Router
- Tailwind CSS 4
- Framer Motion
- Lucide React
- React Markdown
- Mermaid

### Backend / Server Logic

- Next.js Route Handlers
- AI SDK (`ai`)
- `@ai-sdk/google`
- `@ai-sdk/react`

### Database dan Auth

- Supabase Auth
- Supabase SSR
- Supabase JS Client
- PostgreSQL via Supabase
- Row Level Security

### Integrasi AI

- Google Generative AI
- model default aktif: `gemini-3.1-flash-lite`
- dynamic AI config melalui tabel `ai_config`

### Deployment

- Vercel untuk deployment frontend
- GitHub sebagai source control utama

## Keamanan dan Kontrol Akses

Beberapa lapisan keamanan yang sudah diterapkan di project ini:

- login wajib untuk area authenticated
- proteksi route dengan middleware
- validasi owner project sebelum membaca atau menghapus data
- pemisahan akses admin dan user biasa
- RLS pada tabel user, project, PRD, planner, dan AI config
- service role hanya dipakai untuk kebutuhan admin atau persistence terkontrol di server

## Struktur Repository

```text
Amvibe/
├── README.md
├── docs/
├── extracted_screenshots/
├── frontend/
│   ├── src/app/
│   ├── src/components/
│   ├── src/lib/
│   ├── src/utils/
│   └── package.json
├── supabase/
│   └── migrations/
└── tools/
```

## Struktur Database

Migration yang saat ini menjadi inti sistem:

- `20260609000000_initial_schema.sql`
  - `users`
  - `projects`
  - `prd_versions`
  - `audit_logs`
  - `system_configs`
- `20260609000001_planner_history.sql`
  - `planner_versions`
- `20260715000002_ai_config.sql`
  - `ai_config`

## Cara Menjalankan Project

### 1. Install dependency

```bash
cd frontend
npm install
```

### 2. Siapkan environment variables

Buat file `.env.local` di dalam folder `frontend/` dan isi minimal:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key
```

Catatan:

- `SUPABASE_SERVICE_ROLE_KEY` dibutuhkan untuk fitur admin dan beberapa jalur persistence server.
- AI key bisa dikelola dari Admin Panel bila tabel `ai_config` sudah aktif.

### 3. Jalankan development server

```bash
npm run dev
```

Lalu buka:

- [http://localhost:3000](http://localhost:3000)

### 4. Build production

```bash
npm run build
npm run start
```

## Operasional Deployment

Untuk deployment production, alur yang dipakai saat ini adalah:

1. push source code ke GitHub
2. Vercel menarik branch `main`
3. environment variables disiapkan di Vercel
4. Supabase migration diterapkan ke database target
5. login, planner, prompts, admin, dan search diuji ulang setelah deploy

## Status Implementasi

Fitur yang sudah aktif di repository saat ini:

- landing page publik
- login Google via Supabase
- dashboard authenticated
- PRD generation dan history
- planner generation dan history
- coding prompts extraction
- global workspace search
- admin AI config
- admin user management

Area yang masih bisa terus dikembangkan:

- observability yang lebih formal
- export dokumen tambahan
- analytics product usage
- workflow collaboration multi-user
- indexing search yang lebih dalam

## Catatan

- README ini merangkum keadaan repository per 21 Juli 2026.
- README frontend tetap tersedia di [frontend/README.md](/D:/WEB/Amvibe/frontend/README.md), tetapi README root ini adalah ringkasan utama yang tampil di GitHub repository home.
