import { writable, type Writable } from "svelte/store";

export const pageName = writable("page");
export const showBackButton = writable(false);
export const clock: Writable<number> = writable(((new Date()).getTime()+7200));

setInterval(()=> {
    clock.set(((new Date()).getTime()+7200))
},1000);