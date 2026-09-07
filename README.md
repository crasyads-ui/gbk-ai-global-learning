# GBK AI Global Learning V12

Consolidated global learning foundation: multilingual language selector, shared voice coach, speak/type interaction, normal-speed browser speech, practical learning paths, real-life roleplay concepts, progress, PWA install flow, service worker, and tutor API with safe local fallback plus optional production AI provider.

## Environment for production AI
Set `AI_PROVIDER_URL` and `AI_PROVIDER_API_KEY` in Vercel when a compatible chat-completions provider is available. Without these variables the app remains usable in local practice mode and clearly reports that mode.
