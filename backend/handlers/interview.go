package handlers

import (
	"jobsync-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreateInterview(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var intr models.Interview
	c.ShouldBindJSON(&intr)

	intr.UserID = userID.(string)
	query := `INSERT INTO interviews (application_id, user_id, interview_type, interview_date, location, notes) 
              VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`

	err := DB.QueryRow(query, intr.ApplicationID, intr.UserID, intr.InterviewType, intr.InterviewDate, intr.Location, intr.Notes).Scan(&intr.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, intr)
}

func GetInterviews(c *gin.Context) {
	userID, _ := c.Get("user_id")

	// Informatics Pro-Tip: Gunakan JOIN agar data PT & Posisi ikut terbawa
	query := `
		SELECT i.id, i.application_id, i.interview_type, i.interview_date, i.location, i.notes, 
		       a.company_name, a.position
		FROM interviews i
		JOIN applications a ON i.application_id = a.id
		WHERE i.user_id = $1 
		ORDER BY i.interview_date ASC`

	rows, err := DB.Query(query, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	// Kita pakai map dinamis agar bisa menampung data join tanpa merubah struct model
	results := []gin.H{}
	for rows.Next() {
		var i models.Interview
		var companyName, position string
		rows.Scan(&i.ID, &i.ApplicationID, &i.InterviewType, &i.InterviewDate, &i.Location, &i.Notes, &companyName, &position)

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
	userID, _ := c.Get("user_id")
	var input models.Interview
	c.ShouldBindJSON(&input)

	_, err := DB.Exec(`UPDATE interviews SET interview_date = $1, location = $2, notes = $3 
                       WHERE id = $4 AND user_id = $5`,
		input.InterviewDate, input.Location, input.Notes, id, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Jadwal updated"})
}

func DeleteInterview(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("user_id")
	DB.Exec("DELETE FROM interviews WHERE id = $1 AND user_id = $2", id, userID)
	c.JSON(http.StatusOK, gin.H{"message": "Jadwal deleted"})
}
