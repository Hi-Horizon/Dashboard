import type { ReadStatisticType } from "$lib/interfaces/ReadStatisticType";
import type { SettingsLocalChange } from "$lib/interfaces/SettingsLocalChange";
import { db } from "../dataBaseConnection";

export function parseOperationReadStatistic(change: SettingsLocalChange) {
    switch (change.operation) {
        case "Add":
            addReadStatisticsType(change.structure);
            break;
        case "Delete":
            deleteReadStatisticsType(change.structure);
            break;
    }
}

export async function fetchReadStatisticsTypes(): Promise<ReadStatisticType[]> {
    const stmt = db.prepare("SELECT * FROM DataDescription");
    const rawResult:any[] = stmt.raw().all();

    const processedResult: ReadStatisticType[] = [];
    rawResult.forEach((item:string[]) => {
        let newReadStatisticType: ReadStatisticType = {id: item[0], name: item[1], abbreviation: item[2], unit: item[3], quantity: item[4], display: item[5]}
        processedResult.push(newReadStatisticType);
    });
    return processedResult;
}

//TODO: make it an option in settings to change display type
export function addReadStatisticsType(newRow:ReadStatisticType)  {
        preventSpecialCharacters(newRow.abbreviation)
        //adds info about statistic to ReadStatisticTypes table
        const insertRow = db.prepare('INSERT INTO DataDescription (name, tag, quantity, unit, display) VALUES (@name, @tag, @quantity, @unit, @display);');
        const insertInfo = insertRow.run({name: newRow.name, tag: newRow.abbreviation, quantity: newRow.quantity, unit: newRow.unit, display: 1});

        const addColumn = db.prepare('ALTER TABLE Data ADD "'+ insertInfo.lastInsertRowid +'" INTEGER NOT NULL DEFAULT 0;');
        const AddColumnInfo = addColumn.run();
}

export function deleteReadStatisticsType(toDelete:string) {
        //get id to delete the column in the Data table
        const getAbbreviationToDelete = db.prepare('SELECT id FROM DataDescription WHERE name = ?;');
        const columnToDelete:any = getAbbreviationToDelete.get(toDelete);

        //delete row from the ReadStatisticTypes table
        const insertRow = db.prepare('DELETE FROM DataDescription WHERE id = @id;');
        const insertInfo = insertRow.run(columnToDelete);

        //deletes column in the Data table
        const addColumn = db.prepare('ALTER TABLE Data DROP COLUMN "'+ columnToDelete.id +'";');
        const AddColumnInfo = addColumn.run();
}

function preventSpecialCharacters(str: string) {
    //checks if there are special characters in the Abbreviation
    var specialChars  = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    if (specialChars.test(str)) {
        throw new Error("not allowed to use special characters in abbreviation");
    }
}
