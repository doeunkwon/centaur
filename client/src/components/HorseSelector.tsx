import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import { Horse, MODEL_OPTIONS } from "../types";

interface HorseSelectorProps {
  horses: Horse[];
  isRaceStarted: boolean;
  onNameChange: (horseId: number, newValue: string) => void;
}

const HorseSelector: React.FC<HorseSelectorProps> = ({
  horses,
  isRaceStarted,
  onNameChange,
}) => (
  <Stack
    direction="row"
    spacing={2}
    flexWrap="wrap"
    justifyContent="center"
    sx={{ maxWidth: 1200, gap: 2 }}
  >
    {horses.map((horse) => (
      <Stack key={horse.id} spacing={2} alignItems="center">
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id={`horse-${horse.id}-label`}>Select Model</InputLabel>
          <Select
            labelId={`horse-${horse.id}-label`}
            value={horse.modelValue}
            label="Select Model"
            onChange={(e) => onNameChange(horse.id, e.target.value)}
            disabled={isRaceStarted}
          >
            {MODEL_OPTIONS.map((model) => (
              <MenuItem
                key={model.value}
                value={model.value}
                disabled={horses.some(
                  (h) => h.id !== horse.id && h.modelValue === model.value
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
);

export default HorseSelector;
