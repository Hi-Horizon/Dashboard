// as of now the using CANbus is only supported on Windows
#![cfg(target_os = "windows")]

use peak_can::bus::UsbBus;
use peak_can::socket::Baudrate;
use peak_can::socket::RecvCan;
use peak_can::socket::usb::UsbCanSocket;
use peak_can::error::CanError;

use tauri::{AppHandle, Emitter, State};
use std::sync::{Arc, Mutex};
use std::sync::atomic::{AtomicBool, Ordering};

pub struct CanState {
    pub handle: Mutex<Option<std::thread::JoinHandle<()>>>,
    pub stop_flag: Mutex<Option<Arc<AtomicBool>>>,
}

// Serializable struct sent to the frontend
#[derive(serde::Serialize, Clone)]
struct CanFrame {
    id: u32,
    data: Vec<u8>,
}

#[tauri::command]
pub fn connect_can(
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

#[tauri::command]
pub fn disconnect_can(state: State<'_, CanState>) -> Result<String, String> {
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