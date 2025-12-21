# 成绩管理系统 - 服务端

## 项目结构

```
server/
├── app/                 # 应用核心代码
│   └── __init__.py     # 应用工厂函数
├── api/                # API路由
│   └── routes.py       # API路由定义
├── services/           # 业务服务
│   └── qiniu_service.py # 七牛云服务
├── config.py           # 配置文件
├── run.py              # 应用入口
├── requirements.txt    # 依赖包列表
├── .env                # 环境变量配置
└── README.md           # 项目文档
```

## 环境要求

- Python 3.7+
- Flask
- 七牛云存储账号

## 安装步骤

1. 安装依赖：
```bash
pip install -r requirements.txt
```

2. 配置七牛云：
   - 复制 `.env.example` 文件为 `.env`
   - 在 `.env` 文件中填入你的七牛云配置信息：
     ```
     QINIU_ACCESS_KEY=你的七牛云AccessKey
     QINIU_SECRET_KEY=你的七牛云SecretKey
     QINIU_BUCKET_NAME=你的七牛云存储空间名称
     QINIU_DOMAIN=你的七牛云域名
     ```

3. 运行服务：
```bash
python run.py
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

本项目采用应用工厂模式构建，支持多环境配置：

- 开发环境：`FLASK_ENV=development python run.py`
- 生产环境：`FLASK_ENV=production python run.py`
- 测试环境：`FLASK_ENV=testing python run.py`

如需扩展功能，请遵循以下原则：

1. 在 `services/` 目录下添加业务逻辑
2. 在 `api/` 目录下添加API路由
3. 在 `config.py` 中添加配置项
