'use server'

const UNSPLASH_QUERIES = [
  'ocean waves',
  'underwater coral reef',
  'coastal cliffs',
  'tropical beach',
  'deep sea',
  'sailing boat ocean',
  'lighthouse sea',
]

const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes
const BATCH_SIZE = 30

let cachedPhotos: string[] = []
let cacheTimestamp = 0

async function fetchBatch(accessKey: string): Promise<string[]> {
  const query = UNSPLASH_QUERIES[Math.floor(Math.random() * UNSPLASH_QUERIES.length)]

  try {
    const res = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&w=1920&count=${BATCH_SIZE}`,
      { headers: { Authorization: `Client-ID ${accessKey}` } }
    )

    if (!res.ok) return []
    const data = await res.json()

    return (data as { urls?: { regular?: string } }[])
      .map((p) => p.urls?.regular)
      .filter((url): url is string => !!url)
  } catch {
    return []
  }
}

export async function getRandomUnsplashPhoto(): Promise<string | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  if (!accessKey) return null

  const now = Date.now()
  if (cachedPhotos.length === 0 || now - cacheTimestamp > CACHE_TTL_MS) {
    const photos = await fetchBatch(accessKey)
    if (photos.length > 0) {
      cachedPhotos = photos
      cacheTimestamp = now
    }
  }

  if (cachedPhotos.length === 0) return null

  return cachedPhotos[Math.floor(Math.random() * cachedPhotos.length)]
}
