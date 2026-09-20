# ConversaAI Launch

ConversaAI Sprint 1 – Authentication & Business Onboarding

You are building the first production-ready version of ConversaAI, an AI Customer Engagement Platform that helps businesses automate customer conversations across their website, WhatsApp, and other digital channels.

Branding

Important: I have attached the official ConversaAI logo.

- Use this logo wherever the brand logo should appear (navbar, authentication pages, onboarding, favicon where appropriate, and loading screen if one exists).

- Do not replace it with placeholders or AI-generated logos.

- Keep the logo clean, proportional, and high quality.

---

Design Theme

The UI should feel like a premium SaaS product.

Design inspiration:

- Stripe

- Linear

- OpenAI

- Notion

Avoid futuristic neon effects.

The interface should communicate:

- Trust

- Simplicity

- Professionalism

- Intelligence

Use generous spacing, smooth animations, rounded corners, and a clean layout.

---

Brand Colors

Primary Blue: #2563EB

Deep Navy: #0F172A

AI Cyan: #06B6D4

Success Green: #10B981

Warning Orange: #F59E0B

Error Red: #EF4444

Background: #FFFFFF

Card Background: #F8FAFC

Border: #E2E8F0

Primary Text: #111827

Secondary Text: #64748B

---

Typography

Font Family:

Inter

Use a modern SaaS typography scale.

---

Tech Stack

- React

- TypeScript

- Vite

- Tailwind CSS

- shadcn/ui

- Lucide Icons

- Supabase (Authentication only for this sprint)

---

Sprint 1 Objectives

Build only:

1. Authentication

2. Business Onboarding

Do NOT build:

- Dashboard

- AI Chat

- WhatsApp Integration

- Analytics

- Knowledge Base

- Billing

- Conversations

Those will come in later sprints.

---

Authentication Pages

Create the following pages:

Login

Fields:

- Email

- Password

Buttons:

- Sign In

- Continue with Google (placeholder only)

- Forgot Password

Link:

Create Account

---

Register

Fields:

- Full Name

- Business Email

- Password

- Confirm Password

Checkbox:

I agree to the Terms and Privacy Policy.

Buttons:

Create Account

Continue with Google (placeholder)

---

Forgot Password

Field:

Email

Button:

Send Reset Link

---

Reset Password

Fields:

New Password

Confirm Password

---

Email Verification

Create a professional verification success page.

---

Authentication Requirements

Use Supabase Authentication.

Implement:

- Sign Up

- Login

- Logout

- Password Reset

- Email Verification

Show proper loading states.

Show validation errors.

Display success notifications.

Protect authenticated routes.

---

Business Onboarding

After a user signs in for the first time, redirect them automatically to the onboarding flow.

Display a progress indicator at the top.

Example:

Step 1 of 4

---

Step 1

Business Information

Collect:

- Company Name

- Industry (Dropdown)

- Business Description

---

Step 2

Contact Details

Collect:

- Business Email

- Phone Number

- Website (Optional)

- Country

- Time Zone

---

Step 3

Branding

Allow the business to:

- Upload Logo

- Choose Primary Brand Color

- Choose Secondary Brand Color

Show a live preview.

---

Step 4

Confirmation

Display:

"Welcome to ConversaAI"

Explain that the dashboard is being prepared.

Button:

Go to Dashboard

(For now, the button can navigate to a simple placeholder page.)

---

Navigation

Before login:

- Home

- Features

- Pricing

- Contact

- Login

After login:

Do not build the full dashboard yet.

Only create a placeholder page with:

"Dashboard Coming in Sprint 2"

---

Components

Use reusable components.

Buttons

Inputs

Cards

Dropdowns

Progress Steps

Modals

Alerts

Toast Notifications

Loading Spinners

---

Responsiveness

The entire experience must work beautifully on:

- Desktop

- Tablet

- Mobile

Mobile experience is mandatory.

---

Accessibility

Support:

- Keyboard navigation

- Focus states

- Proper labels

- Good color contrast

---

Animations

Use subtle animations only:

- Fade In

- Slide Up

- Smooth page transitions

- Button hover effects

Keep animations fast and professional.

---

Code Quality

Organize the project into reusable folders and components.

Follow clean architecture principles.

Avoid duplicated code.

Use TypeScript types where appropriate.

---

Deliverable

Produce a polished, production-ready Sprint 1 implementation with clean UI, responsive layouts, Supabase authentication integration, and a complete business onboarding flow.

Do not implement features outside the scope of Sprint 1.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://conversai-testing.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/390a720f-ea1d-49c1-b10c-d75d622fc516).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
