"use client";

import { useState, useRef } from "react";
import { Modal, Box, Typography, IconButton, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function ImageMarkerModal({ open, onClose, onSave }) {
  const imgRef = useRef(null);
  const [point, setPoint] = useState(null); // ✅ single hotspot

  const handleClick = (e) => {
    if (!imgRef.current) return;

    const rect = imgRef.current.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Replace existing point (only one allowed)

    setPoint({ x, y });
  };

  const handleClear = () => {
    setPoint(null);
  };

  const handleSave = () => {
    onSave(point); // keep array format for compatibility
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700,
          bgcolor: "background.paper",
          borderRadius: 2,
          p: 3,
          boxShadow: 24,
        }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography fontWeight="bold">Configure Hotspot</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Image Container */}
        <Box mt={2} sx={{ position: "relative" }}>
          <img
            ref={imgRef}
            src="/freedom.jpg"
            alt="Freedom"
            style={{
              width: "100%",
              cursor: "crosshair",
              borderRadius: 8,
              display: "block",
            }}
            onClick={handleClick}
          />

          {/* Hotspot */}
          {point && (
            <div
              style={{
                position: "absolute",
                left: `${point.x}%`,
                top: `${point.y}%`,
                width: 20,
                height: 20,
                borderRadius: "50%",
                backgroundColor: "red",
                transform: "translate(-50%, -50%)",
                border: "2px solid white",
                boxShadow: "0 0 6px rgba(0,0,0,0.4)",
              }}
            />
          )}
        </Box>

        {/* Actions */}
        <Box mt={3} display="flex" gap={2}>
          <Button variant="outlined" fullWidth onClick={handleClear} disabled={!point}>
            Clear
          </Button>

          <Button variant="contained" fullWidth onClick={handleSave} disabled={!point}>
            Save Hotspot
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
