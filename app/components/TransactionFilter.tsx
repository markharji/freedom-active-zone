"use client";

import { useEffect, useState } from "react";
import { TextField, Stack } from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

interface Props {
  search: string;
  setSearch: (val: string) => void;
  date: Dayjs | null;
  setDate: (val: Dayjs | null) => void;
  debounceTime?: number; // optional debounce in ms
}

export default function TransactionFilter({
  search,
  setSearch,
  date,
  setDate,
  debounceTime = 500, // default 500ms
}: Props) {
  const [localSearch, setLocalSearch] = useState(search);

  // Handle debounce for search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(localSearch);
    }, debounceTime);

    return () => clearTimeout(handler); // cleanup on change
  }, [localSearch, debounceTime, setSearch]);

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3} alignItems="center">
      <TextField
        label="Search"
        variant="outlined"
        size="small"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
      />

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Select Date"
          value={date}
          onChange={(newValue) => setDate(newValue)}
          slotProps={{ textField: { size: "small" } }}
        />
      </LocalizationProvider>
    </Stack>
  );
}
