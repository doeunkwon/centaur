package services

import (
	"centaur/models"
	"testing"

	"github.com/joho/godotenv"
)

func init() {
	// Load the .env file
	if err := godotenv.Load("../.env"); err != nil {
		panic("Error loading .env file")
	}
}

func TestGenerateAnswer(t *testing.T) {
	service := NewAnswerService()

	testCases := []struct {
		name           string
		question       models.Question
		expectedChoice string
	}{
		{
			name: "Simple Math",
			question: models.Question{
				Content: "What is 2+2? Please select the mathematically correct answer.",
				Choices: []string{"4", "5", "10", "15"},
			},
			expectedChoice: "4",
		},
		{
			name: "Basic Color",
			question: models.Question{
				Content: "What color is a ripe banana?",
				Choices: []string{"Green", "Yellow", "Red", "Blue"},
			},
			expectedChoice: "Yellow",
		},
		{
			name: "Capital City",
			question: models.Question{
				Content: "What is the capital of France?",
				Choices: []string{"London", "Berlin", "Paris", "Madrid"},
			},
			expectedChoice: "Paris",
		},
		{
			name: "Scientific Fact",
			question: models.Question{
				Content: "What is the closest planet to the Sun?",
				Choices: []string{"Venus", "Earth", "Mercury", "Mars"},
			},
			expectedChoice: "Mercury",
		},
		{
			name: "Multiple Choice with Long Options",
			question: models.Question{
				Content: "Which of these is a mammal?",
				Choices: []string{
					"A snake that gives live birth",
					"A whale that breathes air and produces milk",
					"A salamander that lives on land",
					"A penguin that feeds its babies",
				},
			},
			expectedChoice: "A whale that breathes air and produces milk",
		},
		{
			name: "Basic Grammar",
			question: models.Question{
				Content: "Which is the correct spelling?",
				Choices: []string{"recieve", "receive", "receeve", "receve"},
			},
			expectedChoice: "receive",
		},
		{
			name: "Numeric Range",
			question: models.Question{
				Content: "What is 10% of 100?",
				Choices: []string{"1", "5", "10", "20"},
			},
			expectedChoice: "10",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			result := service.generateAnswer("gemma-2-9b", tc.question)

			// Verify result is one of the choices
			isValidChoice := false
			for _, choice := range tc.question.Choices {
				if result == choice {
					isValidChoice = true
					break
				}
			}

			if !isValidChoice {
				t.Errorf("Generated answer '%s' is not one of the provided choices: %v",
					result, tc.question.Choices)
			}

			// Verify the expected answer
			if result != tc.expectedChoice {
				t.Errorf("Expected '%s', got '%s'", tc.expectedChoice, result)
			}
		})
	}
}

func TestEvaluateAnswer(t *testing.T) {
	service := NewAnswerService()

	testCases := []struct {
		name          string
		question      models.Question
		userAnswer    string
		expectedScore bool
	}{
		{
			name: "Correct Answer",
			question: models.Question{
				Content: "What is 2+2?",
				Choices: []string{"4", "5", "6", "7"},
				Answer:  "4",
			},
			userAnswer:    "4",
			expectedScore: true,
		},
		{
			name: "Wrong Answer",
			question: models.Question{
				Content: "What is the capital of France?",
				Choices: []string{"London", "Paris", "Berlin", "Madrid"},
				Answer:  "Paris",
			},
			userAnswer:    "London",
			expectedScore: false,
		},
		{
			name: "Invalid Answer",
			question: models.Question{
				Content: "What is the capital of France?",
				Choices: []string{"London", "Paris", "Berlin", "Madrid"},
				Answer:  "Paris",
			},
			userAnswer:    "Tokyo",
			expectedScore: false,
		},
		{
			name: "Empty Answer",
			question: models.Question{
				Content: "What is the capital of France?",
				Choices: []string{"London", "Paris", "Berlin", "Madrid"},
				Answer:  "Paris",
			},
			userAnswer:    "",
			expectedScore: false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			score := service.evaluateAnswer(tc.question, tc.userAnswer)

			if score != tc.expectedScore {
				t.Errorf("Expected score %t, got %t", tc.expectedScore, score)
			}
		})
	}
}
