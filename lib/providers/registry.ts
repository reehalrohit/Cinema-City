import type { CinemaProvider } from "./types";

const providers: CinemaProvider[] = [];

export function registerProvider(provider: CinemaProvider) {
  providers.push(provider);
}

export function getProviders() {
  return providers;
}

export function getProvider(id: string) {
  return providers.find((p) => p.id === id);
}
