"use client";

import { useState, useRef } from "react";
import { Box } from "@mui/material";
import Link from "next/link";

export default function FloorplanWithHotspot({ facilities }) {
  const imgRef = useRef<HTMLImageElement>(null);

  const handleHotspotClick = () => {
    alert("Hotspot clicked!");
  };

  console.log(facilities);
  return (
    <Box sx={{ width: "100%", maxWidth: 700, mx: "auto", position: "relative" }}>
      <img ref={imgRef} src="/freedom.jpg" alt="Freedom" style={{ width: "100%", borderRadius: 8, display: "block" }} />

      {facilities?.length > 0 &&
        facilities.map(({ hotspot, _id }) => {
          return hotspot ? (
            <Link
              key={_id}
              href={`/facilities/${_id}`}
              style={{
                position: "absolute",
                left: `${hotspot.x}%`,
                top: `${hotspot.y}%`,
                transform: "translate(-50%, -50%)",
                width: 20,
                height: 20,
                borderRadius: "50%",
                backgroundColor: "red",
                border: "2px solid white",
                cursor: "pointer",
                boxShadow: "0 0 6px rgba(0,0,0,0.4)",
              }}
              title="Click hotspot"
            />
          ) : (
            <></>
          );
        })}
    </Box>
  );
}
