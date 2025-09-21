CREATE TABLE IF NOT EXISTS
  "DashboardLayout" (
    `id` integer not null primary key autoincrement,
    `name` TEXT not null DEFAULT "Custom Dashboard",
    "layoutdata" TEXT NOT NULL DEFAULT ""
  );