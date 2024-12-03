package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"golang.org/x/exp/rand"
)

type GameState struct {
	Questions []Question `json:"questions"`
	Answers   []Answer   `json:"answers"`
	Horses    []Horse    `json:"horses"`
}

type Question struct {
	ID     string `json:"id"`
	Text   string `json:"text"`
	Column int    `json:"column"`
}

type Answer struct {
	ID         string `json:"id"`
	QuestionID string `json:"questionId"`
	HorseID    int    `json:"horseId"`
	Content    string `json:"content"`
	Status     string `json:"status"`
	Timestamp  string `json:"timestamp"`
}

type Horse struct {
	ID         int    `json:"id"`
	Emoji      string `json:"emoji"`
	Position   int    `json:"position"`
	Name       string `json:"name"`
	ModelValue string `json:"modelValue"`
}

type SubmitAnswerRequest struct {
	HorseID    int    `json:"horseId"`
	QuestionID string `json:"questionId"`
	ModelValue string `json:"modelValue"`
}

type UpdateHorseRequest struct {
	HorseID    int    `json:"horseId"`
	Name       string `json:"name"`
	ModelValue string `json:"modelValue"`
}

var (
	gameState  GameState
	stateMux   sync.RWMutex
	clients    = make(map[*websocket.Conn]bool)
	clientsMux sync.RWMutex
	upgrader   = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
)

func initializeGameState() {
	questions := []Question{
		{ID: uuid.NewString(), Text: "Explain quantum computing in simple terms", Column: 0},
		{ID: uuid.NewString(), Text: "What is the meaning of life?", Column: 1},
		{ID: uuid.NewString(), Text: "How does photosynthesis work?", Column: 2},
		{ID: uuid.NewString(), Text: "Explain blockchain technology", Column: 3},
		{ID: uuid.NewString(), Text: "What causes northern lights?", Column: 4},
		{ID: uuid.NewString(), Text: "How do black holes work?", Column: 5},
		{ID: uuid.NewString(), Text: "Explain how vaccines work", Column: 6},
		{ID: uuid.NewString(), Text: "What is dark matter?", Column: 7},
		{ID: uuid.NewString(), Text: "How does AI learning work?", Column: 8},
		{ID: uuid.NewString(), Text: "Explain string theory", Column: 9},
	}

	horses := []Horse{
		{ID: 1, Emoji: "🐎", Position: 0, Name: "", ModelValue: ""},
		{ID: 2, Emoji: "🦄", Position: 0, Name: "", ModelValue: ""},
		{ID: 3, Emoji: "🎠", Position: 0, Name: "", ModelValue: ""},
		{ID: 4, Emoji: "🏇", Position: 0, Name: "", ModelValue: ""},
	}

	stateMux.Lock()
	gameState = GameState{
		Questions: questions,
		Answers:   []Answer{},
		Horses:    horses,
	}
	stateMux.Unlock()
}

func getGameState(w http.ResponseWriter, r *http.Request) {
	stateMux.RLock()
	defer stateMux.RUnlock()

	// Add CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// Set content type before writing response
	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(gameState); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func submitAnswer(w http.ResponseWriter, r *http.Request) {
	// Add CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// Handle preflight OPTIONS request
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var req SubmitAnswerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Process the answer asynchronously
	go processAnswer(req)

	w.WriteHeader(http.StatusAccepted)
}

func processAnswer(req SubmitAnswerRequest) {
	// Create a new answer
	answer := Answer{
		ID:         uuid.NewString(),
		QuestionID: req.QuestionID,
		HorseID:    req.HorseID,
		Content:    generateAnswer(req.ModelValue, req.QuestionID),
		Status:     "pending",
		Timestamp:  time.Now().UTC().Format(time.RFC3339),
	}

	// Simulate judge evaluation
	time.Sleep(time.Duration(rand.Intn(6)+3) * time.Second)
	approved := evaluateAnswer(answer.Content)

	stateMux.Lock()
	// Update horse position while preserving name and model value
	for i, horse := range gameState.Horses {
		if horse.ID == req.HorseID {
			if approved {
				if gameState.Horses[i].Position < 9 {
					gameState.Horses[i].Position++
				}
			} else {
				if gameState.Horses[i].Position > 0 {
					gameState.Horses[i].Position--
				}
			}
			// Preserve the existing name and model value
			gameState.Horses[i].Name = horse.Name
			gameState.Horses[i].ModelValue = horse.ModelValue
			break
		}
	}

	// Update answer status and append to answers
	answer.Status = map[bool]string{true: "approved", false: "rejected"}[approved]
	gameState.Answers = append(gameState.Answers, answer)

	currentState := gameState
	stateMux.Unlock()

	broadcastGameState(currentState)
}

func generateAnswer(model string, questionID string) string {
	// TODO: Implement actual CLōD API call
	return fmt.Sprintf("Sample answer from model %s for question %s", model, questionID)
}

func evaluateAnswer(_ string) bool {
	// TODO: Implement actual judge LLM evaluation
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

	// Keep connection alive
	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			break
		}
	}
}

func broadcastGameState(state GameState) {
	clientsMux.RLock()
	defer clientsMux.RUnlock()

	for client := range clients {
		if err := client.WriteJSON(state); err != nil {
			log.Printf("Failed to send message: %v", err)
			client.Close()
			delete(clients, client)
		}
	}
}

func updateHorse(w http.ResponseWriter, r *http.Request) {
	// Add CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var req UpdateHorseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	stateMux.Lock()
	for i, horse := range gameState.Horses {
		if horse.ID == req.HorseID {
			gameState.Horses[i].Name = req.Name
			gameState.Horses[i].ModelValue = req.ModelValue
			break
		}
	}
	currentState := gameState
	stateMux.Unlock()

	broadcastGameState(currentState)
	w.WriteHeader(http.StatusOK)
}

func main() {
	r := mux.NewRouter()

	// Add middleware to handle CORS
	r.Use(mux.CORSMethodMiddleware(r))

	// REST endpoints
	r.HandleFunc("/api/game-state", getGameState).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/submit-answer", submitAnswer).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/update-horse", updateHorse).Methods("POST", "OPTIONS")

	// WebSocket endpoint
	r.HandleFunc("/ws", handleWebSocket)

	// Initialize game state with questions
	initializeGameState()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
