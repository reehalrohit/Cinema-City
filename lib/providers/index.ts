import { registerProvider } from "./registry";
import { exampleProvider } from "./example";

registerProvider(exampleProvider);

export * from "./registry";
export * from "./types";
