# MDPL Chat / Communication Engine

## Deployment

1. Configure `CHAT_MAX_MESSAGE_LENGTH`, `CHAT_MAX_FILE_SIZE_BYTES`, and `JSON_BODY_LIMIT` as needed.
2. From `mdpl-api`, run `npm run prisma:migrate:deploy`.
3. Restart the API and deploy the frontend build.
4. Confirm the API process can write to `<UPLOAD_DIR>/chat`.

The public widget is mounted by `PublicLayout`. Set `showChat={false}` on a selected public layout instance to disable it.

## Manual test checklist

- Open a public page and confirm the floating launcher works on desktop and mobile.
- Create a thread with name plus phone or email; invalid contacts should be rejected.
- Refresh the page and confirm the thread resumes from local storage.
- Send text and an `https://` URL; both should appear after refresh/polling.
- Upload an allowed image, PDF, or document under the configured limit; unsupported/oversized files should fail.
- Request human handoff and confirm the thread becomes `WAITING_FOR_ADMIN`.
- Attempt to fetch a public thread with no token or a wrong token; expect `401` or `404`.
- Attempt an admin endpoint with no admin JWT; expect `401`. Use a non-admin JWT; expect `403`.
- Open `/admin/chat`, search/filter threads, and verify unread badges and latest-message previews.
- Assign a thread to self and to another admin.
- Reply publicly and confirm the visitor sees it after polling.
- Add an internal note and confirm the visitor never sees it.
- Mark a thread resolved, closed, and reopened; confirm status and `closed_at` behavior.
- Upload an admin attachment and confirm the visitor can open its public attachment metadata/link.

## Phase 1/2 behavior

- Polling interval: 12 seconds.
- Bot behavior is rule-based welcome, quick links, routing, and handoff only.
- Messages render as React text, so visitor-provided HTML is escaped rather than injected.
- Attachments use controlled base64 uploads to the existing local upload storage pattern.
- No AI-generated policy/payment decisions and no WebSocket dependency are included.
