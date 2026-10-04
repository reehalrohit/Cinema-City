export type MediaType = "movie" | "series";

export interface MovieCard {
  id: string;
  title: string;
  image: string;
  provider: string;
  type?: MediaType;
  year?: string;
  rating?: string;
}

export interface CatalogSection {
  title: string;
  items: MovieCard[];
}

export interface MovieDetails {
  id: string;
  title: string;
  image: string;
  poster?: string;
  backdrop?: string;
  synopsis: string;
  type: MediaType;
  year?: string;
  rating?: string;
  genres?: string[];
  cast?: string[];
  imdbId?: string;
  tmdbId?: string;
  provider: string;
  links: MediaLink[];
}

export interface MediaLink {
  title: string;
  quality?: string;
  link: string;
  type: MediaType | "episode";
  season?: number;
  episode?: number;
}

export interface Episode {
  id: string;
  title: string;
  season: number;
  episode: number;
  image?: string;
  link: string;
}

export interface StreamSource {
  server: string;
  url: string;
  type: "hls" | "mp4" | "dash" | "other";
  quality?: string;
  subtitles?: Subtitle[];
  headers?: Record<string, string>;
}

export interface Subtitle {
  language: string;
  url: string;
  type?: string;
}

export interface CinemaProvider {
  id: string;
  name: string;

  getCatalog?(): Promise<CatalogSection[]>;

  search(
    query: string,
    page?: number
  ): Promise<MovieCard[]>;

  getMeta(
    id: string
  ): Promise<MovieDetails>;

  getEpisodes?(
    id: string,
    season: number
  ): Promise<Episode[]>;

  getStreams(
    link: string,
    type: MediaType | "episode"
  ): Promise<StreamSource[]>;
}
