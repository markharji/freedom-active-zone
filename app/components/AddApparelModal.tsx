import { useState } from "react";
import { useForm } from "react-hook-form";
import { Modal, Box, Typography, TextField, Button, MenuItem, Paper, IconButton } from "@mui/material";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import CloseIcon from "@mui/icons-material/Close";

export default function AddFacilityModal({ open, onClose, fetchApparels, title = "Apparel" }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      sport: "",
      price: "",
      description: "",
      image: null,
    },
  });

  const [preview, setPreview] = useState(null);

  // Dropzone setup
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setValue("image", file, { shouldValidate: true });
      setPreview(URL.createObjectURL(file));
    },
  });

  const watchImage = watch("image");

  const submitHandler = async (data) => {
    try {
      const res = await fetch("/api/apparels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to add apparel");

      toast.success("Apparel added successfully!");

      reset();
      fetchApparels(); // refresh list
      onClose();
    } catch (err) {
      toast.error(err.message);
    }

    // close modal after submit
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 380,
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
          {/* Sport Dropdown */}
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
          {/* Description */}
          <TextField fullWidth label="Description" margin="normal" multiline rows={3} {...register("description")} />

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Add
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
