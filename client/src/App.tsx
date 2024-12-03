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
import { GameState, MODEL_OPTIONS } from "./types";

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

function App() {
  const [gameState, setGameState] = useState<GameState>({
    questions: [],
    answers: [],
    horses: [
      { id: 1, emoji: "🐎", position: 0, name: "", modelValue: "" },
      { id: 2, emoji: "🦄", position: 0, name: "", modelValue: "" },
      { id: 3, emoji: "🎠", position: 0, name: "", modelValue: "" },
      { id: 4, emoji: "🏇", position: 0, name: "", modelValue: "" },
    ],
    currentColumn: 0,
  });

  useEffect(() => {
    // Initial fetch
    fetchGameState();

    // Setup WebSocket with proper URL construction
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsHost =
      process.env.NODE_ENV === "development"
        ? "localhost:8080"
        : window.location.host;
    const ws = new WebSocket(`${wsProtocol}//${wsHost}/ws`);

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const newState = JSON.parse(event.data);
      setGameState(newState);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const fetchGameState = async () => {
    try {
      const response = await fetch("/api/game-state");
      const state = await response.json();
      setGameState(state);
    } catch (error) {
      console.error("Failed to fetch game state:", error);
    }
  };

  const submitAnswer = async (horseId: number, questionId: string) => {
    const horse = gameState.horses.find((h) => h.id === horseId);
    if (!horse?.modelValue || horse.isProcessing) return;

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

      // Backend will handle the websocket update
    } catch (error) {
      console.error("Failed to submit answer:", error);
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
      try {
        // Update local state immediately for responsiveness
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

        // Send update to backend
        const response = await fetch("/api/update-horse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            horseId,
            name: selectedModel.name,
            modelValue: selectedModel.value,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update horse model");
        }
      } catch (error) {
        console.error("Failed to update horse model:", error);
        // Optionally revert the state if the update failed
      }
    }
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
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    const currentQuestion = gameState.questions.find(
                      (q) => q.column === horse.position
                    );
                    if (currentQuestion) {
                      submitAnswer(horse.id, currentQuestion.id);
                    }
                  }}
                  disabled={
                    horse.position >= 9 ||
                    horse.isProcessing ||
                    !horse.modelValue
                  }
                  sx={{
                    minWidth: 120,
                    "&:disabled": {
                      backgroundColor: "rgba(144, 202, 249, 0.12)",
                      color: "rgba(255, 255, 255, 0.3)",
                    },
                  }}
                >
                  {horse.isProcessing ? "Thinking..." : "Answer Question"}
                </Button>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Container>
    </ThemeProvider>
  );
}

export default App;
