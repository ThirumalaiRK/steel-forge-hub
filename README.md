# 🏗️ Steel Forge Hub

[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

**Steel Forge Hub** is a premium, enterprise-grade digital platform developed for a specialized industrial client. It serves as a comprehensive solution for industrial metal furniture manufacturing, featuring a unique dual business model: direct e-commerce sales and **Fabrication as a Service (FaaS)** rental subscriptions.

---

## 🚀 Vision
To bridge the gap between traditional metal fabrication and modern digital commerce, providing a seamless interface for businesses to acquire, rent, and manage industrial-grade furniture with high-tech integrations like 3D modeling and AR.

---

## ✨ Key Features

### 🛍️ E-Commerce & Sales
- **Multi-level Catalog**: Advanced categorization and sub-categorization for complex product lines.
- **Product Discovery**: High-performance filtering (metal type, finish, industry) and intelligent search.
- **Comparison Engine**: Side-by-side comparison for up to 3 products to facilitate decision-making.
- **Wishlist & Cart**: Persistent state management for saved items and active shopping sessions.

### 🏢 FaaS (Furniture as a Service)
- **Rental Ecosystem**: Dedicated workflow for subscription-based furniture usage.
- **Intelligent Configurator**: Calculate rental costs based on duration (monthly/quarterly/annual) and quantity.
- **Quotation System**: Automated, branded PDF quotation generation with professional numbering (`FQ-YYYY-NNNN`).
- **Lead Tracking**: End-to-end management of rental enquiries through a dedicated admin pipeline.

### 🛡️ Admin Powerhouse
- **360° Analytics**: Real-time dashboard for enquiries, product popularity, and revenue trends.
- **Full CMS**: Manage products, categories, hero banners, and case studies without writing code.
- **Notification Center**: System-wide alerts for new leads and order updates.
- **Content Security**: Grain-level access control via Supabase Row Level Security (RLS).

### 💎 Cutting-Edge UX
- **3D & AR Ready**: Integrated support for GLB/GLTF models and Augmented Reality viewing.
- **Premium Industrial Design**: Dark mode aesthetic with Glassmorphism and fluid Framer Motion animations.
- **Performance Optimized**: Lazy loading, intelligent caching (TanStack Query), and WebP image optimization.

---

## 🛠️ Tech Stack

- **Frontend**: [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **UI & Styling**: [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/), [Framer Motion](https://www.framer.com/motion/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, Realtime)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Utility**: [jsPDF](https://github.com/parallax/jsPDF) (PDF), [Recharts](https://recharts.org/) (Analytics), [Lucide](https://lucide.dev/) (Icons)

---

## 🗺️ Project Navigation

| Document | Purpose |
| :--- | :--- |
| [**`PROJECT_STRUCTURE.md`**](./PROJECT_STRUCTURE.md) | Visual guide to folders and files. |
| [**`COMPREHENSIVE_ANALYSIS.md`**](./COMPREHENSIVE_APPLICATION_ANALYSIS.md) | Deep dive into technical and business logic. |
| [**`FAAS_QUOTATION_SYSTEM.md`**](./FAAS_QUOTATION_SYSTEM.md) | Technical setup for the rental engine. |
| [**`SUPABASE_STORAGE_SETUP.md`**](./SUPABASE_STORAGE_SETUP.md) | Guide for configuring image/doc storage. |

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- npm or bun

### Setup Instructions
1. **Clone & Install**
   ```bash
   git clone <repository-url>
   cd steel-forge-hub
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the root:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Database Migration**
   Apply the SQL scripts located in `/sql` and `src/sql` to your Supabase project in the following order:
   - Initial schema
   - FaaS system setup
   - Admin permissions

4. **Launch**
   ```bash
   npm run dev
   ```

---

## 📈 Roadmap (Phase 2)
- [ ] **Payment Integration**: Razorpay/Stripe live environment.
- [ ] **Automated Emails**: Integration with SendGrid/AWS SES.
- [ ] **Inventory Sync**: Real-time stock tracking for fabrication units.
- [ ] **PWA Support**: Offline-capable mobile experience.

---

## 📄 License
Internal proprietary project. All rights reserved.

---

Created with ❤️ by **Thirumalai** | **Spear Digital Team** | **Steel Forge Hub** Development Team.
