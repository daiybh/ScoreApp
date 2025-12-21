
import qiniu
import json
import requests
from config import Config

class QiniuService:
    """七牛云存储服务类"""

    def __init__(self):
        """初始化七牛云认证"""
        self.access_key = Config.QINIU_ACCESS_KEY
        self.secret_key = Config.QINIU_SECRET_KEY
        self.bucket_name = Config.QINIU_BUCKET_NAME
        self.domain = Config.QINIU_DOMAIN
        self.auth = qiniu.Auth(self.access_key, self.secret_key)

    def upload_data(self, key, data):
        """
        将数据上传到七牛云
        :param key: 文件名
        :param data: 要上传的数据
        :return: (ret, info) 上传结果
        """
        token = self.auth.upload_token(self.bucket_name, key, 3600)
        ret, info = qiniu.put_data(token, key, data)
        return ret, info

    def get_data(self, key):
        """
        从七牛云获取数据
        :param key: 文件名
        :return: 数据
        """
        base_url = f'http://{self.domain}/{key}'

        try:
            private_url = self.auth.private_download_url(base_url, expires=3600)
            print(private_url)
            
            response = requests.get(private_url)
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            print(f"从七牛云获取数据失败: {e}")
            return None

    def list_files(self, prefix=None):
        """
        列出七牛云中所有匹配的文件
        :param prefix: 前缀
        :return: 文件列表
        """
        bucket_manager = qiniu.BucketManager(self.auth)
        ret, eof, info = bucket_manager.list(self.bucket_name, prefix=prefix)
        return ret.get('items', []) if ret else []
