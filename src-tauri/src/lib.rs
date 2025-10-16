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

// 创建无装饰窗口（隐藏地址栏）
#[tauri::command]
async fn create_kiosk_window(
  app: tauri::AppHandle,
  url: String,
  title: String
) -> Result<String, String> {
  use tauri::{WebviewUrl, WebviewWindowBuilder};
  
  let window_label = format!("kiosk_{}", chrono::Utc::now().timestamp_millis());
  
  // 创建带有CSS注入的HTML页面来隐藏地址栏
  let html_content = format!(r#"
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{}</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        body {{
            overflow: hidden;
            font-family: system-ui, -apple-system, sans-serif;
        }}
        iframe {{
            width: 100vw;
            height: 100vh;
            border: none;
            display: block;
        }}
        /* 隐藏所有可能的浏览器UI元素 */
        ::-webkit-scrollbar {{ display: none; }}
        html {{ scrollbar-width: none; }}
    </style>
</head>
<body>
    <iframe src="{}" frameborder="0" allowfullscreen></iframe>
    <script>
        // 阻止右键菜单
        document.addEventListener('contextmenu', e => e.preventDefault());
        
        // 阻止某些快捷键
        document.addEventListener('keydown', e => {{
            if (e.ctrlKey && (e.key === 'u' || e.key === 'U' || 
                             e.key === 'i' || e.key === 'I' ||
                             e.key === 'j' || e.key === 'J')) {{
                e.preventDefault();
            }}
            if (e.key === 'F12') {{
                e.preventDefault();
            }}
        }});
        
        // 全屏模式
        if (document.documentElement.requestFullscreen) {{
            document.documentElement.requestFullscreen().catch(() => {{}});
        }}
    </script>
</body>
</html>
"#, title, url);

  // 创建临时HTML文件
  let temp_dir = std::env::temp_dir();
  let temp_file = temp_dir.join(format!("{}.html", window_label));
  
  match std::fs::write(&temp_file, html_content) {
    Ok(_) => {
      let file_url = format!("file:///{}", temp_file.to_string_lossy().replace("\\", "/"));
      
      match WebviewWindowBuilder::new(
        &app,
        &window_label,
        WebviewUrl::External(file_url.parse().map_err(|e| format!("无效的URL: {}", e))?)
      )
      .title(&title)
      .inner_size(1200.0, 800.0)
      .decorations(false)
      .resizable(true)
      .center()
      .build()
      {
        Ok(_) => Ok(format!("已在无地址栏窗口打开: {}", title)),
        Err(e) => Err(format!("创建窗口失败: {}", e))
      }
    },
    Err(e) => Err(format!("创建临时文件失败: {}", e))
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
    .plugin(tauri_plugin_http::init())
    .plugin(tauri_plugin_clipboard_manager::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .invoke_handler(tauri::generate_handler![
      open_devtools,
      get_debug_info,
      open_url,
      create_kiosk_window,
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
      auth::debug_tool_usage_data,
      auth::check_raw_tool_usage_fields,
      auth::fix_tool_usage_click_counts,
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
