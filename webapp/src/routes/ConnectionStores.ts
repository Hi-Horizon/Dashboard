import { writable, type Writable } from "svelte/store";

export const datadescription: Writable<any[]> = writable([])
export const liveData: Writable<any> = writable({UnixTime:0})

export const MQTTconnected = writable(false)