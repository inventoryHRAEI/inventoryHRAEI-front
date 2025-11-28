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
├── components/        # Reusable UI components
├── views/            # Page components
│   └── operations/   # Operation-specific views (entrada, salida, etc.)
├── stores/           # State management (mobile notifications, pending requests)
├── utils/            # Utilities (API, auth, notifier, roles, window manager)
├── composables/      # Vue composables
├── styles/           # Global CSS
└── router.js         # Route definitions with auth guards
```

### Key Features
1. **Authentication System:** Session-based with httpOnly cookies
2. **Role-Based Access:** Admin, user, and public routes
3. **Operations Management:**
   - Equipment entry (OpEntrada)
   - Equipment exit (OpSalida)
   - Equipment custody/resguardo (OpResguardo)
   - Equipment service (OpServicio)
   - Biomedical inventory (OpInventarioBiomedica)
   - Consumables on demand (OpInsumosConsumibles)
4. **Multi-Window Management:** Window activity tracking and session management
5. **Responsive Design:** Mobile-friendly with dynamic topbar adjustments

## Replit Configuration

### Development Setup
- **Dev Server:** Runs on port 5000 (configured for Replit's webview)
- **Host:** Bound to 0.0.0.0 for Replit proxy compatibility
- **HMR:** Configured with clientPort 443 for Replit environment
- **Workflow:** "Frontend Dev Server" runs `npm run dev`

### Backend Integration
- The app expects a backend API at `http://localhost:3002`
- API proxy configured in vite.config.js for `/api/*` routes
- Uses credentials: 'include' for cookie-based authentication
- **Note:** Backend not included in this frontend-only Replit

### Deployment
- **Type:** Static site deployment
- **Build Command:** `npm run build`
- **Public Directory:** `dist`
- **Output:** Optimized static assets for production

## Recent Changes (Nov 28, 2025)
1. Configured Vite to run on port 5000 (Replit requirement)
2. Set host to 0.0.0.0 for proper Replit proxy support
3. Added HMR clientPort configuration for Replit environment
4. Fixed node_modules binary permissions for Vite
5. Configured static deployment settings
6. Created workflow for frontend dev server

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

### Important Considerations
- The app makes API calls to `/api/*` which proxy to port 3002
- Without a running backend, some features will show connection errors (expected)
- Authentication flows require the backend API to be available
- Multi-window session management uses sessionStorage and localStorage

## User Preferences
None specified yet.

## Known Issues
- Vite CJS Node API deprecation warning (non-critical, will be resolved in future Vite versions)
- Backend connection refused errors (expected without backend running)
