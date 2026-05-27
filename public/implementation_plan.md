# Implementation Plan - Web Harmonium PWA & Mobile UX Optimization

This plan outlines the enhancements to transform Web Harmonium into a highly polished, responsive Progressive Web App (PWA) that behaves like a native music application on mobile devices while keeping the existing UI, branding, and desktop layout identical.

## User Review Required

> [!IMPORTANT]
> - **Visual Identity**: Desktop layout and styling will remain completely unchanged.
> - **New Mobile Navigation**: On mobile, the current header-based tab navigation (which is cramped with 6 icons) will be replaced with a beautiful **sticky bottom navigation bar** (similar to Spotify or YouTube Music).
> - **Responsive Player Placement**: On mobile, the bottom player will sit directly above the sticky bottom navigation bar (`bottom-16` instead of `bottom-0`). Left/right columns will be optimized to prevent text and button squishing on mobile.
> - **True PWA Install**: The simulated install modal will be upgraded to prompt the actual browser-level installation of the PWA (with customized iOS user instructions as a fallback).
> - **Performance & Fluidity**: Mobile GPU lag on the landing page will be fixed by rendering fewer floating particles on small screens.

## Open Questions

None at this stage. The planned changes align with the required objectives and keep existing styles/logic safe.

## Proposed Changes

We will modify several components to optimize responsiveness, PWA capabilities, and performance, and add manifest and service worker files.

---

### Design System & Layout Configuration

#### [MODIFY] [globals.css](file:///e:/webharmonium/src/app/globals.css)
- Define `--color-accent-gold: #D4AF37;` under `@theme` (missing in Tailwind config, causing unstyled gold elements).
- Add CSS utilities to prevent touch zooming on inputs/buttons and enable momentum scrolling.
- Optimize touch feedbacks and tap target size helpers.

#### [MODIFY] [layout.tsx](file:///e:/webharmonium/src/app/layout.tsx)
- Define and export `viewport` configuration to configure `width: "device-width"`, `initialScale: 1`, `maximumScale: 1`, `userScalable: false` (to prevent iOS auto-zooming on input focus) and `themeColor: "#FF007F"`.
- Reference dynamic PWA manifest link `/manifest.json` in metadata.

---

### PWA Assets & Configurations

#### [NEW] [manifest.json](file:///e:/webharmonium/public/manifest.json)
- Define full Progressive Web App manifest including name, short name, start URL (`/`), standalone display mode, orientation, theme colors, and icons.

#### [NEW] [sw.js](file:///e:/webharmonium/public/sw.js)
- Implement a service worker with a caching strategy (Stale-While-Revalidate) for HTML, CSS, JS, fonts, and local images.
- Keep audio streams and external APIs out of caching to optimize browser storage.

#### [MODIFY] [MainLayout.tsx](file:///e:/webharmonium/src/components/MainLayout.tsx)
- Add a client-side `useEffect` hook to register `sw.js` upon load.

---

### Component-Level Responsiveness & Music App UX

#### [MODIFY] [page.tsx (futuristic music page)](file:///e:/webharmonium/src/app/music/page.tsx)
- **Mobile Bottom Navigation**: Introduce a sticky bottom navigation bar for mobile (`lg:hidden`). Hide the cramped top tab bar.
- **Sticky Bottom Player**: Adjust position on mobile to sit above the bottom bar (`bottom-16`). Disable duration text, heart/download buttons, and volume mute buttons on mobile to avoid text and button squishing.
- **Actual PWA Installation**: Listen to `beforeinstallprompt` to trigger the actual PWA prompt when clicking "Install Now". Show descriptive iOS-specific guidelines as a fallback.
- **Lazy Image Loading**: Add `loading="lazy"` to `MusicCard` and `TOP_ARTISTS` images.
- **Scroll Improvements**: Add `no-scrollbar-on-mobile` to all horizontal scrolling feeds (trending, featured, recently played, spotify playlist).

#### [MODIFY] [LandingPage.tsx](file:///e:/webharmonium/src/components/LandingPage.tsx)
- Make landing page text size and start button padding/font-size responsive so they fit cleanly on 320px screens.
- Optimize performance by conditionally rendering 12 floating particles on mobile instead of 45 (massively improving GPU FPS on phones).

#### [MODIFY] [Drawer.tsx](file:///e:/webharmonium/src/components/Drawer.tsx)
- Add `loading="lazy"` to `SongItem` images.
- Ensure tap targets are clean and easily clickable.

#### [MODIFY] [SongSearch.tsx](file:///e:/webharmonium/src/components/SongSearch.tsx)
- Add `loading="lazy"` to `SongCard` images.

---

## Verification Plan

### Automated & Built-in Verification
- Validate the app build using Next.js build verification: `npm run build` to ensure no TypeScript or linting errors.
- Test that local development starts up with `npm run dev`.

### Manual & Visual Verification
- Deploy local dev server and test using Chrome DevTools:
  - Verify layout responsiveness at 360px (mobile), 768px (tablet), and 1440px (desktop) sizes.
  - Verify PWA installability in Lighthouse panel.
  - Test service worker caching by switching DevTools to Offline mode and reloading.
  - Verify no horizontal scroll exists on the root window.
