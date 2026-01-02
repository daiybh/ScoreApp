package api

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"scoreapp/internal/config"
	"scoreapp/internal/service"

	"github.com/gin-gonic/gin"
)

// ScoreRequest 成绩请求结构体
type ScoreRequest struct {
	Name        string `json:"name" binding:"required"`
	Score       string `json:"score" binding:"required"`
	MaxScore    string `json:"maxScore"`
	AvgScore    string `json:"avgScore"`
	HighScore   string `json:"highScore"`
	Rank        string `json:"rank"`
	Subject     string `json:"subject" binding:"required"`
	ExamContent string `json:"examContent"`
	ExamTime    string `json:"exam_time" binding:"required"`
}

// ScoreResponse 成绩响应结构体
type ScoreResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Key     string      `json:"key,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}

// Handlers API处理器
type Handlers struct {
	qiniuService *service.QiniuService
	cfg          *config.Config
}

// NewHandlers 创建API处理器实例
func NewHandlers(cfg *config.Config) *Handlers {
	return &Handlers{
		qiniuService: service.NewQiniuService(cfg),
		cfg:          cfg,
	}
}

// AddScore 添加成绩
func (h *Handlers) AddScore(c *gin.Context) {
	var req ScoreRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ScoreResponse{
			Success: false,
			Message: "缺少必要参数: " + err.Error(),
		})
		return
	}

	// 解析考试时间
	examTime, err := time.Parse("2006-01-02", req.ExamTime)
	if err != nil {
		c.JSON(http.StatusBadRequest, ScoreResponse{
			Success: false,
			Message: "日期格式不正确，请使用YYYY-MM-DD",
		})
		return
	}

	// 构建文件名: 姓名/科目/考试时间.json
	key := fmt.Sprintf("%s/%s/%s.json", req.Name, req.Subject, examTime.Format("20060102"))
	log.Printf("上传成绩数据到: %s", key)

	// 将请求数据转换为JSON
	data, err := json.Marshal(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ScoreResponse{
			Success: false,
			Message: "序列化数据失败: " + err.Error(),
		})
		return
	}

	// 上传到七牛云
	success, err := h.qiniuService.UploadData(key, data)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ScoreResponse{
			Success: false,
			Message: "上传失败: " + err.Error(),
		})
		return
	}

	if success {
		c.JSON(http.StatusOK, ScoreResponse{
			Success: true,
			Message: "成绩上传成功",
			Key:     key,
		})
	} else {
		c.JSON(http.StatusInternalServerError, ScoreResponse{
			Success: false,
			Message: "上传失败",
		})
	}
}

// GetScores 获取成绩
func (h *Handlers) GetScores(c *gin.Context) {
	name := c.Query("name")
	subject := c.Query("subject")

	if name == "" {
		c.JSON(http.StatusBadRequest, ScoreResponse{
			Success: false,
			Message: "缺少姓名参数",
		})
		return
	}

	// 构建前缀用于搜索
	prefix := fmt.Sprintf("%s/", name)
	if subject != "" {
		prefix += fmt.Sprintf("%s/", subject)
	}

	log.Printf("列出前缀为 %s 的文件", prefix)

	// 获取所有匹配的文件
	items, err := h.qiniuService.ListFiles(prefix)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ScoreResponse{
			Success: false,
			Message: "获取文件列表失败: " + err.Error(),
		})
		return
	}

	log.Printf("找到 %d 个文件", len(items))

	// 获取每个文件的数据
	var scores []interface{}
	for _, item := range items {
		key, ok := item["key"].(string)
		if !ok {
			continue
		}

		scoreData, err := h.qiniuService.GetData(key)
		if err != nil {
			log.Printf("获取文件 %s 数据失败: %v", key, err)
			continue
		}

		scores = append(scores, scoreData)
	}

	c.JSON(http.StatusOK, ScoreResponse{
		Success: true,
		Data:    scores,
	})
}

// HealthCheck 健康检查
func (h *Handlers) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"message": "服务运行正常",
	})
}

// SetupRoutes 设置路由
func (h *Handlers) SetupRoutes() *gin.Engine {
	// 根据环境设置Gin模式
	if h.cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	r := gin.Default()

	// 添加CORS中间件
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	})

	// API路由组 - 放在静态文件路由之前，避免路由冲突
	api := r.Group("/api")
	{
		api.GET("/health", h.HealthCheck)
		api.GET("/scores", h.GetScores)
		api.POST("/scores", h.AddScore)
	}

	// 静态文件服务 - 使用 /www 前缀，避免与API路由冲突
	r.Static("/www", "./www")

	// 添加首页路由，避免根路径冲突
	r.GET("/", func(c *gin.Context) {
		c.File("./www/index.html")
	})

	// 添加404处理
	r.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, ScoreResponse{
			Success: false,
			Message: "资源不存在",
		})
	})

	return r
}
