package main

import (
	"fmt"
	"log"
	"net/http"

	"scoreapp/internal/api"
	"scoreapp/internal/config"
)

func main() {
	// 加载配置
	cfg := config.LoadConfig()

	// 创建API处理器
	handlers := api.NewHandlers(cfg)

	// 设置路由
	router := handlers.SetupRoutes()

	// 启动HTTP服务器
	addr := fmt.Sprintf("%s:%d", cfg.Host, cfg.Port)
	log.Printf("服务器启动在 %s", addr)

	if err := http.ListenAndServe(addr, router); err != nil {
		log.Fatalf("服务器启动失败: %v", err)
	}
}
