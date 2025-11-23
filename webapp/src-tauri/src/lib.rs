#[cfg_attr(mobile, tauri::mobile_entry_point)]

use tauri_plugin_sql::{Migration, MigrationKind};

pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: include_str!("../../../db/schema.sql"),
            kind: MigrationKind::Up
        },
        Migration {
            version: 2,
            description: "create_DashboardLayout_tables",
            sql: include_str!("../../../db/DashboardLayout.sql"),
            kind: MigrationKind::Up
        },
        Migration {
            version: 3,
            description: "add_CANbus_Columns",
            sql: include_str!("../../../db/AddCANbusColumns.sql"),
            kind: MigrationKind::Up
        }
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new()
            .add_migrations("sqlite:HiHorizonTelemetry.db", migrations)
            .build()
        )
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_mqtt::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
