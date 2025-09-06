import type { RESTMessage } from "$lib/interfaces/RestMessage";
import { db } from "../dataBaseConnection";

export function getAllDataPointsFromAxes(x:string, y:string, xs:string, xe:string): RESTMessage {
    try {
        if (xs >= xe) throw new Error("beginTime is bigger or equal to than endTime")
        const stmt = db.prepare("SELECT "+ x +","+ y +" FROM Data WHERE UnixTime >= ? AND UnixTime <= ?");
        const result: any[] = stmt.raw().all([xs,xe]);
        return {result: result, status:200};
    } 
    catch (error) {
        console.log(error)
        return {result: [], status:500};
    }
}

//returns a table in a two-dimensional array with columnnames
export function getDataTableWithRange(min:number = 0, max:number = Number.MAX_SAFE_INTEGER): any[] {
    try {
        const stmt = db.prepare("SELECT * FROM Data where UnixTime >= ? AND UnixTime <= ?");
        const result = stmt.columns().map((column:any) => column.name);
        const test = stmt.raw(true).all(min, max);
        return [result, ...test];
    } 
    catch (error) {
        console.log(error)
        return [];
    }
}