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
    {horses.map((horse, index) => (
      <Stack key={horse.id} spacing={2} alignItems="center">
        <FormControl
          sx={{
            minWidth: 200,
            "& .MuiOutlinedInput-root": {
              borderColor: horse.color,
              "&:hover fieldset": {
                borderColor: horse.color,
              },
              "&.Mui-focused fieldset": {
                borderColor: horse.color,
              },
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: horse.color,
            },
          }}
        >
          <InputLabel
            id={`horse-${horse.id}-label`}
            sx={{
              color: horse.color,
            }}
          >
            Pick model for {horse.emoji}
          </InputLabel>
          <Select
            labelId={`horse-${horse.id}-label`}
            value={horse.modelValue}
            label={`Pick model for ${horse.emoji}`}
            onChange={(e) => onNameChange(horse.id, e.target.value)}
            disabled={isRaceStarted}
            sx={{
              backgroundColor: `${horse.color}22`, // Adding transparency
              "&:hover": {
                backgroundColor: `${horse.color}33`,
              },
            }}
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