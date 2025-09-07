CREATE TABLE IF NOT EXISTS
  `DataDescription` (
    `id` integer not null primary key autoincrement,
    `name` TEXT not null default undefined_data,
    `tag` TEXT null,
    `unit` TEXT null,
    "quantity" TEXT NULL,
    "display" TINYINT NULL DEFAULT 0
  );

CREATE TABLE IF NOT EXISTS
  "Data" (
    "UnixTime" INTEGER,
    "descriptionID" INTEGER NOT NULL DEFAULT 0,
    "Value" INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY ("UnixTime", "descriptionID")
  );