package main

import (
	"fmt"
	"jobsync-backend/config"
	"jobsync-backend/handlers"
	"jobsync-backend/middleware"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// 1. Load .env
	godotenv.Load()

	// 2. Koneksi Database via Config
	db := config.ConnectDB()
	defer db.Close()
	handlers.DB = db

	// 3. Setup Router
	r := gin.Default()

	// Middleware CORS (Pindahkan ke file tersendiri nanti jika ingin lebih rapi)
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	v1 := r.Group("/api/v1")
	v1.Use(middleware.AuthMiddleware())
	{
		// Applications
		v1.POST("/applications", handlers.CreateApplication)
		v1.GET("/applications", handlers.GetApplications)
		v1.DELETE("/applications/:id", handlers.DeleteApplication)
		v1.PUT("/applications/:id/status", handlers.UpdateApplicationStatus)

		// Interviews
		v1.POST("/interviews", handlers.CreateInterview)
		v1.GET("/interviews", handlers.GetInterviews)
		v1.PUT("/interviews/:id", handlers.UpdateInterview)
		v1.DELETE("/interviews/:id", handlers.DeleteInterview)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("🚀 JobSync Backend running on port %s\n", port)
	r.Run(":" + port)
}
