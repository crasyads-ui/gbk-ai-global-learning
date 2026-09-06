# GBK AI Global Learning V9

V9 fixes and expands the global learning frontend while keeping the professional navy/purple visual direction.

## Included
- 15-language selector on the home page with saved language preference.
- Multilingual greeting and language passed into tutor requests.
- Spoken English flow: listen -> speak/type -> AI correction -> explanation -> repeat.
- Browser voice input with language-specific recognition codes where supported.
- Text-to-speech example and correction playback.
- 9 learning paths with expanded lesson sequences.
- AI Tutor page with voice + text questions.
- Progress page and learning navigation.
- Correct Next.js App Router API paths under `app/api/*`.
- Health endpoint version 9.0.0.

Production AI remains optional: configure `AI_PROVIDER_API_KEY` and `AI_PROVIDER_URL` in Vercel to use the external AI provider. Without those variables, the built-in fallback tutor remains available.
