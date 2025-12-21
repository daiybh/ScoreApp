
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

class Config:
    """基础配置类"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')

    # 七牛云配置
    QINIU_ACCESS_KEY = os.getenv('QINIU_ACCESS_KEY', 'your_access_key')
    QINIU_SECRET_KEY = os.getenv('QINIU_SECRET_KEY', 'your_secret_key')
    QINIU_BUCKET_NAME = os.getenv('QINIU_BUCKET_NAME', 'your_bucket_name')
    QINIU_DOMAIN = os.getenv('QINIU_DOMAIN', 'your_domain')

    # 应用配置
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() in ['true', '1', 'yes']
    HOST = os.getenv('FLASK_HOST', '0.0.0.0')
    PORT = int(os.getenv('FLASK_PORT', 5000))


class DevelopmentConfig(Config):
    """开发环境配置"""
    DEBUG = True


class ProductionConfig(Config):
    """生产环境配置"""
    DEBUG = False


class TestingConfig(Config):
    """测试环境配置"""
    TESTING = True
    DEBUG = True


# 配置字典
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
