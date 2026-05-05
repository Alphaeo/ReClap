const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.TMDB_API_READ_TOKEN}`,
    "Content-Type": "application/json",
  };
}

export function tmdbImage(path: string | null, size: "w185" | "w342" | "w500" | "w780" | "original" = "w500") {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function formatRuntime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

export function formatMoney(amount: number) {
  if (!amount) return null;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(amount);
}

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: getHeaders(),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${path}`);
  return res.json();
}

export interface TmdbMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  runtime: number;
  genres: { id: number; name: string }[];
  budget: number;
  revenue: number;
  original_language: string;
  tagline: string;
  status: string;
  popularity: number;
}

export interface TmdbCredits {
  cast: {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
  }[];
  crew: {
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
  }[];
}

export interface TmdbKeywords {
  keywords: { id: number; name: string }[];
}

export interface TmdbVideos {
  results: {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
  }[];
}

export interface TmdbSearchResult {
  results: {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string;
    vote_average: number;
    overview: string;
  }[];
  total_results: number;
  total_pages: number;
}

export async function getMovie(id: number, locale: "fr" | "en" = "fr"): Promise<TmdbMovie> {
  const lang = locale === "fr" ? "fr-FR" : "en-US";
  return tmdbFetch<TmdbMovie>(`/movie/${id}`, { language: lang });
}

export async function getMovieCredits(id: number): Promise<TmdbCredits> {
  return tmdbFetch<TmdbCredits>(`/movie/${id}/credits`);
}

export async function getMovieKeywords(id: number): Promise<TmdbKeywords> {
  return tmdbFetch<TmdbKeywords>(`/movie/${id}/keywords`);
}

export async function getMovieVideos(id: number): Promise<TmdbVideos> {
  return tmdbFetch<TmdbVideos>(`/movie/${id}/videos`, { language: "en-US" });
}

export async function getSimilarMovies(id: number, locale: "fr" | "en" = "fr"): Promise<TmdbSearchResult> {
  const lang = locale === "fr" ? "fr-FR" : "en-US";
  return tmdbFetch<TmdbSearchResult>(`/movie/${id}/similar`, { language: lang });
}

export async function getTrending(locale: "fr" | "en" = "fr"): Promise<TmdbSearchResult> {
  const lang = locale === "fr" ? "fr-FR" : "en-US";
  return tmdbFetch<TmdbSearchResult>("/trending/movie/week", { language: lang });
}

export async function searchMovies(query: string, locale: "fr" | "en" = "fr"): Promise<TmdbSearchResult> {
  const lang = locale === "fr" ? "fr-FR" : "en-US";
  return tmdbFetch<TmdbSearchResult>("/search/movie", { query, language: lang });
}

export async function searchTV(query: string, locale: "fr" | "en" = "fr"): Promise<{ results: { id: number; name: string; poster_path: string | null; first_air_date: string; vote_average: number }[]; total_results: number }> {
  const lang = locale === "fr" ? "fr-FR" : "en-US";
  return tmdbFetch("/search/tv", { query, language: lang });
}

export interface DiscoverParams {
  type?: "movie" | "tv";
  genreId?: string;
  originCountry?: string;
  year?: string;
  sortBy?: string;
  minVote?: string;
  page?: string;
}

export async function discoverMedia(params: DiscoverParams, locale: "fr" | "en" = "fr"): Promise<TmdbSearchResult & { results: { id: number; title?: string; name?: string; poster_path: string | null; release_date?: string; first_air_date?: string; vote_average: number; overview: string }[] }> {
  const lang = locale === "fr" ? "fr-FR" : "en-US";
  const endpoint = params.type === "tv" ? "/discover/tv" : "/discover/movie";
  const p: Record<string, string> = { language: lang, page: params.page ?? "1" };
  if (params.genreId) p.with_genres = params.genreId;
  if (params.originCountry) p.with_origin_country = params.originCountry;
  if (params.year) {
    if (params.type === "tv") p.first_air_date_year = params.year;
    else p.primary_release_year = params.year;
  }
  if (params.sortBy) p.sort_by = params.sortBy;
  if (params.minVote) p["vote_average.gte"] = params.minVote;
  return tmdbFetch(endpoint, p);
}

export const TMDB_GENRES_MOVIE = [
  { id: "28", fr: "Action", en: "Action" },
  { id: "12", fr: "Aventure", en: "Adventure" },
  { id: "16", fr: "Animation", en: "Animation" },
  { id: "35", fr: "Comédie", en: "Comedy" },
  { id: "80", fr: "Crime", en: "Crime" },
  { id: "99", fr: "Documentaire", en: "Documentary" },
  { id: "18", fr: "Drame", en: "Drama" },
  { id: "10751", fr: "Famille", en: "Family" },
  { id: "14", fr: "Fantastique", en: "Fantasy" },
  { id: "36", fr: "Histoire", en: "History" },
  { id: "27", fr: "Horreur", en: "Horror" },
  { id: "10402", fr: "Musique", en: "Music" },
  { id: "9648", fr: "Mystère", en: "Mystery" },
  { id: "10749", fr: "Romance", en: "Romance" },
  { id: "878", fr: "Science-fiction", en: "Sci-Fi" },
  { id: "53", fr: "Thriller", en: "Thriller" },
  { id: "10752", fr: "Guerre", en: "War" },
  { id: "37", fr: "Western", en: "Western" },
];

export const TMDB_COUNTRIES = [
  { code: "FR", fr: "France", en: "France" },
  { code: "US", fr: "États-Unis", en: "United States" },
  { code: "GB", fr: "Royaume-Uni", en: "United Kingdom" },
  { code: "JP", fr: "Japon", en: "Japan" },
  { code: "KR", fr: "Corée du Sud", en: "South Korea" },
  { code: "IT", fr: "Italie", en: "Italy" },
  { code: "ES", fr: "Espagne", en: "Spain" },
  { code: "DE", fr: "Allemagne", en: "Germany" },
  { code: "IN", fr: "Inde", en: "India" },
  { code: "CN", fr: "Chine", en: "China" },
  { code: "MX", fr: "Mexique", en: "Mexico" },
  { code: "BR", fr: "Brésil", en: "Brazil" },
];

export interface TmdbPerson {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  gender: number;
  also_known_as: string[];
}

export interface TmdbPersonCredits {
  cast: {
    id: number;
    title: string;
    character: string;
    poster_path: string | null;
    release_date: string;
    vote_average: number;
    popularity: number;
  }[];
  crew: {
    id: number;
    title: string;
    job: string;
    department: string;
    poster_path: string | null;
    release_date: string;
  }[];
}

export async function getPerson(id: number, locale: "fr" | "en" = "fr"): Promise<TmdbPerson> {
  const lang = locale === "fr" ? "fr-FR" : "en-US";
  return tmdbFetch<TmdbPerson>(`/person/${id}`, { language: lang });
}

export async function getPersonMovieCredits(id: number, locale: "fr" | "en" = "fr"): Promise<TmdbPersonCredits> {
  const lang = locale === "fr" ? "fr-FR" : "en-US";
  return tmdbFetch<TmdbPersonCredits>(`/person/${id}/movie_credits`, { language: lang });
}

export async function searchPeople(query: string, locale: "fr" | "en" = "fr") {
  const lang = locale === "fr" ? "fr-FR" : "en-US";
  return tmdbFetch<{ results: { id: number; name: string; profile_path: string | null; known_for_department: string; popularity: number }[] }>(
    "/search/person", { query, language: lang }
  );
}

export function generateReclapFacts(movie: TmdbMovie, keywords: TmdbKeywords, credits: TmdbCredits): string[] {
  const facts: string[] = [];
  const director = credits.crew.find((c) => c.job === "Director");

  if (movie.budget > 0 && movie.revenue > 0) {
    const roi = ((movie.revenue - movie.budget) / movie.budget * 100).toFixed(0);
    const profitable = movie.revenue > movie.budget;
    facts.push(profitable
      ? `Le film a généré ${formatMoney(movie.revenue)} au box-office pour un budget de ${formatMoney(movie.budget)} — soit +${roi}% de ROI.`
      : `Malgré un budget de ${formatMoney(movie.budget)}, le film n'a rapporté que ${formatMoney(movie.revenue)} — un flop commercial.`
    );
  }

  if (movie.vote_count > 10000) {
    facts.push(`Noté par plus de ${(movie.vote_count / 1000).toFixed(0)}k spectateurs sur TMDB avec une moyenne de ${movie.vote_average.toFixed(1)}/10.`);
  }

  if (movie.runtime > 0) {
    facts.push(`Durée totale : ${formatRuntime(movie.runtime)}. Si tu le regardes en boucle pendant 24h, tu en verras ${Math.floor(1440 / movie.runtime)} fois.`);
  }

  if (director) {
    const otherFilms = credits.crew.filter((c) => c.job === "Director" && c.id !== director.id);
    facts.push(`Réalisé par ${director.name}.${otherFilms.length > 0 ? ` Co-réalisé avec ${otherFilms.map((f) => f.name).join(", ")}.` : ""}`);
  }

  if (keywords.keywords.length > 0) {
    const interesting = keywords.keywords.slice(0, 5).map((k) => k.name).join(", ");
    facts.push(`Thèmes-clés identifiés par la communauté : ${interesting}.`);
  }

  if (movie.original_language !== "fr" && movie.original_language !== "en") {
    const langNames: Record<string, string> = { ja: "japonais", ko: "coréen", it: "italien", es: "espagnol", de: "allemand", pt: "portugais", zh: "mandarin", hi: "hindi" };
    const langName = langNames[movie.original_language] ?? movie.original_language.toUpperCase();
    facts.push(`Film en version originale ${langName} — une immersion totale dans la culture locale.`);
  }

  if (facts.length < 3) {
    facts.push(`${movie.title} est sorti le ${new Date(movie.release_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}.`);
  }

  return facts.slice(0, 5);
}
