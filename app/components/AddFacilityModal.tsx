"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  IconButton,
  Paper,
  CircularProgress,
  Switch,
  FormControlLabel,
} from "@mui/material";
import toast from "react-hot-toast";
import CloseIcon from "@mui/icons-material/Close";
import ImageMarkerModal from "./ImageMarker";

export default function AddFacilityModal({ open, onClose, fetchFacilities, title = "Facility" }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    value,
  } = useForm({
    defaultValues: {
      name: "",
      sport: "",
      convertible: false,
      otherSports: [],
      price: "",
      description: "",
      images: [],
      timeSlots: [{ start: 6, end: 23, price: 0 }],
    },
  });

  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openMarker, setOpenMarker] = useState(false);

  const watchImages = watch("images");
  const watchSport = watch("sport");
  const watchConvertible = watch("convertible");
  const watchOtherSports = watch("otherSports");
  const watchHotspot = watch("hotspot");

  const sportsOptions = ["Basketball", "Pickleball", "Volleyball", "Badminton"];

  // Handle multiple file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const currentImages = watchImages || [];
    const updatedImages = [...currentImages, ...files];

    setValue("images", updatedImages, { shouldValidate: true });

    const urls = updatedImages.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
  };

  // Delete selected image
  const handleRemoveImage = (index) => {
    const currentImages = watchImages || [];
    const updatedImages = currentImages.filter((_, i) => i !== index);

    setValue("images", updatedImages, { shouldValidate: true });

    const updatedPreviews = previews.filter((_, i) => i !== index);
    setPreviews(updatedPreviews);
  };

  const submitHandler = async (data) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("sport", data.sport);
      formData.append("convertible", data.convertible);
      formData.append("description", data.description);

      formData.append("timeSlots", JSON.stringify(data.timeSlots));
      formData.append("hotspot", JSON.stringify(data.hotspot));

      if (data.convertible) {
        data.otherSports.forEach((sport) => formData.append("otherSports", sport));
      }

      data.images.forEach((file) => formData.append("images", file));

      const res = await fetch("/api/facilities", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to add facility");

      toast.success("Facility added successfully!");

      reset();
      setPreviews([]);
      fetchFacilities();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 450,
            maxHeight: "90vh",
            overflowY: "auto",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="bold">
              Add {title}
            </Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box component="form" onSubmit={handleSubmit(submitHandler)} noValidate>
            <TextField
              fullWidth
              label="Name"
              margin="normal"
              {...register("name", {
                required: "Name is required",
              })}
              error={!!errors.name}
              helperText={errors.name?.message}
            />

            {/* Main Sport */}
            <TextField
              select
              fullWidth
              label="Sport"
              margin="normal"
              {...register("sport", {
                required: "Sport is required",
              })}
              error={!!errors.sport}
              helperText={errors.sport?.message}
            >
              {sportsOptions.map((sport) => (
                <MenuItem key={sport} value={sport}>
                  {sport}
                </MenuItem>
              ))}
            </TextField>

            {/* Convertible Switch */}
            <FormControlLabel
              control={
                <Switch
                  checked={watchConvertible}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setValue("convertible", checked);

                    // Clear otherSports if turned off
                    if (!checked) {
                      setValue("otherSports", []);
                    }
                  }}
                />
              }
              label="Convertible"
            />

            {/* Multi Select */}
            {watchConvertible && (
              <TextField
                select
                fullWidth
                label="Other Supported Sports"
                margin="normal"
                SelectProps={{ multiple: true }}
                value={watchOtherSports}
                onChange={(e) => setValue("otherSports", e.target.value)}
              >
                {sportsOptions
                  .filter((sport) => sport !== watchSport)
                  .map((sport) => (
                    <MenuItem key={sport} value={sport}>
                      {sport}
                    </MenuItem>
                  ))}
              </TextField>
            )}

            <Box mt={2}>
              <Typography variant="subtitle1" fontWeight="bold">
                Prices
              </Typography>

              {(watch("timeSlots") || []).map((slot, index) => (
                <Paper key={index} sx={{ p: 2, mt: 1, display: "flex", gap: 1, alignItems: "center" }} elevation={1}>
                  {/* Start Hour Dropdown */}
                  <TextField
                    label="Start Hour"
                    select
                    value={slot.start}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      const updated = [...watch("timeSlots")];
                      updated[index].start = value;
                      setValue("timeSlots", updated);
                    }}
                    sx={{ flex: 1 }}
                    required
                  >
                    {Array.from({ length: 18 }, (_, i) => i + 6).map((hour) => (
                      <MenuItem key={hour} value={hour}>
                        {hour}:00
                      </MenuItem>
                    ))}
                  </TextField>

                  {/* End Hour Dropdown */}
                  <TextField
                    label="End Hour"
                    select
                    value={slot.end}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      const updated = [...watch("timeSlots")];
                      updated[index].end = value;
                      setValue("timeSlots", updated);
                    }}
                    sx={{ flex: 1 }}
                    required
                  >
                    {Array.from({ length: 18 }, (_, i) => i + 6).map((hour) => (
                      <MenuItem key={hour} value={hour}>
                        {hour}:00
                      </MenuItem>
                    ))}
                  </TextField>

                  {/* Price */}
                  <TextField
                    label="Price"
                    type="number"
                    value={slot.price}
                    onChange={(e) => {
                      const updated = [...watch("timeSlots")];
                      updated[index].price = Number(e.target.value);
                      setValue("timeSlots", updated);
                    }}
                    sx={{ width: 100 }}
                    required
                  />

                  {/* Remove Slot */}
                  <IconButton
                    color="error"
                    disabled={watch("timeSlots").length === 1} // prevent removing last slot
                    onClick={() => {
                      const updated = watch("timeSlots").filter((_, i) => i !== index);
                      setValue("timeSlots", updated);
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Paper>
              ))}

              {/* Error if no slots */}
              {(!watch("timeSlots") || watch("timeSlots").length === 0) && (
                <Typography color="error" variant="body2">
                  At least one time slot is required
                </Typography>
              )}

              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 1 }}
                onClick={() => {
                  setValue("timeSlots", [...(watch("timeSlots") || []), { start: 6, end: 7, price: 0 }]);
                }}
              >
                Add Time Slot
              </Button>
            </Box>
            {/* <TextField
            fullWidth
            label="Price"
            type="number"
            margin="normal"
            {...register("price", {
              required: "Price is required",
              min: 0,
            })}
            error={!!errors.price}
            helperText={errors.price?.message}
          /> */}

            <TextField fullWidth label="Description" margin="normal" multiline rows={3} {...register("description")} />

            {/* Upload Images */}
            <Button variant="contained" component="label" fullWidth sx={{ mt: 2 }} onClick={() => setOpenMarker(true)}>
              {watchHotspot ? "Update Hotspot" : "Add Hotspot"}
            </Button>
            <p> {JSON.stringify(watchHotspot)}</p>

            <Button variant="contained" component="label" fullWidth sx={{ mt: 2 }}>
              Upload Images
              <input type="file" accept="image/*" multiple hidden onChange={handleFileChange} />
            </Button>

            <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }} disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : "Add"}
            </Button>
          </Box>
        </Box>
      </Modal>
      <ImageMarkerModal
        open={openMarker}
        onClose={() => setOpenMarker(false)}
        onSave={(point) => {
          setValue("hotspot", point);
        }}
      />
    </>
  );
}
