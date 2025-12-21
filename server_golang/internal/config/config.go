package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config 应用配置结构体
type Config struct {
	// 七牛云配置
	QiniuAccessKey string
	QiniuSecretKey string
	QiniuBucket    string
	QiniuDomain    string

	// 应用配置
	Env   string
	Host  string
	Port  int
	Debug bool
}

// LoadConfig 加载配置
func LoadConfig() *Config {
	// 加载.env文件
	err := godotenv.Load()
	if err != nil {
		log.Println("无法加载.env文件:", err)
	}

	// 解析端口
	port, err := strconv.Atoi(getEnv("PORT", "8080"))
	if err != nil {
		log.Println("无效的端口号，使用默认值8080")
		port = 8080
	}

	// 解析调试模式
	debug, err := strconv.ParseBool(getEnv("DEBUG", "true"))
	if err != nil {
		log.Println("无效的DEBUG值，使用默认值true")
		debug = true
	}

	return &Config{
		QiniuAccessKey: getEnv("QINIU_ACCESS_KEY", "your_access_key"),
		QiniuSecretKey: getEnv("QINIU_SECRET_KEY", "your_secret_key"),
		QiniuBucket:    getEnv("QINIU_BUCKET_NAME", "your_bucket_name"),
		QiniuDomain:    getEnv("QINIU_DOMAIN", "your_domain"),
		Env:            getEnv("APP_ENV", "development"),
		Host:           getEnv("HOST", "0.0.0.0"),
		Port:           port,
		Debug:          debug,
	}
}

// getEnv 获取环境变量，如果不存在则返回默认值
func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
