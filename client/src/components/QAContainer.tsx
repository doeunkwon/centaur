import { Box, Paper, Stack, styled } from "@mui/material";
import { Answer, Question, Horse } from "../types";

const QAContainerStyled = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(3),
  maxWidth: "lg",
}));

interface QAContainerProps {
  questions: Question[];
  answers: Answer[];
  horses: Horse[];
}

const QAContainer: React.FC<QAContainerProps> = ({
  questions,
  answers,
  horses,
}) => (
  <QAContainerStyled elevation={3}>
    <Stack spacing={2}>
      {questions.map((question, index) => {
        const questionAnswers = answers.filter(
          (a) => a.questionId === question.id
        );
        return (
          <Box key={question.id}>
            <Box sx={{ fontWeight: "bold", mb: 1 }}>
              Question {index + 1}: {question.content}
            </Box>
            {questionAnswers.length > 0 ? (
              questionAnswers.map((answer) => (
                <Box key={answer.id} sx={{ pl: 2, color: "text.secondary" }}>
                  <span
                    style={{
                      color: horses.find((horse) => horse.id === answer.horseId)
                        ?.color,
                    }}
                  >
                    {horses.find((horse) => horse.id === answer.horseId)
                      ?.name || "Unknown Horse"}
                    : {answer.content}
                  </span>
                </Box>
              ))
            ) : (
              <Box sx={{ pl: 2, color: "text.secondary" }}>No answers yet.</Box>
            )}
          </Box>
        );
      })}
    </Stack>
  </QAContainerStyled>
);

export default QAContainer;
