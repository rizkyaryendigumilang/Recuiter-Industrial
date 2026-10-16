'use client';

import React from 'react';

export interface DimensionScore {
  label: string;
  key: string;
  score: number; // 0 - 100
  description?: string;
}

interface RadarChartProps {
  dimensions: DimensionScore[];
  size?: number;
  color?: string; // hex or tailwind class
  title?: string;
}

export function RadarChart({
  dimensions,
  size = 320,
  color = '#6366F1',
  title,
}: RadarChartProps) {
  const center = size / 2;
  const radius = center * 0.72;
  const totalAxes = dimensions.length;
  const angleStep = (Math.PI * 2) / totalAxes;

  // Levels for background concentric polygons (e.g. 20%, 40%, 60%, 80%, 100%)
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Helper to compute (x, y) given angle and value (0-1)
  const getCoordinates = (angle: number, value: number) => {
    const r = radius * value;
    // Rotate by -Math.PI / 2 so first axis points straight up
    const x = center + r * Math.sin(angle);
    const y = center - r * Math.cos(angle);
    return { x, y };
  };

  // Compute polygon points for the data
  const dataPoints = dimensions.map((d, index) => {
    const angle = index * angleStep;
    const normalizedScore = Math.max(0.1, Math.min(1.0, d.score / 100));
    return getCoordinates(angle, normalizedScore);
  });

  const polygonPath = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="flex flex-col items-center">
      {title && (
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2 font-mono">
          {title}
        </h4>
      )}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible select-none"
      >
        {/* Background Concentric Polygons */}
        {levels.map((lvl) => {
          const levelPoints = Array.from({ length: totalAxes }).map((_, i) => {
            const angle = i * angleStep;
            return getCoordinates(angle, lvl);
          });
          const path = levelPoints.map((p) => `${p.x},${p.y}`).join(' ');
          return (
            <polygon
              key={`level-${lvl}`}
              points={path}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="1"
              strokeDasharray={lvl === 1.0 ? 'none' : '3 3'}
            />
          );
        })}

        {/* Axes lines from center to outer bounds */}
        {dimensions.map((d, i) => {
          const angle = i * angleStep;
          const outer = getCoordinates(angle, 1.0);
          return (
            <line
              key={`axis-${d.key}`}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke="#E5E7EB"
              strokeWidth="1.2"
            />
          );
        })}

        {/* Filled Data Polygon */}
        <polygon
          points={polygonPath}
          fill={color}
          fillOpacity="0.22"
          stroke={color}
          strokeWidth="2.5"
          className="transition-all duration-300"
        />

        {/* Data points (dots) and value indicators */}
        {dataPoints.map((pt, i) => (
          <circle
            key={`dot-${i}`}
            cx={pt.x}
            cy={pt.y}
            r="4.5"
            fill="#FFFFFF"
            stroke={color}
            strokeWidth="2.5"
            className="hover:r-6 transition-all"
          />
        ))}

        {/* Axis Labels */}
        {dimensions.map((d, i) => {
          const angle = i * angleStep;
          // Offset label slightly outside outer edge
          const labelCoord = getCoordinates(angle, 1.18);
          // Text anchor alignment based on x position
          let textAnchor: 'middle' | 'start' | 'end' = 'middle';
          if (labelCoord.x > center + 10) textAnchor = 'start';
          else if (labelCoord.x < center - 10) textAnchor = 'end';

          return (
            <g key={`label-${d.key}`}>
              <text
                x={labelCoord.x}
                y={labelCoord.y}
                textAnchor={textAnchor}
                className="text-[11px] font-semibold fill-neutral-800"
                alignmentBaseline="central"
              >
                {d.label}
              </text>
              <text
                x={labelCoord.x}
                y={labelCoord.y + 13}
                textAnchor={textAnchor}
                className="text-[10px] font-mono font-bold fill-[#6366F1]"
                alignmentBaseline="central"
              >
                {Math.round(d.score)}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
