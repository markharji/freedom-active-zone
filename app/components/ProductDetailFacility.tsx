"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { TextField, Button, FormControl, InputLabel, Select, FormHelperText, MenuItem, Box } from "@mui/material";
import { LocalizationProvider, DatePicker, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { Navigation } from "swiper/modules";
import { Thumbs } from "swiper/modules";
import toast from "react-hot-toast";
import Facility from "@/models/Facility";

export default function ProductDetail({ product }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [showFullDesc, setShowFullDesc] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const [suggestedSlots, setSuggestedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

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
      time: null,
    },
  });

  const selectedDate = watch("date"); // watch the date field

  useEffect(() => {
    const fetchTransactions = async () => {
      setTransactions([]);
      setValue("startTime", "");
      setValue("endTime", "");
      if (!selectedDate) return;

      setLoadingTransactions(true); // start loading

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
        setLoadingTransactions(false); // done loading
      }
    };

    fetchTransactions();
  }, [selectedDate]);

  const startTime = watch("startTime"); // watch the start time

  const totalHours =
    startTime && watch("endTime") ? parseInt(watch("endTime").split(":")[0]) - parseInt(startTime.split(":")[0]) : 0;

  const totalPrice = totalHours * product.price;

  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);

  useEffect(() => {
    setValue("endTime", "");
  }, [startTime, setValue]);

  const isTimeOverlap = (start: string, end: string) => {
    return transactions.some((t) => {
      return start < t.endTime && end > t.startTime;
    });
  };

  const isStartTimeDisabled = (hour: string) => {
    // Try assuming 1-hour slot
    const proposedStart = hour;
    const proposedEnd = hours[hours.indexOf(hour) + 1] || "24:00"; // next hour

    return isTimeOverlap(proposedStart, proposedEnd);
  };

  const isEndTimeDisabled = (hour: string) => {
    if (!startTime) return false;

    const proposedStart = startTime;
    const proposedEnd = hour;

    // End time must be after startTime
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
      // const totalHours = +data.endTime.split(":")[0] - +data.startTime.split(":")[0];

      const payload = {
        ...data,
        date: data.date.format("DD-MM-YYYY"),
        facility: product,
        facilityId: product._id,
        price: totalPrice,
      };

      console.log("Payload", payload);

      const res = await fetch("/api/facility-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "Failed to book facility");

      toast.success("Booking submitted successfully!");
    } catch (err) {
      toast.error(err.message || "Booking failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8 shadow-md bg-white">
      {/* Left: Swiper Images */}
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

      {/* Right: Info & Booking Form */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
        {/* Product Description */}
        <div className="mb-4">
          <p className={`text-gray-700 text-sm md:text-base ${!showFullDesc ? "line-clamp-3" : ""}`}>
            {product.description}
          </p>
          {product.description.split(" ").length > 20 && ( // Show button only if description is long
            <button
              type="button"
              onClick={() => setShowFullDesc(!showFullDesc)}
              className="text-green-900 font-semibold mt-1 text-sm hover:underline"
            >
              {showFullDesc ? "Show Less" : "Read More"}
            </button>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              className={`h-5 w-5 ${i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.165c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.285-3.957a1 1 0 00-.364-1.118L2.04 9.385c-.783-.57-.38-1.81.588-1.81h4.165a1 1 0 00.951-.69l1.285-3.958z" />
            </svg>
          ))}
          <span className="ml-2 text-gray-600">{product.rating.toFixed(1)}</span>
        </div>

        <p className="text-green-900 text-2xl font-bold mb-4">₱{product.price}</p>

        {/* Booking Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mb-4 w-fit md:w-full">
          <Controller
            name="name"
            control={control}
            rules={{ required: "Customer Name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Customer Name"
                variant="outlined"
                error={!!errors.name}
                helperText={errors.name?.message}
                required
                fullWidth
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            rules={{
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Invalid email format",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                variant="outlined"
                error={!!errors.email}
                helperText={errors.email?.message}
                required
                fullWidth
              />
            )}
          />

          <Controller
            name="contact"
            control={control}
            rules={{
              required: "Contact number is required",
              pattern: {
                value: /^[0-9]{10,15}$/,
                message: "Invalid contact number",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Contact Number"
                variant="outlined"
                error={!!errors.contact}
                helperText={errors.contact?.message}
                required
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
                    textField: {
                      error: !!errors.date,
                      helperText: errors.date?.message,
                      required: true,
                      fullWidth: true,
                    },
                  }}
                />
              )}
            />

            <Box className="flex flex-col md:flex-row gap-2 md:gap-4">
              {/* Start Time */}
              <Controller
                name="startTime"
                control={control}
                rules={{ required: "Start time is required" }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.startTime}>
                    <InputLabel id="start-time-label">Start Time</InputLabel>
                    <Select
                      labelId="start-time-label"
                      {...field}
                      value={field.value || ""}
                      label="Start Time"
                      onChange={(e) => field.onChange(e.target.value)}
                      disabled={loadingTransactions}
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
                      labelId="end-time-label"
                      {...field}
                      value={field.value || ""}
                      label="End Time"
                      onChange={(e) => field.onChange(e.target.value)}
                      disabled={loadingTransactions || !startTime}
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
            color="primary"
            fullWidth
            className="bg-green-900 hover:bg-pink-600"
          >
            Book Now
          </Button>

          <Button
            type="button"
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={handleSuggestSlots}
            className="mt-2"
            disabled={loadingSlots || !selectedDate}
          >
            {loadingSlots ? "Checking..." : "View Available Slots"}
          </Button>

          {/* Display suggested slots */}
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

          {!loadingSlots && suggestedSlots.length === 0 && selectedDate && (
            <p className="mt-4 text-gray-500">No available slots for the selected date.</p>
          )}
        </form>
      </div>
    </div>
  );
}
