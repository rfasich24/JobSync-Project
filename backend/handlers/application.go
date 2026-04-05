package handlers

import (
	"database/sql"
	"jobsync-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

var DB *sql.DB // Shared DB instance

func CreateApplication(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var app models.Application
	if err := c.ShouldBindJSON(&app); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak lengkap"})
		return
	}

	app.UserID = userID.(string)
	query := `INSERT INTO applications (user_id, company_name, position, status, notes) 
              VALUES ($1, $2, $3, $4, $5) RETURNING id, applied_at`

	err := DB.QueryRow(query, app.UserID, app.CompanyName, app.Position, app.Status, app.Notes).
		Scan(&app.ID, &app.AppliedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, app)
}

func GetApplications(c *gin.Context) {
	userID, _ := c.Get("user_id")
	rows, err := DB.Query("SELECT id, company_name, position, status, applied_at, notes FROM applications WHERE user_id = $1", userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	apps := []models.Application{}
	for rows.Next() {
		var app models.Application
		rows.Scan(&app.ID, &app.CompanyName, &app.Position, &app.Status, &app.AppliedAt, &app.Notes)
		apps = append(apps, app)
	}
	c.JSON(http.StatusOK, apps)
}

func UpdateApplicationStatus(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("user_id")
	var input struct {
		Status string `json:"status"`
	}
	c.ShouldBindJSON(&input)

	_, err := DB.Exec("UPDATE applications SET status = $1 WHERE id = $2 AND user_id = $3", input.Status, id, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update status"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Status updated"})
}

func DeleteApplication(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("user_id")
	_, err := DB.Exec("DELETE FROM applications WHERE id = $1 AND user_id = $2", id, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal hapus data"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Data deleted"})
}
