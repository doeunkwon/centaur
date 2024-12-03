package models

type SubmitAnswerRequest struct {
	HorseID    int    `json:"horseId"`
	QuestionID string `json:"questionId"`
	ModelValue string `json:"modelValue"`
}

type SubmitAnswerResponse struct {
	Approved bool   `json:"approved"`
	Answer   string `json:"answer"`
}
