import DOMPurify from 'isomorphic-dompurify'

const BLOG_TAGS = [
  'a',
  'blockquote',
  'br',
  'code',
  'div',
  'em',
  'figcaption',
  'figure',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'iframe',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  's',
  'span',
  'strong',
  'u',
  'ul',
]

const BLOG_ATTRIBUTES = [
  'allow',
  'allowfullscreen',
  'alt',
  'class',
  'frameborder',
  'height',
  'href',
  'loading',
  'rel',
  'src',
  'style',
  'target',
  'title',
  'width',
]

export function sanitizeBlogHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: BLOG_TAGS,
    ALLOWED_ATTR: BLOG_ATTRIBUTES,
  })
}
