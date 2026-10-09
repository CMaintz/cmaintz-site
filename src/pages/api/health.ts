// Health check for the contact API (draft-inadarei-api-health-check format),
// linked from /.well-known/api-catalog as its `status` relation.
import type { APIRoute } from 'astro';
import { RESEND_API_KEY } from 'astro:env/server';

export const prerender = false;

export const GET: APIRoute = () =>
  new Response(JSON.stringify({ status: RESEND_API_KEY ? 'pass' : 'warn' }), {
    headers: { 'Content-Type': 'application/health+json', 'Cache-Control': 'no-store' },
  });
