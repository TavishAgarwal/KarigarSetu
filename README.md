<h1 align="center">
  🪔 KarigarSetu
</h1>

<p align="center">
  <strong>AI-Powered Marketplace for Indian Artisans</strong><br/>
  <em>AI that helps artisans tell their story and sell to the world</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Google_Gemini-AI-4285F4?logo=google" alt="Gemini" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

---

## 📖 Overview

### The Problem

India has **7 million+ traditional artisans** who face critical challenges:

- **Digital Divide** — Lack of digital literacy, professional photography, and marketing skills
- **Language Barrier** — Most artisans speak regional languages and cannot create English product listings
- **Middlemen Exploitation** — Artisans receive only 10–20% of retail value
- **Heritage Loss** — Younger generations abandon ancestral crafts due to poor income
- **No Market Intelligence** — Zero visibility into global demand, trends, or fair pricing

### The Solution

**KarigarSetu** (Karigar = Artisan, Setu = Bridge) is a full-stack, AI-powered platform that bridges the gap between rural Indian artisans and the global digital marketplace. Using Google Gemini AI, it automates product listing creation, generates compelling heritage stories, provides market intelligence, and enables direct commerce — all accessible through voice input in **13 Indian languages**.

### Impact

Every listing and every purchase creates measurable social change — from artisan income generation to craft heritage preservation across Indian states.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Listing Generator** | Upload a craft photo → AI creates professional title, description, story, tags & price |
| 🎙️ **Voice-Based Product Creation** | 13 Indian language voice input for onboarding and listing |
| 📴 **Offline Support** | Service worker + IndexedDB queue for rural low-connectivity areas |
| 🛡️ **Craft Authenticity Verification** | AI detects handmade vs machine-made signals with authenticity score |
| 🛒 **AI Personal Shopper** | Conversational AI: *"Find me a Diwali gift under ₹3000"* |
| 📊 **Production Planning AI** | Recommends what to produce based on demand signals and trends |
| ❤️ **Impact Tracking** | Labor hours, families supported, and crafts preserved metrics |
| 📜 **Cultural Craft Stories** | AI-generated heritage narratives with cultural symbolism |
| 💰 **Fair Price Estimator** | AI recommends fair pricing with global benchmarks |
| 🌍 **Global Demand Mapping** | Leaflet maps showing worldwide craft demand hotspots |
| 📈 **Trend Prediction** | AI predicts trending styles, colors, and target markets |
| 📣 **Marketing Assistant** | Auto-generates Instagram captions, WhatsApp messages, and promotional text |
| 🌐 **Translation** | Translates product content into 13 Indian languages |
| 🏛️ **Heritage Explorer** | Showcases 10+ Indian craft traditions with history and techniques |
| 🛒 **Full E-Commerce** | Cart, checkout, order management with status tracking |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) + [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Database** | [SQLite](https://www.sqlite.org/) via [Prisma ORM](https://www.prisma.io/) |
| **AI Engine** | [Google Gemini API](https://ai.google.dev/) (15 AI functions) |
| **Authentication** | JWT ([jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| **Maps** | [Leaflet](https://leafletjs.com/) + [react-leaflet](https://react-leaflet.js.org/) |
| **Charts** | [Recharts](https://recharts.org/) |
| **Image Upload** | [Cloudinary](https://cloudinary.com/) (optional, falls back to local) |
| **Offline** | Custom Service Worker + IndexedDB queue |
| **Notifications** | [Sonner](https://sonner.emilkowal.dev/) |

---

## 🏗️ Architecture Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                           │
│  ┌──────────┐  ┌──────────────┐  ┌─────────┐  ┌───────────────┐  │
│  │  React   │  │  Leaflet     │  │Recharts │  │ Service Worker│  │
│  │  Pages   │  │  Maps        │  │ Charts  │  │ (Offline PWA) │  │
│  └────┬─────┘  └──────────────┘  └─────────┘  └───────────────┘  │
│       │                                                            │
├───────┴────────────────────────────────────────────────────────────┤
│                    Next.js App Router (API)                         │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Auth API │  │ Products API │  │Orders API│  │  15 AI APIs  │  │
│  │ (JWT)    │  │ (CRUD)       │  │          │  │  (Gemini)    │  │
│  └────┬─────┘  └──────┬───────┘  └────┬─────┘  └──────┬───────┘  │
│       │               │               │                │           │
├───────┴───────────────┴───────────────┴────────────────┴───────────┤
│              ┌──────────────┐              ┌──────────────────┐    │
│              │  Prisma ORM  │              │  Google Gemini   │    │
│              │  (SQLite)    │              │  (AI Engine)     │    │
│              └──────────────┘              └──────────────────┘    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Installation Guide

### Prerequisites

- **Node.js** 18+ and **npm**
- A **Google Gemini API key** ([get one here](https://aistudio.google.com/app/apikey))

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/KarigarSetu.git
cd KarigarSetu

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local

# 4. Edit .env.local and add your API keys
#    (see Environment Variables section below)

# 5. Initialize the database
npx prisma generate
npx prisma db push

# 6. Seed the database with demo data
npm run prisma:seed

# 7. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## 🔐 Environment Variables

Create a `.env.local` file in the project root with these variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | SQLite database path. Default: `file:./dev.db` |
| `JWT_SECRET` | ✅ | Secret key for JWT authentication. Generate with: `openssl rand -base64 32` |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key for all AI features |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ❌ | Cloudinary cloud name (falls back to local uploads) |
| `CLOUDINARY_CLOUD_NAME` | ❌ | Cloudinary cloud name (server-side) |
| `CLOUDINARY_API_KEY` | ❌ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ❌ | Cloudinary API secret |

> **Note**: Cloudinary is optional. Without it, image uploads are stored locally in `public/uploads/`.

---

## 🧪 Demo Credentials

After running the seed script, you can log in with these demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Artisan | `rajan.sharma@demo.karigarsetu.in` | `demo1234` |
| Artisan | `meena.devi@demo.karigarsetu.in` | `demo1234` |
| Artisan | `abdul.kareem@demo.karigarsetu.in` | `demo1234` |
| Artisan | `lakshmi.naidu@demo.karigarsetu.in` | `demo1234` |
| Artisan | `gopal.mahto@demo.karigarsetu.in` | `demo1234` |

Or register a new account at `/register`.

---

## 📸 Screenshots

<!-- Add screenshots of your application here -->

| Page | Description |
|------|-------------|
| Landing Page | Hero section with live platform stats and featured crafts |
| Marketplace | Product grid with search, filters, and pagination |
| Product Detail | Full product info with craft story and authenticity badge |
| AI Generator | Upload photo → AI generates complete product listing |
| Dashboard | Artisan analytics with revenue charts and quick actions |
| Heritage Explorer | 10+ Indian craft traditions with history and techniques |
| Impact Dashboard | Platform-wide statistics with charts |
| AI Shopper | Conversational AI shopping assistant |

---

## 🏆 Hackathon Context

### Problem Statement

> *How can AI technology be used to empower rural artisans and preserve India's craft heritage while connecting them to the global digital marketplace?*

### Innovation Highlights

- **15 distinct AI functions** powered by Google Gemini — from craft image recognition to production planning
- **Voice-first design** supporting 13 Indian languages for inclusive onboarding
- **Offline-capable** PWA architecture for rural low-connectivity areas
- **AI craft authentication** that verifies handmade vs machine-made signals
- **Heritage storytelling engine** that preserves and communicates cultural significance
- **End-to-end artisan empowerment** — from onboarding to market intelligence to sales

---

## 🗺️ Future Roadmap

- [ ] **Payment Gateway Integration** — Razorpay/Stripe for real transactions
- [ ] **Mobile App** — React Native companion app for artisans
- [ ] **AR Try-On** — Augmented reality preview for textiles and jewelry
- [ ] **Multi-language UI** — Full interface localization beyond content translation
- [ ] **Blockchain Provenance** — Immutable craft authentication records
- [ ] **Logistics Integration** — India Post / Delhivery API for shipping
- [ ] **Government Scheme Integration** — Auto-link artisans to MSME, ODOP schemes
- [ ] **Analytics Dashboard** — Advanced sales forecasting and inventory management
- [ ] **Community Features** — Artisan forums, knowledge sharing, mentorship

---

## 📁 Project Structure

```
KarigarSetu/
├── prisma/
│   ├── schema.prisma          # 12 database models
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Demo data seeder
├── public/
│   ├── sw.js                  # Service Worker (offline)
│   └── products/              # Product images
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── marketplace/       # Product browsing
│   │   ├── product/[id]/      # Product detail
│   │   ├── heritage/          # Craft heritage explorer
│   │   ├── impact/            # Impact dashboard
│   │   ├── ai-shopper/        # AI shopping assistant
│   │   ├── cart/              # Shopping cart
│   │   ├── onboarding/        # 7-step artisan onboarding
│   │   ├── dashboard/         # Artisan dashboard (10 pages)
│   │   └── api/               # 30+ API routes
│   │       ├── auth/          # Authentication
│   │       ├── products/      # CRUD
│   │       ├── orders/        # Order management
│   │       └── ai/            # 15 AI endpoints
│   ├── components/            # 30+ React components
│   │   ├── VoiceInput.tsx     # 13-language voice input
│   │   ├── AiShopperChat.tsx  # AI chatbot
│   │   ├── AuthenticityBadge  # Handmade verification
│   │   └── CraftDemandMap     # Global demand map
│   └── lib/
│       ├── gemini.ts          # 15 AI functions (Gemini)
│       ├── auth.ts            # JWT authentication
│       ├── auth-context.tsx   # React auth context
│       ├── cart-context.tsx   # Shopping cart state
│       ├── offlineQueue.ts    # IndexedDB offline queue
│       ├── offlineSync.ts     # Auto-sync engine
│       └── prisma.ts          # Database client
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
└── package.json               # Dependencies
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  Made with ❤️ for Indian Artisans<br/>
  <strong>KarigarSetu</strong> — Bridging Heritage and Technology
</p>
