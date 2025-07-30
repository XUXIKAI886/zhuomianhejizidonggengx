use tauri::Manager;

// 添加调试信息命令
#[tauri::command]
fn open_devtools() -> String {
  "开发者工具功能暂时不可用，请使用F12快捷键".to_string()
}

// 添加调试信息命令
#[tauri::command]
fn get_debug_info() -> String {
  format!("Tauri应用调试信息 - 版本: {}", env!("CARGO_PKG_VERSION"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      // 强制启用日志插件，便于调试
      app.handle().plugin(
        tauri_plugin_log::Builder::default()
          .level(log::LevelFilter::Info)
          .build(),
      )?;

      // 获取主窗口并确保可见
      if let Some(window) = app.get_webview_window("main") {
        // 确保窗口可见并置于前台
        let _ = window.show();
        let _ = window.set_focus();
        let _ = window.unminimize();

        println!("桌面应用窗口已显示并置于前台");
        println!("请使用F12快捷键打开开发者工具");
      }

      Ok(())
    })
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_updater::Builder::new().build())
    .plugin(tauri_plugin_process::init())
    .invoke_handler(tauri::generate_handler![open_devtools, get_debug_info])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
