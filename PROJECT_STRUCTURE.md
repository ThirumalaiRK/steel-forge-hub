# 📂 Project Structure Guide

This document provides a high-level overview of the **Steel Forge Hub** codebase architecture.

## 🏗️ Directory Overview

```text
steel-forge-hub/
├── public/                 # Static assets (logos, icons, fonts)
├── src/
│   ├── assets/             # Images and design assets used in components
│   ├── components/         # Reusable UI components
│   │   ├── admin/          # Dashboard-specific components
│   │   ├── animations/     # Framer Motion & GSAP animations
│   │   ├── checkout/       # multi-step checkout logic
│   │   ├── faas/           # Fabrication-as-a-Service specific UI
│   │   ├── home/           # Homepage sections
│   │   └── ui/             # Core Shadcn/UI primitives
│   ├── contexts/           # React Contexts (Auth, Cart, Wishlist, etc.)
│   ├── hooks/              # Custom React hooks (useAuth, useLocalStorage)
│   ├── integrations/       # Supabase client and external services
│   ├── lib/                # Shared utilities and configurations
│   ├── pages/              # Main route components
│   │   ├── admin/          # Internal management pages
│   │   ├── auth/           # Login and Signup flows
│   │   └── company/        # About, Team, Case Studies
│   ├── sql/                # SQL migrations and database setup scripts
│   ├── utils/              # Helper functions (formatting, validation)
│   ├── App.tsx             # Main application entry and routing
│   └── main.tsx            # React DOM mounting
├── supabase/               # Supabase local configurations (if used)
├── .env.example            # Template for environment variables
├── package.json            # Dependencies and scripts
├── tailwind.config.ts      # Design system tokens (colors, spacing)
└── tsconfig.json           # TypeScript configuration
```

---

## 🔑 Key Architectural Decisions

### 1. Atomic UI System
We use **Shadcn UI** (built on Radix Primitives) located in `src/components/ui`. These are low-level components that follow a consistent design language. Higher-level features are composed from these primitives.

### 2. State Management Strategy
- **Server State**: Managed by **TanStack Query (React Query)** in `src/pages`. This handles caching, loading states, and background synchronization with Supabase.
- **Global UI State**: Managed via **React Context API** in `src/contexts` for lightweight needs (Cart, Auth, Theme).
- **Persistent State**: Items like Cart and Wishlist are synced to `localStorage` via custom hooks.

### 3. Database & Security (FaaS Engine)
The database logic is centralized in `src/sql`.
- **RLS (Row Level Security)**: Every table has specific policies ensuring that only authenticated Admins can modify product data, while public users can view active products.
- **Automated Workflows**: SQL triggers and functions handle the generation of quotation numbers (`FQ-XXXX`) to ensure data integrity.

### 4. Routing Architecture
The app uses **React Router v6** with a split layout strategy:
- **`MainLayout`**: Used for public-facing pages (Home, Products, FaaS).
- **`AdminLayout`**: Used for protected internal management pages, featuring a dedicated sidebar and analytics header.
- **`AuthLayout`**: Simplified layout for login/signup.

### 5. Media & Assets
Product images and PDF documents are stored in **Supabase Storage**. The frontend uses signed URLs (where applicable) and public buckets for optimized delivery.

---

## 🛠️ Naming Conventions

- **Components**: PascalCase (e.g., `ProductCard.tsx`)
- **Hooks**: camelCase starting with 'use' (e.g., `useProductDetails.ts`)
- **Utilities**: camelCase (e.g., `formatCurrency.ts`)
- **Pages**: PascalCase (e.g., `CategoryPage.tsx`)

---

## 📜 Documentation Reference
For specific feature documentation, refer to the root markdown files:
- `FAAS_QUOTATION_SYSTEM.md`: For deep dives into the rental engine.
- `ADMIN_PANEL_FEATURES_BREAKDOWN.md`: For a full list of admin capabilities.
