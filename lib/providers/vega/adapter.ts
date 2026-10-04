import type {
  CinemaProvider,
  CatalogSection,
  Episode,
  MovieCard,
  MovieDetails,
  StreamSource,
} from "../types";

export interface VegaPost {
  title: string;
  link: string;
  image: string;
}

export interface VegaInfo {
  title: string;
  image: string;
  poster?: string;
  logo?: string;
  synopsis: string;
  imdbId: string;
  tmdbId?: string;
  type: string;
  tags?: string[];
  cast?: string[];
  rating?: string;
  linkList: VegaLink[];
  webUrl?: string;
}

export interface VegaLink {
  title: string;
  quality?: string;
  episodesLink?: string;
  directLinks?: VegaDirectLink[];
}

export interface VegaDirectLink {
  title: string;
  link: string;
  type?: "movie" | "series";
}

export interface VegaEpisode {
  title: string;
  link: string;
  image?: string;
}

export interface VegaStream {
  server: string;
  link: string;
  type: string;
  quality?: string;
  subtitles?: Array<{
    title: string;
    language: string;
    type: string;
    uri: string;
  }>;
  headers?: Record<string, string>;
}

export interface VegaModule {
  id: string;
  name?: string;
  catalog?: Array<{ title: string; filter: string }>;
  genres?: Array<{ title: string; filter: string }>;
  getPosts?: (args: {
    filter: string;
    page: number;
    signal?: AbortSignal;
  }) => Promise<VegaPost[]>;
  getSearchPosts?: (args: {
    searchQuery: string;
    page: number;
    signal?: AbortSignal;
  }) => Promise<VegaPost[]>;
  getMeta: (args: {
    link: string;
    signal?: AbortSignal;
  }) => Promise<VegaInfo>;
  getEpisodes?: (args: {
    url: string;
    signal?: AbortSignal;
  }) => Promise<VegaEpisode[]>;
  getStream: (args: {
    link: string;
    type: string;
    signal?: AbortSignal;
    isDownload?: boolean;
  }) => Promise<VegaStream[]>;
}

function normalizeType(type?: string): "movie" | "series" {
  return type?.toLowerCase() === "series" ? "series" : "movie";
}

function detectStreamType(type: string): StreamSource["type"] {
  const value = type.toLowerCase();
  if (value.includes("m3u8") || value.includes("hls")) return "hls";
  if (value.includes("mpd") || value.includes("dash")) return "dash";
  if (value.includes("mp4") || value.includes("video")) return "mp4";
  return "other";
}

function normalizePost(post: VegaPost, providerId: string): MovieCard {
  return {
    id: post.link,
    title: post.title,
    image: post.image,
    provider: providerId,
  };
}

function normalizeStreams(streams: VegaStream[]): StreamSource[] {
  return streams.filter((stream) => Boolean(stream.link)).map((stream) => ({
    server: stream.server,
    url: stream.link,
    type: detectStreamType(stream.type),
    quality: stream.quality,
    subtitles: stream.subtitles?.map((subtitle) => ({
      language: subtitle.language || subtitle.title || "Unknown",
      url: subtitle.uri,
      type: subtitle.type,
    })),
    headers: stream.headers,
  }));
}

function normalizeMeta(info: VegaInfo, providerId: string): MovieDetails {
  const links = info.linkList.flatMap((link) => {
    if (link.directLinks?.length) {
      return link.directLinks.map((direct) => ({
        title: direct.title || link.title,
        quality: link.quality,
        link: direct.link,
        type: direct.type === "series" ? ("series" as const) : ("movie" as const),
      }));
    }

    if (link.episodesLink) {
      return [{
        title: link.title,
        quality: link.quality,
        link: link.episodesLink,
        type: "episode" as const,
      }];
    }

    return [];
  });

  return {
    id: info.webUrl || info.title,
    title: info.title,
    image: info.image,
    poster: info.poster,
    logo: info.logo,
    synopsis: info.synopsis || "",
    type: normalizeType(info.type),
    rating: info.rating,
    genres: info.tags,
    cast: info.cast,
    imdbId: info.imdbId || undefined,
    tmdbId: info.tmdbId,
    provider: providerId,
    links,
  };
}

function normalizeEpisodes(episodes: VegaEpisode[], season: number): Episode[] {
  return episodes.map((episode, index) => {
    const match = episode.title.match(/(?:episode|ep|e)\s*[-.]?\s*(\d+)/i);
    return {
      id: episode.link,
      title: episode.title,
      season,
      episode: match?.[1] ? Number.parseInt(match[1], 10) : index + 1,
      image: episode.image,
      link: episode.link,
    };
  });
}

export function createVegaAdapter(module: VegaModule): CinemaProvider {
  return {
    id: module.id,
    name: module.name || module.id,

    async getCatalog(signal) {
      if (!module.getPosts) return [];

      const sections: CatalogSection[] = [];
      const catalog = [...(module.catalog || []), ...(module.genres || [])];

      for (const section of catalog) {
        try {
          const posts = await module.getPosts({
            filter: section.filter,
            page: 1,
            signal,
          });

          sections.push({
            title: section.title,
            items: posts.map((post) => normalizePost(post, module.id)),
          });
        } catch (error) {
          console.warn(`[${module.id}] catalog failed: ${section.title}`, error);
        }
      }

      return sections;
    },

    async search(query, page = 1, signal) {
      if (!module.getSearchPosts) return [];

      const posts = await module.getSearchPosts({
        searchQuery: query,
        page,
        signal,
      });

      return posts.map((post) => normalizePost(post, module.id));
    },

    async getMeta(id, signal) {
      const info = await module.getMeta({ link: id, signal });
      return normalizeMeta(info, module.id);
    },

    async getEpisodes(id, season, signal) {
      if (!module.getEpisodes) return [];

      const episodes = await module.getEpisodes({
        url: id,
        signal,
      });

      return normalizeEpisodes(episodes, season);
    },

    async getStreams(link, type, signal) {
      const streams = await module.getStream({
        link,
        type,
        signal,
        isDownload: false,
      });

      return normalizeStreams(streams);
    },
  };
}
