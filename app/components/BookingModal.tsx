"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  MenuItem,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import toast from "react-hot-toast";

export default function BookingModal({ open, onClose, slot, loading, fetchFacilityTransactions }) {
  const {
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      contact: "",
      date: slot?.start ? dayjs(slot.start) : null,
      startTime: slot?.start ? dayjs(slot.start).format("HH:00") : "",
      endTime: slot?.end ? dayjs(slot.end).format("HH:00") : "",
    },
  });

  const [rewards, setRewards] = useState([]);

  const fetchRewards = async () => {
    try {
      const params = new URLSearchParams();
      params.append("status", "active");
      params.append("selectedDate", selectedDate);

      const res = await fetch(`/api/rewards?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch rewards");
      const data = await res.json();

      setRewards(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
    }
  };

  const selectedDate = watch("date");

  useEffect(() => {
    if (selectedDate) {
      fetchRewards();
    }
  }, [selectedDate]);

  const startTime = watch("startTime");
  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);
  const totalHours =
    startTime && watch("endTime") ? parseInt(watch("endTime").split(":")[0]) - parseInt(startTime.split(":")[0]) : 0;
  const computeTotalPrice = (timeSlots, startTime, endTime, rewards) => {
    if (!timeSlots || timeSlots.length === 0) return 0;

    const startHour = parseInt(startTime.split(":")[0]);
    const endHour = parseInt(endTime.split(":")[0]);

    let total = 0;

    if (timeSlots.length === 1) {
      const slot = timeSlots[0];
      const hours = endHour - startHour; // assume selected range within slot
      total = slot.price * hours;
    } else {
      // Multiple time slots
      for (const slot of timeSlots) {
        if (slot.end <= startHour || slot.start >= endHour) continue;

        const overlapStart = Math.max(slot.start, startHour);
        const overlapEnd = Math.min(slot.end, endHour);
        const hours = overlapEnd - overlapStart;

        total += hours * slot.price;
      }
    }

    // Apply discount if available
    if (rewards && rewards.length > 0) {
      const { discountType, discountValue } = rewards[0];

      if (discountType === "percentage") {
        total = total * (1 - parseFloat(discountValue) / 100);
      } else if (discountType === "amount") {
        total = total - parseFloat(discountValue);
      }
    }

    return Math.max(0, total); // ensure total is not negative
  };

  const totalPrice = computeTotalPrice(slot?.facility.timeSlots, watch("startTime"), watch("endTime"), rewards);

  useEffect(() => {
    if (slot?.start) setValue("date", dayjs(slot.start));
    if (slot?.start) setValue("startTime", dayjs(slot.start).format("HH:00"));
    if (slot?.end) setValue("endTime", dayjs(slot.end).format("HH:00"));
  }, [slot, setValue]);

  const handleFormSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        price: totalPrice,
        facility: slot.facility,
        facilityId: slot.facility._id,
        date: data.date.format("DD-MM-YYYY"),
      };

      // Call API
      const res = await fetch("/api/facility-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Booking failed");

      toast.success("Booking confirmed!");

      // ✅ Reset the form after submit
      reset({
        name: "",
        email: "",
        contact: "",
        date: slot?.start ? dayjs(slot.start) : null,
        startTime: slot?.start ? dayjs(slot.start).format("HH:00") : "",
        endTime: slot?.end ? dayjs(slot.end).format("HH:00") : "",
      });

      fetchFacilityTransactions();
      onClose();
    } catch (err) {
      toast.error(err.message || "Booking failed");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: 3, minWidth: 340, maxWidth: 500 } }}>
      <Box sx={{ bgcolor: "#1f7a49", color: "white", py: 2, px: 3, borderRadius: "8px 8px 0 0" }}>
        <Typography variant="h6" fontWeight="bold">
          Book {slot?.facility?.name}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Fill in your details and confirm your booking
        </Typography>
      </Box>

      <DialogContent dividers sx={{ px: 3, py: 2 }}>
        <form id="bookingForm" onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          {/* Name */}

          {/* Email */}
          <Controller
            name="email"
            control={control}
            rules={{
              required: "Email is required",
              pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email format" },
            }}
            render={({ field }) => (
              <TextField {...field} label="Email" error={!!errors.email} helperText={errors.email?.message} fullWidth />
            )}
          />

          {/* Contact */}
          <Controller
            name="contact"
            control={control}
            rules={{
              required: "Contact number is required",
              pattern: { value: /^[0-9]{10,15}$/, message: "Invalid contact number" },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Contact Number"
                error={!!errors.contact}
                helperText={errors.contact?.message}
                fullWidth
              />
            )}
          />

          {/* Date */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Controller
              name="date"
              control={control}
              rules={{ required: "Date is required" }}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  label="Date"
                  minDate={dayjs()} // Today
                  maxDate={dayjs().add(1, "month")} // One month from today
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => field.onChange(date)}
                  slotProps={{ textField: { error: !!errors.date, helperText: errors.date?.message, fullWidth: true } }}
                />
              )}
            />

            <Box className="flex flex-col md:flex-row gap-2 md:gap-4 mt-2">
              {/* Start Time */}
              <Controller
                name="startTime"
                control={control}
                rules={{ required: "Start time is required" }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.startTime}>
                    <InputLabel id="start-time-label">Start Time</InputLabel>
                    <Select
                      {...field}
                      value={field.value || ""}
                      label="Start Time"
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      {hours.map((hour) => (
                        <MenuItem key={hour} value={hour}>
                          {hour}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.startTime && <FormHelperText>{errors.startTime.message}</FormHelperText>}
                  </FormControl>
                )}
              />

              {/* End Time */}
              <Controller
                name="endTime"
                control={control}
                rules={{
                  required: "End time is required",
                  validate: (value) => !startTime || value > startTime || "End time must be after Start time",
                }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.endTime}>
                    <InputLabel id="end-time-label">End Time</InputLabel>
                    <Select
                      {...field}
                      value={field.value || ""}
                      label="End Time"
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      {hours.map((hour) => (
                        <MenuItem key={hour} value={hour} disabled={!startTime || hour <= startTime}>
                          {hour}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.endTime && <FormHelperText>{errors.endTime.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Box>
          </LocalizationProvider>

          {totalHours > 0 && (
            <div className="flex gap-2">
              <Typography className="text-lg font-semibold text-gray-800 mt-2">
                Total ({totalHours} {totalHours === 1 ? "hour" : "hours"}): ₱{totalPrice}
              </Typography>
              {rewards.length > 0 && (
                <p style={{ color: "red", fontWeight: 600 }}>
                  (
                  {rewards[0].discountType === "percentage" ? `${rewards[0].discountValue}%` : rewards[0].discountValue}
                  )
                </p>
              )}
            </div>
          )}
        </form>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2, color: "#1f7a49", borderColor: "#1f7a49" }}>
          Cancel
        </Button>
        <Button
          form="bookingForm"
          type="submit"
          variant="contained"
          sx={{ bgcolor: "#1f7a49", color: "white", borderRadius: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Confirm Booking"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
