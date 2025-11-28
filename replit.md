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
├── components/        # Reusable UI components (including StepBubbles.vue, Breadcrumbs.vue)
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
6. **Navigation:** Breadcrumbs in all authenticated pages, recovery flows

## Recent Enhancements (Nov 28, 2025)

### Breadcrumbs Navigation ✅
- **Dashboard & Operations:** Smart breadcrumbs with "Inicio" pointing to `/dashboard` (not home, prevents logout)
- **Recovery Flow:** Breadcrumbs in ForgotPublic and ResetPublic showing navigation path
- **Interactive:** Clickable for backward navigation, smooth transitions

### Forms & Validation - Interactive & Alive 🎉
1. **Discrete Input Glow Effects:**
   - Soft green glow on focus: `0 0 12px rgba(45, 221, 90, 0.12)`
   - Inset shadow for subtle depth
   - Smooth 0.3s transitions

2. **Button Glow & Elevation (Refined):**
   - Primary buttons: `0 12px 28px rgba(11, 172, 65, 0.18)` on hover
   - Secondary buttons: `0 8px 20px rgba(11, 172, 65, 0.15)` on hover
   - Elevation: `-1px to -2px` (subtle lift)
   - Enhanced feedback for better interactivity

3. **Input Hints:**
   - Contextual help text under inputs
   - Changes color on focus (green feedback)
   - Non-invasive, clean design

4. **Password Strength Indicator:**
   - Visual bars (weak/medium/strong) with color feedback
   - Discrete and elegant styling

### Home Page Polish
1. **Perfect Topbar Skeleton:** Matches real topbar exactly
   - Floating capsule (64px height, 16px border-radius)
   - Identical glassmorphism and positioning
2. **Enhanced Carousel:** Better image quality, less overlay
3. **Login/Register Buttons:** Positioned below carousel
4. **Feature Cards:** Glassmorphic design with hover animations

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
- **Interactivity:** Maximum feedback without being invasive
- **Skeleton Loaders:** Exact visual match to real components
- **Navigation:** Clean breadcrumbs, intuitive flow

## Components
- **StepBubbles.vue:** Interactive step progress indicator with descriptions
- **Breadcrumbs.vue:** Smart navigation with proper logout prevention

## Known Issues
- Backend connection errors (expected without backend running)
