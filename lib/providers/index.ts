import {
  registerProvider,
  getProviders,
  getProvider,
} from "./registry";

import vegaProvider from "./vega";

registerProvider(vegaProvider);

export {
  registerProvider,
  getProviders,
  getProvider,
};

export type {
  CinemaProvider,
  MovieCard,
  MovieDetails,
  CatalogSection,
  Episode,
  StreamSource,
  Subtitle,
  MediaLink,
  MediaType,
} from "./types";
