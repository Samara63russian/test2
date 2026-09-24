# Anspruch Schweiz

A responsive, multilingual lead-generation landing page for a 2026 guide to
Swiss social benefits. The interface is available in German, French, and
Italian.

## Local development

```bash
npm install
npm run dev
```

Create an optimized production build with:

```bash
npm run build
```

## Lead delivery

The page runs in preview mode until a lead endpoint is configured. Set the
`content` value of the `lead-endpoint` meta tag in `index.html` to an HTTPS
endpoint that accepts JSON:

```json
{
  "email": "name@example.ch",
  "birthYear": "earlier",
  "language": "de",
  "consent": true,
  "consentedAt": "2026-09-24T20:00:00.000Z"
}
```

Before publishing, replace the bracketed operator details in the imprint and
privacy policy, connect a double-opt-in mail provider, and review the legal
copy with the actual data-processing setup.
