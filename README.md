🚀 Next.js LeetCode Clone

A high-performance coding platform built with Next.js, Firebase, and Recoil. This project features an automated Lighthouse CI pipeline to ensure top-tier performance, accessibility, and SEO.

🛠 Tech Stack

    Frontend: Next.js (App Router), TypeScript, Tailwind CSS

    State Management: Recoil

    Database & Auth: Firebase (Firestore & Authentication)

    Performance Monitoring: Lighthouse CI

    Infrastructure: Render (LHCI Server), Supabase (Postgres storage)

✨ Features

🔐 Authentication & Security

        Firebase Auth: Secure Login, Signup, and Password Reset.

        Route Guards: Protected pages that redirect unauthenticated users.

        Persistent Sessions: Users remain logged in across refreshes.

📝 Problem Workspace

        Code Editor: Interactive environment for solving DSA problems.

        Test Cases: Real-time feedback on code submissions.

        YouTube Integration: Built-in video solutions for every problem.

        Toast Notifications: Real-time UI feedback via react-toastify.

📊 Quality Assurance

        CI/CD Pipeline: Automated Lighthouse audits on every Pull Request.

        Score Assertions: Enforces a minimum 90% score for accessibility and performance.

        Audit History: Visualized dashboard tracking performance over time.

🚀 Installation & Setup

    Clone the Repository

        Bash
        git clone https://github.com/narendravs/nextjsleet.git
        cd nextjsleet
        Install Dependencies

        Bash
        npm install
        Environment Variables
        Create a .env file in the root directory:

Code snippet

    FIREBASE_API_KEY=your_firebase_key

    LHCI_REMOTE_BUILD_TOKEN=your_lhci_token

    LHCI_REMOTE_SERVER=your_render_server_url

Command Description

    npm run dev Starts the Development Server at localhost:7000.

    npm run build Generates an optimized Production Build.

    npm run start Starts the production server (run after npm run build).

    npx lhci autorun Triggers a Lighthouse Performance Audit locally.

    npm run lint Runs ESLint to check for code quality issues.

📊 Lighthouse CI Workflow

    Every push to the following branches triggers a performance audit:

    master / main

    production

    development

    The results are automatically uploaded to your private LHCI server and can be viewed via the dashboard link provided in the GitHub Action logs.
