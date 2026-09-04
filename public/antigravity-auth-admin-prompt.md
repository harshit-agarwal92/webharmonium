# Masti Music — User Profile & Admin Mode Prompt for Antigravity AI

Implement a proper authentication system with two roles: **User** and **Admin**. Currently there's a hardcoded name ("Harshit Agarwal") in the sidebar with no real login — replace this with a working system as described below.

---

## 1. Authentication (Foundation)

- Implement login/signup using **email + password**, and optionally **Google OAuth** for faster sign-in.
- Use a proper auth solution suited to Next.js — e.g. **NextAuth.js (Auth.js)** or **Firebase Auth** — rather than building JWT/session handling from scratch, to avoid security bugs.
- Store user data in a database (e.g. **Supabase**, **Firebase Firestore**, or **MongoDB**) with at minimum:
  ```
  User {
    id: string (unique)
    name: string
    email: string (unique)
    passwordHash: string (if using email/password)
    avatarUrl: string (optional)
    role: "user" | "admin"   // default "user"
    favorites: [songId]
    playlists: [playlistId]
    recentlyPlayed: [songId]
    createdAt: timestamp
  }
  ```
- Protect routes: pages/actions that require login (favorites, playlists, profile) should redirect to login if the user isn't authenticated.
- Persist session (so refreshing the page doesn't log the user out) using cookies/JWT via the auth library.

## 2. User Profile (Regular User)

- Add a working **Profile page** accessible from the sidebar (replacing the static "Harshit Agarwal" text):
  - Shows avatar, name, email.
  - Editable fields: name, avatar (upload or choose from presets), password change.
  - Shows the user's stats: total songs liked, playlists created, recently played count.
- Sidebar bottom section should show the **actual logged-in user's** name/avatar (from session), with a dropdown menu on click: `Profile`, `Settings`, `Logout`.
- "Good Evening, [users]" on the home page should use the real first name from the session, e.g. "Good Evening, Harshit".
- If not logged in, show a "Login / Sign Up" button in place of the profile section, and gate personalized features (Favorites, Playlists, Recently Played) behind login — Explore/Search/Home can remain visible to guests.

## 3. Admin Mode

- Add a `role` field per user (`"user"` or `"admin"`), set manually in the database for now (no public way to self-assign admin).
- When an admin logs in, show an **additional "Admin" link** in the sidebar (hidden for regular users) that leads to `/admin`.
- Protect the `/admin` route: check `session.user.role === "admin"` server-side (in middleware or a server component) — if a non-admin tries to access `/admin` directly via URL, redirect them away. Never rely on hiding the link alone.

### Admin Dashboard should include:
1. **User management**
   - Table of all registered users: name, email, role, date joined.
   - Ability to promote/demote a user's role (user ↔ admin).
   - Ability to disable/delete a user account.
2. **Content management**
   - View/search the song catalog currently being pulled from the API.
   - Ability to manually feature songs/albums in "Trending Hits" or "Top Charts" (i.e. an override list stored in the database, separate from whatever the API returns).
   - If using multiple API sources (JioSaavn + fallback), a way to see which source a song came from — useful for debugging missing/wrong songs.
3. **Basic analytics**
   - Total registered users.
   - Most-played songs/artists (based on aggregated `recentlyPlayed` data across users).
   - Simple charts/numbers — doesn't need to be fancy, just functional.

## 4. Security Notes
- Never expose `role` checks only on the frontend — always verify server-side (API routes / middleware), since frontend checks can be bypassed by directly calling APIs.
- Hash passwords properly (bcrypt or whatever the chosen auth library handles by default — don't store plaintext).
- Rate-limit login attempts to prevent brute-force attacks.
- Sanitize all admin inputs (e.g. featured song overrides) to prevent injection issues.

## 5. Testing Checklist
- [ ] Sign up as a new user — profile created correctly in database.
- [ ] Log in, refresh page — session persists, still logged in.
- [ ] Log out — session clears, protected pages redirect to login.
- [ ] Regular user cannot see or access `/admin` (even via direct URL).
- [ ] Manually set a user's role to `"admin"` in the database — they can now see and access the Admin link/dashboard.
- [ ] Admin can promote/demote another user's role and it takes effect on that user's next login/session refresh.
- [ ] Profile page correctly shows and allows editing of name/avatar.
- [ ] Sidebar "Good Evening, [Name]" reflects the actual logged-in user.

## General ask
Please implement authentication first (Section 1), then build the user Profile page (Section 2), then Admin mode (Section 3), keeping the existing dark theme and layout consistent with the rest of the app. Confirm role checks are enforced server-side, not just hidden in the UI.
