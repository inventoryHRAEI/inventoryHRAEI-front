# Inventario Frontend

## Overview
This is a Vue 3 medical equipment inventory management system frontend application. It provides a comprehensive interface for managing hospital equipment, consumables, donations, and services with role-based access control.

**Last Updated:** November 28, 2025

## Project Architecture

### Tech Stack
- **Framework:** Vue 3 with Composition API
- **Build Tool:** Vite 5
- **Router:** Vue Router 4 (with authentication guards)
- **UI Libraries:**
  - Notivue for notifications
  - SweetAlert2 for dialogs
  - GSAP for animations
  - Liquid Glass Vue for glassmorphic effects
  - Heroicons & Lucide for icons
  - Bootstrap 5 for base styling

### Project Structure
```
src/
├── components/        # Reusable UI components (StepBubbles.vue, Breadcrumbs.vue)
├── views/            # Page components
│   └── operations/   # Operation-specific views
├── stores/           # State management
├── utils/            # Utilities (API, auth, notifier, roles, window manager)
├── composables/      # Vue composables
├── styles/           # Global CSS
└── router.js         # Route definitions
```

### Key Features
1. **Authentication System:** Session-based with httpOnly cookies
2. **Role-Based Access:** Admin, user, and public routes
3. **Operations Management:** Full CRUD for equipment, comodatos, donations, services, inventory, consumables
4. **Multi-Window Management:** Window activity tracking
5. **Responsive Design:** Mobile-friendly interface

## Recent Enhancements (Nov 28, 2025)

### Navigation System (Breadcrumbs) ✅
- **All Public Pages:** Breadcrumbs in Login, Register, Home, ForgotPublic, ResetPublic
- **Smart Routing:** "Inicio" in dashboard breadcrumbs points to `/dashboard` (prevents logout)
- **Interactive:** Clickable navigation with smooth transitions
- **Accessibility:** Proper ARIA labels and semantic navigation

### Multi-Stage Forms (Breadcrumbs + Progress Bubbles) ✅
- **Registration Flow:** Breadcrumbs + 3 Step Bubbles
  - Step 1: Información (Datos básicos)
  - Step 2: Verificación (Confirma tu email)
  - Step 3: Perfil (Completa tu cuenta)

- **Password Recovery Flow:** Breadcrumbs + Progress Steps
  - ForgotPublic: Breadcrumbs + 2 Step Bubbles
  - ResetPublic: Breadcrumbs + 3 Step Bubbles

### Forms & Validation - Discrete & Elegant 🎉
1. **Input Glow Effects:**
   - Soft focus glow: `0 0 12px rgba(45, 221, 90, 0.12)`
   - Border color transition to green
   - Inset shadow for subtle depth
   - Smooth 0.3s transitions

2. **Button Effects (Refined):**
   - Primary buttons: `0 12px 28px rgba(11, 172, 65, 0.18)` on hover
   - Secondary buttons: `0 8px 20px rgba(11, 172, 65, 0.15)` on hover
   - Subtle elevation: `-1px to -2px` (minimal lift)
   - Non-intrusive interactivity

3. **Input Hints:**
   - Contextual help text under inputs
   - Color changes on focus (green feedback)
   - Clean, minimal design

4. **Password Strength Indicator:**
   - Visual bars for weak/medium/strong
   - Discrete color coding
   - Elegant styling

### Home Page & Hero Section
- **Perfect Topbar Skeleton:** Matches real topbar exactly
- **Carousel:** Enhanced images with better quality
- **Login/Register CTA:** Positioned below carousel
- **Feature Cards:** Glassmorphic design with hover animations
- **Breadcrumbs:** Navigation at top of page

### Desktop Layout Optimization (Nov 28, 2025) ✅
**Formularios (Login, Register, Recovery) - FINAL FIX:**
- **AHORA:** Forms expand to **90% viewport width** on PC (1024px+)
- Fixed scoped CSS conflicts in Login.vue & Register.vue (`max-width: 520px` was overriding global styles)
- Solution: Added media query to component scoped styles with `max-width: none` on desktop
- Result: Cards now fully expand horizontally on large screens - NOT mobile-like ✅

**Dashboard Cards (Admin & User):**
- Grid: Changed from 3 columns → **2 columns** for better spacing
- Gap increased: `22px` → `28px` for breathing room
- Cards now more prominent on desktop

**Home Page & General:**
- Container max-width: `920px` → `1200px`
- Hero section: `1100px` → `1300px`
- Feature cards gap: `20px` → `28px`
- All layouts now utilize full desktop width elegantly

## Replit Configuration

### Development Setup
- **Dev Server:** Port 5000 (Replit webview)
- **Host:** 0.0.0.0 (Replit proxy compatible)
- **Workflow:** "Frontend Dev Server" runs `npm run dev`

### Deployment
- **Type:** Static site
- **Build:** `npm run build`
- **Public Dir:** `dist`

## Development Notes

### Running Locally
```bash
npm install
npm run dev
```

### Building for Production
```bash
npm run build
```

## User Preferences
- **Language:** Spanish
- **Design:** Glassmorphic UI with smooth animations
- **Interactivity:** Maximum feedback, non-invasive
- **Navigation:** Breadcrumbs in all public pages, progress indicators in multi-step forms
- **Skeleton Loaders:** Exact visual match to real components
- **Desktop Layout:** Forms and cards expanded to use full width elegantly

## Components
- **StepBubbles.vue:** Interactive step progress indicator with descriptions
- **Breadcrumbs.vue:** Smart navigation with proper logout prevention

## Known Issues
- Backend connection errors (expected without backend running)

## Skeleton Loaders Enhancement (Nov 28, 2025) ✅
**LoadingSkeleton.vue Improvements:**
- Breadcrumbs skeleton added to all forms (Login, Register, Forgot, Reset)
- Step bubbles (progress dots) skeleton added to multi-step forms
- Full-width buttons (100%) instead of fixed width
- **Responsive design:**
  - **Mobile (≤1023px):** Narrow form (max-width: 520px)
  - **PC (≥1024px):** Expanded form (90% width, no max-width limit)
- Matches exact visual structure of actual forms
- Breadcrumbs positioned above glass card on both mobile and desktop

## Modified Files (Latest Session - Nov 28, 2025)
- `src/views/Login.vue` - Fixed scoped styles: `max-width: none` on PC + media query for 90% width expansion ✅
- `src/views/Register.vue` - Fixed scoped styles: `max-width: none` on PC + media query for 90% width expansion ✅
- `src/components/LoadingSkeleton.vue` - Enhanced with breadcrumbs, step bubbles, responsive breakpoints ✅
- `src/styles/forms.css` - Global form layout with 90% width on desktop + `max-width: none`
- `src/styles.css` - Global form styling backup
- `src/views/AdminDashboard.vue` - Dashboard grid layout (3 → 2 columns)
- `src/views/UserDashboard.vue` - Dashboard grid layout (3 → 2 columns)
- `src/views/Home.vue` - Hero and features section expansion
