use serde::{Deserialize, Serialize};
use mongodb::{Client, Database, Collection, bson::{doc, oid::ObjectId, DateTime}};
// MongoDB cursor handling - no external futures traits needed
use std::sync::Arc;
use tokio::sync::RwLock;
use sha2::{Sha256, Digest};

// 用户数据结构
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub username: String,
    #[serde(skip_serializing, default)]
    pub password: String,
    pub role: String, // "admin" | "user"
    #[serde(rename = "isActive")]
    pub is_active: bool,
    #[serde(rename = "createdAt")]
    pub created_at: DateTime,
    #[serde(rename = "lastLoginAt")]
    pub last_login_at: Option<DateTime>,
    #[serde(rename = "totalUsageTime")]
    pub total_usage_time: i64,
    #[serde(rename = "loginCount")]
    pub login_count: i64,
}

// 用户响应结构（不包含密码）
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserResponse {
    pub id: String,
    pub username: String,
    pub role: String,
    #[serde(rename = "isActive")]
    pub is_active: bool,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "lastLoginAt")]
    pub last_login_at: Option<String>,
    #[serde(rename = "totalUsageTime")]
    pub total_usage_time: i64,
    #[serde(rename = "loginCount")]
    pub login_count: i64,
}

// 工具使用统计
#[derive(Debug, Serialize, Deserialize)]
pub struct ToolUsage {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    #[serde(rename = "userId")]
    pub user_id: ObjectId,
    #[serde(rename = "toolId")]
    pub tool_id: i32,
    #[serde(rename = "toolName")]
    pub tool_name: String,
    #[serde(rename = "clickCount")]
    pub click_count: i64,
    #[serde(rename = "totalUsageTime")]
    pub total_usage_time: i64,
    #[serde(rename = "lastUsedAt")]
    pub last_used_at: DateTime,
}

// 用户会话
#[derive(Debug, Serialize, Deserialize)]
pub struct UserSession {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    #[serde(rename = "userId")]
    pub user_id: ObjectId,
    #[serde(rename = "loginAt")]
    pub login_at: DateTime,
    #[serde(rename = "logoutAt")]
    pub logout_at: Option<DateTime>,
    #[serde(rename = "sessionDuration")]
    pub session_duration: Option<i64>,
}

// 系统统计
#[derive(Debug, Serialize, Deserialize)]
pub struct SystemStats {
    #[serde(rename = "totalUsers")]
    pub total_users: i64,
    #[serde(rename = "activeUsersToday")]
    pub active_users_today: i64,
    #[serde(rename = "totalSessions")]
    pub total_sessions: i64,
    #[serde(rename = "mostPopularTools")]
    pub most_popular_tools: Vec<PopularTool>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PopularTool {
    #[serde(rename = "toolId")]
    pub tool_id: i32,
    #[serde(rename = "toolName")]
    pub tool_name: String,
    #[serde(rename = "totalClicks")]
    pub total_clicks: i64,
    #[serde(rename = "totalUsageTime")]
    pub total_usage_time: i64,
    #[serde(rename = "uniqueUsers")]
    pub unique_users: i64,
}

// 高级用户分析数据结构
#[derive(Debug, Serialize, Deserialize)]
pub struct UserAnalytics {
    #[serde(rename = "_id")]
    pub id: String,
    pub username: String,
    pub role: String,
    #[serde(rename = "isActive")]
    pub is_active: bool,
    #[serde(rename = "totalToolClicks")]
    pub total_tool_clicks: i64,
    #[serde(rename = "totalUsageTime")]
    pub total_usage_time: i64,
    #[serde(rename = "loginCount")]
    pub login_count: i64,
    #[serde(rename = "lastLoginAt")]
    pub last_login_at: Option<String>,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "favoriteTools")]
    pub favorite_tools: Vec<String>,
}

// 系统高级统计
#[derive(Debug, Serialize, Deserialize)]
pub struct SystemAnalytics {
    #[serde(rename = "totalUsers")]
    pub total_users: i64,
    #[serde(rename = "activeUsersToday")]
    pub active_users_today: i64,
    #[serde(rename = "totalSessions")]
    pub total_sessions: i64,
    #[serde(rename = "averageSessionDuration")]
    pub average_session_duration: i64,
    #[serde(rename = "mostPopularTools")]
    pub most_popular_tools: Vec<PopularTool>,
    #[serde(rename = "userGrowthTrend")]
    pub user_growth_trend: Vec<DailyGrowth>,
    #[serde(rename = "toolUsageTrend")]
    pub tool_usage_trend: Vec<DailyUsage>,
}

// 每日增长数据
#[derive(Debug, Serialize, Deserialize)]
pub struct DailyGrowth {
    pub date: String,
    #[serde(rename = "newUsers")]
    pub new_users: i64,
    #[serde(rename = "activeUsers")]
    pub active_users: i64,
    #[serde(rename = "totalSessions")]
    pub total_sessions: i64,
}

// 每日使用数据
#[derive(Debug, Serialize, Deserialize)]
pub struct DailyUsage {
    pub date: String,
    #[serde(rename = "totalClicks")]
    pub total_clicks: i64,
    #[serde(rename = "totalUsageTime")]
    pub total_usage_time: i64,
    #[serde(rename = "uniqueUsers")]
    pub unique_users: i64,
}

// MongoDB管理器
pub struct MongoManager {
    client: Client,
    database: Database,
}

impl MongoManager {
    pub async fn new(connection_string: &str, db_name: &str) -> Result<Self, mongodb::error::Error> {
        let client = Client::with_uri_str(connection_string).await?;
        let database = client.database(db_name);
        
        // 测试连接
        database.run_command(doc! {"ping": 1}).await?;
        
        Ok(MongoManager {
            client,
            database,
        })
    }
    
    pub fn users(&self) -> Collection<User> {
        self.database.collection("users")
    }
    
    pub fn tool_usage(&self) -> Collection<ToolUsage> {
        self.database.collection("tool_usage")
    }
    
    pub fn user_sessions(&self) -> Collection<UserSession> {
        self.database.collection("user_sessions")
    }
}

// 全局状态管理
pub struct AppState {
    pub mongo: Arc<RwLock<MongoManager>>,
    pub current_user: Arc<RwLock<Option<UserResponse>>>,
}

impl AppState {
    pub async fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let connection_string = "mongodb://root:6scldk9f@dbconn.sealosbja.site:39056/?directConnection=true";
        let mongo = MongoManager::new(connection_string, "chengshang_tools").await?;
        
        Ok(AppState {
            mongo: Arc::new(RwLock::new(mongo)),
            current_user: Arc::new(RwLock::new(None)),
        })
    }
}

// 辅助函数：将User转换为UserResponse
impl From<User> for UserResponse {
    fn from(user: User) -> Self {
        UserResponse {
            id: user.id.map(|id| id.to_hex()).unwrap_or_default(),
            username: user.username,
            role: user.role,
            is_active: user.is_active,
            created_at: user.created_at.try_to_rfc3339_string().unwrap_or_default(),
            last_login_at: user.last_login_at.map(|dt| dt.try_to_rfc3339_string().unwrap_or_default()),
            total_usage_time: user.total_usage_time,
            login_count: user.login_count,
        }
    }
}

// 密码哈希函数
fn hash_password(password: &str) -> String {
    let salt = "chengshang2025";
    let mut hasher = Sha256::new();
    hasher.update(password.as_bytes());
    hasher.update(salt.as_bytes());
    format!("{:x}", hasher.finalize())
}

// 验证密码函数
fn verify_password(password: &str, hash: &str) -> bool {
    hash_password(password) == hash
}

// Tauri命令实现
#[tauri::command]
pub async fn login(
    username: String,
    password: String,
    _remember_me: Option<bool>,
    _auto_login: Option<bool>,
    state: tauri::State<'_, AppState>,
) -> Result<UserResponse, String> {
    let mongo = state.mongo.read().await;
    
    // 查找用户
    let user = mongo.users()
        .find_one(doc! {"username": &username})
        .await
        .map_err(|e| format!("数据库查询失败: {}", e))?;
    
    let user = user.ok_or("用户名或密码错误")?;
    
    // 验证密码
    if !verify_password(&password, &user.password) {
        return Err("用户名或密码错误".to_string());
    }
    
    // 检查用户状态
    if !user.is_active {
        return Err("账号已被禁用，请联系管理员".to_string());
    }
    
    // 更新最后登录时间和登录次数
    let now = DateTime::now();
    mongo.users()
        .update_one(
            doc! {"_id": user.id.unwrap()},
            doc! {
                "$set": {"lastLoginAt": now},
                "$inc": {"loginCount": 1}
            }
        )
        .await
        .map_err(|e| format!("更新用户信息失败: {}", e))?;
    
    // 创建会话记录
    let session = UserSession {
        id: None,
        user_id: user.id.unwrap(),
        login_at: now,
        logout_at: None,
        session_duration: None,
    };
    
    mongo.user_sessions()
        .insert_one(session)
        .await
        .map_err(|e| format!("创建会话失败: {}", e))?;
    
    // 更新用户信息并转换为响应格式
    let mut updated_user = user;
    updated_user.last_login_at = Some(now);
    updated_user.login_count += 1;
    
    let user_response = UserResponse::from(updated_user);
    
    // 保存当前用户到状态
    *state.current_user.write().await = Some(user_response.clone());
    
    Ok(user_response)
}

#[tauri::command]
pub async fn logout(
    user_id: String,
    state: tauri::State<'_, AppState>,
) -> Result<(), String> {
    let mongo = state.mongo.read().await;
    
    // 解析用户ID
    let user_object_id = ObjectId::parse_str(&user_id)
        .map_err(|e| format!("无效的用户ID: {}", e))?;
    
    // 更新最近的会话记录
    let now = DateTime::now();
    mongo.user_sessions()
        .update_one(
            doc! {
                "userId": user_object_id,
                "logoutAt": {"$exists": false}
            },
            doc! {
                "$set": {"logoutAt": now}
            }
        )
        .await
        .map_err(|e| format!("更新会话失败: {}", e))?;
    
    // 清除当前用户状态
    *state.current_user.write().await = None;
    
    Ok(())
}

#[tauri::command]
pub async fn check_session(
    state: tauri::State<'_, AppState>,
) -> Result<UserResponse, String> {
    let current_user = state.current_user.read().await;
    
    match current_user.as_ref() {
        Some(user) => Ok(user.clone()),
        None => Err("未登录".to_string()),
    }
}

#[tauri::command]
pub async fn get_all_users_admin(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<UserResponse>, String> {
    // 检查当前用户权限
    let current_user = state.current_user.read().await;
    let current_user = current_user.as_ref().ok_or("未登录")?;
    
    if current_user.role != "admin" {
        return Err("权限不足".to_string());
    }
    
    let mongo = state.mongo.read().await;
    
    // 查询所有用户
    let mut cursor = mongo.users()
        .find(doc! {})
        .await
        .map_err(|e| format!("查询用户失败: {}", e))?;
    
    let mut users = Vec::new();
    while cursor.advance().await.map_err(|e| format!("遍历用户失败: {}", e))? {
        let user = cursor.deserialize_current().map_err(|e| format!("反序列化用户失败: {}", e))?;
        users.push(UserResponse::from(user));
    }
    
    Ok(users)
}

#[tauri::command]
pub async fn get_system_overview(
    state: tauri::State<'_, AppState>,
) -> Result<SystemStats, String> {
    let mongo = state.mongo.read().await;
    
    // 获取总用户数
    let total_users = mongo.users()
        .count_documents(doc! {"isActive": true})
        .await
        .map_err(|e| format!("查询用户数失败: {}", e))? as i64;

    // 获取今日活跃用户数（简化实现）
    let active_users_today = mongo.user_sessions()
        .count_documents(doc! {})
        .await
        .map_err(|e| format!("查询会话数失败: {}", e))? as i64;

    // 获取总会话数
    let total_sessions = mongo.user_sessions()
        .count_documents(doc! {})
        .await
        .map_err(|e| format!("查询总会话数失败: {}", e))? as i64;
    
    Ok(SystemStats {
        total_users,
        active_users_today,
        total_sessions,
        most_popular_tools: vec![], // 简化实现
    })
}

#[tauri::command]
pub async fn track_user_activity(
    user_id: String,
    activity_type: String,
    tool_id: Option<i32>,
    duration: Option<i64>,
    state: tauri::State<'_, AppState>,
) -> Result<(), String> {
    let mongo = state.mongo.read().await;
    
    // 解析用户ID
    let user_object_id = ObjectId::parse_str(&user_id)
        .map_err(|e| format!("无效的用户ID: {}", e))?;
    
    match activity_type.as_str() {
        "login" => {
            // 记录登录活动 - 已在 login 函数中处理会话创建
            // 这里可以记录额外的登录统计信息
            println!("记录用户登录活动: {}", user_id);
        },
        "logout" => {
            // 记录登出活动 - 在 logout 函数中处理会话结束
            println!("记录用户登出活动: {}", user_id);
        },
        "tool_click" => {
            if let Some(tid) = tool_id {
                // 更新或插入工具使用记录
                let filter = doc! {
                    "userId": user_object_id,
                    "toolId": tid
                };
                
                let update = doc! {
                    "$inc": {"clickCount": 1},
                    "$set": {"lastUsedAt": DateTime::now()},
                    "$setOnInsert": {
                        "toolName": format!("工具{}", tid),
                        "totalUsageTime": 0
                    }
                };
                
                mongo.tool_usage()
                    .update_one(filter, update)
                    .await
                    .map_err(|e| format!("更新工具使用记录失败: {}", e))?;
            }
        },
        "tool_usage" => {
            if let (Some(tid), Some(dur)) = (tool_id, duration) {
                let filter = doc! {
                    "userId": user_object_id,
                    "toolId": tid
                };
                
                let update = doc! {
                    "$inc": {"totalUsageTime": dur}
                };
                
                mongo.tool_usage()
                    .update_one(filter, update)
                    .await
                    .map_err(|e| format!("更新工具使用时长失败: {}", e))?;
            }
        },
        _ => return Err(format!("未知的活动类型: {}。支持的类型: login, logout, tool_click, tool_usage", activity_type)),
    }
    
    Ok(())
}

// 高级用户分析 - 基于MongoDB聚合管道
#[tauri::command]
pub async fn get_user_analytics(
    state: tauri::State<'_, AppState>,
    limit: Option<i64>,
) -> Result<Vec<UserAnalytics>, String> {
    let mongo = state.mongo.read().await;
    
    let pipeline = vec![
        doc! {
            "$match": { "isActive": true }
        },
        doc! {
            "$lookup": {
                "from": "tool_usage",
                "localField": "_id",
                "foreignField": "userId",
                "as": "tool_usage"
            }
        },
        doc! {
            "$addFields": {
                "totalToolClicks": { "$sum": "$tool_usage.clickCount" },
                "totalUsageTime": { "$sum": "$tool_usage.totalUsageTime" },
                "favoriteTools": {
                    "$map": {
                        "input": { "$slice": [
                            { "$sortArray": { 
                                "input": "$tool_usage", 
                                "sortBy": { "clickCount": -1 } 
                            }}, 3
                        ]},
                        "as": "tool",
                        "in": "$$tool.toolName"
                    }
                }
            }
        },
        doc! {
            "$sort": { "totalToolClicks": -1 }
        },
        doc! {
            "$limit": limit.unwrap_or(50)
        }
    ];

    let mut cursor = mongo.users()
        .aggregate(pipeline)
        .await
        .map_err(|e| format!("聚合查询失败: {}", e))?;

    let mut results = Vec::new();
    while cursor.advance().await.map_err(|e| format!("遍历聚合结果失败: {}", e))? {
        let document = cursor.deserialize_current().map_err(|e| format!("反序列化聚合结果失败: {}", e))?;
        let user_analytics = UserAnalytics {
            id: document.get_object_id("_id")
                .map(|id| id.to_hex())
                .unwrap_or_default(),
            username: document.get_str("username").unwrap_or("").to_string(),
            role: document.get_str("role").unwrap_or("user").to_string(),
            is_active: document.get_bool("isActive").unwrap_or(false),
            total_tool_clicks: document.get_i64("totalToolClicks").unwrap_or(0),
            total_usage_time: document.get_i64("totalUsageTime").unwrap_or(0),
            login_count: document.get_i64("loginCount").unwrap_or(0),
            last_login_at: document.get_datetime("lastLoginAt")
                .map(|dt| dt.try_to_rfc3339_string().unwrap_or_default())
                .ok(),
            created_at: document.get_datetime("createdAt")
                .map(|dt| dt.try_to_rfc3339_string().unwrap_or_default())
                .unwrap_or_default(),
            favorite_tools: document.get_array("favoriteTools")
                .map(|arr| arr.iter()
                    .filter_map(|v| v.as_str().map(|s| s.to_string()))
                    .collect())
                .unwrap_or_default(),
        };
        results.push(user_analytics);
    }

    Ok(results)
}

// 高级系统分析 - 完整的统计分析
#[tauri::command]
pub async fn get_system_analytics(
    state: tauri::State<'_, AppState>,
) -> Result<SystemAnalytics, String> {
    let mongo = state.mongo.read().await;
    
    // 获取基本统计
    let total_users = mongo.users()
        .count_documents(doc! {"isActive": true})
        .await
        .map_err(|e| format!("查询用户数失败: {}", e))? as i64;

    // 获取今日活跃用户数 - 简化时间计算
    let now = DateTime::now();
    let today_start = DateTime::from_millis(now.timestamp_millis() - 86400000); // 24小时前
    let active_users_today = mongo.user_sessions()
        .count_documents(doc! {"loginAt": {"$gte": today_start}})
        .await
        .map_err(|e| format!("查询今日活跃用户失败: {}", e))? as i64;

    // 获取总会话数
    let total_sessions = mongo.user_sessions()
        .count_documents(doc! {})
        .await
        .map_err(|e| format!("查询总会话数失败: {}", e))? as i64;

    // 计算平均会话时长
    let session_pipeline = vec![
        doc! {
            "$match": {
                "logoutAt": { "$exists": true, "$ne": null },
                "sessionDuration": { "$exists": true, "$gt": 0 }
            }
        },
        doc! {
            "$group": {
                "_id": null,
                "avgDuration": { "$avg": "$sessionDuration" }
            }
        }
    ];

    let mut session_cursor = mongo.user_sessions()
        .aggregate(session_pipeline)
        .await
        .map_err(|e| format!("会话时长聚合失败: {}", e))?;

    let average_session_duration = if session_cursor.advance().await.map_err(|e| format!("获取聚合结果失败: {}", e))? {
        let doc = session_cursor.deserialize_current().map_err(|e| format!("反序列化聚合结果失败: {}", e))?;
        doc.get_f64("avgDuration").unwrap_or(0.0) as i64
    } else {
        0
    };

    // 获取最受欢迎的工具 - 高级聚合查询
    let tool_pipeline = vec![
        doc! {
            "$group": {
                "_id": "$toolId",
                "toolName": { "$first": "$toolName" },
                "totalClicks": { "$sum": "$clickCount" },
                "totalUsageTime": { "$sum": "$totalUsageTime" },
                "uniqueUsers": { "$addToSet": "$userId" }
            }
        },
        doc! {
            "$addFields": {
                "uniqueUserCount": { "$size": "$uniqueUsers" }
            }
        },
        doc! {
            "$sort": { "totalClicks": -1 }
        },
        doc! {
            "$limit": 10
        }
    ];

    let mut tool_cursor = mongo.tool_usage()
        .aggregate(tool_pipeline)
        .await
        .map_err(|e| format!("工具统计聚合失败: {}", e))?;

    let mut most_popular_tools = Vec::new();
    while tool_cursor.advance().await.map_err(|e| format!("遍历工具统计失败: {}", e))? {
        let doc = tool_cursor.deserialize_current().map_err(|e| format!("反序列化工具统计失败: {}", e))?;
        let tool = PopularTool {
            tool_id: doc.get_i32("_id").unwrap_or(0),
            tool_name: doc.get_str("toolName").unwrap_or("未知工具").to_string(),
            total_clicks: doc.get_i64("totalClicks").unwrap_or(0),
            total_usage_time: doc.get_i64("totalUsageTime").unwrap_or(0),
            unique_users: doc.get_i64("uniqueUserCount").unwrap_or(0),
        };
        most_popular_tools.push(tool);
    }

    // 简化版的趋势数据 (实际项目中应该基于时间范围查询)
    let user_growth_trend = vec![
        DailyGrowth {
            date: "2025-08-01".to_string(),
            new_users: 1,
            active_users: active_users_today,
            total_sessions,
        }
    ];

    let tool_usage_trend = vec![
        DailyUsage {
            date: "2025-08-01".to_string(),
            total_clicks: most_popular_tools.iter().map(|t| t.total_clicks).sum(),
            total_usage_time: most_popular_tools.iter().map(|t| t.total_usage_time).sum(),
            unique_users: active_users_today,
        }
    ];

    Ok(SystemAnalytics {
        total_users,
        active_users_today,
        total_sessions,
        average_session_duration,
        most_popular_tools,
        user_growth_trend,
        tool_usage_trend,
    })
}

// 创建新用户 - 管理员功能
#[tauri::command]
pub async fn create_user(
    username: String,
    password: String,
    role: String,
    state: tauri::State<'_, AppState>,
) -> Result<UserResponse, String> {
    // 检查当前用户权限
    let current_user = state.current_user.read().await;
    let current_user = current_user.as_ref().ok_or("未登录")?;
    
    log::info!("📝 用户管理操作 - 创建用户请求");
    log::info!("   操作员: {} ({})", current_user.username, current_user.role);
    log::info!("   目标用户名: {}", username);
    log::info!("   目标角色: {}", role);
    
    if current_user.role != "admin" {
        log::warn!("❌ 权限拒绝 - 非管理员尝试创建用户: {}", current_user.username);
        return Err("权限不足，只有管理员可以创建用户".to_string());
    }
    
    log::info!("✅ 权限验证通过，开始创建用户流程");
    
    let mongo = state.mongo.read().await;
    
    // 检查用户名是否已存在
    log::info!("🔍 检查用户名是否已存在: {}", username);
    let existing_user = mongo.users()
        .find_one(doc! {"username": &username})
        .await
        .map_err(|e| {
            log::error!("❌ 数据库查询失败: {}", e);
            format!("检查用户名失败: {}", e)
        })?;
    
    if existing_user.is_some() {
        log::warn!("❌ 用户名已存在: {}", username);
        return Err("用户名已存在".to_string());
    }
    
    log::info!("✅ 用户名可用，继续创建");
    
    // 验证角色有效性
    if role != "admin" && role != "user" {
        log::warn!("❌ 无效的用户角色: {}", role);
        return Err("无效的用户角色，只能是 admin 或 user".to_string());
    }
    
    log::info!("✅ 角色验证通过: {}", role);
    
    // 创建新用户
    log::info!("🔐 开始创建用户对象并加密密码");
    let new_user = User {
        id: None,
        username: username.clone(),
        password: hash_password(&password),
        role: role.clone(),
        is_active: true,
        created_at: DateTime::now(),
        last_login_at: None,
        total_usage_time: 0,
        login_count: 0,
    };
    
    log::info!("✅ 用户对象创建完成，密码已安全加密");
    
    // 插入用户到数据库
    log::info!("💾 开始将用户插入数据库");
    let insert_result = mongo.users()
        .insert_one(new_user.clone())
        .await
        .map_err(|e| {
            log::error!("❌ 数据库插入失败: {}", e);
            format!("创建用户失败: {}", e)
        })?;
    
    // 获取插入的用户ID并返回用户响应
    let user_id = insert_result.inserted_id.as_object_id()
        .ok_or_else(|| {
            log::error!("❌ 无法获取新创建用户的ID");
            "获取用户ID失败".to_string()
        })?;
    
    log::info!("✅ 用户创建成功！");
    log::info!("   用户ID: {}", user_id);
    log::info!("   用户名: {}", username);
    log::info!("   角色: {}", role);
    log::info!("   创建时间: {}", DateTime::now());
    
    let mut created_user = new_user;
    created_user.id = Some(user_id);
    
    Ok(UserResponse::from(created_user))
}

// 编辑用户信息 - 管理员功能
#[tauri::command]
pub async fn edit_user(
    userId: String,
    username: Option<String>,
    role: Option<String>,
    isActive: Option<bool>,
    state: tauri::State<'_, AppState>,
) -> Result<UserResponse, String> {
    // 检查当前用户权限
    let current_user = state.current_user.read().await;
    let current_user = current_user.as_ref().ok_or("未登录")?;
    
    log::info!("📝 用户管理操作 - 编辑用户请求");
    log::info!("   操作员: {} ({})", current_user.username, current_user.role);
    log::info!("   目标用户ID: {}", userId);
    log::info!("   更新用户名: {:?}", username);
    log::info!("   更新角色: {:?}", role);
    log::info!("   更新状态: {:?}", isActive);
    
    if current_user.role != "admin" {
        log::warn!("❌ 权限拒绝 - 非管理员尝试编辑用户: {}", current_user.username);
        return Err("权限不足，只有管理员可以编辑用户".to_string());
    }
    
    log::info!("✅ 权限验证通过，开始编辑用户流程");
    
    let mongo = state.mongo.read().await;
    
    // 解析用户ID
    log::info!("🔍 解析用户ID: {}", userId);
    let user_object_id = ObjectId::parse_str(&userId)
        .map_err(|e| {
            log::error!("❌ 用户ID解析失败: {}", e);
            format!("无效的用户ID: {}", e)
        })?;
    
    // 构建更新文档
    log::info!("📋 开始构建更新文档");
    let mut update_doc = doc! {};
    let mut update_fields = Vec::new();
    
    if let Some(new_username) = username {
        log::info!("🔍 检查新用户名是否已被使用: {}", new_username);
        // 检查新用户名是否已被其他用户使用
        let existing_user = mongo.users()
            .find_one(doc! {"username": &new_username, "_id": {"$ne": user_object_id}})
            .await
            .map_err(|e| {
                log::error!("❌ 用户名检查失败: {}", e);
                format!("检查用户名失败: {}", e)
            })?;
        
        if existing_user.is_some() {
            log::warn!("❌ 用户名已被占用: {}", new_username);
            return Err("用户名已存在".to_string());
        }
        
        log::info!("✅ 新用户名可用: {}", new_username);
        update_doc.insert("username", new_username.clone());
        update_fields.push(format!("用户名: {}", new_username));
    }
    
    if let Some(new_role) = role {
        if new_role != "admin" && new_role != "user" {
            log::warn!("❌ 无效的用户角色: {}", new_role);
            return Err("无效的用户角色，只能是 admin 或 user".to_string());
        }
        log::info!("✅ 角色验证通过: {}", new_role);
        update_doc.insert("role", new_role.clone());
        update_fields.push(format!("角色: {}", new_role));
    }
    
    if let Some(active_status) = isActive {
        log::info!("📝 更新用户状态: {}", if active_status { "启用" } else { "禁用" });
        update_doc.insert("isActive", active_status);
        update_fields.push(format!("状态: {}", if active_status { "启用" } else { "禁用" }));
    }
    
    if update_doc.is_empty() {
        log::warn!("❌ 没有提供任何更新字段");
        return Err("没有提供任何更新字段".to_string());
    }
    
    log::info!("📋 更新文档构建完成，将更新字段: [{}]", update_fields.join(", "));
    
    // 更新用户
    log::info!("💾 开始更新数据库用户信息");
    let update_result = mongo.users()
        .update_one(
            doc! {"_id": user_object_id},
            doc! {"$set": update_doc}
        )
        .await
        .map_err(|e| {
            log::error!("❌ 数据库更新失败: {}", e);
            format!("更新用户失败: {}", e)
        })?;
    
    if update_result.matched_count == 0 {
        log::warn!("❌ 未找到目标用户: {}", userId);
        return Err("用户不存在".to_string());
    }
    
    log::info!("✅ 数据库更新成功，影响 {} 条记录", update_result.modified_count);
    
    // 获取更新后的用户信息
    log::info!("🔍 获取更新后的用户信息");
    let updated_user = mongo.users()
        .find_one(doc! {"_id": user_object_id})
        .await
        .map_err(|e| {
            log::error!("❌ 获取更新后用户信息失败: {}", e);
            format!("获取更新后用户信息失败: {}", e)
        })?
        .ok_or_else(|| {
            log::error!("❌ 更新后用户不存在");
            "用户不存在".to_string()
        })?;
    
    log::info!("✅ 用户编辑成功！");
    log::info!("   用户ID: {}", userId);
    log::info!("   更新字段: [{}]", update_fields.join(", "));
    
    Ok(UserResponse::from(updated_user))
}

// 删除用户 - 管理员功能
#[tauri::command]
pub async fn delete_user(
    userId: String,
    state: tauri::State<'_, AppState>,
) -> Result<(), String> {
    // 检查当前用户权限
    let current_user = state.current_user.read().await;
    let current_user = current_user.as_ref().ok_or("未登录")?;
    
    log::info!("📝 用户管理操作 - 删除用户请求");
    log::info!("   操作员: {} ({})", current_user.username, current_user.role);
    log::info!("   目标用户ID: {}", userId);
    
    if current_user.role != "admin" {
        log::warn!("❌ 权限拒绝 - 非管理员尝试删除用户: {}", current_user.username);
        return Err("权限不足，只有管理员可以删除用户".to_string());
    }
    
    // 防止删除自己
    if current_user.id == userId {
        log::warn!("❌ 安全拒绝 - 管理员尝试删除自己: {}", current_user.username);
        return Err("不能删除自己的账户".to_string());
    }
    
    log::info!("✅ 权限和安全检查通过，开始删除用户流程");
    
    let mongo = state.mongo.read().await;
    
    // 解析用户ID
    log::info!("🔍 解析用户ID: {}", userId);
    let user_object_id = ObjectId::parse_str(&userId)
        .map_err(|e| {
            log::error!("❌ 用户ID解析失败: {}", e);
            format!("无效的用户ID: {}", e)
        })?;
    
    // 首先获取要删除的用户信息，用于日志记录
    log::info!("🔍 获取用户信息用于删除日志");
    let target_user = mongo.users()
        .find_one(doc! {"_id": user_object_id})
        .await
        .map_err(|e| {
            log::error!("❌ 获取用户信息失败: {}", e);
            format!("获取用户信息失败: {}", e)
        })?;
    
    let target_username = if let Some(user) = &target_user {
        user.username.clone()
    } else {
        log::warn!("❌ 用户不存在: {}", userId);
        return Err("用户不存在或已被删除".to_string());
    };
    
    log::info!("🗑️ 确认删除用户: {} (ID: {})", target_username, userId);
    
    // 删除用户
    log::info!("💾 开始从数据库删除用户");
    let delete_result = mongo.users()
        .delete_one(doc! {"_id": user_object_id})
        .await
        .map_err(|e| {
            log::error!("❌ 数据库删除失败: {}", e);
            format!("删除用户失败: {}", e)
        })?;
    
    if delete_result.deleted_count == 0 {
        log::warn!("❌ 删除操作未影响任何记录，用户可能已被删除");
        return Err("用户不存在或已被删除".to_string());
    }
    
    log::info!("✅ 用户删除成功！");
    log::info!("   被删除用户: {} (ID: {})", target_username, userId);
    log::info!("   操作员: {} ({})", current_user.username, current_user.role);
    log::info!("   删除记录数: {}", delete_result.deleted_count);
    
    Ok(())
}

// 重置用户密码 - 管理员功能
#[tauri::command]
pub async fn reset_user_password(
    userId: String,
    newPassword: String,
    state: tauri::State<'_, AppState>,
) -> Result<(), String> {
    // 检查当前用户权限
    let current_user = state.current_user.read().await;
    let current_user = current_user.as_ref().ok_or("未登录")?;
    
    log::info!("📝 用户管理操作 - 重置用户密码请求");
    log::info!("   操作员: {} ({})", current_user.username, current_user.role);
    log::info!("   目标用户ID: {}", userId);
    log::info!("   新密码长度: {} 字符", newPassword.len());
    
    if current_user.role != "admin" {
        log::warn!("❌ 权限拒绝 - 非管理员尝试重置密码: {}", current_user.username);
        return Err("权限不足，只有管理员可以重置密码".to_string());
    }
    
    log::info!("✅ 权限验证通过，开始重置密码流程");
    
    let mongo = state.mongo.read().await;
    
    // 解析用户ID
    log::info!("🔍 解析用户ID: {}", userId);
    let user_object_id = ObjectId::parse_str(&userId)
        .map_err(|e| {
            log::error!("❌ 用户ID解析失败: {}", e);
            format!("无效的用户ID: {}", e)
        })?;
    
    // 验证密码长度
    if newPassword.len() < 6 {
        log::warn!("❌ 密码长度不足: {} 字符 (至少需要6字符)", newPassword.len());
        return Err("密码长度至少6位".to_string());
    }
    
    log::info!("✅ 密码长度验证通过: {} 字符", newPassword.len());
    
    // 获取目标用户信息用于日志
    log::info!("🔍 获取目标用户信息");
    let target_user = mongo.users()
        .find_one(doc! {"_id": user_object_id})
        .await
        .map_err(|e| {
            log::error!("❌ 获取用户信息失败: {}", e);
            format!("获取用户信息失败: {}", e)
        })?;
    
    let target_username = if let Some(user) = &target_user {
        user.username.clone()
    } else {
        log::warn!("❌ 用户不存在: {}", userId);
        return Err("用户不存在".to_string());
    };
    
    log::info!("🔐 开始为用户重置密码: {}", target_username);
    
    // 更新密码
    log::info!("🔐 加密新密码并更新数据库");
    let update_result = mongo.users()
        .update_one(
            doc! {"_id": user_object_id},
            doc! {"$set": {"password": hash_password(&newPassword)}}
        )
        .await
        .map_err(|e| {
            log::error!("❌ 数据库更新失败: {}", e);
            format!("重置密码失败: {}", e)
        })?;
    
    if update_result.modified_count == 0 {
        log::warn!("❌ 密码重置操作未影响任何记录");
        return Err("用户不存在或密码未更改".to_string());
    }
    
    log::info!("✅ 密码重置成功！");
    log::info!("   目标用户: {} (ID: {})", target_username, userId);
    log::info!("   操作员: {} ({})", current_user.username, current_user.role);
    log::info!("   新密码长度: {} 字符", newPassword.len());
    log::info!("   更新记录数: {}", update_result.modified_count);
    
    Ok(())
}

// 切换用户状态 - 管理员功能
#[tauri::command]
pub async fn toggle_user_status(
    userId: String,
    state: tauri::State<'_, AppState>,
) -> Result<UserResponse, String> {
    // 检查当前用户权限
    let current_user = state.current_user.read().await;
    let current_user = current_user.as_ref().ok_or("未登录")?;
    
    log::info!("📝 用户管理操作 - 切换用户状态请求");
    log::info!("   操作员: {} ({})", current_user.username, current_user.role);
    log::info!("   目标用户ID: {}", userId);
    
    if current_user.role != "admin" {
        log::warn!("❌ 权限拒绝 - 非管理员尝试切换用户状态: {}", current_user.username);
        return Err("权限不足，只有管理员可以切换用户状态".to_string());
    }
    
    // 防止禁用自己
    if current_user.id == userId {
        log::warn!("❌ 安全拒绝 - 管理员尝试切换自己的状态: {}", current_user.username);
        return Err("不能禁用自己的账户".to_string());
    }
    
    log::info!("✅ 权限和安全检查通过，开始切换用户状态流程");
    
    let mongo = state.mongo.read().await;
    
    // 解析用户ID
    log::info!("🔍 解析用户ID: {}", userId);
    let user_object_id = ObjectId::parse_str(&userId)
        .map_err(|e| {
            log::error!("❌ 用户ID解析失败: {}", e);
            format!("无效的用户ID: {}", e)
        })?;
    
    // 获取当前用户状态
    log::info!("🔍 获取用户当前状态");
    let user = mongo.users()
        .find_one(doc! {"_id": user_object_id})
        .await
        .map_err(|e| {
            log::error!("❌ 查询用户失败: {}", e);
            format!("查询用户失败: {}", e)
        })?
        .ok_or_else(|| {
            log::warn!("❌ 用户不存在: {}", userId);
            "用户不存在".to_string()
        })?;
    
    let current_status = user.is_active;
    let target_username = user.username.clone();
    
    log::info!("📊 用户当前状态: {} - {}", target_username, if current_status { "启用" } else { "禁用" });
    
    // 切换状态
    let new_status = !current_status;
    log::info!("🔄 将状态切换为: {}", if new_status { "启用" } else { "禁用" });
    
    // 更新用户状态
    log::info!("💾 更新数据库中的用户状态");
    let update_result = mongo.users()
        .update_one(
            doc! {"_id": user_object_id},
            doc! {"$set": {"isActive": new_status}}
        )
        .await
        .map_err(|e| {
            log::error!("❌ 数据库更新失败: {}", e);
            format!("更新用户状态失败: {}", e)
        })?;
    
    if update_result.modified_count == 0 {
        log::warn!("❌ 状态切换操作未影响任何记录");
        return Err("用户状态未更改".to_string());
    }
    
    log::info!("✅ 用户状态切换成功！");
    log::info!("   目标用户: {} (ID: {})", target_username, userId);
    log::info!("   操作员: {} ({})", current_user.username, current_user.role);
    log::info!("   状态变化: {} → {}", 
              if current_status { "启用" } else { "禁用" },
              if new_status { "启用" } else { "禁用" });
    log::info!("   更新记录数: {}", update_result.modified_count);
    
    // 返回更新后的用户信息
    let mut updated_user = user;
    updated_user.is_active = new_status;
    
    Ok(UserResponse::from(updated_user))
}
