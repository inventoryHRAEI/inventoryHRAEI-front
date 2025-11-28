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
├── components/        # Reusable UI components (including StepBubbles.vue)
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

### Forms & Validation - Interactive & Alive 🎉
1. **StepBubbles Component:** Interactive step indicator with:
   - Visual progress bubbles (active, completed states)
   - Step titles and descriptions
   - Connecting lines that fill as progress advances
   - Responsive design (bubbles-only on mobile)

2. **Input Focus Glow Effects:**
   - Soft green glow on focus (`0 0 16px rgba(45, 221, 90, 0.2)`)
   - Border color transition to green
   - Inset shadow for depth
   - Smooth 0.3s transitions

3. **Button Glow & Elevation:**
   - Primary buttons: `0 16px 40px rgba(11, 172, 65, 0.3)` glow on hover
   - Secondary buttons: `0 12px 32px rgba(11, 172, 65, 0.2)` glow on hover
   - Buttons lift up on hover with `translateY(-2px to -3px)`
   - Enhanced feedback for better interactivity

4. **Input Hints:**
   - Contextual help text that appears under inputs
   - Changes color on focus (contextual feedback)
   - Non-invasive, clean design

### Home Page Polish
1. **Perfect Topbar Skeleton:** Matches real topbar exactly
   - Floating capsule (64px height, 16px border-radius)
   - Identical glassmorphism and positioning
2. **Enhanced Carousel:** Better image quality, less overlay
3. **Login/Register Buttons:** Positioned below carousel
4. **Feature Cards:** Glassmorphic design with:
   - Glassmorphism: blur(12px), saturate(150%)
   - Hover animation: `translateY(-12px) scale(1.02)`
   - Icon scaling and rotating on hover
   - Shimmer effect overlay

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

## Components Added
- **StepBubbles.vue:** Interactive step progress indicator with descriptions

## Known Issues
- Backend connection errors (expected without backend running)
