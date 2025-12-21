# -*- coding: utf-8 -*-
# flake8: noqa

import sys,io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# post  127.0.0.1:5000/api/scores

# - URL: `/api/scores`
# - 方法: POST
# - 参数:
#   ```json
#   {
#     "name": "学生姓名",
#     "score": "当前成绩",
#     "maxScore": "班级最高分",
#     "avgScore": "班级平均分",
#     "rank": "班级排名",
#     "subject": "科目",
#     "examContent": "考试内容",
#     "exam_time": "考试时间(YYYY-MM-DD)"
#   }
#   ```

import requests
import json
url = 'http://127.0.0.1:5000/api/scores'
data = {
    "name": "张三",
    "score": 95,
    "maxScore": 100,
    "avgScore": 85,
    "rank": 2,
    "subject": "数学",
    "examContent": "期中考试",
    "exam_time": "2024-05-21"
}
response = requests.post(url, json=data)
print(response.json())