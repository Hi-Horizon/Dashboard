CREATE TABLE IF NOT EXISTS
  `DataDescription` (
    'id'                INTEGER NOT NULL primary key,              
    'CANid'             INTEGER NOT NULL,
    'CANmsgPosition'    INTEGER NOT NULL,
    'name'              TEXT NOT NULL,
    'CANbyteLength'     INTEGER NOT NULL DEFAULT 1,
    'Endian'            TINYINT NOT NULL DEFAULT 0,
    'CANscale'          NUMBER NOT NULL DEFAULT  1,
    'CANoffset'         NUMBER NOT NULL DEFAULT  0,
    'tag'               TEXT NULL,
    'unit'              TEXT NULL,   
    "quantity"          TEXT NULL,
    UNIQUE('CANid', 'CANmsgPosition') ON CONFLICT REPLACE,
    UNIQUE('name') ON CONFLICT REPLACE
  );

CREATE TABLE IF NOT EXISTS
  "Data" (
    "UnixTime" INTEGER,
    "descriptionID" INTEGER NOT NULL DEFAULT 0,
    "Value" INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY ("UnixTime", "descriptionID")
  );