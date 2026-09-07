// Client-safe slug generator for blog posts. Kept separate from
// lib/blog-store.ts (which imports node:crypto) so this can be imported into
// client components for live slug previews without pulling in server-only APIs.

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
