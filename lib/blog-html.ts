import sanitizeHtml from "sanitize-html";

// Server-safe HTML sanitizer for blog content. Uses sanitize-html (htmlparser2
// based, zero jsdom) — a heavy jsdom dependency caused an ESM/CJS crash and
// huge cold starts in the serverless environment.

const BLOG_TAGS = [
  "a",
  "blockquote",
  "br",
  "code",
  "div",
  "em",
  "figcaption",
  "figure",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "iframe",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "s",
  "span",
  "strong",
  "u",
  "ul",
];

const BLOG_ATTRIBUTES = [
  "allow",
  "allowfullscreen",
  "alt",
  "class",
  "frameborder",
  "height",
  "href",
  "loading",
  "rel",
  "src",
  "style",
  "target",
  "title",
  "width",
];

export function sanitizeBlogHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: BLOG_TAGS,
    allowedAttributes: { "*": BLOG_ATTRIBUTES },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: {
      iframe: ["http", "https"],
    },
  });
}