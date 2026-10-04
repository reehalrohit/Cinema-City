import {
  createVegaAdapter,
  type VegaModule,
} from "./adapter";

/*
 * IMPORTANT:
 *
 * This file expects the provider implementation to expose
 * Vega-compatible functions.
 *
 * Example:
 *
 * import * as vega from "@/lib/vega-provider";
 *
 * const module: VegaModule = {
 *   id: "vega",
 *   name: "Vega",
 *   catalog: vega.catalog,
 *   genres: vega.genres,
 *   getPosts: vega.getPosts,
 *   getSearchPosts: vega.getSearchPosts,
 *   getMeta: vega.getMeta,
 *   getEpisodes: vega.getEpisodes,
 *   getStream: vega.getStream,
 * };
 */

const module: VegaModule = {
  id: "vega",
  name: "Vega",

  catalog: [],

  genres: [],

  async getPosts() {
    return [];
  },

  async getSearchPosts() {
    return [];
  },

  async getMeta() {
    throw new Error(
      "Vega provider implementation is not configured.",
    );
  },

  async getEpisodes() {
    return [];
  },

  async getStream() {
    return [];
  },
};

export const vegaProvider =
  createVegaAdapter(module);

export default vegaProvider;
