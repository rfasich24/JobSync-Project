package middleware

import (
	"fmt"
	"net/http"
	"os" // Tambahkan ini
	"strings"

	"github.com/MicahParks/keyfunc/v3"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware() gin.HandlerFunc {
	// AMBIL DARI .env (Ganti baris jwksURL lamamu)
	jwksURL := os.Getenv("JWKS_URL")
	if jwksURL == "" {
		panic("JWKS_URL tidak ditemukan di .env")
	}

	k, err := keyfunc.NewDefault([]string{jwksURL})
	if err != nil {
		panic(fmt.Sprintf("Gagal inisialisasi kunci: %v", err))
	}

	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Butuh token login!"})
			c.Abort()
			return
		}

		tokenString := strings.Replace(authHeader, "Bearer ", "", 1)
		token, err := jwt.Parse(tokenString, k.Keyfunc)

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token tidak valid"})
			c.Abort()
			return
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			c.Set("user_id", claims["sub"])
		}
		c.Next()
	}
}
