package handlers

import (
	"database/sql"
	"fmt"
	"jobsync-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreateInterview(c *gin.Context) {
	rawUserID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID tidak ditemukan"})
		return
	}
	userID, _ := rawUserID.(string)

	var intr models.Interview
	if err := c.ShouldBindJSON(&intr); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid"})
		return
	}

	intr.UserID = userID
	query := `INSERT INTO interviews (application_id, user_id, interview_type, interview_date, location, notes) 
              VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`

	err := DB.QueryRow(query, intr.ApplicationID, intr.UserID, intr.InterviewType, intr.InterviewDate, intr.Location, intr.Notes).Scan(&intr.ID)
	if err != nil {
		fmt.Printf("DB Insert Error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan jadwal"})
		return
	}
	c.JSON(http.StatusCreated, intr)
}

func GetInterviews(c *gin.Context) {
	rawUserID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID tidak ditemukan"})
		return
	}
	userID, _ := rawUserID.(string)

	query := `
        SELECT i.id, i.application_id, i.interview_type, i.interview_date, i.location, i.notes, 
               a.company_name, a.position
        FROM interviews i
        JOIN applications a ON i.application_id = a.id
        WHERE i.user_id = $1 
        ORDER BY i.interview_date ASC`

	rows, err := DB.Query(query, userID)
	if err != nil {
		fmt.Printf("Query Error Interviews: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data jadwal"})
		return
	}
	defer rows.Close()

	results := []gin.H{}
	for rows.Next() {
		var i models.Interview
		var companyName, position string

		// Proteksi: Gunakan NullString untuk kolom yang mungkin kosong (NULL)
		var location, notes sql.NullString

		err := rows.Scan(
			&i.ID, &i.ApplicationID, &i.InterviewType, &i.InterviewDate,
			&location, &notes, &companyName, &position,
		)
		if err != nil {
			fmt.Printf("Scan Error Interviews: %v\n", err)
			continue // Kalau ada 1 baris yang rusak, abaikan, lanjut ke baris data berikutnya
		}

		// Masukkan nilai yang sudah aman ke struct
		if location.Valid {
			i.Location = location.String
		}
		if notes.Valid {
			i.Notes = notes.String
		}

		results = append(results, gin.H{
			"interview":    i,
			"company_name": companyName,
			"position":     position,
		})
	}
	c.JSON(http.StatusOK, results)
}

func UpdateInterview(c *gin.Context) {
	id := c.Param("id")
	rawUserID, _ := c.Get("user_id")
	userID, _ := rawUserID.(string)

	var input models.Interview
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data input tidak valid"})
		return
	}

	_, err := DB.Exec(`UPDATE interviews SET interview_date = $1, location = $2, notes = $3 
                       WHERE id = $4 AND user_id = $5`,
		input.InterviewDate, input.Location, input.Notes, id, userID)
	if err != nil {
		fmt.Printf("Update Error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update jadwal"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Jadwal updated"})
}

func DeleteInterview(c *gin.Context) {
	id := c.Param("id")
	rawUserID, _ := c.Get("user_id")
	userID, _ := rawUserID.(string)

	_, err := DB.Exec("DELETE FROM interviews WHERE id = $1 AND user_id = $2", id, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus jadwal"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Jadwal deleted"})
}
