# Product Requirements Document (PRD)
## Masti Music — Web Music Streaming App

**Version:** 2.0 (Rebuild)
**Owner:** [Your Name]
**Status:** Draft for Development

---

## 1. Overview

Masti Music is a web-based music streaming app that lets users search, browse, and play songs with a smooth, bug-free playback experience — including working Next/Previous controls, autoplay, and reliable song-to-audio matching. This PRD defines what "working" means so the rebuild fixes all current issues (wrong song playing, broken next/skip, missing songs, partial track lists).

## 2. Problem Statement

The current version has core playback bugs:
- Clicking a song sometimes plays a different song than selected.
- Next/Previous buttons don't work.
- Songs don't auto-advance when one ends.
- Only a partial song list loads (not the full album/search results).
- The API source (unofficial JioSaavn wrapper) sometimes returns only previews, not full tracks.

This rebuild must fix these at the architecture level, not patch symptoms.

## 3. Goals & Success Criteria

| Goal | Success Criteria |
|---|---|
| Reliable playback | Clicking any song always plays that exact song, every time |
| Full queue control | Next/Previous always move to the correct adjacent track |
| Continuous listening | Songs auto-play the next track on completion, no manual action needed |
| Complete catalog | Full song lists/albums load, not just first page of results |
| Stable data source | Music source returns full-length audio, not 30-sec previews, with a documented fallback if not |

## 4. Non-Goals (Out of Scope for v2.0)
- Offline downloads
- User accounts / login / saved playlists (can be v2.1)
- Social features (sharing, comments, likes)
- Paid subscriptions

## 5. Target Users
- Casual listeners who want a fast, ad-free, no-login way to stream Hindi/Indian music
- Users on both mobile and desktop web

## 6. Core Features & Requirements

### 6.1 Search
- Search bar to find songs, artists, or albums by name.
- Debounced input (don't fire API call on every keystroke — wait ~300ms after typing stops).
- Show loading state while results load.
- Show "no results" state clearly if search returns empty.

### 6.2 Song List / Browse
- Home page shows curated/trending sections (e.g. "Trending," "New Releases") pulled from the API.
- Clicking an album/playlist shows **all** tracks in it — implement pagination or "load more" so the full tracklist loads, not just the first 10–20.
- Each song row shows: thumbnail, title, artist name, duration.

### 6.3 Player (Core Fix Area)
- **Song identity:** every playback action must reference the song's unique `id`, never array index or name matching.
- **Play/Pause:** single button toggles correctly, syncs with audio element state.
- **Next/Previous:**
  - Maintains a `currentIndex` synced to the active queue/playlist array.
  - Next → `currentIndex + 1` (wrap or stop at end, per product decision — default: stop at end unless "repeat queue" is on).
  - Previous → `currentIndex - 1` (wrap or stop at start).
  - Buttons disabled/greyed out appropriately at start/end of queue if not looping.
- **Autoplay:** `onEnded` event on the audio element automatically triggers "Next" logic — no user action needed between songs.
- **Seek bar:** draggable progress bar showing current time / total duration, allows scrubbing.
- **Volume control.**
- **Now playing bar:** persistent mini-player at bottom showing current song art, name, artist, and controls — visible across all pages.

### 6.4 Queue / Playlist State
- A single source of truth for "current queue" (e.g. React Context or a state store like Zustand).
- Playing a song from a list sets that entire list as the queue, with the clicked song as `currentIndex`.
- Queue persists during navigation (switching pages doesn't stop playback).

### 6.5 Data Source / API Layer
- Use a documented, reasonably stable API (e.g. `saavn.dev` or similar JioSaavn wrapper) that returns **full song URLs**, not 30-second previews — verify this before building on it.
- Centralize all API calls in one service file (e.g. `services/musicApi.ts`) so field-name issues are fixed in one place, not scattered across components.
- Handle API response shape defensively: validate/normalize each song object into a consistent internal shape (`{ id, title, artist, image, audioUrl, duration }`) right after fetching, so the rest of the app never deals with raw API inconsistencies.
- Implement pagination support (`page`/`limit` params) and fetch all pages when displaying a full album/playlist.
- Have a fallback message/state if the API fails or a track has no playable URL (e.g. "This track isn't available right now" instead of silent failure or wrong song).

## 6.6 Library / Sidebar Additions
- **Recently Played:** track last 20–30 played songs, shown as a list, most recent first.
- **Playlists:** users can create custom playlists (name + add/remove songs), shown under Library.
- **Liked Songs:** a dedicated "Liked Songs" collection, separate from generic Favorites, matching common music-app patterns.
- **Queue / Up Next panel:** a slide-out or expandable panel showing the current play queue, with ability to reorder or remove upcoming tracks.

## 6.7 Player Enhancements
- **Shuffle:** randomizes playback order within the current queue; toggle on/off.
- **Repeat modes:** off / repeat-one / repeat-all, cycled via a single button with a visual state indicator.
- **Lyrics view:** expandable panel showing lyrics if the API/source provides them; graceful fallback ("Lyrics not available") if not.
- **Full-screen Now Playing view:** tapping/clicking the mini-player expands to a full-screen view with large art, controls, and lyrics.
- **Sleep timer:** user sets a duration after which playback auto-pauses.

## 6.8 Discovery / Content Features
- **Genres/Moods:** curated rows like "Sad Songs," "Party," "Romantic," "Workout," pulled from the API or manually curated.
- **Artist pages:** clicking an artist name navigates to a page listing all their available tracks.
- **New Releases / Recently Added:** a home-page section for newest content.
- **Recommended for You:** simple recommendation logic based on liked songs or listening history (can start rule-based, e.g. "more from artists you've liked").

## 6.9 Harmonium Tab Enhancements
(Builds on the existing Harmonium tab already in the app.)
- Chords/notes overlay synced to the currently playing song, where available.
- Practice mode with a built-in metronome.
- Ability to save custom harmonium presets/settings.

## 6.10 User Account Features
- Login/Signup via email or Google OAuth (replace any hardcoded/placeholder user name).
- Cross-device sync for favorites, playlists, and liked songs tied to the user's account.
- Listening stats/recap (e.g. "You listened to X songs this month") as a simple engagement feature.

## 6.11 Polish / UX
- Theme toggle (dark mode exists; optional light mode).
- Keyboard shortcuts: Space = play/pause, Arrow keys = next/previous/seek.
- Verify the existing "Install App" (PWA) button correctly installs and functions as a standalone app.

## 7. Technical Architecture Notes
- **Framework:** Next.js (existing) — keep client-side player logic in a dedicated component/hook (e.g. `usePlayer()`).
- **State management:** Centralized queue/player state (Context API or Zustand) — avoid prop-drilling player state through many components, which is a common cause of stale/broken Next-Previous logic.
- **Audio handling:** Single persistent `<audio>` element (not recreated per song) — swap only its `src` and call `.play()`, to avoid flicker/state loss.
- **Testing checklist before shipping:**
  - [ ] Click 10 different songs in a row — correct song plays each time
  - [ ] Click Next 5 times in a row — moves correctly through queue
  - [ ] Click Previous from song 1 — handled gracefully (stop or wrap, per spec)
  - [ ] Let a song play to completion — next song auto-starts
  - [ ] Open an album with 20+ tracks — all tracks are visible/loadable
  - [ ] Search for a song — correct results appear, playable

## 8. Design Requirements
- Mobile-first responsive layout (most users likely on mobile web).
- Persistent bottom mini-player, expandable to full-screen "Now Playing" view.
- Brand color: `#FF007F` (existing theme color) — maintain consistent use across buttons/accents.
- Loading skeletons for song lists instead of blank screens.

## 9. Risks / Open Questions
- **Legal risk:** unofficial JioSaavn APIs may violate terms of service; confirm intended use (personal/learning vs. public launch) before scaling.
- **API reliability:** third-party unofficial APIs can change or go down without notice — consider having a backup data source or graceful degradation.
- Decide: should Next/Previous loop the queue or stop at boundaries? (Recommend: stop, with a separate "repeat" toggle for looping.)

## 10. Milestones (Suggested)
1. **Fix data layer** — normalize API responses, confirm full-length audio URLs, add pagination.
2. **Fix player core** — single audio element, `currentIndex`-based queue, id-based song selection.
3. **Fix Next/Previous/Autoplay** — wire up `onEnded`, Next/Prev handlers.
4. **QA pass** — run through testing checklist in Section 7.
5. **Core playback polish** — Shuffle, Repeat modes, Recently Played, Queue panel (Sections 6.6–6.7).
6. **Playlists & Liked Songs** — user-created playlists, dedicated liked-songs collection.
7. **Discovery features** — genres/moods, artist pages, recommendations (Section 6.8).
8. **Accounts & sync** — login/signup, cross-device sync (Section 6.10).
9. **Nice-to-haves** — lyrics view, sleep timer, harmonium enhancements, listening stats, theme/shortcuts polish.

**Priority note:** Fix all core playback bugs (Milestones 1–4) before adding any new feature — a stable player is the foundation everything else depends on.

---

*Give this PRD to Antigravity AI along with the current codebase so it can rebuild against these exact requirements rather than patching bugs individually.*
