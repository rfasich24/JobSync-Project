package models

import "time"

type Application struct {
	ID          string    `json:"id"`
	UserID      string    `json:"user_id"`
	CompanyName string    `json:"company_name" binding:"required"`
	Position    string    `json:"position" binding:"required"`
	Status      string    `json:"status"`
	AppliedAt   time.Time `json:"applied_at"`
	Notes       string    `json:"notes"`
}

type Interview struct {
	ID            string    `json:"id"`
	ApplicationID string    `json:"application_id"`
	UserID        string    `json:"user_id"`
	InterviewType string    `json:"interview_type"`
	InterviewDate time.Time `json:"interview_date"`
	Location      string    `json:"location"`
	Notes         string    `json:"notes"`
	CreatedAt     time.Time `json:"created_at"`
}
