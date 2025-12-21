# 成绩管理系统 - 服务端

## 项目结构

```
server_golang/
├── cmd/                # 应用入口
│   └── main.go         # 主程序入口
├── internal/           # 应用核心代码
│   ├── api/            # API路由
│   │   └── handlers.go # API路由处理器
│   ├── config/         # 配置
│   │   └── config.go   # 配置定义
│   └── service/        # 业务服务
│       └── qiniu.go    # 七牛云服务
├── go.mod              # Go模块定义
├── go.sum              # Go模块依赖锁定
├── .env                # 环境变量配置
└── README.md           # 项目文档
```

## 环境要求

- Go 1.19+
- 七牛云存储账号

## 安装步骤

1. 安装依赖：
```bash
go mod download
```

2. 配置七牛云：
   - 在 `.env` 文件中填入你的七牛云配置信息：
     ```
     QINIU_ACCESS_KEY=你的七牛云AccessKey
     QINIU_SECRET_KEY=你的七牛云SecretKey
     QINIU_BUCKET_NAME=你的七牛云存储空间名称
     QINIU_DOMAIN=你的七牛云域名
     ```

3. 运行服务：
```bash
go run cmd/main.go
```

## API接口

### 添加成绩

- URL: `/api/scores`
- 方法: POST
- 参数:
  ```json
  {
    "name": "学生姓名",
    "score": "当前成绩",
    "maxScore": "班级最高分",
    "avgScore": "班级平均分",
    "rank": "班级排名",
    "subject": "科目",
    "examContent": "考试内容",
    "exam_time": "考试时间(YYYY-MM-DD)"
  }
  ```
- 返回:
  ```json
  {
    "success": true,
    "message": "成绩上传成功",
    "key": "文件名"
  }
  ```

### 查询成绩

- URL: `/api/scores`
- 方法: GET
- 参数:
  - `name`: 学生姓名（必填）
  - `subject`: 科目（可选）
- 返回:
  ```json
  {
    "success": true,
    "data": [
      {
        "name": "学生姓名",
        "score": "当前成绩",
        "maxScore": "班级最高分",
        "avgScore": "班级平均分",
        "rank": "班级排名",
        "subject": "科目",
        "examContent": "考试内容",
        "exam_time": "考试时间"
      }
    ]
  }
  ```

### 健康检查

- URL: `/api/health`
- 方法: GET
- 返回:
  ```json
  {
    "status": "ok",
    "message": "服务运行正常"
  }
  ```

## 开发指南

本项目采用Go语言实现，支持多环境配置：

- 开发环境：`APP_ENV=development go run cmd/main.go`
- 生产环境：`APP_ENV=production go run cmd/main.go`
- 测试环境：`APP_ENV=testing go run cmd/main.go`

如需扩展功能，请遵循以下原则：

1. 在 `internal/service/` 目录下添加业务逻辑
2. 在 `internal/api/` 目录下添加API路由处理器
3. 在 `internal/config/` 目录下添加配置项
