use serde::{Deserialize, Serialize};
use mongodb::{Client, Database, Collection, bson::{doc, oid::ObjectId, DateTime, Document}};
// MongoDB cursor handling - no external futures traits needed
use futures::TryStreamExt;
use std::sync::Arc;
use tokio::sync::RwLock;
use sha2::{Sha256, Digest};

// Token管理相关依赖
use jsonwebtoken::{encode, decode, Header, Validation, EncodingKey, DecodingKey};
use rand::Rng;
use chrono::{Utc, Duration};

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

// 登录响应结构（包含Token信息）
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LoginResponse {
    pub user: UserResponse,
    #[serde(rename = "rememberMeToken")]
    pub remember_me_token: Option<String>,
    #[serde(rename = "autoLoginToken")]
    pub auto_login_token: Option<String>,
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
    pub click_count: i32,  // 改为i32，匹配数据库中的Int32
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

// 用户Token管理
#[derive(Debug, Serialize, Deserialize)]
pub struct UserToken {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    #[serde(rename = "userId")]
    pub user_id: ObjectId,
    pub token: String,
    #[serde(rename = "tokenType")]
    pub token_type: String, // "remember_me" | "auto_login"
    #[serde(rename = "createdAt")]
    pub created_at: DateTime,
    #[serde(rename = "expiresAt")]
    pub expires_at: DateTime,
    #[serde(rename = "isActive")]
    pub is_active: bool,
    #[serde(rename = "deviceInfo")]
    pub device_info: Option<String>,
}

// JWT Claims结构
#[derive(Debug, Serialize, Deserialize)]
pub struct TokenClaims {
    pub sub: String, // 用户ID
    pub username: String,
    pub role: String,
    pub token_type: String,
    pub exp: i64, // 过期时间
    pub iat: i64, // 签发时间
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

// 工具使用详情结构
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ToolUsageDetail {
    #[serde(rename = "toolId")]
    pub tool_id: i32,
    #[serde(rename = "toolName")]
    pub tool_name: String,
    #[serde(rename = "clickCount")]
    pub click_count: i32,  // 改为i32，匹配数据库中的Int32
    #[serde(rename = "totalUsageTime")]
    pub total_usage_time: i64,
    #[serde(rename = "lastUsedAt")]
    pub last_used_at: String,
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
    #[serde(rename = "toolUsageDetails")]
    pub tool_usage_details: Vec<ToolUsageDetail>,
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

    pub fn user_tokens(&self) -> Collection<UserToken> {
        self.database.collection("user_tokens")
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

// Token管理常量
const JWT_SECRET: &str = "chengshang_tools_jwt_secret_2025";
const REMEMBER_ME_DAYS: i64 = 30; // 记住我Token有效期30天
const AUTO_LOGIN_DAYS: i64 = 7;   // 自动登录Token有效期7天

// 生成JWT Token
fn generate_token(user: &UserResponse, token_type: &str, days: i64) -> Result<String, String> {
    let now = Utc::now();
    let exp = now + Duration::days(days);

    let claims = TokenClaims {
        sub: user.id.clone(),
        username: user.username.clone(),
        role: user.role.clone(),
        token_type: token_type.to_string(),
        exp: exp.timestamp(),
        iat: now.timestamp(),
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(JWT_SECRET.as_ref()),
    )
    .map_err(|e| format!("Token生成失败: {}", e))
}

// 验证JWT Token
fn verify_token(token: &str) -> Result<TokenClaims, String> {
    decode::<TokenClaims>(
        token,
        &DecodingKey::from_secret(JWT_SECRET.as_ref()),
        &Validation::default(),
    )
    .map(|data| data.claims)
    .map_err(|e| format!("Token验证失败: {}", e))
}

// 生成随机Token ID
fn generate_token_id() -> String {
    let mut rng = rand::thread_rng();
    (0..32)
        .map(|_| rng.sample(rand::distributions::Alphanumeric) as char)
        .collect()
}

// Tauri命令实现
#[tauri::command]
pub async fn login(
    username: String,
    password: String,
    remember_me: Option<bool>,
    auto_login: Option<bool>,
    state: tauri::State<'_, AppState>,
) -> Result<LoginResponse, String> {
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

    // 初始化Token变量
    let mut remember_me_token: Option<String> = None;
    let mut auto_login_token: Option<String> = None;

    // 处理记住我和自动登录Token
    if remember_me.unwrap_or(false) || auto_login.unwrap_or(false) {
        // 清除该用户的旧Token
        let user_object_id = ObjectId::parse_str(&user_response.id)
            .map_err(|e| format!("用户ID解析失败: {}", e))?;

        mongo.user_tokens()
            .delete_many(doc! {"userId": user_object_id})
            .await
            .map_err(|e| format!("清除旧Token失败: {}", e))?;

        // 生成记住我Token
        if remember_me.unwrap_or(false) {
            let token = generate_token(&user_response, "remember_me", REMEMBER_ME_DAYS)?;
            let user_token = UserToken {
                id: None,
                user_id: user_object_id,
                token: token.clone(),
                token_type: "remember_me".to_string(),
                created_at: now,
                expires_at: DateTime::from_millis((Utc::now() + Duration::days(REMEMBER_ME_DAYS)).timestamp_millis()),
                is_active: true,
                device_info: None,
            };

            mongo.user_tokens()
                .insert_one(user_token)
                .await
                .map_err(|e| format!("保存记住我Token失败: {}", e))?;

            remember_me_token = Some(token);
        }

        // 生成自动登录Token
        if auto_login.unwrap_or(false) {
            let token = generate_token(&user_response, "auto_login", AUTO_LOGIN_DAYS)?;
            let user_token = UserToken {
                id: None,
                user_id: user_object_id,
                token: token.clone(),
                token_type: "auto_login".to_string(),
                created_at: now,
                expires_at: DateTime::from_millis((Utc::now() + Duration::days(AUTO_LOGIN_DAYS)).timestamp_millis()),
                is_active: true,
                device_info: None,
            };

            mongo.user_tokens()
                .insert_one(user_token)
                .await
                .map_err(|e| format!("保存自动登录Token失败: {}", e))?;

            auto_login_token = Some(token);
        }
    }

    // 保存当前用户到状态
    *state.current_user.write().await = Some(user_response.clone());

    // 返回登录响应
    Ok(LoginResponse {
        user: user_response,
        remember_me_token,
        auto_login_token,
    })
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

    // 清除用户的所有Token（记住我和自动登录）
    mongo.user_tokens()
        .delete_many(doc! {"userId": user_object_id})
        .await
        .map_err(|e| format!("清除Token失败: {}", e))?;

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

// 通过Token验证用户身份
#[tauri::command]
pub async fn verify_token_and_login(
    token: String,
    token_type: String,
    state: tauri::State<'_, AppState>,
) -> Result<UserResponse, String> {
    // 验证JWT Token
    let claims = verify_token(&token)?;

    // 检查Token类型是否匹配
    if claims.token_type != token_type {
        return Err("Token类型不匹配".to_string());
    }

    let mongo = state.mongo.read().await;

    // 检查Token是否在数据库中存在且有效
    let user_object_id = ObjectId::parse_str(&claims.sub)
        .map_err(|e| format!("用户ID解析失败: {}", e))?;

    let token_doc = mongo.user_tokens()
        .find_one(doc! {
            "userId": user_object_id,
            "token": &token,
            "tokenType": &token_type,
            "isActive": true,
            "expiresAt": {"$gt": DateTime::now()}
        })
        .await
        .map_err(|e| format!("Token查询失败: {}", e))?;

    if token_doc.is_none() {
        return Err("Token无效或已过期".to_string());
    }

    // 获取用户信息
    let user = mongo.users()
        .find_one(doc! {"_id": user_object_id})
        .await
        .map_err(|e| format!("用户查询失败: {}", e))?
        .ok_or("用户不存在")?;

    // 检查用户状态
    if !user.is_active {
        return Err("账号已被禁用".to_string());
    }

    // 更新最后登录时间
    let now = DateTime::now();
    mongo.users()
        .update_one(
            doc! {"_id": user_object_id},
            doc! {"$set": {"lastLoginAt": now}}
        )
        .await
        .map_err(|e| format!("更新登录时间失败: {}", e))?;

    // 创建会话记录
    let session = UserSession {
        id: None,
        user_id: user_object_id,
        login_at: now,
        logout_at: None,
        session_duration: None,
    };

    mongo.user_sessions()
        .insert_one(session)
        .await
        .map_err(|e| format!("创建会话失败: {}", e))?;

    // 转换为响应格式
    let mut updated_user = user;
    updated_user.last_login_at = Some(now);
    let user_response = UserResponse::from(updated_user);

    // 保存当前用户到状态
    *state.current_user.write().await = Some(user_response.clone());

    Ok(user_response)
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
    userId: String,
    activityType: String,
    toolId: Option<i32>,
    toolName: Option<String>,
    duration: Option<i64>,
    state: tauri::State<'_, AppState>,
) -> Result<(), String> {
    println!("🎯 [track_user_activity] 开始追踪用户活动: 用户ID={}, 活动类型={}, 工具ID={:?}, 工具名称={:?}, 时长={:?}", 
             userId, activityType, toolId, toolName, duration);
    
    let mongo = state.mongo.read().await;
    
    // 解析用户ID
    let user_object_id = ObjectId::parse_str(&userId)
        .map_err(|e| {
            println!("❌ [track_user_activity] 无效的用户ID: {}", e);
            format!("无效的用户ID: {}", e)
        })?;
    
    match activityType.as_str() {
        "login" => {
            // 记录登录活动 - 已在 login 函数中处理会话创建
            // 这里可以记录额外的登录统计信息
            println!("记录用户登录活动: {}", userId);
        },
        "logout" => {
            // 记录登出活动 - 在 logout 函数中处理会话结束
            println!("记录用户登出活动: {}", userId);
        },
        "tool_click" => {
            println!("🎯 [track_user_activity] 处理工具点击事件");
            if let Some(tid) = toolId {
                println!("🎯 [track_user_activity] 工具ID: {}, 用户ObjectID: {}", tid, user_object_id);
                
                // 更新或插入工具使用记录
                let filter = doc! {
                    "userId": user_object_id,
                    "toolId": tid
                };
                
                let update = doc! {
                    "$inc": {"clickCount": 1},
                    "$set": {
                        "lastUsedAt": DateTime::now(),
                        "toolName": toolName.clone().unwrap_or_else(|| format!("工具{}", tid))
                    },
                    "$setOnInsert": {
                        "totalUsageTime": 0
                        // 移除clickCount，让$inc自动处理字段创建
                    }
                };
                
                println!("🎯 [track_user_activity] 准备更新MongoDB工具使用记录...");
                let result = mongo.tool_usage()
                    .update_one(filter, update)
                    .upsert(true)
                    .await
                    .map_err(|e| {
                        println!("❌ [track_user_activity] 更新工具使用记录失败: {}", e);
                        format!("更新工具使用记录失败: {}", e)
                    })?;
                
                println!("✅ [track_user_activity] 工具点击记录成功: 工具ID={}, 匹配数={:?}, 修改数={:?}, 插入ID={:?}", 
                         tid, result.matched_count, result.modified_count, result.upserted_id);
            } else {
                println!("❌ [track_user_activity] 工具点击事件缺少工具ID");
            }
        },
        "tool_usage" => {
            if let (Some(tid), Some(dur)) = (toolId, duration) {
                let filter = doc! {
                    "userId": user_object_id,
                    "toolId": tid
                };
                
                let update = doc! {
                    "$inc": {"totalUsageTime": dur},
                    "$set": {
                        "toolName": toolName.clone().unwrap_or_else(|| format!("工具{}", tid))
                    }
                };
                
                mongo.tool_usage()
                    .update_one(filter, update)
                    .await
                    .map_err(|e| format!("更新工具使用时长失败: {}", e))?;
            }
        },
        _ => {
            println!("❌ [track_user_activity] 未知的活动类型: {}", activityType);
            return Err(format!("未知的活动类型: {}。支持的类型: login, logout, tool_click, tool_usage", activityType));
        }
    }
    
    println!("✅ [track_user_activity] 用户活动追踪完成: 用户ID={}, 活动类型={}", userId, activityType);
    Ok(())
}

// 高级用户分析 - 基于MongoDB聚合管道
#[tauri::command]
pub async fn get_user_analytics(
    state: tauri::State<'_, AppState>,
    limit: Option<i64>,
) -> Result<Vec<UserAnalytics>, String> {
    println!("🔍 [get_user_analytics] 开始获取用户分析数据，限制: {:?}", limit);
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
                "totalToolClicks": { 
                    "$sum": {
                        "$map": {
                            "input": "$tool_usage",
                            "as": "usage",
                            "in": "$$usage.clickCount"
                        }
                    }
                },
                "totalUsageTime": { 
                    "$sum": {
                        "$map": {
                            "input": "$tool_usage",
                            "as": "usage", 
                            "in": "$$usage.totalUsageTime"
                        }
                    }
                },
                "loginCount": { "$ifNull": ["$loginCount", 0] },
                "toolUsageDetails": {
                    "$sortArray": {
                        "input": "$tool_usage",
                        "sortBy": { "clickCount": -1 }
                    }
                },
                "favoriteTools": {
                    "$map": {
                        "input": { "$slice": [
                            { "$sortArray": {
                                "input": "$tool_usage",
                                "sortBy": { "clickCount": -1 }
                            }}, 5
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

    println!("📊 [get_user_analytics] 执行MongoDB聚合管道查询...");
    let mut cursor = mongo.users()
        .aggregate(pipeline)
        .await
        .map_err(|e| {
            println!("❌ [get_user_analytics] 聚合查询失败: {}", e);
            format!("聚合查询失败: {}", e)
        })?;

    println!("✅ [get_user_analytics] 聚合查询成功，开始处理结果...");
    let mut results = Vec::new();
    while cursor.advance().await.map_err(|e| format!("遍历聚合结果失败: {}", e))? {
        let document = cursor.deserialize_current().map_err(|e| format!("反序列化聚合结果失败: {}", e))?;

        let username = document.get_str("username").unwrap_or("未知用户");
        println!("📄 [get_user_analytics] 处理用户文档: {}", username);

        // 调试：检查聚合结果的关键字段
        let total_clicks = document.get_i64("totalToolClicks").unwrap_or(0);
        let total_time = document.get_i64("totalUsageTime").unwrap_or(0);
        println!("🔍 [get_user_analytics] 用户 {} 聚合结果: 总点击={}, 总时长={}", username, total_clicks, total_time);

        // 调试：检查tool_usage数组
        if let Ok(tool_usage_array) = document.get_array("toolUsageDetails") {
            println!("🔧 [get_user_analytics] 用户 {} 的工具使用详情数组长度: {}", username, tool_usage_array.len());
            for (i, tool_doc) in tool_usage_array.iter().enumerate().take(3) { // 只显示前3个
                if let Some(tool) = tool_doc.as_document() {
                    println!("  工具 {}: ID={}, 名称={}, 点击={}, 时长={}",
                             i + 1,
                             tool.get_i32("toolId").unwrap_or(0),
                             tool.get_str("toolName").unwrap_or("未知"),
                             tool.get_i32("clickCount").unwrap_or(0) as i64,  // 转换为i64用于计算
                             tool.get_i64("totalUsageTime").unwrap_or(0));
                }
            }
        } else {
            println!("⚠️ [get_user_analytics] 用户 {} 没有 toolUsageDetails 字段", username);
        }

        // 调试：检查原始tool_usage数组（聚合前）
        if let Ok(raw_tool_usage) = document.get_array("tool_usage") {
            println!("🔍 [get_user_analytics] 用户 {} 原始tool_usage数组长度: {}", username, raw_tool_usage.len());
            let mut total_clicks_manual = 0i64;
            for tool_doc in raw_tool_usage.iter().take(3) {
                if let Some(tool) = tool_doc.as_document() {
                    let clicks = tool.get_i32("clickCount").unwrap_or(0) as i64;  // 转换为i64用于累计
                    total_clicks_manual += clicks;
                    println!("  原始工具: ID={}, 点击={}",
                             tool.get_i32("toolId").unwrap_or(0),
                             clicks);
                }
            }
            println!("🧮 [get_user_analytics] 用户 {} 手动计算总点击: {}", username, total_clicks_manual);
        }

        let user_analytics = UserAnalytics {
            id: document.get_object_id("_id")
                .map(|id| id.to_hex())
                .unwrap_or_else(|_| format!("unknown-{}", results.len())),
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
            tool_usage_details: document.get_array("toolUsageDetails")
                .map(|arr| arr.iter()
                    .filter_map(|v| {
                        if let Some(doc) = v.as_document() {
                            Some(ToolUsageDetail {
                                tool_id: doc.get_i32("toolId").unwrap_or(0),
                                tool_name: doc.get_str("toolName").unwrap_or("未知工具").to_string(),
                                click_count: doc.get_i32("clickCount").unwrap_or(0),  // 保持i32类型匹配ToolUsageDetail
                                total_usage_time: doc.get_i64("totalUsageTime").unwrap_or(0),
                                last_used_at: doc.get_datetime("lastUsedAt")
                                    .map(|dt| dt.try_to_rfc3339_string().unwrap_or_default())
                                    .unwrap_or("未知时间".to_string()),
                            })
                        } else {
                            None
                        }
                    })
                    .collect())
                .unwrap_or_default(),
        };
        println!("👤 [get_user_analytics] 处理用户: {} (点击: {}, 时长: {}, 登录: {})", 
                 user_analytics.username, user_analytics.total_tool_clicks, user_analytics.total_usage_time, user_analytics.login_count);
        results.push(user_analytics);
    }

    println!("🎯 [get_user_analytics] 完成，返回 {} 个用户分析数据", results.len());
    Ok(results)
}

// 高级系统分析 - 完整的统计分析
#[tauri::command]
pub async fn get_system_analytics(
    state: tauri::State<'_, AppState>,
) -> Result<SystemAnalytics, String> {
    println!("🔍 [get_system_analytics] 开始获取系统分析数据...");
    let mongo = state.mongo.read().await;
    
    // 获取基本统计
    println!("📊 [get_system_analytics] 查询总用户数...");
    let total_users = mongo.users()
        .count_documents(doc! {"isActive": true})
        .await
        .map_err(|e| {
            println!("❌ [get_system_analytics] 查询用户数失败: {}", e);
            format!("查询用户数失败: {}", e)
        })? as i64;
    println!("✅ [get_system_analytics] 总用户数: {}", total_users);

    // 获取今日活跃用户数 - 简化时间计算
    println!("📊 [get_system_analytics] 查询今日活跃用户数...");
    let now = DateTime::now();
    let today_start = DateTime::from_millis(now.timestamp_millis() - 86400000); // 24小时前
    let active_users_today = mongo.user_sessions()
        .count_documents(doc! {"loginAt": {"$gte": today_start}})
        .await
        .map_err(|e| {
            println!("❌ [get_system_analytics] 查询今日活跃用户失败: {}", e);
            format!("查询今日活跃用户失败: {}", e)
        })? as i64;
    println!("✅ [get_system_analytics] 今日活跃用户数: {}", active_users_today);

    // 获取总会话数
    println!("📊 [get_system_analytics] 查询总会话数...");
    let total_sessions = mongo.user_sessions()
        .count_documents(doc! {})
        .await
        .map_err(|e| {
            println!("❌ [get_system_analytics] 查询总会话数失败: {}", e);
            format!("查询总会话数失败: {}", e)
        })? as i64;
    println!("✅ [get_system_analytics] 总会话数: {}", total_sessions);

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
    println!("📊 [get_system_analytics] 开始查询工具使用统计...");
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
        .map_err(|e| {
            println!("❌ [get_system_analytics] 工具统计聚合失败: {}", e);
            format!("工具统计聚合失败: {}", e)
        })?;
    println!("✅ [get_system_analytics] 工具统计聚合查询成功");

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
        println!("🔧 [get_system_analytics] 工具统计: {} - 点击:{}, 时长:{}, 用户:{}", 
                 tool.tool_name, tool.total_clicks, tool.total_usage_time, tool.unique_users);
        most_popular_tools.push(tool);
    }
    println!("✅ [get_system_analytics] 完成工具统计，找到 {} 个工具", most_popular_tools.len());

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

    let result = SystemAnalytics {
        total_users,
        active_users_today,
        total_sessions,
        average_session_duration,
        most_popular_tools,
        user_growth_trend,
        tool_usage_trend,
    };
    
    println!("🎯 [get_system_analytics] 完成系统分析数据获取: 用户:{}, 活跃:{}, 会话:{}, 工具数:{}", 
             result.total_users, result.active_users_today, result.total_sessions, result.most_popular_tools.len());
    Ok(result)
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

// 测试数据生成API - 仅用于开发调试
#[tauri::command]
pub async fn generate_test_data(
    state: tauri::State<'_, AppState>,
) -> Result<String, String> {
    println!("🧪 [generate_test_data] 开始生成测试数据...");
    let mongo = state.mongo.read().await;
    
    // 创建测试工具使用数据
    let test_tools = vec![
        ("AI写作助手", 1, 150, 7200),
        ("美团运营知识学习系统", 2, 89, 5400),
        ("外卖店铺完整运营流程", 3, 76, 4200),
        ("域锦科技AI系统", 4, 65, 3600),
        ("微信群发助手", 5, 54, 2800),
        ("运营数据统计分析", 6, 43, 2100),
        ("销售数据报告生成系统", 7, 32, 1500),
        ("财务记账系统", 8, 28, 1200),
        ("智能排班系统", 9, 21, 900),
        ("人事面试顾问系统", 10, 15, 600),
    ];
    
    // 获取现有用户ID
    let user_cursor = mongo.users().find(doc! {"isActive": true}).await.map_err(|e| format!("查询用户失败: {}", e))?;
    let users: Vec<User> = user_cursor.try_collect().await.map_err(|e| format!("收集用户失败: {}", e))?;
    
    if users.is_empty() {
        return Err("没有找到活跃用户，无法生成测试数据".to_string());
    }
    
    println!("📊 [generate_test_data] 找到 {} 个用户，为其生成工具使用数据", users.len());
    
    let mut inserted_count = 0;
    
    for user in &users {
        let user_object_id = user.id.as_ref().ok_or("用户ID为空")?;
        
        // 为每个用户随机生成一些工具使用数据
        for (tool_name, tool_id, base_clicks, base_time) in &test_tools {
            // 随机化数据，让每个用户的使用情况不同
            use std::collections::hash_map::DefaultHasher;
            use std::hash::{Hash, Hasher};
            
            let mut hasher = DefaultHasher::new();
            user_object_id.hash(&mut hasher);
            tool_id.hash(&mut hasher);
            let seed = hasher.finish();
            
            let click_multiplier = ((seed % 3) + 1) as i64; // 1到3倍
            let time_multiplier = ((seed % 4) + 1) as i64; // 1到4倍
            
            let final_clicks = base_clicks * click_multiplier / 2;
            let final_time = base_time * time_multiplier / 2;
            
            let tool_usage_doc = doc! {
                "userId": user_object_id,
                "toolId": tool_id,
                "toolName": tool_name,
                "clickCount": final_clicks,
                "totalUsageTime": final_time,
                "lastUsedAt": DateTime::now(),
                "createdAt": DateTime::now(),
            };
            
            // 使用upsert避免重复插入
            let result = mongo.tool_usage()
                .update_one(
                    doc! {"userId": user_object_id, "toolId": tool_id},
                    doc! {"$set": tool_usage_doc}
                )
                .upsert(true)
                .await
                .map_err(|e| format!("插入工具使用数据失败: {}", e))?;
                
            if result.upserted_id.is_some() {
                inserted_count += 1;
                println!("📝 [generate_test_data] 为用户 {} 生成工具数据: {} (点击:{}, 时长:{})", 
                         user.username, tool_name, final_clicks, final_time);
            }
        }
    }
    
    // 生成一些用户会话数据
    for user in &users {
        let user_object_id = user.id.as_ref().ok_or("用户ID为空")?;
        
        // 为每个用户生成3-5个会话记录
        for i in 0..4 {
            let session_duration = 1800 + (i * 600); // 30分钟到2小时不等
            let login_time = DateTime::from_millis(DateTime::now().timestamp_millis() - (i as i64 * 86400000)); // 最近几天
            let logout_time = DateTime::from_millis(login_time.timestamp_millis() + (session_duration * 1000));
            
            let session = UserSession {
                id: None,
                user_id: *user_object_id,
                login_at: login_time,
                logout_at: Some(logout_time),
                session_duration: Some(session_duration),
            };
            
            mongo.user_sessions()
                .insert_one(session)
                .await
                .map_err(|e| format!("插入会话数据失败: {}", e))?;
        }
        
        println!("📅 [generate_test_data] 为用户 {} 生成了4个会话记录", user.username);
    }
    
    println!("🎯 [generate_test_data] 测试数据生成完成！");
    println!("   工具使用记录: {} 条", inserted_count);
    println!("   用户会话记录: {} 条", users.len() * 4);
    
    Ok(format!("✅ 测试数据生成成功！\n工具使用记录: {} 条\n用户会话记录: {} 条", 
               inserted_count, users.len() * 4))
}

// 清除测试数据API - 仅用于开发调试
#[tauri::command]
pub async fn clear_test_data(
    state: tauri::State<'_, AppState>,
) -> Result<String, String> {
    println!("🧹 [clear_test_data] 开始清除测试数据...");
    let mongo = state.mongo.read().await;
    
    // 清除工具使用数据
    println!("📊 [clear_test_data] 清除工具使用数据...");
    let tool_usage_result = mongo.tool_usage()
        .delete_many(doc! {})
        .await
        .map_err(|e| format!("清除工具使用数据失败: {}", e))?;
    println!("✅ [clear_test_data] 清除工具使用记录: {} 条", tool_usage_result.deleted_count);
    
    // 清除用户会话数据
    println!("📅 [clear_test_data] 清除用户会话数据...");
    let sessions_result = mongo.user_sessions()
        .delete_many(doc! {})
        .await
        .map_err(|e| format!("清除会话数据失败: {}", e))?;
    println!("✅ [clear_test_data] 清除会话记录: {} 条", sessions_result.deleted_count);
    
    // 不清除用户数据，只清除统计相关的测试数据
    println!("💡 [clear_test_data] 保留用户账号数据，仅清除统计数据");
    
    println!("🎯 [clear_test_data] 测试数据清除完成！");
    println!("   工具使用记录: {} 条已删除", tool_usage_result.deleted_count);
    println!("   用户会话记录: {} 条已删除", sessions_result.deleted_count);
    
    Ok(format!("✅ 测试数据清除成功！\n工具使用记录: {} 条已删除\n用户会话记录: {} 条已删除\n\n💡 用户账号数据已保留", 
               tool_usage_result.deleted_count, sessions_result.deleted_count))
}

// 测试ToolUsage反序列化和统计
#[tauri::command]
pub async fn debug_tool_usage_data(
    state: tauri::State<'_, AppState>,
) -> Result<String, String> {
    println!("🔍 [debug_tool_usage_data] 测试ToolUsage结构体反序列化...");
    let mongo = state.mongo.read().await;
    
    // 尝试正常反序列化为ToolUsage结构体
    let mut cursor = mongo.tool_usage().find(doc! {}).limit(10).await.map_err(|e| format!("查询失败: {}", e))?;
    
    let mut debug_info = String::new();
    debug_info.push_str("🔧 ToolUsage 反序列化测试:\n\n");
    
    let mut total_count = 0;
    let mut total_clicks = 0i32;
    let mut user_stats = std::collections::HashMap::new();
    
    while let Some(result) = cursor.try_next().await.map_err(|e| format!("反序列化失败: {}", e))? {
        total_count += 1;
        total_clicks += result.click_count;
        
        if total_count <= 5 {
            debug_info.push_str(&format!("📝 记录 {}: \n", total_count));
            debug_info.push_str(&format!("   用户ID: {}\n", result.user_id.to_hex()));
            debug_info.push_str(&format!("   工具ID: {}\n", result.tool_id));
            debug_info.push_str(&format!("   工具名称: {}\n", result.tool_name));
            debug_info.push_str(&format!("   点击次数: {}\n", result.click_count));
            debug_info.push_str(&format!("   总使用时长: {}\n", result.total_usage_time));
            debug_info.push_str(&format!("   最后使用时间: {:?}\n", result.last_used_at));
            debug_info.push_str("\n");
        }
        
        // 统计数据
        let user_id_str = result.user_id.to_hex();
        let entry = user_stats.entry(user_id_str).or_insert((0i32, 0i64));
        entry.0 += result.click_count;
        entry.1 += result.total_usage_time;
    }
    
    debug_info.push_str(&format!("📊 统计结果:\n"));
    debug_info.push_str(&format!("   总记录数: {}\n", total_count));
    debug_info.push_str(&format!("   总点击次数: {}\n", total_clicks));
    debug_info.push_str(&format!("\n👥 按用户统计:\n"));
    
    for (user_id, (clicks, time)) in user_stats {
        debug_info.push_str(&format!("   用户 {}: 总点击={}, 总时长={}\n", user_id, clicks, time));
    }
    
    Ok(debug_info)
}

// 检查数据库实际字段名 - 直接返回原始文档
#[tauri::command]
pub async fn check_raw_tool_usage_fields(
    state: tauri::State<'_, AppState>,
) -> Result<String, String> {
    println!("🔍 [check_raw_tool_usage_fields] 检查tool_usage集合的实际字段名...");
    let mongo = state.mongo.read().await;
    
    // 使用原生MongoDB查询，不进行类型转换
    let collection = mongo.database.collection::<Document>("tool_usage");
    let mut cursor = collection.find(doc! {}).limit(3).await.map_err(|e| format!("查询失败: {}", e))?;
    
    let mut debug_info = String::new();
    debug_info.push_str("🔧 Tool Usage 原始字段调试:\n\n");
    
    let mut count = 0;
    while let Some(doc) = cursor.try_next().await.map_err(|e| format!("遍历失败: {}", e))? {
        count += 1;
        debug_info.push_str(&format!("📝 原始文档 {}:\n", count));
        
        // 列出所有字段名
        for (key, value) in doc.iter() {
            debug_info.push_str(&format!("   {}: {:?}\n", key, value));
        }
        debug_info.push_str("\n");
    }
    
    if count == 0 {
        debug_info.push_str("❌ 没有找到任何tool_usage记录\n");
    }
    
    Ok(debug_info)
}

// 调试API - 查看用户表的实际数据结构
#[tauri::command]
pub async fn debug_user_data(
    state: tauri::State<'_, AppState>,
) -> Result<String, String> {
    println!("🔍 [debug_user_data] 开始检查用户数据结构...");
    let mongo = state.mongo.read().await;

    let cursor = mongo.users().find(doc! {}).await.map_err(|e| format!("查询用户失败: {}", e))?;
    let users: Vec<User> = cursor.try_collect().await.map_err(|e| format!("收集用户失败: {}", e))?;

    let mut debug_info = String::new();
    debug_info.push_str("📊 用户数据调试信息:\n\n");

    for user in &users {
        debug_info.push_str(&format!("👤 用户: {}\n", user.username));
        debug_info.push_str(&format!("   ID: {:?}\n", user.id));
        debug_info.push_str(&format!("   角色: {}\n", user.role));
        debug_info.push_str(&format!("   激活状态: {}\n", user.is_active));
        debug_info.push_str(&format!("   登录次数: {}\n", user.login_count));
        debug_info.push_str(&format!("   总使用时长: {}\n", user.total_usage_time));
        debug_info.push_str(&format!("   最后登录: {:?}\n", user.last_login_at));
        debug_info.push_str(&format!("   创建时间: {:?}\n", user.created_at));
        debug_info.push_str(&format!("   密码哈希: {}\n", user.password)); // 添加密码哈希显示
        debug_info.push_str("\n");

        println!("👤 [debug_user_data] 用户: {} - 登录次数: {} - 密码哈希: {}", user.username, user.login_count, user.password);
    }

    debug_info.push_str(&format!("总用户数: {}\n", users.len()));

    println!("🎯 [debug_user_data] 调试信息收集完成");
    Ok(debug_info)
}

// 修复tool_usage集合中的clickCount字段
#[tauri::command]
pub async fn fix_tool_usage_click_counts(
    state: tauri::State<'_, AppState>,
) -> Result<String, String> {
    println!("🔧 [fix_tool_usage_click_counts] 开始修复tool_usage的clickCount字段...");
    let mongo = state.mongo.read().await;
    
    // 直接查看MongoDB文档，获取ToolUsage结构
    let mut cursor = mongo.tool_usage().find(doc! {}).await.map_err(|e| format!("查询tool_usage失败: {}", e))?;
    
    let mut total_count = 0;
    let mut fixed_count = 0;
    let mut records_with_zero_clicks = 0;
    
    while let Some(result) = cursor.try_next().await.map_err(|e| format!("遍历cursor失败: {}", e))? {
        total_count += 1;
        
        println!("🔍 [fix_tool_usage_click_counts] 检查记录: 工具{}({}) - 点击:{}, 时长:{}", 
                 result.tool_name, result.tool_id, result.click_count, result.total_usage_time);
        
        if result.click_count == 0 && result.total_usage_time > 0 {
            records_with_zero_clicks += 1;
            // 根据使用时长估算点击次数 (假设每次点击平均使用5分钟=300秒)
            let estimated_clicks = std::cmp::max(1i32, (result.total_usage_time / 300) as i32);
            
            if let Some(doc_id) = result.id {
                let update_result = mongo.tool_usage()
                    .update_one(
                        doc! {"_id": doc_id},
                        doc! {"$set": {"clickCount": estimated_clicks}}
                    )
                    .await
                    .map_err(|e| format!("更新clickCount失败: {}", e))?;
                
                if update_result.modified_count > 0 {
                    fixed_count += 1;
                    println!("✅ [fix_tool_usage_click_counts] 修复记录: {} - 设置点击次数为 {}", 
                             result.tool_name, estimated_clicks);
                }
            }
        }
    }
    
    println!("🎯 [fix_tool_usage_click_counts] 修复完成！");
    println!("   总记录数: {}", total_count);
    println!("   零点击记录数: {}", records_with_zero_clicks);
    println!("   成功修复数: {}", fixed_count);
    
    Ok(format!("✅ tool_usage点击次数修复完成！\n总记录数: {}\n零点击记录数: {}\n成功修复数: {}", 
               total_count, records_with_zero_clicks, fixed_count))
}

// 初始化用户登录计数 - 为现有用户添加缺失字段
#[tauri::command]
pub async fn init_user_login_counts(
    state: tauri::State<'_, AppState>,
) -> Result<String, String> {
    println!("🔧 [init_user_login_counts] 开始初始化用户登录计数...");
    let mongo = state.mongo.read().await;
    
    // 查找所有用户并为他们初始化登录计数
    let result = mongo.users()
        .update_many(
            doc! {}, // 匹配所有用户
            doc! {
                "$setOnInsert": {
                    "loginCount": 0,
                    "totalUsageTime": 0
                }
            }
        )
        .await
        .map_err(|e| format!("初始化登录计数失败: {}", e))?;
    
    println!("✅ [init_user_login_counts] 更新结果: 匹配 {} 个用户", result.matched_count);
    
    // 现在基于用户会话数据更新实际的登录次数
    let users_cursor = mongo.users().find(doc! {}).await.map_err(|e| format!("查询用户失败: {}", e))?;
    let users: Vec<User> = users_cursor.try_collect().await.map_err(|e| format!("收集用户失败: {}", e))?;
    
    let mut updated_users = 0;
    
    for user in &users {
        if let Some(user_id) = &user.id {
            // 计算这个用户的实际登录次数
            let login_count = mongo.user_sessions()
                .count_documents(doc! {"userId": user_id})
                .await
                .map_err(|e| format!("计算登录次数失败: {}", e))? as i64;
            
            // 更新用户的登录次数
            let update_result = mongo.users()
                .update_one(
                    doc! {"_id": user_id},
                    doc! {"$set": {"loginCount": login_count}}
                )
                .await
                .map_err(|e| format!("更新登录次数失败: {}", e))?;
            
            if update_result.modified_count > 0 {
                updated_users += 1;
                println!("✅ [init_user_login_counts] 用户 {} 登录次数设置为: {}", user.username, login_count);
            }
        }
    }
    
    println!("🎯 [init_user_login_counts] 初始化完成，更新了 {} 个用户", updated_users);
    Ok(format!("✅ 用户登录计数初始化完成！\n更新了 {} 个用户的登录次数", updated_users))
}
