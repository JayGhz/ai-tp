"use client";

import { useEffect, useState, useRef } from "react";
import {
  ClientTooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/Tooltip";

function pastelBlueScale(val: number): string {
  const t = Math.max(0, Math.min(1, (val + 1) / 2));
  const palette = [
    "#f0faff", "#d6f0fb", "#c0e6f7", "#a9dcf3", "#94d3ef",
    "#7fc9eb", "#6ac0e7", "#56b6e3", "#42adde", "#2ea3da"
  ];
  const index = Math.min(palette.length - 1, Math.floor(t * palette.length));
  return palette[index];
}

type Cell = {
  row: string;
  col: string;
  value: number;
};

export default function CorrelationHeatmap() {
  const [data, setData] = useState<Cell[]>([]);
  const [hovered, setHovered] = useState<Cell | null>(null);
  const fillRef = useRef<string>("");

  useEffect(() => {
    fetch("/eda.json")
      .then((res) => res.json())
      .then((json) => {
        setData(json.correlationHeatmap || []);
      });
  }, []);

  if (data.length === 0) return null;

  const cellSize = 40;
  const cellGap = 3;
  const paddingTop = 20;
  const paddingLeft = 20;

  const rows = Array.from(new Set(data.map((d) => d.row)));
  const cols = Array.from(new Set(data.map((d) => d.col)));

  const width = cols.length * cellSize + paddingLeft;
  const height = rows.length * cellSize + paddingTop;

  return (
    <ClientTooltip>
      <div className="relative h-full w-full overflow-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
        >
          <TooltipTrigger>
            {data.map((d, i) => {
              const x = cols.indexOf(d.col) * cellSize + paddingLeft + cellGap / 2;
              const y = rows.indexOf(d.row) * cellSize + paddingTop + cellGap / 2;
              const fill = isNaN(d.value) ? "#e0e0e0" : pastelBlueScale(d.value);

              return (
                <g
                  key={i}
                  onPointerEnter={() => {
                    setHovered(d);
                    fillRef.current = fill;
                  }}
                  onPointerLeave={() => setHovered(null)}
                >
                  <rect
                    x={x}
                    y={y}
                    width={cellSize - cellGap}
                    height={cellSize - cellGap}
                    fill={fill}
                    rx={6}
                    ry={6}
                  />
                  {!isNaN(d.value) && (
                    <text
                      x={x + (cellSize - cellGap) / 2}
                      y={y + (cellSize - cellGap) / 2 + 4}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="bold"
                      className="fill-zinc-800 pointer-events-none select-none"
                    >
                      {d.value.toFixed(2)}
                    </text>
                  )}
                </g>
              );
            })}
          </TooltipTrigger>
        </svg>

        {hovered && (
          <TooltipContent>
            <div className="flex items-center gap-2">
              <div
                className="w-1 h-8 rounded-sm"
                style={{ backgroundColor: fillRef.current }}
              />
              <div>
                <p className="text-sm font-semibold">{`${hovered.row} ↔ ${hovered.col}`}</p>
                <p className="text-xs text-gray-500">
                  {hovered.value.toFixed(2)}
                </p>
              </div>
            </div>
          </TooltipContent>
        )}
      </div>
    </ClientTooltip>
  );
}
