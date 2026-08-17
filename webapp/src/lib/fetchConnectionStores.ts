import type { Writable } from "svelte/store";
import { getDb } from "./IOconnections/DBO/databaseObject";

// fetch initial values of the connection stores, important since these stores define that incoming data
export async function fetchConnectionStores(datadescriptionStore: Writable<any[]>, canSchemaStore: Writable<any>, liveData: Writable<any>) {
    const db = await getDb();
    const dataDescription: any[] = await db.select('SELECT * FROM DataDescription')
    
    //fill the canschema values
    const canSchema = Object
        .groupBy(dataDescription, ({ CANid }) => CANid)
        
    // sort on CAN position
    Object.keys(canSchema).forEach(key => {
        canSchema[key] = canSchema[key]?.sort((a: any, b: any) => a.CANmsgPosition - b.CANmsgPosition)
    });
    
    // fetch time of last update
    const lastMsgTime: any[] = await db.select('SELECT max(UnixTime) as UnixTime FROM Data')
    
    //update all stores
    datadescriptionStore.set(dataDescription);
    canSchemaStore.set(canSchema)
    liveData.update((xs: any) => {
        xs["UnixTime"] = lastMsgTime[0].UnixTime
        return xs
    })
}