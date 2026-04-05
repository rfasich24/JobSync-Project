package config

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func ConnectDB() *sql.DB {
	dbUrl := os.Getenv("SUPABASE_DB_URL")
	if dbUrl == "" {
		log.Fatal("SUPABASE_DB_URL tidak ditemukan di .env")
	}

	db, err := sql.Open("postgres", dbUrl)
	if err != nil {
		log.Fatal("❌ Gagal koneksi database:", err)
	}

	if err = db.Ping(); err != nil {
		log.Fatal("❌ Database tidak merespon:", err)
	}

	return db
}
