import type { ReadStatisticType } from "$lib/interfaces/ReadStatisticType";
import type { SettingsLocalChange } from "$lib/interfaces/SettingsLocalChange";
import type Database from "@tauri-apps/plugin-sql";

export function parseOperationReadStatistic(db: any, change: SettingsLocalChange) {
    switch (change.operation) {
        case "Add":
            addReadStatisticsType(db, change.structure);
            break;
        case "Delete":
            deleteReadStatisticsType(db, change.structure);
            break;
    }
}

export async function fetchReadStatisticsTypes(): Promise<any> {
//     const stmt = db.prepare("SELECT * FROM DataDescription");
//     const rawResult:any[] = stmt.raw().all();

//     const processedResult: ReadStatisticType[] = [];
//     rawResult.forEach((item:string[]) => {
//         let newReadStatisticType: ReadStatisticType = {id: item[0], name: item[1], abbreviation: item[2], unit: item[3], quantity: item[4], display: item[5]}
//         processedResult.push(newReadStatisticType);
//     });
//     return processedResult;
}

//TODO: make it an option in settings to change display type
export async function addReadStatisticsType(db:Database, newRow:ReadStatisticType)  {
        preventSpecialCharacters(newRow.abbreviation)
        console.log(newRow.quantity)
        //adds info about statistic to ReadStatisticTypes table
        const insertRow = await db.execute(
            'INSERT INTO DataDescription (name, tag, quantity, unit, display) VALUES ( $1 , $2 , $3 , $4 , $5);',
            [newRow.name, newRow.abbreviation, newRow.quantity, newRow.unit, newRow.display]
        );
}

//todo: delete on id
export async function deleteReadStatisticsType(db:Database,toDelete:string) {
        //get id to delete the column in the Data table
        const columnToDelete: any = await db.select('SELECT id FROM DataDescription WHERE name = ?;', [toDelete]);
        //delete row from the ReadStatisticTypes table
        const insertRow = await db.execute('DELETE FROM DataDescription WHERE id = $1;', [columnToDelete[0].id]);
}

function preventSpecialCharacters(str: string) {
    //checks if there are special characters in the Abbreviation
    var specialChars  = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    if (specialChars.test(str)) {
        throw new Error("not allowed to use special characters in abbreviation");
    }
}
