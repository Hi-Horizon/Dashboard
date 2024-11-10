use tauri_plugin_shell::process::CommandEvent;
#[cfg_attr(mobile, tauri::mobile_entry_point)]
use tauri_plugin_shell::ShellExt;

// #[tauri::command]
// fn start_mqtt_listener(app: tauri::AppHandle) {
//   println!("kaaaanker");

//   let sidecar_command = app.shell().sidecar("MqttDataHandler").unwrap();
//   let (mut rx, mut child) = sidecar_command
//     .spawn()
//     .expect("Failed to spawn sidecar");
// }

pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .setup(|app| {
      let sidecar_command = app.handle().shell().sidecar("MqttDataHandler").unwrap();
      let (mut rx, mut child) = sidecar_command
        .spawn()
        .expect("Failed to spawn sidecar");

      tauri::async_runtime::spawn(async move {
        // read events such as stdout
        while let Some(event) = rx.recv().await {
          if let CommandEvent::Stdout(line_bytes) = event {
            let line = String::from_utf8_lossy(&line_bytes);
            println!("{}", line);
            // window
            //   .emit("message", Some(format!("'{}'", line)))
            //   .expect("failed to emit event");
            // write to stdin
            child.write("message from Rust\n".as_bytes()).unwrap();
          }
        }
      });

      // println!("child pid: {}", child.pid());
      if cfg!(debug_assertions) {
        app.handle().plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        )?;
      }
      Ok(())
    })
    // .invoke_handler(tauri::generate_handler![start_mqtt_listener])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
