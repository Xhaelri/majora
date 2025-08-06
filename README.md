# 🛍️ Sekra E-commerce

Sekra is a modern, full-stack e-commerce web application built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**, designed for performance, scalability, and user experience.
It supports **authenticated users**, **guest shopping**, **serverless deployment**, and much more — aiming to deliver a smooth online shopping experience with rich interactions and modular architecture.

---

## 🚀 Tech Stack

### Frontend

* **React 19** – Latest concurrent rendering features
* **Next.js 15** – App Router, Server Actions, and API Routes
* **Tailwind CSS v4** – Utility-first styling for responsive UI
* **Framer Motion** – Smooth animations and transitions
* **Shadcn/UI** – Customizable and reusable component library
* **Radix UI** – Accessibility-first primitives
* **Redux Toolkit** – State management
* **Zod** – Type-safe schema validation for forms
* **React Context API** – For guest user handling

### Backend

* **Next.js Server Actions & API Routes** – Seamless data fetching and server logic
* **Prisma ORM** – Database access
* **PostgreSQL** – Main relational database
* **Neon** – Serverless PostgreSQL for production

### Auth & Security

* **Next-Auth (Auth.js)** – Secure authentication with adapters (including Prisma)
* **Bcrypt.js** – Password hashing
* **UUID** – Unique ID generation

---

## 🧩 Features

* ✅ **Authentication** using **Next-Auth** with Prisma Adapter
* ✅ **Guest user cart** handled manually via **React Context API** and merged with DB on sign-in
* ✅ **Server Actions** and **API Routes** to handle product fetching, user data, and orders
* ✅ **Reusable UI components** via **shadcn/ui**, powered by Radix
* ✅ **Animations** for interactions and transitions using **Framer Motion**
* ✅ **Fully responsive layout** with TailwindCSS v4
* ✅ **Type-safe form validation** using Zod + TypeScript
* ✅ **Embla Carousel** for interactive sliders with autoplay
* ✅ **Product zoom** with `react-medium-image-zoom`
* ✅ Clean and maintainable codebase with ESLint, TypeScript, and folder-based structure
* ✅ **Search functionality** with instant filtering
* ✅ **Checkout flow** with paymob gateway integrated
* ✅ **Implemented internationalization (i18n) ** and localization for a multi-language user experience.

---

## 🔮 Planned Features (Coming Soon)

* 📊 **Admin dashboard** for managing products and orders
* ❤️ **Wishlist** feature per user
* ⭐ **Review & rating system** with detailed feedback

---

## 🛠️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/sekra.git
cd sekra
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root with values like:

```env
DATABASE_URL=your_neon_db_url
NEXTAUTH_SECRET=your_auth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Run the Development Server

```bash
npm run dev
```

---

## ⚙️ Scripts

| Script   | Description                  |
| -------- | ---------------------------- |
| `dev`    | Start development server     |
| `build`  | Build for production         |
| `start`  | Start production server      |
| `lint`   | Run ESLint checks            |
| `prisma` | Prisma CLI for DB management |

---

## 📁 Folder Structure Highlights

```
/app             → Next.js app directory (App Router)
/components      → Reusable UI components
/lib             → Utility functions (e.g., prisma, auth, db helpers)
/context         → React context for guest cart and theme
/actions         → Server actions
```

---

## 🛆 Dependencies Snapshot

* **Auth:** `next-auth`, `@auth/prisma-adapter`, `bcryptjs`
* **UI:** `framer-motion`, `shadcn/ui`, `radix-ui`, `tailwindcss`, `clsx`
* **State:** `react-redux`, `@reduxjs/toolkit`
* **Forms:** `zod`
* **Carousel:** `embla-carousel-react`, `autoplay`
* **Image Zoom:** `react-medium-image-zoom`

---

## 🧠 Contribution

We welcome contributions, suggestions, and bug reports.
Please fork the repository and open a pull request with your changes!

---

## 📄 License

This project is licensed under the **MIT License**.
