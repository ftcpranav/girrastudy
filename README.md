# GirraStudy — Private HSC Study Portal

GirraStudy is a private, premium study dashboard designed for Girraween High School students preparing for their Higher School Certificate (HSC). It enables students to track subjects, organize notes, monitor assessments, log marks, calculate averages, and manage deadlines on a calendar.

---

## 💡 About the `GEMINI_API_KEY` & Auth

* **Do I need a Gemini API Key?**
  No. There are no active AI dependencies in the client codebase. The `GEMINI_API_KEY` in `.env.local` is a template placeholder for future features and can be safely ignored or removed.
* **Do I need a real Supabase instance for Auth to work?**
  **No, not for local development and testing.** If the Supabase URL or Anon Key is left as a placeholder in `.env.local`, GirraStudy automatically falls back to a robust client-side mock database stored in `localStorage` (`mockSupabase.ts`). You can sign up, log in, create/edit subjects, notes, and assessments, and the app will store them locally in your browser.

---

## 🛠️ Stack & Architecture

* **Frontend**: Next.js (App Router, TypeScript)
* **Styling**: Tailwind CSS & Lucide Icons
* **UI Controls**: `@radix-ui` primitives for components (modals, dropdowns)
* **Database & Auth**: Supabase JS Client (`@supabase/supabase-js` and `@supabase/ssr`), with `localStorage` client-side fallback.

---

## 🚀 Production Rollout & Implementation Guide

To move from the local mock environment to a fully operational, live production environment, follow these steps:

### 1. Set Up Your Supabase Project
1. Go to [Supabase](https://supabase.com/) and create a new project.
2. In your project settings, locate your **Project API keys** and **Project URL**:
   - **Project URL** (will map to `NEXT_PUBLIC_SUPABASE_URL`)
   - **Anon public key** (will map to `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### 2. Initialize the Database Schema
1. In the Supabase Dashboard, go to **SQL Editor** > **New Query**.
2. Open the SQL migration file (`supabase/migrations/20260607000000_init.sql`).
3. Copy the entire contents of that file and paste it into the Supabase SQL editor.
4. Click **Run**. This will create the required tables (`users`, `subjects`, `student_subjects`, `assessments`, `marks`, `notifications`, `notes`), set up foreign keys, validation constraints, and register triggers for user creation.

### 3. Deploy to Vercel
1. Push your repository to GitHub.
2. Log into [Vercel](https://vercel.com/) and click **Add New > Project**.
3. Import your GitHub repository.
4. In the **Environment Variables** section, add your production keys:
   - `NEXT_PUBLIC_SUPABASE_URL` = `<your-live-supabase-url>`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `<your-live-anon-key>`
5. Click **Deploy**. Vercel will build and host your app.

---

## 🔍 Bug-Free Deployment Checklist

Before merging to your production branch or releasing to users, make sure you complete these verification steps:

* [ ] **Local Build Check**: Run `npm run build` locally to ensure there are no compilation, type checking, or bundler errors.
* [ ] **Database Schema Match**: Make sure your SQL migration script ran without errors on Supabase.
* [ ] **Supabase Authentication**: Enable **Email** provider in the Supabase Dashboard under **Authentication > Providers** (it is enabled by default, but confirm that registration email verification is either configured or disabled for easier testing).
