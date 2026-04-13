import DOMPurify from 'dompurify'

const ALLOWED_TAGS = [
  // Text formatting
  'p',
  'br',
  'strong',
  'em',
  'u',
  's',
  'sub',
  'sup',
  // Headings
  'h1',
  'h2',
  'h3',
  'h4',
  // Lists
  'ul',
  'ol',
  'li',
  // Links
  'a',
  // Block
  'blockquote',
  'hr',
  'pre',
  'code',
]

const ALLOWED_ATTR = ['href', 'target', 'rel']

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
    FORBID_TAGS: ['style', 'script', 'iframe', 'form', 'input', 'object', 'embed'],
    FORBID_ATTR: ['style', 'onerror', 'onclick', 'onload', 'onmouseover'],
  })
}

// Stricter sanitizer for embed blocks — allows iframes from trusted sources only
const TRUSTED_EMBED_ORIGINS = [
  'https://www.youtube.com',
  'https://www.youtube-nocookie.com',
  'https://player.vimeo.com',
  'https://open.spotify.com',
  'https://w.soundcloud.com',
  'https://codepen.io',
  'https://docs.google.com',
  'https://www.figma.com',
  'https://miro.com',
]

export function sanitizeEmbed(dirty: string): string {
  const clean = DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['iframe'],
    ALLOWED_ATTR: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'title'],
    ALLOW_DATA_ATTR: false,
  })

  // Validate iframe src against trusted origins
  const div = document.createElement('div')
  div.innerHTML = clean
  const iframe = div.querySelector('iframe')

  if (!iframe) return ''

  const src = iframe.getAttribute('src') || ''
  const isTrusted = TRUSTED_EMBED_ORIGINS.some((origin) => src.startsWith(origin))

  if (!isTrusted) return ''

  // Force sandbox for extra safety
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation')
  iframe.setAttribute('referrerpolicy', 'no-referrer')

  return div.innerHTML
}
