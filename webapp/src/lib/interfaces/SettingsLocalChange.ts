export type Operation = "Add" | "Delete"
export type SettingsType = "ReadStatisticType" | "formulaParameter"
export interface SettingsLocalChange {
    operation: Operation;
    settingType: SettingsType;
    structure: any;
}