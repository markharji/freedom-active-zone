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
} from "@mui/material";
import toast from "react-hot-toast";
import CloseIcon from "@mui/icons-material/Close";

export default function AddFacilityModal({ open, onClose, fetchFacilities, title = "Facility" }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      sport: null,
      price: "",
      description: "",
      images: [],
    },
  });

  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const watchImages = watch("images");

  // Handle multiple file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const currentImages = watchImages || [];
    const updatedImages = [...currentImages, ...files];

    setValue("images", updatedImages, { shouldValidate: true });

    const urls = updatedImages.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
  };

  // Delete a selected image
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
      formData.append("price", data.price);
      formData.append("description", data.description);

      console.log(data);

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
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error(err.message);
    }
  };

  return (
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
            {...register("name", { required: "Name is required" })}
            error={!!errors.name}
            helperText={errors.name?.message}
          />

          <TextField
            select
            fullWidth
            label="Sport"
            margin="normal"
            {...register("sport", { required: "Sport is required" })}
            error={!!errors.sport}
            helperText={errors.sport?.message}
          >
            <MenuItem value="Basketball">Basketball</MenuItem>
            <MenuItem value="Pickleball">Pickleball</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="Price"
            type="number"
            margin="normal"
            {...register("price", { required: "Price is required", min: 0 })}
            error={!!errors.price}
            helperText={errors.price?.message}
          />

          <TextField fullWidth label="Description" margin="normal" multiline rows={3} {...register("description")} />

          {/* Multiple Image Upload */}
          <Button variant="contained" component="label" fullWidth sx={{ mt: 2 }}>
            Upload Images
            <input type="file" accept="image/*" multiple onChange={handleFileChange} />
          </Button>

          {/* Horizontally scrollable previews */}
          {/* {previews.length > 0 && (
            <Box
              sx={{
                display: "flex",
                overflowX: "auto",
                mt: 2,
                gap: 1,
                py: 1,
              }}
            >
              {previews.map((src, idx) => (
                <Box key={idx} sx={{ position: "relative", minWidth: 100, minHeight: 100 }}>
                  <Paper
                    sx={{
                      width: 100,
                      height: 100,
                      backgroundImage: `url(${src})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      borderRadius: 1,
                      border: "1px solid #ccc",
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveImage(idx)}
                    sx={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      bgcolor: "rgba(0,0,0,0.7)",
                      color: "#fff",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.9)" },
                    }}
                  >
                    ✕
                  </IconButton>
                </Box>
              ))}
            </Box>
          )} */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
            disabled={loading} // disable button when loading is true
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Add"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
