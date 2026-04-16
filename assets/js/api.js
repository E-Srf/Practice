/**
 * Shared API config — imported by every page that calls the backend.
 *
 * This is the ONE place to change the backend URL.
 * Vanilla JS running in the browser cannot read server-side env vars,
 * so this value is intentionally set here.
 *
 * Development : http://localhost:8000
 * Production  : replace with your deployed API domain, e.g. https://api.yourdomain.com
 */
const API_BASE = 'http://localhost:8000';
