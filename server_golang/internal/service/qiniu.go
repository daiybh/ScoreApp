package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"scoreapp/internal/config"

	"github.com/qiniu/go-sdk/v7/auth"
	"github.com/qiniu/go-sdk/v7/auth/qbox"
	"github.com/qiniu/go-sdk/v7/storage"
)

// QiniuService 七牛云存储服务
type QiniuService struct {
	cfg          *config.Config
	mac          *qbox.Mac
	credentials  *auth.Credentials
	bucket       string
	domain       string
	formUploader *storage.FormUploader
	putPolicy    storage.PutPolicy
}

// NewQiniuService 创建七牛云服务实例
func NewQiniuService(cfg *config.Config) *QiniuService {
	mac := qbox.NewMac(cfg.QiniuAccessKey, cfg.QiniuSecretKey)
	credentials := auth.New(cfg.QiniuAccessKey, cfg.QiniuSecretKey)

	// 配置上传参数
	cfgUp := storage.Config{
		Zone:          &storage.ZoneHuadong, // 华东区
		UseHTTPS:      true,
		UseCdnDomains: false,
	}

	// 构建表单上传的对象
	formUploader := storage.NewFormUploader(&cfgUp)

	// 设置上传策略
	putPolicy := storage.PutPolicy{
		Scope: cfg.QiniuBucket,
	}

	return &QiniuService{
		cfg:          cfg,
		mac:          mac,
		credentials:  credentials,
		bucket:       cfg.QiniuBucket,
		domain:       cfg.QiniuDomain,
		formUploader: formUploader,
		putPolicy:    putPolicy,
	}
}

// UploadData 上传数据到七牛云
func (s *QiniuService) UploadData(key string, data []byte) (bool, error) {
	// 生成上传token
	upToken := s.putPolicy.UploadToken(s.mac)

	// 设置上传的额外参数
	ret := storage.PutRet{}
	putExtra := storage.PutExtra{
		Params: map[string]string{
			"x:name": "score data",
		},
	}

	// 上传数据
	reader := bytes.NewReader(data)
	err := s.formUploader.Put(context.Background(), &ret, upToken, key, reader, int64(len(data)), &putExtra)
	if err != nil {
		log.Printf("上传失败: %v", err)
		return false, err
	}

	log.Printf("上传成功, key: %s, hash: %s", ret.Key, ret.Hash)
	return true, nil
}

// GetData 从七牛云获取数据
func (s *QiniuService) GetData(key string) (map[string]interface{}, error) {
	// 构建私有下载链接
	deadline := time.Now().Add(3600 * time.Second).Unix()
	privateURL := storage.MakePrivateURL(s.credentials, s.domain, key, deadline)

	log.Printf("获取数据的URL: %s", privateURL)

	// 发送HTTP请求获取数据
	resp, err := http.Get(privateURL)
	if err != nil {
		log.Printf("获取数据失败: %v", err)
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		err := fmt.Errorf("HTTP状态码: %d", resp.StatusCode)
		log.Printf("获取数据失败: %v", err)
		return nil, err
	}

	// 解析JSON数据
	var data map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		log.Printf("解析JSON失败: %v", err)
		return nil, err
	}

	return data, nil
}

// ListFiles 列出七牛云中所有匹配的文件
func (s *QiniuService) ListFiles(prefix string) ([]map[string]interface{}, error) {
	// 创建BucketManager实例
	bucketManager := storage.NewBucketManager(s.mac, nil)

	// 设置列出文件的前缀
	limit := 1000
	retItems, _, _, eof, err := bucketManager.ListFiles(s.bucket, prefix, "", "", limit)
	if err != nil {
		log.Printf("列出文件失败: %v", err)
		return nil, err
	}

	// 如果还有更多文件，继续获取
	if !eof {
		moreItems, _, _, moreEof, err := bucketManager.ListFiles(s.bucket, prefix, "", "", limit)
		if err != nil {
			log.Printf("列出更多文件失败: %v", err)
			return nil, err
		}
		retItems = append(retItems, moreItems...)
		eof = moreEof
	}

	// 转换为map数组
	var items []map[string]interface{}
	for _, item := range retItems {
		items = append(items, map[string]interface{}{
			"key":      item.Key,
			"hash":     item.Hash,
			"putTime":  item.PutTime,
			"fileSize": item.Fsize,
			"mimeType": item.MimeType,
		})
	}

	return items, nil
}
