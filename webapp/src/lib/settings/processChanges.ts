import type { SettingsLocalChange } from "$lib/interfaces/SettingsLocalChange";
import type Database from "@tauri-apps/plugin-sql";
import { parseOperationReadStatistic } from "./ReadStatistics";
import { db } from "../IOconnections/DBO/databaseObject";

// export const parseChanges = db.transaction((body)=>{
//     body.forEach((setting: SettingsLocalChange[]) =>{
//         setting.forEach((change)=>{
//             // parseSettingType(db, change);
//         });
//     });
// });

export function parseSettingType(db:Database , change:SettingsLocalChange) {
    switch (change.settingType) {
        case "ReadStatisticType":
            parseOperationReadStatistic(db, change);
            break;
        case "formulaParameter":
            break; //To be Implemented
    }
}