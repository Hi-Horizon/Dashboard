import { writable, type Writable } from "svelte/store";
import type { DataStreamCANbus } from "$lib/interfaces/DataStreamCANbus";

export const pageName = writable("page");
export const showBackButton = writable(false);
export const clock: Writable<number> = writable(((new Date()).getTime()+7200));
export const selectedConnection: Writable<DataStreamCANbus | null> = writable(null)

setInterval(()=> {
    clock.set(((new Date()).getTime()+7200))
},1000);