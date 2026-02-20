"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Paper,
  CircularProgress,
  Switch,
  FormControlLabel,
  IconButton,
} from "@mui/material";
import toast from "react-hot-toast";
import CloseIcon from "@mui/icons-material/Close";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { Navigation, Thumbs } from "swiper/modules";

// Drag & drop
import { useDropzone } from "react-dropzone";
import ImageMarkerModal from "./ImageMarker";

export default function ProductDetailAdmin({ product }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [previewImages, setPreviewImages] = useState(product.images || []);
  const [loading, setLoading] = useState(false);

  const sportsOptions = ["Basketball", "Pickleball", "Tennis", "Volleyball", "Badminton"];

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: product.name,
      sport: product.sport,
      convertible: product.convertible || false,
      otherSports: product.otherSports || [],
      price: product.price,
      description: product.description,
      images: product.images || [],
      timeSlots: product.timeSlots || [{ start: 6, end: 23, price: 0 }],
      hotspot: product.hotspot || null,
    },
  });

  const [openMarker, setOpenMarker] = useState(false);
  const watchHotspot = watch("hotspot");
  const watchSport = watch("sport");
  const watchConvertible = watch("convertible");

  // Dropzone
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop: (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        const url = URL.createObjectURL(file);
        setPreviewImages((prev) => [...prev, url]);
      });
      setValue("images", acceptedFiles, { shouldValidate: true });
    },
  });

  // PUT update
  const onUpdate = async (data) => {
    try {
      setLoading(true);

      const payload = {
        name: data.name,
        sport: data.sport,
        convertible: data.convertible,
        otherSports: data.convertible ? data.otherSports : [],
        price: data.price,
        description: data.description,
        timeSlots: data.timeSlots,
        hotspot: data.hotspot,
      };

      const res = await fetch(`/api/facilities/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to update facility");

      toast.success("Facility updated successfully!");
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    await onUpdate(data);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-md bg-white rounded-lg">
      {/* LEFT SIDE - IMAGES */}
      <div>
        <Swiper
          spaceBetween={10}
          navigation
          thumbs={{ swiper: thumbsSwiper }}
          modules={[Navigation, Thumbs]}
          className="rounded-lg overflow-hidden"
          style={{ height: "400px" }}
        >
          {previewImages.map((img, i) => (
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
          slidesPerView={6}
          freeMode
          watchSlidesProgress
          modules={[Thumbs]}
          className="mt-4"
        >
          {previewImages.map((img, i) => (
            <SwiperSlide key={i}>
              <img
                src={img}
                alt={`${product.name} thumb ${i}`}
                className="w-20 h-20 object-cover rounded-lg cursor-pointer border border-gray-200"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <Paper
          {...getRootProps()}
          sx={{
            mt: 4,
            p: 2,
            textAlign: "center",
            border: "2px dashed gray",
            cursor: "pointer",
          }}
        >
          <input {...getInputProps()} />
          <Typography>Drag & drop images here, or click to select</Typography>
        </Paper>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div>
        <Typography variant="h4" fontWeight="bold" mb={4}>
          Edit Facility
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Name */}
          <Controller
            name="name"
            control={control}
            rules={{ required: "Facility name is required" }}
            render={({ field }) => (
              <TextField {...field} label="Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />
            )}
          />

          {/* Main Sport */}
          <Controller
            name="sport"
            control={control}
            rules={{ required: "Sport is required" }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.sport}>
                <InputLabel>Sport</InputLabel>
                <Select {...field} label="Sport">
                  {sportsOptions.map((sport) => (
                    <MenuItem key={sport} value={sport}>
                      {sport}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />

          {/* Convertible Switch */}
          <Controller
            name="convertible"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    {...field}
                    checked={field.value}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      field.onChange(checked);

                      if (!checked) {
                        setValue("otherSports", []);
                      }
                    }}
                  />
                }
                label="Convertible"
              />
            )}
          />

          {/* Multi Select Sports */}
          {watchConvertible && (
            <Controller
              name="otherSports"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Other Supported Sports</InputLabel>
                  <Select {...field} multiple label="Other Supported Sports">
                    {sportsOptions
                      .filter((sport) => sport !== watchSport)
                      .map((sport) => (
                        <MenuItem key={sport} value={sport}>
                          {sport}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              )}
            />
          )}

          {/* Price */}
          {/* <Controller
            name="price"
            control={control}
            rules={{
              required: "Price is required",
              min: {
                value: 0,
                message: "Price cannot be negative",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Price"
                type="number"
                fullWidth
                error={!!errors.price}
                helperText={errors.price?.message}
              />
            )}
          /> */}

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

          {/* Description */}
          <Controller
            name="description"
            control={control}
            rules={{ required: "Description is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Description"
                multiline
                rows={4}
                fullWidth
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            )}
          />

          <Button variant="contained" component="label" fullWidth sx={{ mt: 2 }} onClick={() => setOpenMarker(true)}>
            {watchHotspot ? "Update Hotspot" : "Add Hotspot"}
          </Button>

          <Button type="submit" variant="contained">
            {loading ? <CircularProgress size={24} /> : "Update Facility"}
          </Button>
        </form>
      </div>

      <ImageMarkerModal
        open={openMarker}
        onClose={() => setOpenMarker(false)}
        onSave={(point) => {
          setValue("hotspot", point);
        }}
        defaultPoints={product.hotspot}
      />
    </div>
  );
}
