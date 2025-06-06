import type { CSSProperties } from "react";
import { scaleTime, scaleLinear, max, line as d3_line } from "d3";
import { ClientTooltip, TooltipContent, TooltipTrigger } from "@/components/ui/Tooltip";
import { AnimatedLine } from "@/components/ui/AnimatedLine";

const sales = [
  { date: "2023-04-30", value: 4 },
  { date: "2023-05-01", value: 6 },
  { date: "2023-05-02", value: 8 },
  { date: "2023-05-03", value: 7 },
  { date: "2023-05-04", value: 10 },
  { date: "2023-05-05", value: 12 },
  { date: "2023-05-06", value: 11 },
  { date: "2023-05-07", value: 8 },
  { date: "2023-05-08", value: 7 },
  { date: "2023-05-09", value: 9 },
];
const data = sales.map((d) => ({ ...d, date: new Date(d.date) }));

export function AnimatedLineChart() {
  const xScale = scaleTime()
    .domain([data[0].date, data[data.length - 1].date])
    .range([0, 100]);
  const yScale = scaleLinear()
    .domain([0, max(data.map((d) => d.value)) ?? 0])
    .range([100, 0]);

  const line = d3_line<(typeof data)[number]>()
    .x((d) => xScale(d.date))
    .y((d) => yScale(d.value));

  const d = line(data);

  if (!d) {
    return null;
  }

  return (
    <div
      className="relative h-full w-full"
      style={
        {
          "--marginTop": "20px",
          "--marginRight": "25px",
          "--marginBottom": "25px",
          "--marginLeft": "25px",
        } as CSSProperties
      }
    >
      {/* Y axis */}
      <div
        className="absolute inset-0
          h-[calc(100%-var(--marginTop)-var(--marginBottom))]
          w-[var(--marginLeft)]
          translate-y-[var(--marginTop)]
          overflow-visible
        "
      >
        {yScale
          .ticks(8)
          .map(yScale.tickFormat(8, "d"))
          .map((value, i) => (
            <div
              key={i}
              style={{
                top: `${yScale(+value)}%`,
                left: "0%",
              }}
              className="absolute text-xs tabular-nums -translate-y-1/2 dark:text-zinc-400 w-full text-right pr-2"
            >
              {value}
            </div>
          ))}
      </div>

      {/* Chart area */}
      <div
        className="absolute inset-0
          h-[calc(100%-var(--marginTop)-var(--marginBottom))]
          w-[calc(100%-var(--marginLeft)-var(--marginRight))]
          translate-x-[var(--marginLeft)]
          translate-y-[var(--marginTop)]
          overflow-visible
        "
      >
        <svg
          viewBox="0 0 100 100"
          className="overflow-visible w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
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
              d={d}
              fill="none"
              className="stroke-fuchsia-400"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </AnimatedLine>

          {/* Circles and Tooltips */}
          {data.map((d, index) => {
            // Calculate the x position and width for each interactive segment
            const currentX = xScale(d.date);
            let segmentWidth;
            let segmentX;

            if (index === data.length - 1) {
                // Last segment: calculate width from current point to the beginning of the previous segment
                const prevX = xScale(data[index - 1]?.date || d.date);
                segmentWidth = currentX - prevX;
                segmentX = prevX;
            } else {
                // All other segments: calculate width to the next point, and center around current point
                const nextX = xScale(data[index + 1]?.date || d.date);
                segmentWidth = (nextX - currentX) / 2 + (currentX - xScale(data[index -1]?.date || d.date)) / 2;
                segmentX = currentX - segmentWidth / 2;
            }

            // For the first data point, adjust width and x
            if (index === 0) {
                const nextX = xScale(data[1]?.date || d.date);
                segmentWidth = (nextX - currentX) / 2;
                segmentX = currentX;
            }
            
            // Ensure segmentWidth is never negative or zero
            segmentWidth = Math.max(0, segmentWidth);

            return (
              <ClientTooltip key={index}>
                <TooltipTrigger>
                  <path
                    key={index}
                    d={`M ${xScale(d.date)} ${yScale(d.value)} l 0.0001 0`}
                    vectorEffect="non-scaling-stroke"
                    strokeWidth="7"
                    strokeLinecap="round"
                    fill="none"
                    stroke="currentColor"
                    className="text-fuchsia-300"
                  />
                  <g className="group/tooltip">
                    {/* Tooltip Line */}
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
                    {/* Invisible area closest to a specific point for the tooltip trigger */}
                    <rect
                      x={segmentX}
                      y={0}
                      width={segmentWidth}
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
                  <div className="text-gray-500 text-xs">{d.value.toLocaleString("en-US")}</div>
                </TooltipContent>
              </ClientTooltip>
            );
          })}
        </svg>

        {/* X Axis */}
        <div className="translate-y-2">
          {data.map((day, i) => {
            const isFirst = i === 0;
            const isLast = i === data.length - 1;
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