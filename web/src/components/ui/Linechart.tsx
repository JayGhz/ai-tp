"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import {
  scaleTime,
  scaleLinear,
  max,
  line as d3_line,
  tickStep,
} from "d3";
import {
  ClientTooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { AnimatedLine } from "@/components/ui/AnimatedLine";

type LinePoint = {
  date: Date;
  value: number;
};

export function AnimatedLineChart() {
  const [data, setData] = useState<LinePoint[]>([]);

  useEffect(() => {
    fetch("/eda.json")
      .then((res) => res.json())
      .then((json) => {
        const loaded = json.lineChart || [];
        const parsed = loaded.map((d: any) => ({
          date: new Date(d.date),
          value: d.value,
        }));
        setData(parsed);
      });
  }, []);

  if (data.length === 0) return null;

  const xScale = scaleTime()
    .domain([data[0].date, data[data.length - 1].date])
    .range([0, 100]);


  const minValue = Math.min(...data.map((d) => d.value));
  const maxValue = Math.max(...data.map((d) => d.value));
  const margin = (maxValue - minValue) * 0.5;

  const yScale = scaleLinear()
    .domain([minValue - margin, maxValue + margin])
    .range([100, 0]);

  const line = d3_line<LinePoint>()
    .x((d) => xScale(d.date))
    .y((d) => yScale(d.value));

  const dPath = line(data);
  if (!dPath) return null;

  return (
    <div
      className="relative h-full w-full"
      style={
        {
          "--marginTop": "5px",
          "--marginRight": "10px",
          "--marginBottom": "25px",
          "--marginLeft": "40px",
        } as CSSProperties
      }
    >
      {/* Y axis */}
      <div className="absolute inset-0 h-[calc(100%-var(--marginTop)-var(--marginBottom))] w-[var(--marginLeft)] translate-y-[var(--marginTop)] overflow-visible">
        {yScale
          .ticks(8)
          .map((value, i) => (
            <div
              key={i}
              style={{ top: `${yScale(+value)}%`, left: "0%" }}
              className="absolute text-xs tabular-nums -translate-y-1/2 dark:text-zinc-400 w-[30px] text-right pr-1"
            >
              {value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
            </div>
          ))}
      </div>

      {/* Chart Area */}
      <div className="absolute inset-0 h-[calc(100%-var(--marginTop)-var(--marginBottom))] w-[calc(100%-var(--marginLeft)-var(--marginRight))] translate-x-[var(--marginLeft)] translate-y-[var(--marginTop)] overflow-visible">
        <svg
          viewBox="0 0 100 100"
          className="overflow-visible w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Grid Lines */}
          {yScale
            .ticks(8)
            .map(yScale.tickFormat(8, "d"))
            .map((active, i) => (
              <g
                transform={`translate(0,${yScale(+active)})`}
                className="text-zinc-600 dark:text-zinc-400"
                key={i}
              >
                <line
                  x1={0}
                  x2={100}
                  stroke="currentColor"
                  strokeDasharray="6,5"
                  strokeWidth={0.5}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            ))}

          {/* Line */}
          <AnimatedLine>
            <path
              d={dPath}
              fill="none"
              className="stroke-fuchsia-400"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </AnimatedLine>

          {/* Circles + Tooltips */}
          {data.map((d, index) => {
            const currentX = xScale(d.date);
            let segmentWidth = 2;
            let segmentX = currentX;

            if (index === data.length - 1) {
              const prevX = xScale(data[index - 1]?.date || d.date);
              segmentWidth = currentX - prevX;
              segmentX = prevX;
            } else if (index === 0) {
              const nextX = xScale(data[1]?.date || d.date);
              segmentWidth = (nextX - currentX) / 2;
              segmentX = currentX;
            } else {
              const nextX = xScale(data[index + 1].date);
              const prevX = xScale(data[index - 1].date);
              segmentWidth = (nextX - prevX) / 2;
              segmentX = currentX - segmentWidth / 2;
            }

            return (
              <ClientTooltip key={index}>
                <TooltipTrigger>
                  <path
                    d={`M ${xScale(d.date)} ${yScale(d.value)} l 0.0001 0`}
                    vectorEffect="non-scaling-stroke"
                    strokeWidth="7"
                    strokeLinecap="round"
                    fill="none"
                    stroke="currentColor"
                    className="text-fuchsia-300"
                  />
                  <g className="group/tooltip">
                    <line
                      x1={xScale(d.date)}
                      y1={0}
                      x2={xScale(d.date)}
                      y2={100}
                      stroke="currentColor"
                      strokeWidth={1}
                      className="opacity-0 group-hover/tooltip:opacity-100 text-zinc-300 dark:text-zinc-600 transition-opacity"
                      vectorEffect="non-scaling-stroke"
                      style={{ pointerEvents: "none" }}
                    />
                    <rect
                      x={segmentX}
                      y={0}
                      width={Math.max(0, segmentWidth)}
                      height={100}
                      fill="transparent"
                    />
                  </g>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm font-semibold">
                    {d.date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                    })}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {d.value.toLocaleString("en-US")}
                  </div>
                </TooltipContent>
              </ClientTooltip>
            );
          })}
        </svg>

        {/* X Axis */}
        <div className="translate-y-0">
          {data.map((day, i) => {
            const isFirst = i === 0;
            const isLast = i === data.length - 2;
            const isMax = day.value === Math.max(...data.map((d) => d.value));
            if (!isFirst && !isLast && !isMax) return null;
            return (
              <div key={i} className="overflow-visible dark:text-zinc-400">
                <div
                  style={{
                    left: `${xScale(day.date)}%`,
                    top: "100%",
                  }}
                  className="text-xs absolute"
                >
                  {day.date.toLocaleDateString("es", {
                    day: "numeric",
                    month: "numeric",
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
