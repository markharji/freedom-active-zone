"use client";

import { Box, Tooltip, Stack, Typography } from "@mui/material";
import Link from "next/link";

interface Facility {
  _id: string;
  name: string;
  sport?: string;
  convertible?: boolean;
  hotspot?: { x: number; y: number }[];
}

interface Props {
  facilities: Facility[];
}

const getSportColor = (sport?: string) => {
  switch (sport) {
    case "Basketball":
      return {
        fill: "rgba(220, 53, 69, 0.35)",
        hover: "rgba(220, 53, 69, 0.55)",
        stroke: "rgba(220, 53, 69, 0.9)",
      };
    case "Pickleball":
      return {
        fill: "rgba(0, 123, 255, 0.35)",
        hover: "rgba(0, 123, 255, 0.55)",
        stroke: "rgba(0, 123, 255, 0.9)",
      };
    default:
      return {
        fill: "rgba(108, 117, 125, 0.35)",
        hover: "rgba(108, 117, 125, 0.55)",
        stroke: "rgba(108, 117, 125, 0.9)",
      };
  }
};

export default function FloorplanWithHotspot({ facilities }: Props) {
  return (
    <div>
      {/* Legend */}
      <div className="flex gap-4 p-2 flex-wrap">
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 18, height: 18, backgroundColor: "rgba(220,53,69,0.6)", borderRadius: 1 }} />
          <Typography variant="body2">Basketball</Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 18, height: 18, backgroundColor: "rgba(0,123,255,0.6)", borderRadius: 1 }} />
          <Typography variant="body2">Pickleball</Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 18, height: 18, backgroundColor: "rgba(108,117,125,0.6)", borderRadius: 1 }} />
          <Typography variant="body2">Other</Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              border: "1.5px solid black",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              fontWeight: "bold",
            }}
          >
            ↺
          </Box>
          <Typography variant="body2">Convertible</Typography>
        </Stack>
      </div>

      <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", position: "relative" }}>
        <img
          src="/freedom.jpg"
          alt="Freedom"
          style={{
            width: "100%",
            borderRadius: 8,
            display: "block",
          }}
        />

        {facilities?.map(({ hotspot, _id, name, sport, convertible }) => {
          if (!hotspot || hotspot.length < 3) return null;

          const { fill, hover, stroke } = getSportColor(sport);

          const xs = hotspot.map((p) => p.x);
          const ys = hotspot.map((p) => p.y);

          const minX = Math.min(...xs);
          const maxX = Math.max(...xs);
          const minY = Math.min(...ys);
          const maxY = Math.max(...ys);

          const width = maxX - minX;
          const height = maxY - minY;

          const points = hotspot.map((p) => `${p.x - minX},${p.y - minY}`).join(" ");

          return (
            <Tooltip
              key={_id}
              title={
                <p className="text-sm">
                  {name}
                  {convertible && " (Convertible)"}
                </p>
              }
              placement="top"
              arrow
            >
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
                  {/* Polygon */}
                  <polygon
                    points={points}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={0.5}
                    style={{
                      transition: "transform 0.2s, fill 0.2s",
                      transformOrigin: "50% 50%",
                    }}
                    onMouseEnter={(e) => {
                      const target = e.currentTarget;
                      target.style.transform = "scale(1.05)";
                      target.style.fill = hover;
                    }}
                    onMouseLeave={(e) => {
                      const target = e.currentTarget;
                      target.style.transform = "scale(1)";
                      target.style.fill = fill;
                    }}
                  />

                  {/* Centered smaller convertible badge */}
                  {convertible && (
                    <g>
                      <circle
                        cx={width / 2}
                        cy={height / 2}
                        r={Math.min(width, height) * 0.08}
                        fill="white"
                        stroke={stroke}
                        strokeWidth={0.5}
                      />
                      <text
                        x={width / 2}
                        y={height / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={Math.min(width, height) * 0.12}
                        fontWeight="bold"
                        fill={stroke}
                      >
                        ↺
                      </text>
                    </g>
                  )}
                </svg>
              </Link>
            </Tooltip>
          );
        })}
      </Box>
    </div>
  );
}
