package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"

	_ "github.com/jackc/pgx/v5/stdlib"
)

func main() {
	// Load file .env
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Ambil URL dari variabel lingkungan
	connStr := os.Getenv("DB_URL")

	// Membuka koneksi ke database PostgreSQL
	db, err := sql.Open("pgx", connStr)
	if err != nil {
		log.Fatalf("Gagal membuka database: %v", err)
	}
	defer db.Close()

	// Melakukan "Ping" untuk memastikan koneksi benar-benar tersambung
	err = db.Ping()
	if err != nil {
		log.Fatalf("Koneksi gagal! Cek password atau URL: %v", err)
	}

	// Jika berhasil sampai sini, berarti koneksi aman!
	fmt.Println("🚀 BINGO! Backend Golang berhasil terhubung ke Supabase!")
}
