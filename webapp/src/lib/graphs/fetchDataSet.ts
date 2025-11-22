import { db } from "../IOconnections/DBO/databaseObject";

//TODO, implement query to get desired dataSet row in the database
export function fetchDataSet(id: number) {
    // //gets all points for All Data
    // if (id == -1) {
    //     const getBegin = db.select("SELECT MIN(UnixTime) AS begin, MAX(UnixTime) AS end  FROM Data");
    //     const interval: any = getBegin.get();
    //     return {begin: interval['begin'] * 1000, end: interval['end'] * 1000}
    // }
    return {begin: 0, end: 0}
}