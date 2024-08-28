import Database from 'better-sqlite3';

export const db = new Database('../db/HiHorizonTelemetry.db', { fileMustExist: true });