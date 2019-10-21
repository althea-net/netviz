import { writable } from "svelte/store";

export const links = writable();
export const nodes = writable();
export const graph = writable();
export const map = writable();
export const selected = writable();
export const zooming = writable(false);
