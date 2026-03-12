

# Webnario — Client Project Portal

## Overview
A sleek, frontend-only freelance web development portal where clients can submit project requests and you (admin) can manage them. Features a stunning animated landing page, dark/light theme toggle, and full project management dashboard.

---

## 🎨 Theme System
- **Light mode**: Clean white background with black text and subtle gray accents
- **Dark mode**: Black/dark background with red accents (#DC2626) and white text — buttons, links, active states, and borders all use red highlights
- Theme toggle button accessible from all pages (sun/moon icon)

---

## Page 1: Landing Page (Hero)
- **"Webnario" text animation**: Letters appear one by one with a typewriter-style effect, with a glowing cursor
- **Background animations**: Floating geometric shapes (circles, squares, triangles) slowly moving and rotating, with subtle parallax effect
- **Tagline** that fades in after the title: *"We Build Websites That Work"*
- **Two CTA buttons**: "Get Started" (→ signup) and "Login" 
- Smooth scroll sections showcasing services (Web Development, Responsive Design, etc.) with fade-in-on-scroll animations

## Page 2: Login Page
- Clean centered login form with email and password fields
- "Don't have an account? Sign up" link
- Hardcoded admin credentials check (admin@webnario.com) — routes to admin dashboard
- Regular users route to client dashboard
- Subtle background animation consistent with landing page

## Page 3: Signup Page
- Registration form: Name, Email, Password, Confirm Password
- Client-side validation with error messages
- On signup, store user in localStorage and redirect to client dashboard

## Page 4: Client Dashboard
- Welcome message with user's name
- **"Add Your Project"** prominent button
- List of submitted projects (stored in localStorage) with status badges
- Sidebar navigation with: Home, My Projects, Profile, Logout

### Add Project Form (Dialog/Modal)
Comprehensive fields:
- Project Name
- Project Description (textarea)
- Website Type (dropdown: Business, E-commerce, Portfolio, Blog, Other)
- Number of Pages (input)
- Features Needed (multi-select checkboxes: Contact Form, Gallery, Blog, Payment, Chat, etc.)
- Tech Stack Preference (optional dropdown)
- Reference Websites (textarea)
- Budget Range (dropdown)
- Deadline (date picker)
- Priority Level (Low, Medium, High, Urgent)
- File Upload area (visual only — file name display, no actual upload)
- Preferred Contact Method (Email, Phone, WhatsApp)

## Page 5: Admin Dashboard
- Accessed via admin login credentials
- **View all submitted projects** from all "clients" (from localStorage)
- Each project card shows: client name, project name, status, priority, date submitted
- **Status Management**: Update project status (Pending → In Review → In Progress → Completed → Delivered)
- **Delete projects** with confirmation dialog
- **Add notes/replies** to each project (viewable as a thread)
- Filter & search projects by status, priority, or client name

---

## Animations & UX Polish
- Page transitions with fade-in effects
- Hover effects on all interactive elements (cards lift, buttons scale slightly)
- Form inputs with focus animations (border glow in theme color)
- Status badge color coding
- Loading skeletons where appropriate
- Toast notifications for actions (project submitted, deleted, status updated)
- Smooth scroll behavior throughout

