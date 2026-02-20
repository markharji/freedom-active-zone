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
  Switch,
  FormControlLabel,
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

// Icons for preview modal
import InfoIcon from "@mui/icons-material/Info";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

export default function ProductDetail({ product }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [showFullDesc, setShowFullDesc] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const [suggestedSlots, setSuggestedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [openPreview, setOpenPreview] = useState(false);
  const [formDataPreview, setFormDataPreview] = useState(null);

  const [openConfirm, setOpenConfirm] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSlots, setShowSlots] = useState(true);
  const [rewards, setRewards] = useState([]);

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
      convertTo: false,
      convertedTo: "",
      contact: "",
      date: null,
      startTime: "",
      endTime: "",
    },
  });

  const watchConvertible = watch("convertTo");
  const selectedDate = watch("date");
  const startTime = watch("startTime");

  // Only allow operating hours 06:00 to 23:00
  const hours = Array.from({ length: 18 }, (_, i) => `${(i + 6).toString().padStart(2, "0")}:00`); // 06:00 to 23:00
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

  const totalPrice = computeTotalPrice(product.timeSlots, watch("startTime"), watch("endTime"), rewards);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("status", "active");
      params.append("selectedDate", selectedDate);

      const res = await fetch(`/api/rewards?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch rewards");
      const data = await res.json();
      console.log(data);
      setRewards(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchRewards();
    }
  }, [selectedDate]);
  // Reset endTime when startTime changes
  useEffect(() => {
    setValue("endTime", "");
  }, [startTime, setValue]);

  // Reset convertedTo when switch is turned off
  useEffect(() => {
    if (!watchConvertible) {
      setValue("convertedTo", "");
    }
  }, [watchConvertible, setValue]);

  // Fetch transactions
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
          `/api/facility-transactions?facilityId=${product._id}&date=${dateString}&status=confirmed`,
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

  const isTimeOverlap = (start, end) => transactions.some((t) => start < t.endTime && end > t.startTime);
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

  const paymentFunction = async (data, transaction) => {
    const createRes = await fetch("/api/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create_intent",
        amount: totalPrice * 100, // e.g., 444.00 PHP
        payment_method_allowed: ["gcash"],
        description: `${product.name} - ${dayjs(data.date).format("DD-MM-YYYY")} (${data.startTime + "-" + data.endTime}) , ${data.name}`,
      }),
    });

    const intentData = await createRes.json();
    const paymentIntentId = intentData.data.id;

    const confirmRes = await fetch("/api/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create_payment_method",
        paymentIntentId,
        paymentMethod: "gcash",
        phone: data.contact,
        transactionId: transaction._id,
      }),
    });

    const confirmData = await confirmRes.json();
    const redirectUrl = confirmData.data.attributes.next_action.redirect.url;
    if (redirectUrl) {
      window.open(redirectUrl, "_self")?.focus();
    } else {
      alert("No redirect URL returned. Check paymentIntent status.");
    }
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

  const handlePreview = (data) => {
    setFormDataPreview(data);
    setOpenPreview(true);
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

      paymentFunction(data, result.transaction);
    } catch (err) {
      setLoading(false);
      toast.error(err.message || "Booking failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-md bg-white">
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

        {
          <div className="flex justify-between items-center mb-2">
            <div className="flex gap-2 items-baseline">
              <p className="text-green-900 text-2xl font-bold">₱{product.timeSlots[0].price}</p>
              {rewards.length > 0 && (
                <p style={{ color: "red", fontWeight: 600 }}>
                  {rewards[0].discountType === "percentage" ? `${rewards[0].discountValue}%` : rewards[0].discountValue}
                </p>
              )}
            </div>

            {product.timeSlots.length > 1 && (
              <button
                type="button"
                onClick={() => setShowSlots(!showSlots)}
                className="text-green-900 font-semibold hover:underline text-sm"
              >
                {showSlots ? "Hide Prices" : "Show Prices"}
              </button>
            )}
          </div>
        }

        {showSlots && product.timeSlots && product.timeSlots.length > 1 && (
          <div className="mb-6">
            <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm bg-white">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-green-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                    >
                      Start
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                    >
                      End
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                    >
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {product.timeSlots.map((slot, index) => (
                    <tr key={index} className="hover:bg-green-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">{slot.start}:00</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">{slot.end}:00</td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-900 font-bold">₱{slot.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(handlePreview)} className="flex flex-col gap-4 mb-4 md:w-full">
          {/* Name */}
          {/* <Controller
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
          /> */}

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

          {/* Convert Switch */}
          {product?.convertible && (
            <Controller
              name="convertTo"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      {...field}
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      color="success"
                    />
                  }
                  label="Convert to another sport?"
                />
              )}
            />
          )}

          {/* Converted Sport Select */}
          {product?.convertible && watchConvertible && (
            <Controller
              name="convertedTo"
              control={control}
              rules={{ required: "Please select a sport" }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.convertedTo}>
                  <InputLabel id="converted-to-label">Select Sport</InputLabel>
                  <Select {...field} labelId="converted-to-label" label="Select Sport">
                    {product?.otherSports?.map((sport, index) => (
                      <MenuItem key={index} value={sport}>
                        {sport}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.convertedTo && <FormHelperText>{errors.convertedTo.message}</FormHelperText>}
                </FormControl>
              )}
            />
          )}

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

          {/* Date and Time Pickers */}
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

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }} disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Book Now"}
          </Button>
        </form>

        {/* Preview Modal */}
        <Dialog
          open={openPreview}
          onClose={() => setOpenPreview(false)}
          PaperProps={{ sx: { borderRadius: 3, minWidth: 340, maxWidth: 500, bgcolor: "#f9f9f9", boxShadow: 8 } }}
        >
          <Box sx={{ bgcolor: "#1f7a49", color: "white", py: 2, px: 3, borderRadius: "8px 8px 0 0" }}>
            <Typography variant="h6" fontWeight="bold">
              Confirm Your Booking
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Please review your booking details
            </Typography>
          </Box>
          <DialogContent dividers sx={{ px: 3, py: 2 }}>
            <Box sx={{ display: "grid", gap: 2 }}>
              {/* Booking Details */}

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <EmailIcon sx={{ color: "#1f7a49" }} />
                <Typography>
                  <strong>Email:</strong> {formDataPreview?.email}
                </Typography>
              </Box>
              {product?.convertible && formDataPreview?.convertTo && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <InfoIcon sx={{ color: "#1f7a49" }} />
                  <Typography>
                    <strong>Converted Sport:</strong> {formDataPreview?.convertedTo}
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PhoneIcon sx={{ color: "#1f7a49" }} />
                <Typography>
                  <strong>Contact:</strong> {formDataPreview?.contact}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarTodayIcon sx={{ color: "#1f7a49" }} />
                <Typography>
                  <strong>Date:</strong> {formDataPreview?.date?.format("DD-MM-YYYY")}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AccessTimeIcon sx={{ color: "#1f7a49" }} />
                <Typography>
                  <strong>Time:</strong> {formDataPreview?.startTime} - {formDataPreview?.endTime}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AttachMoneyIcon sx={{ color: "#1f7a49" }} />
                <Typography>
                  <strong>Total Price:</strong> ₱{totalPrice}
                </Typography>
              </Box>

              {/* Payment Method */}
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="preview-payment-method-label" className="bg-white">
                  Payment Method
                </InputLabel>
                <Select
                  labelId="preview-payment-method-label"
                  value={formDataPreview?.paymentMethod || "card"}
                  onChange={(e) => setFormDataPreview({ ...formDataPreview, paymentMethod: e.target.value })}
                >
                  <MenuItem value="card">Card</MenuItem>
                  <MenuItem value="gcash">GCash</MenuItem>
                  <MenuItem value="grab_pay">GrabPay</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
            <Button
              onClick={() => setOpenPreview(false)}
              variant="outlined"
              sx={{ borderRadius: 2, color: "#1f7a49", borderColor: "#1f7a49" }}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setOpenPreview(false);
                await onSubmit(formDataPreview);
              }}
              variant="contained"
              sx={{ bgcolor: "#1f7a49", color: "white", borderRadius: 2, "&:hover": { bgcolor: "#14532d" } }}
            >
              Confirm Booking
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}
