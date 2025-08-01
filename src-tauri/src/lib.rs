use tauri::Manager;

mod auth;

// 添加调试信息命令
#[tauri::command]
async fn open_devtools() -> Result<String, String> {
  // 注意：实际的开发者工具已通过禁用DevToolsBlocker实现
  // 用户现在可以使用F12或Ctrl+Shift+I打开开发者工具
  Ok("安全保护已禁用，请使用F12打开开发者工具".to_string())
}

// 添加调试信息命令
#[tauri::command]
fn get_debug_info() -> String {
  format!("Tauri应用调试信息 - 版本: {}", env!("CARGO_PKG_VERSION"))
}

// 打开外部URL命令
#[tauri::command]
async fn open_url(url: String) -> Result<String, String> {
  // 使用标准库打开URL
  #[cfg(target_os = "windows")]
  {
    use std::process::Command;
    match Command::new("cmd")
      .args(&["/C", "start", &url])
      .spawn()
    {
      Ok(_) => Ok(format!("已打开URL: {}", url)),
      Err(e) => Err(format!("打开URL失败: {}", e))
    }
  }

  #[cfg(target_os = "macos")]
  {
    use std::process::Command;
    match Command::new("open")
      .arg(&url)
      .spawn()
    {
      Ok(_) => Ok(format!("已打开URL: {}", url)),
      Err(e) => Err(format!("打开URL失败: {}", e))
    }
  }

  #[cfg(target_os = "linux")]
  {
    use std::process::Command;
    match Command::new("xdg-open")
      .arg(&url)
      .spawn()
    {
      Ok(_) => Ok(format!("已打开URL: {}", url)),
      Err(e) => Err(format!("打开URL失败: {}", e))
    }
  }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      // 初始化MongoDB连接和应用状态
      let app_state = tauri::async_runtime::block_on(async {
        auth::AppState::new().await
      }).expect("Failed to initialize app state");

      app.manage(app_state);

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
        println!("开发者工具可通过F12或右键菜单打开");
        println!("MongoDB认证系统已初始化");
        println!("前端构建目录: ../out");
        println!("应用启动完成！");
        println!("用户状态管理已优化！");
      }

      Ok(())
    })
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_updater::Builder::new().build())
    .plugin(tauri_plugin_process::init())
    .plugin(tauri_plugin_app::init())
    .plugin(tauri_plugin_store::Builder::default().build())
    .invoke_handler(tauri::generate_handler![
      open_devtools,
      get_debug_info,
      open_url,
      auth::login,
      auth::logout,
      auth::check_session,
      auth::verify_token_and_login,
      auth::get_all_users_admin,
      auth::get_system_overview,
      auth::track_user_activity,
      auth::get_user_analytics,
      auth::get_system_analytics,
      auth::generate_test_data,
      auth::clear_test_data,
      auth::debug_user_data,
      auth::init_user_login_counts,
      auth::create_user,
      auth::edit_user,
      auth::delete_user,
      auth::reset_user_password,
      auth::toggle_user_status
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
