import { writable, type Writable } from "svelte/store";

// TODO: when uploader is a child of builder, remove this store and put it in builder
export const layout: Writable<any[][]> = writable([[{}]])