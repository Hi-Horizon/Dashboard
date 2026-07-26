#[cfg_attr(mobile, tauri::mobile_entry_point)]

#[cfg(target_os = "windows")]
use peak_can::bus::UsbBus;
#[cfg(target_os = "windows")]
use peak_can::socket::Baudrate;
#[cfg(target_os = "windows")]
use peak_can::socket::RecvCan;
#[cfg(target_os = "windows")]
use peak_can::socket::usb::UsbCanSocket;
#[cfg(target_os = "windows")]
use peak_can::error::CanError;
use std::sync::{Arc, Mutex};
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{AppHandle, Emitter, State};
use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg(target_os = "windows")]
struct CanState {
    handle: Mutex<Option<std::thread::JoinHandle<()>>>,
    stop_flag: Mutex<Option<Arc<AtomicBool>>>,
}

#[cfg(target_os = "windows")]
#[tauri::command]
fn connect_can(
    state: State<'_, CanState>,
    app: AppHandle,
) -> Result<String, String> {
    let mut handle_guard = state.handle.lock().map_err(|e| e.to_string())?;
    if handle_guard.is_some() {
        return Err("Already connected".into());
    }

    let socket = match UsbCanSocket::open(UsbBus::USB1, Baudrate::Baud125K) {
        Ok(s) => s,
        Err(CanError::Caution) => {
            // Bus warning — channel is open, but bitrate mismatch or no termination.
            // The socket is still usable; treat as success but warn the frontend.
            // Unfortunately open() consumed the socket on error in most crate versions,
            // so we re-open once more (the second call usually succeeds or gives Ok).
            UsbCanSocket::open(UsbBus::USB1, Baudrate::Baud125K)
                .map_err(|e| format!("Connect failed: {:?}", e))?
        }
        Err(e) => return Err(format!("Connect failed: {:?}", e)),
    };

    let stop = Arc::new(AtomicBool::new(false));
    let stop_clone = Arc::clone(&stop);

    let handle = std::thread::spawn(move || {
        loop {
            // Check the stop flag first
            if stop_clone.load(Ordering::Relaxed) {
                break;
            }

            match socket.recv() {
                Ok((frame, _timestamp)) => {
                    let _ = app.emit("can-frame", CanFrame {
                        id: frame.can_id(),
                        data: frame.data().to_vec(),
                    });
                }
                Err(CanError::QrcvEmpty) => {
                    std::thread::sleep(std::time::Duration::from_millis(1));
                    continue;
                }
                Err(e) => {
                    let _ = app.emit("can-error", format!("{:?}", e));
                    break;
                }
            }
        }
    });

    *handle_guard = Some(handle);
    *state.stop_flag.lock().map_err(|e| e.to_string())? = Some(stop);

    Ok("Connected".into())
}

#[cfg(target_os = "windows")]
#[tauri::command]
fn disconnect_can(state: State<'_, CanState>) -> Result<String, String> {
    // Set the stop flag so the thread exits on its next loop iteration
    let mut flag_guard = state.stop_flag.lock().map_err(|e| e.to_string())?;
    if let Some(flag) = flag_guard.take() {
        flag.store(true, Ordering::Relaxed);
    } else {
        return Err("Not connected".into());
    }

    // Wait for the thread to finish, which also drops the socket -> CAN_Uninitialize
    let mut handle_guard = state.handle.lock().map_err(|e| e.to_string())?;
    if let Some(handle) = handle_guard.take() {
        let _ = handle.join();
    }

    Ok("Disconnected".into())
}

// Serializable struct sent to the frontend
#[cfg(target_os = "windows")]
#[derive(serde::Serialize, Clone)]
struct CanFrame {
    id: u32,
    data: Vec<u8>,
}

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
        .manage(CanState {
            handle: Mutex::new(None),
            stop_flag: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![connect_can, disconnect_can])
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
