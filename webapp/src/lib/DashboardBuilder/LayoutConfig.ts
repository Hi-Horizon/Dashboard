import { db } from "../IOconnections/DBO/databaseObject";

// gets the main layout config (id 1), 
// returns a javascript object containing the config
export async function getlayoutConfig() {
    const result: any = await db.select('SELECT layoutData FROM DashboardLayout where id = 1');
    let jsonObj
    try {
        jsonObj = JSON.parse(result[0].layoutdata)
    } catch {
        jsonObj = {}
    }
    return jsonObj
}


// edit the main layout config (id 1)
// returns update result
export async function editLayoutconfig(newConfig:string) {
    const result: any = await db.execute('UPDATE DashboardLayout SET layoutdata = ? where id = 1', [newConfig]);
    return result
}