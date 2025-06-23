// src/components/ui/AreaChart.tsx
import { scaleTime, scaleLinear, line as d3line, max, area as d3area, curveMonotoneX } from "d3";
import { ClientTooltip, TooltipContent, TooltipTrigger } from "@/components/ui/Tooltip";
import { AnimatedArea } from "@/components/ui/AnimatedArea";
import { useEffect, useState } from "react";

type Point = {
    date: Date;
    value: number;
}

export function AnimatedOutlinedAreaChart() {
    const [data, setData] = useState<Point[]>([]);

    useEffect(() => {
        fetch("/eda.json")
            .then((res) => res.json())
            .then((json) => {
                const loaded = json.areaChart || [];
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

    const yScale = scaleLinear()
        .domain([0, max(data.map((d) => d.value)) ?? 0])
        .range([100, 0]);

    const line = d3line<(typeof data)[number]>()
        .x((d) => xScale(d.date))
        .y((d) => yScale(d.value))
        .curve(curveMonotoneX);

    const area = d3area<(typeof data)[number]>()
        .x((d) => xScale(d.date))
        .y0(yScale(0))
        .y1((d) => yScale(d.value))
        .curve(curveMonotoneX);

    const areaPath = area(data) ?? undefined;

    const d = line(data);

    if (!d) {
        return null;
    }

    return (
        <div className="relative h-full w-full mt-4">
            <div
                className="absolute inset-0
        h-full
        w-full
        overflow-visible"
            >
                {/* Chart area */}
                <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                >
                    {/* Area */}
                    <path d={areaPath} className="text-blue-200" fill="url(#outlinedAreaGradient)" />
                    <defs>
                        {/* Gradient definition */}
                        <linearGradient id="outlinedAreaGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop
                                offset="0%"
                                className="text-blue-500/20 dark:text-blue-500/20"
                                stopColor="currentColor"
                            />
                            <stop
                                offset="100%"
                                className="text-blue-50/5 dark:text-blue-900/5"
                                stopColor="currentColor"
                            />
                        </linearGradient>
                    </defs>

                    {/* Line */}
                    <AnimatedArea>
                        <path
                            d={d}
                            fill="none"
                            className="text-blue-400 dark:text-blue-600"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            vectorEffect="non-scaling-stroke"
                        />
                    </AnimatedArea>
                    {/* Invisible Tooltip Area */}
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
                            segmentWidth = (nextX - currentX) / 2 + (currentX - xScale(data[index - 1]?.date || d.date)) / 2;
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
                                    <g className="group/tooltip">
                                        {/* Tooltip Line */}
                                        <line
                                            x1={xScale(d.date)}
                                            y1={0}
                                            x2={xScale(d.date)}
                                            y2={100}
                                            stroke="currentColor"
                                            strokeWidth={1}
                                            className="opacity-0 group-hover/tooltip:opacity-100 text-zinc-300 dark:text-zinc-700 transition-opacity"
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

                {/* X axis */}
                {data.map((day, i) => {
                    // show 1 every x labels
                    if (i % 6 !== 0 || i === 0 || i >= data.length - 3) return;
                    return (
                        <div
                            key={i}
                            style={{
                                left: `${xScale(day.date)}%`,
                                top: "90%",
                            }}
                            className="absolute text-xs mt-[-20px] dark:text-zinc-400 -translate-x-1/2"
                        >
                            {day.date.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                            })}
                        </div>
                    );
                })}
            </div>
            {/* Y axis */}
            {yScale
                .ticks(8)
                .map(yScale.tickFormat(8, "d"))
                .map((value, i) => {
                    if (i < 1) return;
                    return (
                        <div
                            key={i}
                            style={{
                                top: `${yScale(+value)}%`,
                                right: "3%",
                            }}
                            className="absolute text-xs tabular-nums dark:text-zinc-400 -translate-y-1/2"
                        >
                            {value}
                        </div>
                    );
                })}
        </div>
    );
}