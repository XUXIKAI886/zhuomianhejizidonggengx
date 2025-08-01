from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import semver
from datetime import datetime
import json

app = FastAPI(
    title="呈尚策划工具箱更新服务",
    description="企业级桌面应用自动更新服务器",
    version="1.0.0"
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据模型
class Release(BaseModel):
    version: str
    notes: str
    pub_date: str
    signature: str
    url: str

class UpdateResponse(BaseModel):
    version: str
    notes: str
    pub_date: Optional[str]
    platforms: Dict

# 版本数据存储
releases_db = {
    "windows-x86_64": [
        {
            "version": "1.0.0",
            "notes": "• 初始版本发布\\n• 19个专业工具集成\\n• 企业级安全保护",
            "pub_date": "2024-01-10T10:00:00Z",
            "signature": "dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkKUlVUNDJSNXU5VWZ4...",
            "url": "https://releases.chengshangcehua.com/呈尚策划工具箱-1.0.0-setup.exe"
        }
    ]
}

@app.get("/")
async def root():
    return {
        "service": "呈尚策划工具箱更新服务",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "service": "呈尚策划工具箱更新服务"
    }

@app.get("/api/releases/{target}/{current_version}", response_model=UpdateResponse)
async def check_updates(target: str, current_version: str):
    """检查更新API"""
    try:
        print(f"检查更新请求: {target} v{current_version}")
        
        # 获取目标平台的发布版本
        platform_releases = releases_db.get(target, [])
        if not platform_releases:
            return UpdateResponse(
                version=current_version,
                notes="",
                pub_date=None,
                platforms={}
            )
        
        # 查找最新版本
        latest_release = max(
            platform_releases,
            key=lambda x: semver.Version.parse(x["version"])
        )
        
        # 版本比较
        if semver.compare(latest_release["version"], current_version) > 0:
            # 有新版本可用
            print(f"发现新版本: {latest_release['version']}")
            return UpdateResponse(
                version=latest_release["version"],
                notes=latest_release["notes"],
                pub_date=latest_release["pub_date"],
                platforms={
                    target: {
                        "signature": latest_release["signature"],
                        "url": latest_release["url"]
                    }
                }
            )
        else:
            # 已是最新版本
            print("已是最新版本")
            return UpdateResponse(
                version=current_version,
                notes="",
                pub_date=None,
                platforms={}
            )
            
    except Exception as e:
        print(f"更新检查错误: {e}")
        raise HTTPException(status_code=500, detail="服务器内部错误")

@app.post("/api/admin/releases")
async def add_release(release: Release, target: str):
    """添加新版本 (管理员API)"""
    if target not in releases_db:
        releases_db[target] = []
    
    release_dict = release.dict()
    release_dict["pub_date"] = datetime.now().isoformat()
    
    releases_db[target].append(release_dict)
    print(f"新版本添加: {target} v{release.version}")
    
    return {"success": True, "message": "版本添加成功"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=3001,
        reload=True,
        log_level="info"
    )