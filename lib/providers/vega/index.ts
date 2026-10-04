import {
  createVegaAdapter,
  type VegaModule,
} from "./adapter";

/*
 * Provider boundary only.
 *
 * Connect this object to a provider implementation that you are
 * authorized to access. No cookies, authentication tokens, DRM
 * bypasses, CAPTCHA bypasses, or protected-source credentials belong
 * in this repository.
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
    throw new Error("Vega provider implementation is not configured.");
  },

  async getEpisodes() {
    return [];
  },

  async getStream() {
    return [];
  },
};

export const vegaProvider = createVegaAdapter(module);
export default vegaProvider;
