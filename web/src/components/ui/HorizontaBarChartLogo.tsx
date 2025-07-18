"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { scaleBand, scaleLinear, max, format } from "d3";
import type { Datum } from "@/components/ui/TooltipBar";
import {
    TooltipBar,
    TooltipBarDivTrigger,
    TooltipBarContent,
    useTooltipBarContext,
} from "@/components/ui/TooltipBar";
import { AnimatedBar } from "@/components/ui/AnimatedBar";

const LOGO_PATHS: Record<string, string> = {
    Linux: "/logos/linux.svg",
    Windows: "/logos/windows.svg",
    macOs: "/logos/macos.svg",
    x11: "/logos/x11.svg",
    Others: "/logos/others.svg",
};

function HorizontalBarChartLogosContent({ data }: { data: Datum[] }) {
    const sortedData = [...data].sort((a, b) => b.value - a.value);

    const yScale = scaleBand<string>()
        .domain(sortedData.map((d) => d.key))
        .range([0, 100])
        .padding(0.25);

    const xScale = scaleLinear()
        .domain([0, max(sortedData.map((d) => d.value)) ?? 0])
        .range([0, 100]);

    const { tooltip } = useTooltipBarContext("HorizontalBarLogos");

    return (
        <div
            className="relative w-full h-64"
            style={
                {
                    "--marginLeft": "50px",
                    "--marginRight": "10px",
                    "--marginTop": "0px",
                    "--marginBottom": "0px",
                } as CSSProperties
            }
        >
            {/* Y-axis logos */}
            <div className="absolute inset-0 translate-y-[var(--marginTop)]">
                {sortedData.map((entry) => (
                    <div
                        key={entry.key}
                        className="absolute size-10 rounded-lg overflow-hidden flex items-center justify-center -translate-y-1/2"
                        style={{
                            top: `${yScale(entry.key)! + yScale.bandwidth() / 2}%`,
                            left: `0`,
                            backgroundColor: entry.color,
                        }}
                    >
                        <img
                            src={LOGO_PATHS[entry.key] ?? "/logos/others.png"}
                            alt={entry.key}
                            className="w-6 h-6 object-contain"
                        />
                    </div>
                ))}
            </div>

            {/* Barras horizontales */}
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


                {/* Líneas guía */}
                <svg
                    className="h-full w-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                >
                    {xScale.ticks(8).map(xScale.tickFormat(8, "d")).map((label, idx) => (
                        <g
                            key={idx}
                            transform={`translate(${xScale(+label)}, 0)`}
                            className="text-zinc-600 dark:text-zinc-400"
                        >
                            <line
                                y1={20}
                                y2={95}
                                stroke="currentColor"
                                strokeDasharray="6,5"
                                strokeWidth={0.5}
                                vectorEffect="non-scaling-stroke"
                            />
                        </g>
                    ))}
                </svg>
            </div>

            {/* Eje X */}
            <svg
                className="absolute inset-0 
        w-[calc(100%-var(--marginLeft)-var(--marginRight))] 
        translate-x-[var(--marginLeft)] 
        h-[calc(100%-var(--marginBottom))] 
        translate-y-2 
        overflow-visible"
            >
                <g className="overflow-visible">
                    {xScale.ticks(4).map((value, idx) => {
                        const formattedValue = value >= 1000
                            ? `${(value / 1000)}K`
                            : value.toString();

                        return (
                            <text
                                key={idx}
                                x={`${xScale(value)}%`}
                                y="100%"
                                textAnchor="middle"
                                fill="currentColor"
                                className="text-xs mt-10 tabular-nums dark:text-zinc-400"
                            >
                                {formattedValue}
                            </text>
                        );
                    })}
                </g>
            </svg>


            {/* Tooltip */}
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
                                {tooltip.datum.value.toLocaleString()}
                            </p>

                        </div>
                    </div>
                </TooltipBarContent>
            )}
        </div>
    );
}

export function HorizontalBarChartLogos() {
    const [data, setData] = useState<Datum[] | null>(null);

    useEffect(() => {
        fetch("/eda.json")
            .then((res) => res.json())
            .then((json) => {
                setData(json.deviceOSBar);
            })
            .catch((err) => console.error("Error loading deviceOSBar:", err));
    }, []);

    if (!data) return null;

    return (
        <TooltipBar>
            <HorizontalBarChartLogosContent data={data} />
        </TooltipBar>
    );
}
