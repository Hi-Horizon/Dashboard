import { db } from "../dataBaseConnection";

export function fetchLatestData() {
    const stmt = db.prepare("SELECT * FROM Data where UnixTime = (SELECT max(UnixTime) FROM Data)");
    const result = stmt.get();

    return result;
}

export function resetDistance() {
    const stmt = db.prepare("UPDATE Data SET '13' = 0 WHERE UnixTime = (SELECT max(UnixTime) FROM Data)");
    const updates = stmt.run();

    return
}