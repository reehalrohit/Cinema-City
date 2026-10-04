import type { CinemaProvider } from "./types";

const providers: CinemaProvider[] = [];

export function registerProvider(provider: CinemaProvider) {
  if (!providers.some((item) => item.id === provider.id)) {
    providers.push(provider);
  }
}

export function getProviders(): CinemaProvider[] {
  return providers;
}

export function getProvider(id: string): CinemaProvider | undefined {
  return providers.find((provider) => provider.id === id);
}
