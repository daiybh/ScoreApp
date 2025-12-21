#!/bin/bash

# 成绩管理系统服务启动脚本

# 设置默认环境为开发环境
export FLASK_ENV=${FLASK_ENV:-development}

echo "启动成绩管理系统服务，环境: $FLASK_ENV"

# 检查是否存在虚拟环境
if [ ! -d "venv" ]; then
    echo "创建虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
source venv/bin/activate

# 安装依赖
echo "安装依赖..."
pip install -r requirements.txt

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "创建环境变量文件..."
    cp .env.example .env
    echo "请编辑 .env 文件，填入正确的配置信息"
    exit 1
fi

# 启动服务
echo "启动服务..."
python run.py
