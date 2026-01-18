"use client";

import React from "react";
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  Button,
  Stack,
  TextField,
  RadioGroup,
  Radio,
  FormLabel,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";

export default function Filters({
  selectedSports = [],
  setSelectedSports = () => {},
  selectedPrices = [],
  setSelectedPrices = () => {},
  selectedDate = "", // new prop
  setSelectedDate = () => {}, // new prop
}) {
  const sportsOptions = ["Basketball", "Pickleball", "Tennis"];
  const priceOptions = [
    { label: "< 500", value: "500" },
    { label: "< 2000", value: "2000" },
    { label: "< 5000", value: "5000" },
  ];

  const handleSportChange = (sport) => {
    if (selectedSports.includes(sport)) {
      setSelectedSports(selectedSports.filter((s) => s !== sport));
    } else {
      setSelectedSports([...selectedSports, sport]);
    }
  };

  const handlePriceChange = (price) => {
    if (selectedPrices.includes(price)) {
      setSelectedPrices(selectedPrices.filter((p) => p !== price));
    } else {
      setSelectedPrices([...selectedPrices, price]);
    }
  };

  const handleClearAll = () => {
    setSelectedSports([]);
    setSelectedPrices([]);
    setSelectedDate(""); // clear date as well
  };

  return (
    <Box
      sx={{
        width: { xs: "100%", md: 280 },
        p: 3,
        bgcolor: "background.paper",
        borderRadius: 3,
        boxShadow: 3,
        position: { md: "sticky" },
        top: 46,
      }}
    >
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Filters</Typography>
        <Button variant="text" size="small" startIcon={<ClearIcon />} onClick={handleClearAll}>
          Clear
        </Button>
      </Stack>

      {/* Sport Type */}
      <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
        Sport Type
      </Typography>
      <FormGroup>
        {sportsOptions.map((sport) => (
          <FormControlLabel
            key={sport}
            control={<Checkbox checked={selectedSports.includes(sport)} onChange={() => handleSportChange(sport)} />}
            label={sport}
            sx={{
              "& .MuiFormControlLabel-label": {
                fontSize: 14,
                fontWeight: 500,
              },
            }}
          />
        ))}
      </FormGroup>

      <Divider sx={{ my: 3 }} />

      {/* Price */}
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
        Price
      </Typography>
      <FormGroup>
        <RadioGroup
          value={selectedPrices[0] || ""} // Only one selected value
          onChange={(e) => setSelectedPrices([e.target.value])} // store as array with single value
        >
          {priceOptions.map((price, index) => (
            <FormControlLabel
              key={index}
              value={price.value}
              control={<Radio />}
              label={`${price.label} PHP`}
              sx={{
                "& .MuiFormControlLabel-label": {
                  fontSize: 14,
                  fontWeight: 500,
                },
              }}
            />
          ))}
        </RadioGroup>
      </FormGroup>

      <Divider sx={{ my: 3 }} />

      {/* Date */}
      {/* <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
        Date
      </Typography>
      <TextField
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        size="small"
        fullWidth
        InputLabelProps={{
          shrink: true,
        }}
      /> */}

      {/* Optional: Add a subtle message */}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 3, fontStyle: "italic" }}>
        Select filters to find the perfect facility.
      </Typography>
    </Box>
  );
}
