import { Box, Paper, styled } from "@mui/material";
import { Horse } from "../types";

const RaceTrackContainer = styled(Paper)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(11, 80px)",
  gridTemplateRows: "repeat(4, 80px)",
  gap: 4,
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  marginBottom: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`,
  justifyContent: "center",
  alignItems: "center",
}));

const HorseCell = styled(Box)<{ $selected?: boolean }>(({ theme }) => ({
  width: "80%",
  height: "80%",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.3s ease",
  position: "relative",
}));

const HorseContent = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const SleepOverlay = styled(Box)({
  position: "absolute",
  top: -5,
  right: -5,
  width: 23,
  height: 23,
  backgroundColor: "#ffffff",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "2px solid #e0e0e0",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  fontSize: 12,
});

// const HorseName = styled(Box)({
//   fontSize: "0.6em",
//   maxWidth: 60,
//   overflow: "hidden",
//   textOverflow: "ellipsis",
//   whiteSpace: "nowrap",
// });

interface RaceTrackProps {
  horses: Horse[];
}

const RaceTrack: React.FC<RaceTrackProps> = ({ horses }) => {
  // Create a list of horses that have finished, sorted by finishTime
  const finishedHorses = horses
    .filter((horse) => horse.finishTime !== undefined)
    .sort((a, b) => (a.finishTime || 0) - (b.finishTime || 0));

  return (
    <RaceTrackContainer elevation={3}>
      {horses.map((horse) => {
        let overlayIcon = null;

        // Assign medals to the top three finishers
        if (horse.position >= 10) {
          const finishIndex = finishedHorses.findIndex(
            (h) => h.id === horse.id
          );
          if (finishIndex === 0) overlayIcon = "🥇";
          else if (finishIndex === 1) overlayIcon = "🥈";
          else if (finishIndex === 2) overlayIcon = "🥉";
        }

        return (
          <HorseCell
            key={horse.id}
            sx={{
              gridRow: horse.id,
              gridColumn: horse.position + 1,
              opacity: horse.isProcessing ? 0.5 : 1,
              backgroundColor: `${horse.color}50`,
              border: `2px solid ${horse.color}`,
            }}
          >
            <HorseContent>
              <Box sx={{ fontSize: "2em" }}>{horse.emoji}</Box>
              {horse.isWaiting && <SleepOverlay>❌</SleepOverlay>}
              {overlayIcon && <SleepOverlay>{overlayIcon}</SleepOverlay>}
            </HorseContent>
          </HorseCell>
        );
      })}
    </RaceTrackContainer>
  );
};

export default RaceTrack;
