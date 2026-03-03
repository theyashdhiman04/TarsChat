<div align="center">
  <img src="https://raw.githubusercontent.com/theyashdhiman04/TarsChat/main/public/logo.png" alt="TarsChat Logo" width="120" padding="20" style="border-radius: 20px;" onerror="this.outerHTML='<h1 align=\'center\'>💬 TarsChat</h1>'"/>
  
  <p align="center">
    <strong>A modern, real-time messaging web application built for seamless communication.</strong>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next JS" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Convex-FF7A59?style=for-the-badge&logo=convex&logoColor=white" alt="Convex" />
    <img src="https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk" />
  </p>
</div>

<br/>

## ✨ Features

TarsChat offers a fully-featured chat experience, whether you're talking one-on-one or in groups:

- 🔐 **Authentication** — Secure sign up and log in via Clerk (email + social). Profiles sync instantly to Convex.
- 🔍 **User Discovery** — Easily search and start conversations with any registered user.
- ⚡ **Real-Time Messaging** — Lightning-fast DMs and group chats powered by Convex subscriptions.
- 👥 **Group Chats** — Create collaborative group conversations with multiple members and custom names.
- 🕒 **Smart Timestamps** — Intelligent time formatting showing 'Today', yesterday, or full dates for older messages.
- 🟢 **Online Status** — Live presence indicators for users currently active in the app.
- 💬 **Typing Indicators** — Real-time animated dots when someone is typing, auto-hiding after 2 seconds.
- 🔴 **Unread Badges** — Per-conversation unread message counts, automatically cleared upon opening.
- 📜 **Auto-Scroll** — Seamlessly scrolls to new messages with a helpful "New Messages ↓" button when scrolled up.
- 😊 **Message Reactions** — React to messages with emojis; simply click again to remove.
- 🗑️ **Delete Messages** — Soft-delete your own messages, beautifully transitioning to "This message was deleted."
- 📱 **Responsive Layout** — Adaptive UI with an intuitive sidebar + chat on desktop, and a full-screen mobile experience.
- 🎨 **Beautiful UI** — Stunning components styled with Tailwind CSS and Radix UI primitives.

## 🛠️ Tech Stack

TarsChat is built with the most modern web technologies:

| Category | Technology |
| :--- | :--- |
| **Framework** | [Next.js 15+ (App Router)](https://nextjs.org/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Backend & Realtime** | [Convex](https://www.convex.dev/) |
| **Authentication** | [Clerk](https://clerk.dev/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/) |

## 🚀 Getting Started

Follow these steps to set up TarsChat locally on your machine.

### Prerequisites

- Node.js 18.0.0 or higher
- npm, pnpm, or yarn

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/theyashdhiman04/TarsChat.git
cd TarsChat
```

**2. Install dependencies**

```bash
npm install
# or
pnpm install
```

**3. Set up environment variables**

Create a `.env.local` file in the root directory and add your matching keys:

```env
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

**4. Start the Convex backend**

Open a terminal and start the Convex development environment:

```bash
npx convex dev
```

**5. Start the Next.js frontend**

In a new terminal window, start the development server:

```bash
npm run dev
# or 
pnpm dev
```

Your app will be running at [http://localhost:3000](http://localhost:3000).

---

## 📂 Project Structure

```text
TarsChat/
├── app/                    # Next.js App Router (Pages, Layouts)
│   ├── (auth)/             # Clerk authentication routes
│   └── (main)/chat/        # Main chat interface and layout
├── components/             # Reusable UI components
│   ├── ChatBox.tsx         # Primary chat window component
│   ├── SideBar.tsx         # Navigation sidebar 
│   ├── MessageItem.tsx     # Message bubbles and reactions
│   ├── TypingIndicator.tsx # Real-time typing animation
│   ├── UserSearch.tsx      # User discovery interface
│   └── CreateGroup.tsx     # Group creation modal
├── convex/                 # Convex backend logic
│   ├── schema.ts           # Database schema definitions
│   ├── messages.ts         # Message queries and mutations
│   └── users_...           # User and conversation logic
└── hooks/                  # Custom React hooks
```

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/theyashdhiman04"><strong>Yash Dhiman</strong></a></p>
  <p>Released under the MIT License.</p>
</div>