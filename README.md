<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Av5YNyYp0x9AISko4ekElxGQ-ifIrz9c

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Netlify (recommended)

1. Create a new site in Netlify connecting your Git repository.
2. In Site settings > Build & deploy > Environment > Environment variables, add:
   - `VITE_SUPABASE_URL` -> your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` -> your Supabase anon key
   - `GEMINI_API_KEY` -> your Google Gemini API key (server-side only; no VITE_ prefix)
3. Set the build command to `npm run build` and the publish directory to `dist`.
4. Trigger a deploy. The app will now call Gemini via a serverless function so your key stays secret.
