package services

import (
	"bytes"
	"centaur/models"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
)

type AnswerService struct{}

func NewAnswerService() *AnswerService {
	return &AnswerService{}
}

func (s *AnswerService) ProcessAnswer(req models.SubmitAnswerRequest) models.SubmitAnswerResponse {

	answer := s.generateAnswer(req.ModelValue, req.Question)
	approved := s.evaluateAnswer(req.Question, answer)

	return models.SubmitAnswerResponse{
		Approved: approved,
		Answer:   answer,
	}
}

func (s *AnswerService) generateAnswer(model string, question string) string {
	apiKey := os.Getenv("CLOD_API_KEY")
	if apiKey == "" {
		log.Println("Error: CLOD_API_KEY environment variable not set")
		return "Error: API key not configured"
	}

	url := "https://api.clod.io/v1/chat/completions"

	// Prepare the request payload
	payload := map[string]interface{}{
		"model": model,
		"messages": []map[string]string{
			{"role": "system", "content": "Please provide concise answers in about 300 characters."},
			{"role": "user", "content": question},
		},
		"max_tokens": 80,
	}
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		log.Println("Error marshalling payload:", err)
		return "Error generating answer"
	}

	// Create a new HTTP request
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(payloadBytes))
	if err != nil {
		log.Println("Error creating request:", err)
		return "Error generating answer"
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	// Make the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Error making request to %s: %v\n", req.URL, err)
		return "Error generating answer"
	}
	defer resp.Body.Close()
	log.Printf("Request to %s successful, status code: %d\n", req.URL, resp.StatusCode)

	// Read the response
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Println("Error reading response:", err)
		return "Error generating answer"
	}

	// Parse the response
	var response map[string]interface{}
	if err := json.Unmarshal(body, &response); err != nil {
		log.Println("Error unmarshalling response:", err)
		return "Error generating answer"
	}

	// Extract the answer from the response
	if choices, ok := response["choices"].([]interface{}); ok && len(choices) > 0 {
		if choice, ok := choices[0].(map[string]interface{}); ok {
			if message, ok := choice["message"].(map[string]interface{}); ok {
				if content, ok := message["content"].(string); ok {
					return content
				}
			}
		}
	}

	return "Error generating answer"
}

func (s *AnswerService) evaluateAnswer(question, answer string) bool {
	apiKey := os.Getenv("CLOD_API_KEY")
	if apiKey == "" {
		log.Println("Error: CLOD_API_KEY environment variable not set")
		return false
	}

	url := "https://api.clod.io/v1/chat/completions"

	// Prepare the evaluation prompt
	evaluationPrompt := fmt.Sprintf(
		"You are an answer evaluator. Evaluate if the following answer is appropriate for the question. "+
			"Respond with a JSON object containing a single boolean field 'isValid'. Set it to true if the answer is good, "+
			"or false if it's inappropriate, irrelevant, or contains errors.\n\n"+
			"Question: %s\nAnswer: %s\n\n"+
			"Respond only with valid JSON in this format: {\"isValid\": true} or {\"isValid\": false}",
		question, answer,
	)

	// Prepare the request payload
	payload := map[string]interface{}{
		"model": "gpt-4o",
		"messages": []map[string]string{
			{"role": "system", "content": "You must respond with valid JSON only."},
			{"role": "user", "content": evaluationPrompt},
		},
		"max_tokens": 20,
		"response_format": map[string]string{
			"type": "json_object",
		},
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		log.Println("Error marshalling evaluation payload:", err)
		return false
	}

	// Create a new HTTP request
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(payloadBytes))
	if err != nil {
		log.Println("Error creating evaluation request:", err)
		return false
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	// Make the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Error making evaluation request to %s: %v\n", req.URL, err)
		return false
	}
	defer resp.Body.Close()

	// Read the response
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Println("Error reading evaluation response:", err)
		return false
	}

	// Parse the response
	var response map[string]interface{}
	if err := json.Unmarshal(body, &response); err != nil {
		log.Println("Error unmarshalling API response:", err)
		return false
	}

	// Check if the response is empty
	if len(response) == 0 {
		log.Println("Error: Empty response from API")
		return false
	}

	// Extract and parse the evaluation result
	if choices, ok := response["choices"].([]interface{}); ok && len(choices) > 0 {
		if choice, ok := choices[0].(map[string]interface{}); ok {
			if message, ok := choice["message"].(map[string]interface{}); ok {
				if content, ok := message["content"].(string); ok {
					var result struct {
						IsValid bool `json:"isValid"`
					}
					if err := json.Unmarshal([]byte(content), &result); err != nil {
						log.Println("Error parsing evaluation result:", err)
						return false
					}
					return result.IsValid
				}
			}
		}
	}

	return false
}

// Use these for testing
// func (s *AnswerService) generateAnswer(model string, question string) string {
// 	time.Sleep(time.Duration(rand.Intn(3)+2) * time.Second)
// 	return fmt.Sprintf("Sample answer from model %s for question %s\n", model, question)
// }

// func (s *AnswerService) evaluateAnswer(_ string) bool {
// 	return time.Now().UnixNano()%2 == 0 // Random approval for now
// }
