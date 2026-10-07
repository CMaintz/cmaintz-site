// Just enough of the Workers runtime module for the bindings this site uses,
// so it doesn't need the full @cloudflare/workers-types package.
declare module 'cloudflare:workers' {
  export const env: Record<string, unknown>;
}
