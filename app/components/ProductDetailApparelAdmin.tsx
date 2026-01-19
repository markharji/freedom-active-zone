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
} from "@mui/material";
import toast from "react-hot-toast";

// Swiper for images
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { Navigation, Thumbs } from "swiper/modules";

// Drag & drop
import { useDropzone } from "react-dropzone";

export default function ProductDetailAdmin({ product }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [previewImages, setPreviewImages] = useState(product.images || []);
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: product.name,
      sport: product.sport,
      price: product.price,
      description: product.description,
      images: product.images || [],
    },
  });

  // Dropzone for uploading images
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

  // PUT request to update apparel
  const onUpdate = async (data) => {
    try {
      setLoading(true);
      delete data.images;
      const res = await fetch(`/api/apparels/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "Failed to update apparel");

      toast.success("Apparel updated successfully!");
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error(err.message || "Update failed");
    }
  };

  const onSubmit = async (data) => {
    await onUpdate(data);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-md bg-white rounded-lg">
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

        {/* Dropzone */}
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

      {/* Right: Admin Form */}
      <div>
        <Typography variant="h4" fontWeight="bold" mb={4}>
          Edit Apparel
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Controller
            name="name"
            control={control}
            rules={{ required: "Apparel name is required" }}
            render={({ field }) => (
              <TextField {...field} label="Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />
            )}
          />

          <Controller
            name="sport"
            control={control}
            rules={{ required: "Sport is required" }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.sport}>
                <InputLabel>Sport</InputLabel>
                <Select {...field} label="Sport">
                  <MenuItem value="Basketball">Basketball</MenuItem>
                  <MenuItem value="Pickleball">Pickleball</MenuItem>
                  <MenuItem value="Tennis">Tennis</MenuItem>
                </Select>
              </FormControl>
            )}
          />

          <Controller
            name="price"
            control={control}
            rules={{
              required: "Price is required",
              min: { value: 0, message: "Price cannot be negative" },
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
          />

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

          <Button type="submit" variant="contained" color="primary">
            {loading ? <CircularProgress /> : "Update Apparel"}
          </Button>
        </form>
      </div>
    </div>
  );
}
