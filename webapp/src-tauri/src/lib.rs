#[cfg_attr(mobile, tauri::mobile_entry_point)]
mod mqtt;
mod canbus;

use std::sync::{Mutex};
use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg(target_os = "windows")]
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
        }
    ];
    
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new()
            .add_migrations("sqlite:HiHorizonTelemetry.db", migrations)
            .build()
        )
        .plugin(tauri_plugin_shell::init())
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
        .manage(canbus::CanState {
            handle: Mutex::new(None),
            stop_flag: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![canbus::connect_can, canbus::disconnect_can])
                .manage(mqtt::MqttState {
            handle: Mutex::new(None),
            stop_flag: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![mqtt::connect_mqtt, mqtt::disconnect_mqtt])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(not(target_os = "windows"))]
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
        }
    ];
    
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new()
            .add_migrations("sqlite:HiHorizonTelemetry.db", migrations)
            .build()
        )
        .plugin(tauri_plugin_shell::init())
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
        .manage(mqtt::MqttState {
            handle: Mutex::new(None),
            stop_flag: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![mqtt::connect_mqtt, mqtt::disconnect_mqtt])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
