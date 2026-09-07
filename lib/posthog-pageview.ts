const PROTECTED_PATH_PREFIXES = ['/dashboard', '/api/admin']
const SAFE_CATEGORY = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function buildPostHogPageviewUrl(
  origin: string,
  pathname: string,
  searchParams: URLSearchParams,
): string | null {
  if (
    PROTECTED_PATH_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  ) {
    return null
  }

  const url = new URL(pathname, origin)
  const category = searchParams.get('category')
  const page = searchParams.get('page')

  if (category && category.length <= 80 && SAFE_CATEGORY.test(category)) {
    url.searchParams.set('category', category)
  }
  if (page && /^\d{1,5}$/.test(page) && Number(page) > 0) {
    url.searchParams.set('page', page)
  }

  return url.toString()
}
