"use client";

import { Box, Tooltip } from "@mui/material";
import Link from "next/link";

interface Facility {
  _id: string;
  name: string;
  hotspot?: { x: number; y: number }[]; // 0-100 %
}

interface Props {
  facilities: Facility[];
}

export default function FloorplanWithHotspot({ facilities }: Props) {
  return (
    <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", position: "relative" }}>
      {/* Floorplan image */}
      <img src="/freedom.jpg" alt="Freedom" style={{ width: "100%", borderRadius: 8, display: "block" }} />

      {/* Polygon hotspots */}
      {facilities?.map(({ hotspot, _id, name, sport }) => {
        if (!hotspot || hotspot.length < 3) return null;

        // Compute bounding box for the polygon
        const xs = hotspot.map((p) => p.x);
        const ys = hotspot.map((p) => p.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const width = maxX - minX;
        const height = maxY - minY;

        // Local polygon points relative to bounding box
        const points = hotspot.map((p) => `${p.x - minX},${p.y - minY}`).join(" ");

        return (
          <Tooltip key={_id} title={<p className="text-sm">{name}</p>} placement="top" arrow>
            <Link
              href={`/facilities/${_id}`}
              style={{
                position: "absolute",
                top: `${minY}%`,
                left: `${minX}%`,
                width: `${width}%`,
                height: `${height}%`,
                pointerEvents: "auto",
                display: "block",
              }}
            >
              <svg
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
                style={{
                  width: "100%",
                  height: "100%",
                  overflow: "visible",
                  cursor: "pointer",
                }}
              >
                <polygon
                  points={points}
                  fill="rgba(0,123,255,0.3)"
                  stroke="rgba(0,123,255,0.8)"
                  strokeWidth={0.5}
                  style={{
                    transition: "transform 0.2s, fill 0.2s",
                    transformOrigin: "50% 50%",
                  }}
                  onMouseEnter={(e) => {
                    const target = e.currentTarget;
                    target.style.transform = "scale(1.05)";
                    target.style.fill = "rgba(0,123,255,0.5)";
                  }}
                  onMouseLeave={(e) => {
                    const target = e.currentTarget;
                    target.style.transform = "scale(1)";
                    target.style.fill = "rgba(0,123,255,0.3)";
                  }}
                />
              </svg>
            </Link>
          </Tooltip>
        );
      })}
    </Box>
  );
}
