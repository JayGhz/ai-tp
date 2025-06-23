"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { scaleBand, scaleLinear, max, tickStep, format } from "d3";
import { AnimatedBarVertical } from "@/components/ui/AnimatedBarVertical";
import {
  TooltipBarDivTrigger,
  TooltipBarContent,
  useTooltipBarContext,
  TooltipBar,
} from "@/components/ui/TooltipBar";

import type { Datum } from "@/components/ui/TooltipBar";

function BarChartVerticalContent() {
  const [data, setData] = useState<Datum[]>([]);

  useEffect(() => {
    fetch("/eda.json")
      .then((res) => res.json())
      .then((json) => {
        setData(json.verticalBar || []);
      });
  }, []);

  const minBars = 5;
  const filledData: Datum[] = [
    ...data,
    ...Array.from({ length: Math.max(0, minBars - data.length) }, (_, i) => ({
      key: `Empty ${i + 1}`,
      value: 0,
      color: "#33C2EA",
    })),
  ];

  const xScale = scaleBand<string>()
    .domain(filledData.map((d) => d.key))
    .range([0, 100])
    .padding(0.175);

  const maxValue = max(data.map((d) => d.value)) ?? 0;
  const idealTickCount = 8;
  const step = tickStep(0, maxValue, idealTickCount);
  const niceMaxValue = Math.ceil(maxValue / step) * step;

  const yScale = scaleLinear()
    .domain([0, niceMaxValue > 0 ? niceMaxValue : 1])
    .range([100, 0]);

  const { tooltip } = useTooltipBarContext("BarChartVertical");

  return (
    <div
      className="relative h-full w-full grid"
      style={
        {
          "--marginTop": "20px",
          "--marginRight": "8px",
          "--marginBottom": "40px",
          "--marginLeft": "30px",
        } as CSSProperties
      }
    >
      {/* Y axis */}
      <div
        className="relative
          h-[calc(100%-var(--marginTop)-var(--marginBottom))]
          w-[var(--marginLeft)]
          translate-y-[var(--marginTop)]
          overflow-visible"
      >
        {yScale.ticks(idealTickCount).map((value, i) => (
          <div
            key={i}
            style={{ top: `${yScale(value)}%` }}
            className="absolute text-xs tabular-nums -translate-y-1/2 dark:text-zinc-400 w-full text-right pr-2"
          >
            {value}
          </div>
        ))}
      </div>

      {/* Chart area + bars */}
      <div
        className="absolute inset-0
          h-[calc(100%-var(--marginTop)-var(--marginBottom))]
          w-[calc(100%-var(--marginLeft)-var(--marginRight))]
          translate-x-[var(--marginLeft)]
          translate-y-[var(--marginTop)]
          overflow-visible"
      >
        <svg
          viewBox="0 0 100 100"
          className="overflow-visible w-full h-full"
          preserveAspectRatio="none"
        >
          {yScale.ticks(idealTickCount).map((active, i) =>
            active === 0 ? null : (
              <g
                key={i}
                transform={`translate(0,${yScale(active)})`}
                className="text-zinc-600 dark:text-zinc-400"
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
            )
          )}
        </svg>

        {/* Labels */}
        {data.map((entry, i) => {
          const xPosition = xScale(entry.key)! + xScale.bandwidth() / 2;
          return (
            <div
              key={i}
              className="absolute mt-2 overflow-visible dark:text-zinc-400"
              style={{
                left: `${xPosition}%`,
                top: "100%",
                transform: "rotate(25deg) translateX(1px) translateY(6px)",
              }}
            >
              <div className="absolute text-xs -translate-y-1/2 whitespace-nowrap">
                {entry.key.length > 10
                  ? `${entry.key.slice(0, 10)}...`
                  : entry.key}
              </div>
            </div>
          );
        })}

        {/* Bars */}
        {filledData.map((d, index) => {
          if (d.value === 0) return null;

          const barWidth = xScale.bandwidth();
          const barHeight = yScale(0) - yScale(d.value);

          return (
            <AnimatedBarVertical
              key={index}
              index={index}
              style={{ top: 0, left: 0, width: "100%", height: "100%" }}
            >
              <TooltipBarDivTrigger datum={d}>
                <div
                  className="pointer-events-auto transition-all duration-300 ease-in-out"
                  style={{
                    position: "absolute",
                    left: `${xScale(d.key)}%`,
                    bottom: "0",
                    width: `${barWidth}%`,
                    height: `${barHeight}%`,
                    backgroundColor: d.color ?? "#33C2EA",
                    borderRadius: "6px 6px 0 0",
                  }}
                />
              </TooltipBarDivTrigger>
            </AnimatedBarVertical>
          );
        })}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <TooltipBarContent>
          <div className="flex items-center gap-2">
            <div
              className="w-1 h-8 rounded-sm"
              style={{ backgroundColor: tooltip.datum.color ?? "#33C2EA" }}
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

export function BarChartVertical() {
  return (
    <TooltipBar>
      <BarChartVerticalContent />
    </TooltipBar>
  );
}
