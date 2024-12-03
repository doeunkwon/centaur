package main

import (
	"log"
	"net/http"
	"os"

	"centaur/handlers"
	"centaur/services"

	"github.com/gorilla/mux"
)

func main() {
	// Initialize services
	answerService := services.NewAnswerService()

	// Initialize handlers
	answerHandler := handlers.NewAnswerHandler(answerService)
	wsHandler := handlers.NewWebSocketHandler()

	// Setup router
	r := mux.NewRouter()
	r.Use(mux.CORSMethodMiddleware(r))

	// Register routes
	r.HandleFunc("/api/submit-answer", answerHandler.SubmitAnswer).Methods("POST", "OPTIONS")
	r.HandleFunc("/ws", wsHandler.HandleWebSocket)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
