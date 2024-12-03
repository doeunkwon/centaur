import { useState, useEffect } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  styled,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import { Answer, GameState, Horse, MODEL_OPTIONS, Question } from "./types";

// Create dark theme
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
    },
    background: {
      default: "#1a1a1a",
      paper: "#2d2d2d",
    },
  },
});

// Styled components using MUI's styled utility
const RaceTrack = styled(Paper)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(10, 80px)",
  gridTemplateRows: "repeat(4, 80px)",
  gap: 2,
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  marginBottom: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`,
}));

const HorseCell = styled(Box)(({ theme }) => ({
  width: 70,
  height: 70,
  backgroundColor: theme.palette.background.default,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.3s ease",
  border: `1px solid ${theme.palette.divider}`,
}));

const HorseContent = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 2,
});

const HorseName = styled(Box)({
  fontSize: "0.6em",
  maxWidth: 60,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

// Add this styled component after the other styled components
const QAContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(3),
  width: "100%",
  maxWidth: 1200,
}));

function App() {
  const [gameState, setGameState] = useState<GameState>({
    questions: [
      { id: "1", text: "Explain quantum computing in simple terms", column: 0 },
      { id: "2", text: "What is the meaning of life?", column: 1 },
      { id: "3", text: "How does photosynthesis work?", column: 2 },
      { id: "4", text: "Explain blockchain technology", column: 3 },
      { id: "5", text: "What causes northern lights?", column: 4 },
      { id: "6", text: "How do black holes work?", column: 5 },
      { id: "7", text: "Explain how vaccines work", column: 6 },
      { id: "8", text: "What is dark matter?", column: 7 },
      { id: "9", text: "How does AI learning work?", column: 8 },
      { id: "10", text: "Explain string theory", column: 9 },
    ] as Question[],
    answers: [] as Answer[],
    horses: [
      { id: 1, emoji: "🐎", position: 0, name: "", modelValue: "" },
      { id: 2, emoji: "🦄", position: 0, name: "", modelValue: "" },
      { id: 3, emoji: "🎠", position: 0, name: "", modelValue: "" },
      { id: 4, emoji: "🏇", position: 0, name: "", modelValue: "" },
    ] as Horse[],
    currentColumn: 0,
  });

  const [isRaceStarted, setIsRaceStarted] = useState(false);

  useEffect(() => {
    if (!isRaceStarted) return;

    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsHost =
      process.env.NODE_ENV === "development"
        ? "localhost:8080"
        : window.location.host;
    const ws = new WebSocket(`${wsProtocol}//${wsHost}/ws`);

    ws.onopen = () => console.log("WebSocket connected");
    ws.onerror = (error) => console.error("WebSocket error:", error);
    ws.onclose = () => console.log("WebSocket disconnected");

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [isRaceStarted]);

  useEffect(() => {
    if (!isRaceStarted) return;

    // Try to submit answers for all horses that aren't processing and haven't finished
    gameState.horses.forEach((horse) => {
      if (!horse.isProcessing && horse.position <= 9) {
        const currentQuestion = gameState.questions.find(
          (q) => q.column === horse.position
        );
        if (currentQuestion) {
          submitAnswer(horse.id, currentQuestion.id);
        }
      }
    });
  }, [isRaceStarted, gameState.horses]);

  const submitAnswer = async (horseId: number, questionId: string) => {
    const horse = gameState.horses.find((h) => h.id === horseId);

    if (!horse?.modelValue || horse.isProcessing) {
      console.log("Submission blocked:", {
        noModelValue: !horse?.modelValue,
        isProcessing: horse?.isProcessing,
      });
      return;
    }

    try {
      setGameState((prev) => ({
        ...prev,
        horses: prev.horses.map((h) =>
          h.id === horseId ? { ...h, isProcessing: true } : h
        ),
      }));

      const response = await fetch("/api/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          horseId,
          questionId,
          modelValue: horse.modelValue,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit answer");

      const result = await response.json();

      setGameState((prev) => {
        const newHorses = prev.horses.map((h) => {
          if (h.id === horseId) {
            const newPosition = result.approved
              ? Math.min(h.position + 1, 10)
              : Math.max(h.position - 1, 0);
            return { ...h, position: newPosition, isProcessing: false };
          }
          return h;
        });

        const newAnswer: Answer = {
          id: Date.now().toString(),
          questionId,
          horseId,
          content: result.answer,
          status: result.approved ? "approved" : "rejected",
          timestamp: new Date().toISOString(),
        };

        return {
          ...prev,
          horses: newHorses,
          answers: [...prev.answers, newAnswer],
        };
      });
    } catch (error) {
      console.error("Error submitting answer:", error);
      setGameState((prev) => ({
        ...prev,
        horses: prev.horses.map((h) =>
          h.id === horseId ? { ...h, isProcessing: false } : h
        ),
      }));
    }
  };

  const handleNameChange = async (horseId: number, newValue: string) => {
    // Check if model is already selected by another horse
    if (
      gameState.horses.some(
        (horse) => horse.id !== horseId && horse.modelValue === newValue
      )
    ) {
      return;
    }

    const selectedModel = MODEL_OPTIONS.find(
      (model) => model.value === newValue
    );

    if (selectedModel) {
      // Update local state only
      setGameState((prev) => ({
        ...prev,
        horses: prev.horses.map((h) =>
          h.id === horseId
            ? {
                ...h,
                name: selectedModel.name,
                modelValue: selectedModel.value,
              }
            : h
        ),
      }));
    }
  };

  const canStartRace = () => {
    return gameState.horses.every((horse) => horse.modelValue);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Stack spacing={3} alignItems="center">
          <RaceTrack elevation={3}>
            {/* Horses */}
            {gameState.horses?.map((horse) => (
              <HorseCell
                key={horse.id}
                sx={{
                  gridRow: horse.id + 1,
                  gridColumn: horse.position + 1,
                  opacity: horse.isProcessing ? 0.5 : 1,
                }}
              >
                <HorseContent>
                  <Box sx={{ fontSize: "2em" }}>{horse.emoji}</Box>
                  <HorseName>{horse.name || "Unnamed"}</HorseName>
                </HorseContent>
              </HorseCell>
            ))}
          </RaceTrack>

          {/* Controls */}
          <Stack
            direction="row"
            spacing={2}
            flexWrap="wrap"
            justifyContent="center"
            sx={{ maxWidth: 1200, gap: 2 }}
          >
            {gameState.horses?.map((horse) => (
              <Stack key={horse.id} spacing={2} alignItems="center">
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel id={`horse-${horse.id}-label`}>
                    Select Model
                  </InputLabel>
                  <Select
                    labelId={`horse-${horse.id}-label`}
                    value={horse.modelValue}
                    label="Select Model"
                    onChange={(e: SelectChangeEvent) =>
                      handleNameChange(horse.id, e.target.value)
                    }
                    disabled={isRaceStarted}
                  >
                    {MODEL_OPTIONS.map((model) => (
                      <MenuItem
                        key={model.value}
                        value={model.value}
                        disabled={gameState.horses.some(
                          (h) =>
                            h.id !== horse.id && h.modelValue === model.value
                        )}
                      >
                        {model.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            ))}
          </Stack>

          {!isRaceStarted && (
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => setIsRaceStarted(true)}
              disabled={!canStartRace()}
              sx={{ mt: 2 }}
            >
              Start Race
            </Button>
          )}

          {/* New Questions & Answers section */}
          <QAContainer elevation={3}>
            <Stack spacing={2}>
              {gameState.questions.map((question, index) => {
                const answers = gameState.answers.filter(
                  (a) => a.questionId === question.id
                );
                return (
                  <Box key={question.id}>
                    <Box sx={{ fontWeight: "bold", mb: 1 }}>
                      Question {index + 1}: {question.text}
                    </Box>
                    {answers.length > 0 ? (
                      answers.map((answer) => (
                        <Box
                          key={answer.id}
                          sx={{ pl: 2, color: "text.secondary" }}
                        >
                          Answer from{" "}
                          {gameState.horses.find(
                            (horse) => horse.id === answer.horseId
                          )?.name || "Unknown Horse"}
                          : {answer.content}
                        </Box>
                      ))
                    ) : (
                      <Box sx={{ pl: 2, color: "text.secondary" }}>
                        No answers yet.
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Stack>
          </QAContainer>
        </Stack>
      </Container>
    </ThemeProvider>
  );
}

export default App;
