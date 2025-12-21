
import json
from flask import Blueprint, request, jsonify
import datetime
from services.qiniu_service import QiniuService

# 创建蓝图
api_bp = Blueprint('api', __name__)

# 初始化七牛云服务
qiniu_service = QiniuService()

@api_bp.route('/scores', methods=['POST'])
def add_score():
    """
    添加成绩数据
    """
    try:
        data = request.json
        name = data.get('name')
        subject = data.get('subject')
        exam_time = data.get('exam_time')
        current_score = data.get('score')

        if not all([name, subject, exam_time,current_score]):
            return jsonify({'success': False, 'message': '缺少必要参数'}), 400

        # 格式化考试时间
        try:
            exam_time_obj = datetime.datetime.strptime(exam_time, '%Y-%m-%d')
            formatted_time = exam_time_obj.strftime('%Y%m%d')
        except ValueError:
            return jsonify({'success': False, 'message': '日期格式不正确，请使用YYYY-MM-DD'}), 400

        # 构建文件名: 姓名/科目/考试时间.json
        key = f"{name}/{subject}/{formatted_time}.json"
        print(f"Uploading score data to key: {key}")
        # 上传到七牛云
        ret, info = qiniu_service.upload_data(key, json.dumps(data).encode('utf-8'))

        if ret:
            return jsonify({'success': True, 'message': '成绩上传成功', 'key': key})
        else:
            return jsonify({'success': False, 'message': f'上传失败: {info}'}), 500

    except Exception as e:
        return jsonify({'success': False, 'message': f'服务器错误: {str(e)}'}), 500

@api_bp.route('/scores', methods=['GET'])
def get_scores():
    """
    获取成绩数据
    """
    try:
        name = request.args.get('name')
        subject = request.args.get('subject')

        if not name:
            return jsonify({'success': False, 'message': '缺少姓名参数'}), 400

        # 构建前缀用于搜索
        prefix = f"{name}/"
        if subject:
            prefix += f"{subject}/"

        # 获取所有匹配的文件
        print(f"Listing files with prefix: {prefix}")
        items = qiniu_service.list_files(prefix)
        scores = []
        print(f"Found items: {items}")

        for item in items:
            key = item.get('key')
            score_data = qiniu_service.get_data(key)
            if score_data:
                scores.append(score_data)

        return jsonify({'success': True, 'data': scores})

    except Exception as e:
        return jsonify({'success': False, 'message': f'server error: {str(e)}'}), 500

@api_bp.route('/health', methods=['GET'])
def health_check():
    """
    健康检查接口
    """
    return jsonify({'status': 'ok', 'message': 'Server is running smoothly.'})
