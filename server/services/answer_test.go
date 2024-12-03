package services

import (
	"os"
	"testing"

	"github.com/joho/godotenv"
)

func TestMain(m *testing.M) {
	// Load environment variables from .env file
	if err := godotenv.Load("../.env"); err != nil {
		// Try loading from parent directory if current directory fails
		if err := godotenv.Load("../../.env"); err != nil {
			// Log but don't fail - env vars might be set directly
			// in the environment (e.g., in CI/CD)
		}
	}
	os.Exit(m.Run())
}

func TestAnswerService_GenerateAnswer(t *testing.T) {
	service := NewAnswerService()

	tests := []struct {
		name      string
		model     string
		question  string
		wantError bool
	}{
		{
			name:      "valid model and question",
			model:     "clod-3",
			question:  "What is the capital of France?",
			wantError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			answer := service.generateAnswer(tt.model, tt.question)

			if tt.wantError {
				if !isErrorResponse(answer) {
					t.Errorf("expected error response, got: %s", answer)
				}
			} else {
				if isErrorResponse(answer) {
					t.Errorf("expected valid answer, got error: %s", answer)
				}
				if len(answer) == 0 {
					t.Error("expected non-empty answer")
				}
			}
		})
	}
}

func TestAnswerService_EvaluateAnswer(t *testing.T) {
	service := NewAnswerService()

	tests := []struct {
		name     string
		question string
		answer   string
		want     bool
	}{
		{
			name:     "valid answer",
			question: "What is 2+2?",
			answer:   "4",
			want:     true,
		},
		{
			name:     "invalid answer",
			question: "What is 2+2?",
			answer:   "The sky is blue",
			want:     false,
		},
		{
			name:     "empty answer",
			question: "What is 2+2?",
			answer:   "",
			want:     false,
		},
		{
			name:     "error message answer",
			question: "What is 2+2?",
			answer:   "Error generating answer",
			want:     false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := service.evaluateAnswer(tt.question, tt.answer)
			if got != tt.want {
				t.Errorf("evaluateAnswer() = %v, want %v", got, tt.want)
			}
		})
	}
}

// Helper function to check if the response is an error message
func isErrorResponse(answer string) bool {
	errorResponses := []string{
		"Error generating answer",
		"Error: API key not configured",
		"Error:",
	}

	for _, errMsg := range errorResponses {
		if answer == errMsg {
			return true
		}
	}
	return false
}
