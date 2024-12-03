package services

import (
	"fmt"
	"time"

	"centaur/models"

	"golang.org/x/exp/rand"
)

type AnswerService struct{}

func NewAnswerService() *AnswerService {
	return &AnswerService{}
}

func (s *AnswerService) ProcessAnswer(req models.SubmitAnswerRequest) models.SubmitAnswerResponse {
	// Simulate processing time
	time.Sleep(time.Duration(rand.Intn(3)+2) * time.Second)

	answer := s.generateAnswer(req.ModelValue, req.QuestionID)
	approved := s.evaluateAnswer(answer)

	return models.SubmitAnswerResponse{
		Approved: approved,
		Answer:   answer,
	}
}

func (s *AnswerService) generateAnswer(model string, question string) string {
	// TODO: Implement actual CLōD API call
	return fmt.Sprintf("Sample answer from model %s for question %s", model, question)
}

func (s *AnswerService) evaluateAnswer(_ string) bool {
	return time.Now().UnixNano()%2 == 0 // Random approval for now
}
