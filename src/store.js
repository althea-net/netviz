import { writable } from "svelte/store";

export const confirming = writable();
export const importing = writable();
export const exporting = writable();
export const ip = writable();
export const links = writable();
export const nodes = writable();
export const notification = writable();
export const graph = writable();
export const showGraph = writable(false);
export const map = writable();
export const selected = writable();
export const zooming = writable(false);
export const zoom = writable();
