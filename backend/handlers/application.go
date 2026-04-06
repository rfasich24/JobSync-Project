package handlers

import (
	"database/sql"
	"fmt"
	"jobsync-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

var DB *sql.DB // Shared DB instance

func CreateApplication(c *gin.Context) {
	// Proteksi Tipe Data
	rawUserID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID tidak ditemukan"})
		return
	}

	// Memaksa interface{} menjadi string
	userID, ok := rawUserID.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Format User ID salah"})
		return
	}

	var app models.Application
	if err := c.ShouldBindJSON(&app); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid"})
		return
	}

	app.UserID = userID
	query := `INSERT INTO applications (user_id, company_name, position, status, notes) 
              VALUES ($1, $2, $3, $4, $5) RETURNING id, applied_at`

	err := DB.QueryRow(query, app.UserID, app.CompanyName, app.Position, app.Status, app.Notes).
		Scan(&app.ID, &app.AppliedAt)

	if err != nil {
		fmt.Printf("DB Error: %v\n", err) // Log error untuk debugging di terminal
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan ke database"})
		return
	}
	c.JSON(http.StatusCreated, app)
}

func GetApplications(c *gin.Context) {
	// Proteksi Ekstraksi Tipe
	rawUserID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID tidak ditemukan"})
		return
	}

	// Convert ke string (Ini krusial untuk Postgres)
	userID, ok := rawUserID.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Format User ID salah"})
		return
	}

	rows, err := DB.Query("SELECT id, company_name, position, status, applied_at, notes FROM applications WHERE user_id = $1", userID)
	if err != nil {
		fmt.Printf("Query Error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data dari database"})
		return
	}
	defer rows.Close()

	apps := []models.Application{}
	for rows.Next() {
		var app models.Application

		// Menangani Nilai NULL pada Notes dan string lainnya
		var notes sql.NullString

		err := rows.Scan(&app.ID, &app.CompanyName, &app.Position, &app.Status, &app.AppliedAt, &notes)
		if err != nil {
			fmt.Printf("Scan Error: %v\n", err)
			continue // Lewati baris yang error, jangan biarkan seluruh aplikasi crash
		}

		// Konversi NullString ke string biasa
		if notes.Valid {
			app.Notes = notes.String
		}

		apps = append(apps, app)
	}

	c.JSON(http.StatusOK, apps)
}

func UpdateApplicationStatus(c *gin.Context) {
	id := c.Param("id")

	rawUserID, _ := c.Get("user_id")
	userID, _ := rawUserID.(string)

	var input struct {
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data status tidak valid"})
		return
	}

	_, err := DB.Exec("UPDATE applications SET status = $1 WHERE id = $2 AND user_id = $3", input.Status, id, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update status"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Status updated"})
}

func DeleteApplication(c *gin.Context) {
	id := c.Param("id")
	rawUserID, _ := c.Get("user_id")
	userID, _ := rawUserID.(string)

	_, err := DB.Exec("DELETE FROM applications WHERE id = $1 AND user_id = $2", id, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal hapus data"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Data deleted"})
}
