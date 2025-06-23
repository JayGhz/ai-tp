"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { Datum } from "@/components/ui/TooltipBar";
import { scaleBand, scaleLinear, max, format } from "d3";
import {
  TooltipBar,
  TooltipBarDivTrigger,
  TooltipBarContent,
  useTooltipBarContext,
} from "@/components/ui/TooltipBar";
import { AnimatedBar } from "@/components/ui/AnimatedBar";

// Componente que recibe los datos como prop
function HorizontalBarChartContent({ data }: { data: Datum[] }) {
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  const yScale = scaleBand<string>()
    .domain(sortedData.map((d) => d.key))
    .range([0, 100])
    .padding(0.175);

  const xScale = scaleLinear()
    .domain([0, max(sortedData.map((d) => d.value)) ?? 0])
    .range([0, 100]);

  const longestWord = max(sortedData.map((d) => d.key.length)) || 1;

  const { tooltip } = useTooltipBarContext("HorizontalBarChart");

  return (
    <div
      className="relative w-full h-full"
      style={
        {
          "--marginTop": "14px",
          "--marginRight": "8px",
          "--marginBottom": "25px",
          "--marginLeft": `${longestWord * 7}px`,
        } as CSSProperties
      }
    >
      {/* Chart Area */}
      <div
        className="absolute inset-0
                    z-10
                    h-[calc(100%-var(--marginTop)-var(--marginBottom))] 
                    w-[calc(100%-var(--marginLeft)-var(--marginRight))] 
                    translate-x-[var(--marginLeft)] 
                    translate-y-[var(--marginTop)] 
                    overflow-hidden"
      >
        {sortedData.map((d, i) => {
          const topPerc = yScale(d.key)!;
          const heightPerc = yScale.bandwidth();
          const widthPerc = xScale(d.value);

          return (
            <AnimatedBar
              key={d.key}
              index={i}
              style={{ top: 0, left: 0, width: "100%", height: "100%" }}
            >
              <TooltipBarDivTrigger datum={d}>
                <div
                  className="absolute transition-all duration-200 ease-out"
                  style={{
                    left: "0%",
                    top: `${topPerc}%`,
                    width: `${widthPerc}%`,
                    height: `${heightPerc}%`,
                    backgroundColor: d.color,
                    borderRadius: "0 6px 6px 0",
                    pointerEvents: "auto",
                  }}
                />
              </TooltipBarDivTrigger>
            </AnimatedBar>
          );
        })}

        <svg
          className="h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          pointerEvents="none"
        >
          {xScale
            .ticks(8)
            .map(xScale.tickFormat(8, "d"))
            .map((tickLabel, idx) => (
              <g
                key={idx}
                transform={`translate(${xScale(+tickLabel)})`}
                className="text-zinc-600 dark:text-zinc-400"
              >
                <line
                  y1={0}
                  y2={100}
                  stroke="currentColor"
                  strokeDasharray="6,5"
                  strokeWidth={0.5}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            ))}
        </svg>
      </div>

      {/* Y axis */}
      <svg
        className="absolute inset-0 
                    h-[calc(100%-var(--marginTop)-var(--marginBottom))] 
                    translate-y-[var(--marginTop)] 
                    overflow-visible"
      >
        <g className="translate-x-[calc(var(--marginLeft)-8px)]">
          {sortedData.map((entry) => {
            const y = yScale(entry.key)! + yScale.bandwidth() / 2;
            return (
              <text
                key={entry.key}
                x="0"
                y={`${y}%`}
                dy=".35em"
                textAnchor="end"
                fill="currentColor"
                className="text-xs dark:text-zinc-400"
              >
                {entry.key}
              </text>
            );
          })}
        </g>
      </svg>

      {/* X axis */}
      <svg
        className="absolute inset-0 
                    w-[calc(100%-var(--marginLeft)-var(--marginRight))] 
                    translate-x-[var(--marginLeft)] 
                    h-[calc(100%-var(--marginBottom))] 
                    translate-y-4 
                    overflow-visible"
      >
        <g className="overflow-visible">
          {xScale.ticks(4).map((value, idx) => (
            <text
              key={idx}
              x={`${xScale(value)}%`}
              y="100%"
              textAnchor="middle"
              fill="currentColor"
              className="text-xs tabular-nums dark:text-zinc-400"
            >
              {value}
            </text>
          ))}
        </g>
      </svg>

      {tooltip && (
        <TooltipBarContent>
          <div className="flex items-center gap-2">
            <div
              className="w-1 h-8 rounded-sm"
              style={{ backgroundColor: tooltip.datum.color }}
            />
            <div>
              <p className="text-sm font-semibold">{tooltip.datum.key}</p>
              <p className="text-xs text-gray-500">
                {format(".1f")(tooltip.datum.value)}%
              </p>
            </div>
          </div>
        </TooltipBarContent>
      )}
    </div>
  );
}

export function HorizontalBarChart() {
  const [data, setData] = useState<Datum[] | null>(null);

  useEffect(() => {
    fetch("/eda.json")
      .then((res) => res.json())
      .then((json) => {
        setData(json.horizontalBar);
      })
      .catch((err) => console.error("Error loading EDA data:", err));
  }, []);

  if (!data) {
    return null
  }

  return (
    <TooltipBar>
      <HorizontalBarChartContent data={data} />
    </TooltipBar>
  );
}
