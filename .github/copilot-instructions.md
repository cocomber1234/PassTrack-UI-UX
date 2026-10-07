# Global Copilot Instructions

- Project: PASSTRACK, a Passport Application & Tracking System.
- Tech Stack: Next.js (App Router), Tailwind CSS, Supabase Auth & Database.
- User Roles: admin, staff, member. Default role for all signups is 'member'. Admin and staff roles are assigned manually.
- Core Modules: Member Login, Registration (personal details, ID details, account creation), Dashboard, Application Status / Document Progress Tracking, Inquiries (My Inquiries list and Inquiry Details message thread).
- Security: Enable Row Level Security (RLS) on all Supabase tables. Members can only read and write their own applications, documents, and inquiries. Never expose passport or ID data to unauthenticated users.
- UI: Use blue as the highlight color. Keep existing page layouts consistent with the Dashboard design.
- UI/UX Design: Generate accessible, modern, and responsive React + Tailwind UI components. Focus on the Member Login, Registration, Dashboard, Application Status / Document Progress Tracking, and Inquiries pages (My Inquiries list and Inquiry Details thread), while keeping all layouts consistent with the existing Dashboard design.
- Git Strategy: Never commit directly to main branch. Always create feature branches.