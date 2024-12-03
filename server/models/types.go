package models

type SubmitAnswerRequest struct {
	HorseID    int    `json:"horseId"`
	Question   string `json:"question"`
	ModelValue string `json:"modelValue"`
}

type SubmitAnswerResponse struct {
	Approved bool   `json:"approved"`
	Answer   string `json:"answer"`
}
