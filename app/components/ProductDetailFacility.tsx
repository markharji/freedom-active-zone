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

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { Navigation, Thumbs } from "swiper/modules";

export default function ProductDetail({ product }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [showFullDesc, setShowFullDesc] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const [suggestedSlots, setSuggestedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [openConfirm, setOpenConfirm] = useState(false);
  const [referenceId, setReferenceId] = useState("");

  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      contact: "",
      date: null,
      startTime: "",
      endTime: "",
    },
  });

  const selectedDate = watch("date");
  const startTime = watch("startTime");
  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);

  const totalHours =
    startTime && watch("endTime") ? parseInt(watch("endTime").split(":")[0]) - parseInt(startTime.split(":")[0]) : 0;

  const totalPrice = totalHours * product.price;

  useEffect(() => {
    setValue("endTime", "");
  }, [startTime, setValue]);

  // Fetch transactions for the selected date
  useEffect(() => {
    const fetchTransactions = async () => {
      setTransactions([]);
      setValue("startTime", "");
      setValue("endTime", "");
      if (!selectedDate) return;

      setLoadingTransactions(true);
      try {
        const dateString = selectedDate.format("DD-MM-YYYY");
        const res = await fetch(
          `/api/facility-transactions?facilityId=${product._id}&date=${dateString}&status=pending`,
        );
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch transactions");
        setTransactions(data);
      } catch (err) {
        toast.error(err.message || "Failed to fetch transactions");
      } finally {
        setLoadingTransactions(false);
      }
    };

    fetchTransactions();
  }, [selectedDate, product._id, setValue]);

  const isTimeOverlap = (start, end) => {
    return transactions.some((t) => start < t.endTime && end > t.startTime);
  };

  const isStartTimeDisabled = (hour) => {
    const proposedStart = hour;
    const proposedEnd = hours[hours.indexOf(hour) + 1] || "24:00";
    return isTimeOverlap(proposedStart, proposedEnd);
  };

  const isEndTimeDisabled = (hour) => {
    if (!startTime) return false;
    const proposedStart = startTime;
    const proposedEnd = hour;
    if (proposedEnd <= proposedStart) return true;
    return isTimeOverlap(proposedStart, proposedEnd);
  };

  const handleSuggestSlots = async () => {
    if (!selectedDate) {
      toast.error("Please select a date first");
      return;
    }

    setLoadingSlots(true);
    setSuggestedSlots([]);

    try {
      const dateString = selectedDate.format("DD-MM-YYYY");
      const res = await fetch(`/api/facility-slots?facilityId=${product._id}&date=${dateString}&duration=60`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch available slots");

      setSuggestedSlots(data.freeSlots || []);
    } catch (err) {
      toast.error(err.message || "Failed to fetch available slots");
    } finally {
      setLoadingSlots(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = {
        ...data,
        date: data.date.format("DD-MM-YYYY"),
        facility: product,
        facilityId: product._id,
        price: totalPrice,
      };

      const res = await fetch("/api/facility-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "Failed to book facility");

      // Open confirmation modal
      setReferenceId(result.transaction._id || "N/A");
      setOpenConfirm(true);

      setLoading(false);

      // Auto-close after 5 seconds
      setTimeout(() => setOpenConfirm(false), 5000);
    } catch (err) {
      setLoading(false);
      toast.error(err.message || "Booking failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8 shadow-md bg-white">
      {/* Left: Swiper */}
      <div>
        <Swiper
          spaceBetween={10}
          navigation
          thumbs={{ swiper: thumbsSwiper }}
          modules={[Navigation, Thumbs]}
          className="rounded-lg overflow-hidden"
          style={{ height: "400px" }}
        >
          {product?.images?.map((img, i) => (
            <SwiperSlide key={i}>
              <img
                src={img}
                alt={`${product.name} ${i}`}
                className="w-full h-[400px] md:h-[500px] object-cover rounded-lg"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <Swiper
          onSwiper={setThumbsSwiper}
          spaceBetween={10}
          slidesPerView={8}
          freeMode
          watchSlidesProgress
          modules={[Thumbs]}
          className="mt-4"
        >
          {product?.images?.map((img, i) => (
            <SwiperSlide key={i}>
              <img
                src={img}
                alt={`${product.name} thumb ${i}`}
                className="w-20 h-20 object-cover rounded-lg cursor-pointer border border-gray-200"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Right: Booking Form */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>

        <div className="mb-4">
          <p className={`text-gray-700 text-sm md:text-base ${!showFullDesc ? "line-clamp-3" : ""}`}>
            {product.description}
          </p>
          {product.description.split(" ").length > 20 && (
            <button
              type="button"
              onClick={() => setShowFullDesc(!showFullDesc)}
              className="text-green-900 font-semibold mt-1 text-sm hover:underline"
            >
              {showFullDesc ? "Show Less" : "Read More"}
            </button>
          )}
        </div>

        <p className="text-green-900 text-2xl font-bold mb-4">₱{product.price}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mb-4 w-fit md:w-full">
          {/* Name */}
          <Controller
            name="name"
            control={control}
            rules={{ required: "Customer Name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Customer Name"
                error={!!errors.name}
                helperText={errors.name?.message}
                fullWidth
              />
            )}
          />

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

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Controller
              name="date"
              control={control}
              rules={{ required: "Date is required" }}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  label="Date"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => field.onChange(date)}
                  slotProps={{
                    textField: { error: !!errors.date, helperText: errors.date?.message, fullWidth: true },
                  }}
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
                        <MenuItem key={hour} value={hour} disabled={isStartTimeDisabled(hour)}>
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
                        <MenuItem
                          key={hour}
                          value={hour}
                          disabled={!startTime || hour <= startTime || isEndTimeDisabled(hour)}
                        >
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
            <p className="text-lg font-semibold text-gray-800 mb-2">
              Total ({totalHours} {totalHours === 1 ? "hour" : "hours"}): ₱{totalPrice}
            </p>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
            disabled={loading} // disable button when loading is true
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Book Now"}
          </Button>

          <Button
            type="button"
            variant="outlined"
            fullWidth
            onClick={handleSuggestSlots}
            className="mt-2"
            disabled={loadingSlots || !selectedDate}
          >
            {loadingSlots ? "Checking..." : "View Available Slots"}
          </Button>

          {/* Suggested Slots */}
          {suggestedSlots.length > 0 && (
            <Box className="mt-4 p-4 border border-gray-300 rounded-md bg-gray-50">
              <h3 className="text-lg font-semibold mb-2">Available Slots:</h3>
              <ul className="list-disc list-inside">
                {suggestedSlots.map((slot, i) => (
                  <li key={i}>
                    {slot.startTime} - {slot.endTime}
                  </li>
                ))}
              </ul>
            </Box>
          )}
        </form>

        {/* Confirmation Modal */}
        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
          <DialogTitle>Booking Confirmed!</DialogTitle>
          <DialogContent dividers>
            <Typography gutterBottom>Your booking has been successfully submitted.</Typography>
            <Typography gutterBottom>
              Reference Number: <strong>{referenceId}</strong>
            </Typography>
            <Button variant="outlined" onClick={() => navigator.clipboard.writeText(referenceId)} className="mt-2">
              Copy Reference
            </Button>
            <Typography variant="body2" color="textSecondary" className="mt-2">
              Please take a screenshot or note this reference number for your records.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirm(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}
