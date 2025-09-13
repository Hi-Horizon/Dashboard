import { db } from "../IOconnections/DBO/databaseObject";

export function getAllDataPointsFromAxes(x:string, y:string, xs:string, xe:string): any {
    // try {
    //     if (xs >= xe) throw new Error("beginTime is bigger or equal to than endTime")
    //     const stmt = db.select("SELECT "+ x +","+ y +" FROM Data WHERE UnixTime >= ? AND UnixTime <= ?");
    //     const result: any[] = stmt.raw().all([xs,xe]);
    //     return {result: result, status:200};
    // } 
    // catch (error) {
    //     console.log(error)
    //     return {result: [], status:500};
    // }
    return {result: [], status:500}
}

//returns a table in a two-dimensional array with columnnames
export async function getDataTableWithRange(min:number = 0, max:number = Number.MAX_SAFE_INTEGER): Promise<any[]> {
    try {
        //get datadescription values
        const columndescriptions: any[] = await db.select('SELECT * FROM DataDescription');
        let sql = "SELECT unixTime"
        //loop this line for data de
        columndescriptions.forEach(column => {
            sql = sql.concat(", (SELECT Value FROM Data where descriptionid = "+ column.id +" and unixtime = D.UnixTime) AS '"+ column.name +"'" )
        });
        sql = sql.concat(" FROM Data as D where UnixTime >= ? AND UnixTime <= ?")
        const result: any[] = await db.select(sql, [min, max]);
        return result
    } 
    catch (error) {
        console.log(error)
        return [];
    }
    return []
}