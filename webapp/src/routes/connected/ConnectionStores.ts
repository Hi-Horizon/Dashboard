import { writable, type Writable } from "svelte/store";

export const datadescription: Writable<any[]> = writable([])
export const latestData: Writable<any> = writable({UnixTime:0})