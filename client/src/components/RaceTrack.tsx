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

const HorseCell = styled(Box)(({ theme }) => ({
  width: "80%",
  height: "80%",
  backgroundColor: theme.palette.background.default,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.3s ease",
}));

const HorseContent = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
});

const HorseName = styled(Box)({
  fontSize: "0.6em",
  maxWidth: 60,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

interface RaceTrackProps {
  horses: Horse[];
}

const RaceTrack: React.FC<RaceTrackProps> = ({ horses }) => (
  <RaceTrackContainer elevation={3}>
    {horses.map((horse) => (
      <HorseCell
        key={horse.id}
        sx={{
          gridRow: horse.id,
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
  </RaceTrackContainer>
);

export default RaceTrack;
