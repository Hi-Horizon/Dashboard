#[cfg_attr(mobile, tauri::mobile_entry_point)]
// mod Command;

pub fn run() {
  // let (mut rx, mut child) = Command::new_sidecar("my-sidecar")
  //   .expect("failed to create `my-sidecar` binary command")
  //   .spawn()
  //   .expect("Failed to spawn sidecar");

  // tauri::async_runtime::spawn(async move {
  //   // read events such as stdout
  //   while let Some(event) = rx.recv().await {
  //     if let CommandEvent::Stdout(line) = event {
  //       window
  //         .emit("message", Some(format!("'{}'", line)))
  //         .expect("failed to emit event");
  //       // write to stdin
  //       child.write("message from Rust\n".as_bytes()).unwrap();
  //     }
  //   }
  // });

  tauri::Builder::default()
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
