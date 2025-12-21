
from flask import Flask,jsonify
from flask_cors import CORS
from config import config
from api.routes import api_bp

def create_app(config_name='default'):
    """
    应用工厂函数
    :param config_name: 配置名称
    :return: Flask应用实例
    """
    app = Flask(__name__)

    # 加载配置
    app.config.from_object(config[config_name])

    # 启用CORS
    CORS(app)

    # 注册蓝图
    app.register_blueprint(api_bp, url_prefix='/api')

    # 添加错误处理
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'success': False, 'message': '资源不存在'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'success': False, 'message': '服务器内部错误'}), 500

    return app
