# -*- coding: utf-8 -*-
# flake8: noqa

import sys,io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')


# - URL: `/api/scores`
# - 方法: GET
# - 参数:
#   - `name`: 学生姓名（必填）
#   - `subject`: 科目（可选）
# - 返回:

import requests
import json
url = 'http://127.0.0.1:5000/api/scores'
params = {
    "name": "张三",
    "subject": "数学"
}
response = requests.get(url, params=params)
print(response.json())