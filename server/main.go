package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"golang.org/x/exp/rand"
)

type SubmitAnswerRequest struct {
	HorseID    int    `json:"horseId"`
	QuestionID string `json:"questionId"`
	ModelValue string `json:"modelValue"`
}

type SubmitAnswerResponse struct {
	Approved bool   `json:"approved"`
	Answer   string `json:"answer"`
}

var (
	clients    = make(map[*websocket.Conn]bool)
	clientsMux sync.RWMutex
	upgrader   = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
)

func submitAnswer(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var req SubmitAnswerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Error decoding request: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	log.Printf("Received answer submission: horseId=%d, questionId=%s, model=%s",
		req.HorseID, req.QuestionID, req.ModelValue)

	// Simulate processing time
	time.Sleep(time.Duration(rand.Intn(3)+2) * time.Second)

	answer := generateAnswer(req.ModelValue, req.QuestionID)
	approved := evaluateAnswer(answer)

	response := SubmitAnswerResponse{
		Approved: approved,
		Answer:   answer,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func generateAnswer(model string, questionID string) string {
	// TODO: Implement actual CLōD API call
	return fmt.Sprintf("Sample answer from model %s for question %s", model, questionID)
}

func evaluateAnswer(_ string) bool {
	return time.Now().UnixNano()%2 == 0 // Random approval for now
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}

	clientsMux.Lock()
	clients[conn] = true
	clientsMux.Unlock()

	defer func() {
		clientsMux.Lock()
		delete(clients, conn)
		clientsMux.Unlock()
		conn.Close()
	}()

	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			break
		}
	}
}

func main() {
	r := mux.NewRouter()
	r.Use(mux.CORSMethodMiddleware(r))

	r.HandleFunc("/api/submit-answer", submitAnswer).Methods("POST", "OPTIONS")
	r.HandleFunc("/ws", handleWebSocket)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
