import { useState, useEffect } from "react";
import {
  Button,
  Container,
  CssBaseline,
  Stack,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { Answer, GameState, Horse, MODEL_OPTIONS, Question } from "./types";
import RaceTrack from "./components/RaceTrack";
import HorseSelector from "./components/HorseSelector";
import QAContainer from "./components/QAContainer";

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
      {
        id: 1,
        emoji: "🦄",
        color: "#DDA0DD",
        position: 0,
        name: "",
        modelValue: "",
      },
      {
        id: 2,
        emoji: "🐎",
        color: "#98FB98",
        position: 0,
        name: "",
        modelValue: "",
      },
      {
        id: 3,
        emoji: "🎠",
        color: "#87CEEB",
        position: 0,
        name: "",
        modelValue: "",
      },
      {
        id: 4,
        emoji: "🐴",
        color: "#EF9C66",
        position: 0,
        name: "",
        modelValue: "",
      },
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
    const processHorses = async () => {
      if (!isRaceStarted) return;

      const promises = gameState.horses.map(async (horse) => {
        if (!horse.isProcessing && horse.position <= 9) {
          const currentQuestion = gameState.questions.find(
            (q) => q.column === horse.position
          );
          if (currentQuestion) {
            await submitAnswer(horse.id, currentQuestion);
          }
        }
      });

      await Promise.all(promises);
    };

    processHorses();
  }, [isRaceStarted, gameState.horses]);

  const submitAnswer = async (horseId: number, question: Question) => {
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
          question: question.text,
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
          id: `${question.id}-${horseId}`,
          questionId: question.id,
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
          <RaceTrack horses={gameState.horses} />
          <HorseSelector
            horses={gameState.horses}
            isRaceStarted={isRaceStarted}
            onNameChange={handleNameChange}
          />
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
          <QAContainer
            questions={gameState.questions}
            answers={gameState.answers}
            horses={gameState.horses}
          />
        </Stack>
      </Container>
    </ThemeProvider>
  );
}

export default App;
