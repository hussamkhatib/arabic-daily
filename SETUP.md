# Arabic Writing Practice — Setup Guide

## What was built

17 new files across the full app:

- `src/lib/supabase.js` — Supabase client singleton
- `src/hooks/` — `useSessions`, `useSession`, `useImageUpload`
- `src/components/Calendar/` — calendar with green dots on active days + list view
- `src/components/Day/` — drag-and-drop uploader (4-image limit), image grid with hover actions, auto-saving notes
- `src/components/Editor/` — Fabric.js canvas editor with pen, text, rectangle, line, color picker, undo, clear, save
- `src/pages/` — CalendarPage, DayPage, EditorPage

**Routes:**

| Path | Page |
|------|------|
| `/` | Calendar / list of all sessions |
| `/day/2026-06-08` | Day view — upload images + notes |
| `/editor/:sessionId/:imageId` | Full-screen annotation editor |

---

## Supabase Setup

### 1. Create a project

Go to [supabase.com](https://supabase.com) → New project. Pick a name, region, and password.

### 2. Run the database migrations

In the Supabase dashboard go to **Database → SQL Editor** and run:

```sql
CREATE TABLE sessions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_date date NOT NULL UNIQUE,
  notes        text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE session_images (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  storage_path    text NOT NULL,
  annotated_path  text,
  display_order   integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON session_images(session_id);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_sessions"       ON sessions       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_session_images" ON session_images FOR ALL USING (true) WITH CHECK (true);
```

### 3. Create the storage bucket

Go to **Storage → New bucket**:

- Name: `session-images`
- Toggle **Public bucket** on
- Click Create

Then go to **Storage → Policies** and add a policy for the bucket:

```sql
CREATE POLICY "allow_all_storage" ON storage.objects
  FOR ALL USING (bucket_id = 'session-images')
  WITH CHECK (bucket_id = 'session-images');
```

### 4. Add your credentials

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Then open `.env.local` and fill in your values from **Settings → API** in the Supabase dashboard:

```
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Running the app

```bash
npm start
```

The app opens at [http://localhost:3000](http://localhost:3000).

---

## How to use it

**Upload images:**
1. Click **Today** or pick a day on the calendar
2. Drag and drop up to 4 photos of your handwriting onto the upload zone

**Annotate during instructor calls:**
1. On a day's page, hover over an image and click **Edit**
2. Use the toolbar at the bottom — pen, text, shapes, color picker
3. Click **Save** — the annotated version is stored and shown on the card

**Browse past sessions:**
- The calendar shows a green dot on every day that has uploads
- Toggle to **List** view for a scrollable history
- Click any day to open it

---

## Tech stack

| Package | Purpose |
|---------|---------|
| `@supabase/supabase-js` | Database + file storage |
| `react-router-dom` | Client-side routing |
| `react-dropzone` | Drag-and-drop file upload |
| `react-calendar` | Calendar grid with custom tile content |
| `fabric@5` | Canvas-based image annotation editor |
| `date-fns` | Date formatting utilities |
| `tailwindcss` | Utility-first styling |
