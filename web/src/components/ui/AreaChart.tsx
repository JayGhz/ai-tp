// src/components/ui/AreaChart.tsx
import { scaleTime, scaleLinear, line as d3line, max, area as d3area, curveMonotoneX } from "d3";
import { ClientTooltip, TooltipContent, TooltipTrigger } from "@/components/ui/Tooltip";
import { AnimatedArea } from "@/components/ui/AnimatedArea";

const sales = [
    { date: "2023-04-30", value: 4 },
    { date: "2023-05-01", value: 6 },
    { date: "2023-05-02", value: 8 },
    { date: "2023-05-03", value: 7 },
    { date: "2023-05-04", value: 10 },
    { date: "2023-05-05", value: 12 },
    { date: "2023-05-06", value: 10.5 },
    { date: "2023-05-07", value: 6 },
    { date: "2023-05-08", value: 8 },
    { date: "2023-05-09", value: 7.5 },
    { date: "2023-05-10", value: 6 },
    { date: "2023-05-11", value: 8 },
    { date: "2023-05-12", value: 9 },
    { date: "2023-05-13", value: 10 },
    { date: "2023-05-14", value: 17 },
    { date: "2023-05-15", value: 14 },
    { date: "2023-05-16", value: 15 },
    { date: "2023-05-17", value: 20 },
    { date: "2023-05-18", value: 18 },
    { date: "2023-05-19", value: 16 },
    { date: "2023-05-20", value: 15 },
    { date: "2023-05-21", value: 16 },
    { date: "2023-05-22", value: 13 },
    { date: "2023-05-23", value: 11 },
    { date: "2023-05-24", value: 11 },
    { date: "2023-05-25", value: 13 },
    { date: "2023-05-26", value: 12 },
    { date: "2023-05-27", value: 9 },
    { date: "2023-05-28", value: 8 },
    { date: "2023-05-29", value: 10 },
    { date: "2023-05-30", value: 11 },
    { date: "2023-05-31", value: 8 },
    { date: "2023-06-01", value: 9 },
    { date: "2023-06-02", value: 10 },
    { date: "2023-06-03", value: 12 },
    { date: "2023-06-04", value: 13 },
    { date: "2023-06-05", value: 15 },
    { date: "2023-06-06", value: 13.5 },
    { date: "2023-06-07", value: 13 },
    { date: "2023-06-08", value: 13 },
    { date: "2023-06-09", value: 14 },
    { date: "2023-06-10", value: 13 },
    { date: "2023-06-11", value: 12.5 },
];
const data = sales.map((d) => ({ ...d, date: new Date(d.date) }));

export function AnimatedOutlinedAreaChart() {
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
        <div className="relative h-full w-full mt-2">
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
                            className="absolute text-xs dark:text-zinc-400 -translate-x-1/2"
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