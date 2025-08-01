use serde::{Deserialize, Serialize};
use mongodb::{Client, Database, Collection, bson::{doc, oid::ObjectId, DateTime}};
use std::sync::Arc;
use tokio::sync::RwLock;
use sha2::{Sha256, Digest};

// 用户数据结构
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub username: String,
    #[serde(skip_serializing)]
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
    remember_me: Option<bool>,
    auto_login: Option<bool>,
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
        _ => return Err("未知的活动类型".to_string()),
    }
    
    Ok(())
}
