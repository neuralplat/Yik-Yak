# 🦙 Yik Yak Clone (Enhanced)

A fully-featured **location‑based anonymous social feed** — a modern recreation of *Yik Yak* with improvements like ghost posts, business ads, moderation, and community groups.

---

## 🚀 Table of Contents

- 📌 Project Overview  
- ✨ Features  
- 🧠 Technical Architecture  
- 🛠 Tech Stack  
- 🚀 Getting Started  
- 📸 Screenshots  
- 🧪 Testing & Running  
- 👥 Contributing  
- 📄 License  

---

## Getting Started

First, run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📌 Project Overview

This project is a clone of the popular *Yik Yak* application built using modern web technologies.  
It enables users to post **anonymous messages** visible only to people within a nearby geographic radius.

The project also extends the original concept with:
- Time‑limited posts (Ghost Posts)
- Community groups
- Business dashboards
- Moderation support

---

## ✨ Features

- 🗺️ **Location‑Based Anonymous Feed**
- 👻 **Ghost Posts** (auto‑expire after a fixed duration)
- 🌍 **Community Groups (Herds)**
- 📊 **Business Dashboard & Ads**
- 🛡️ **Moderation & Reporting Tools**
- ⚡ **Realtime Feed Updates**

---

## 🧠 Technical Architecture

The application follows a **client–server architecture** using Supabase as a backend service.

### High‑Level Flow

```
User → Frontend (Next.js) → API Layer → Supabase
                         → Moderation → Geo‑Filter → Feed
```

### Architecture Diagram

```
┌──────────────────────┐
│   Next.js Frontend   │
│ • UI Rendering      │
│ • Location Access   │
│ • API Calls         │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│     Supabase        │
│ • Authentication   │
│ • PostgreSQL DB    │
│ • Realtime Engine  │
└─────────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | Next.js |
| Styling | Tailwind CSS |
| Language | TypeScript |
| Backend | Supabase |
| Database | PostgreSQL |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime |

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/neuralplat/Yik-Yak.git
cd Yik-Yak
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Environment Variables

Create a `.env.local` file in the root directory:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📸 Screenshots

> Add screenshots after running the project

```
/screenshots
  ├── feed.png
  ├── ghost-post.png
  └── dashboard.png
```

---

## 🧪 Testing & Running

### Run Development Server

```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## 👥 Contributing

Contributions are welcome!

1. Fork the repository  
2. Create a feature branch  
3. Commit your changes  
4. Open a Pull Request  

---

## 📄 License

This project is open‑source and available under the **MIT License**.