"use client";

import { useState, useRef } from "react";
import { Modal, Box, Typography, IconButton, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function ImageMarkerModal({ open, onClose, onSave }) {
  const imgRef = useRef(null);
  const [points, setPoints] = useState([]); // multiple points for polygon
  const [polygonFinalized, setPolygonFinalized] = useState(false);

  // Add a point on image click
  const handleClick = (e) => {
    if (!imgRef.current || polygonFinalized) return;

    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPoints([...points, { x, y }]);
  };

  // Clear all points
  const handleClear = () => {
    setPoints([]);
    setPolygonFinalized(false);
  };

  // Save polygon points
  const handleSave = () => {
    if (points.length < 3) {
      alert("Polygon must have at least 3 points");
      return;
    }
    onSave(points); // send array of points
    onClose();
  };

  // Finalize polygon (stop adding new points)
  const handleFinish = () => {
    if (points.length < 3) {
      alert("Polygon must have at least 3 points");
      return;
    }
    setPolygonFinalized(true);
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
          <Typography fontWeight="bold">Configure Polygon</Typography>
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
              cursor: polygonFinalized ? "default" : "crosshair",
              borderRadius: 8,
              display: "block",
            }}
            onClick={handleClick}
          />

          {/* SVG overlay for polygon */}
          {points.length > 0 && (
            <svg
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none", // allows clicks on image
              }}
            >
              {/* Filled polygon */}
              <polygon
                points={points.map((p) => `${p.x}% ${p.y}%`).join(",")}
                fill="rgba(255,0,0,0.3)" // semi-transparent fill
                stroke="red"
                strokeWidth="2"
              />

              {/* Draw lines explicitly connecting vertices */}
              {points.length > 1 &&
                points.map((p, i) => {
                  const next = points[(i + 1) % points.length];
                  return (
                    <line
                      key={i}
                      x1={`${p.x}%`}
                      y1={`${p.y}%`}
                      x2={`${next.x}%`}
                      y2={`${next.y}%`}
                      stroke="red"
                      strokeWidth="2"
                    />
                  );
                })}

              {/* Draw vertices */}
              {points.map((p, i) => (
                <circle key={i} cx={`${p.x}%`} cy={`${p.y}%`} r={5} fill="red" stroke="white" strokeWidth={1} />
              ))}
            </svg>
          )}
        </Box>

        {/* Actions */}
        <Box mt={3} display="flex" gap={2}>
          <Button variant="outlined" fullWidth onClick={handleClear} disabled={points.length === 0}>
            Clear
          </Button>

          {!polygonFinalized && (
            <Button variant="contained" fullWidth onClick={handleFinish} disabled={points.length < 3}>
              Finish Polygon
            </Button>
          )}

          <Button variant="contained" fullWidth onClick={handleSave} disabled={points.length < 3}>
            Save Polygon
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
