"use client";
import { useEffect, useState } from "react";
import { pie, arc } from "d3";
import type { PieArcDatum } from "d3";
import { format } from "d3-format";
import { ClientTooltip, TooltipTrigger, TooltipContent } from "@/components/ui/Tooltip";
import { AnimatedSlice } from "@/components/ui/AnimatedSlice";

type Item = { name: string; value: number };

function AnimatedDonutChartContent({
  singleColor,
}: {
  singleColor?: "purple" | "blue" | "fuchsia" | "yellow";
}) {
  const [data, setData] = useState<Item[]>([]);
  const [hoveredDatum, setHoveredDatum] = useState<{
    key: string;
    value: number;
    color: string;
  } | null>(null);

  useEffect(() => {
    fetch("/eda.json")
      .then((res) => res.json())
      .then((json) => {
        const pieData = json.fraudPieChart || [];
        setData(pieData);
      });
  }, []);

  if (data.length === 0) return null;

  const radius = 420;
  const lightStrokeEffect = 10;
  const minAngle = 20;

  const pieLayout = pie<Item>().value((d) => d.value).padAngle(0.01);
  const arcs = pieLayout(data);

  const innerRadius = radius / 1.625;
  const arcGenerator = arc<PieArcDatum<Item>>()
    .innerRadius(innerRadius)
    .outerRadius(radius)
    .cornerRadius(lightStrokeEffect + 2);

  const arcLabel = arc<PieArcDatum<Item>>()
    .innerRadius(radius * 0.825)
    .outerRadius(radius * 0.825);

  const computeAngle = (d: PieArcDatum<Item>) =>
    ((d.endAngle - d.startAngle) * 180) / Math.PI;

  const colors = {
    purple: ["#600bff", "#7b35ff", "#955fff", "#b088ff", "#cbb2ff", "#e5dbff"],
    blue: ["#00aaff", "#2ab8ff", "#55c6ff", "#81d5ff", "#ace3ff", "#d8f1ff"],
    fuchsia: ["#ed0acc", "#f033d4", "#f35bdd", "#f684e5", "#f9adee", "#fcd6f6"],
    yellow: ["#ffce00", "#ffd700", "#ffe033", "#ffe866", "#fff199", "#fff9cc"],
  };



  return (
    <div className="relative mt-4">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-lg text-zinc-500">Total</p>
          <p className="text-4xl font-bold">1M</p>
        </div>
      </div>

      <svg
        viewBox={`-${radius} -${radius} ${radius * 2} ${radius * 2}`}
        className="max-w-[16rem] mx-auto overflow-visible"
      >
        {arcs.map((d, i) => {
          const angle = computeAngle(d);
          let centroid = arcLabel.centroid(d);
          if (d.endAngle > Math.PI) {
            centroid[0] += 10;
            centroid[1] += 10;
          } else {
            centroid[0] -= 10;
          }

          const color = singleColor ? colors[singleColor][i] : colors.blue[i];
          const datum = {
            key: d.data.name,
            value: d.data.value,
            color,
          };

          return (
            <TooltipTrigger key={i}>
              <g
                onPointerMove={() => setHoveredDatum(datum)}
                onPointerLeave={() => setHoveredDatum(null)}
              >
                <AnimatedSlice index={i}>
                  <path
                    stroke="#ffffff33"
                    strokeWidth={lightStrokeEffect}
                    fill={color}
                    d={arcGenerator(d) || undefined}
                  />
                  {angle > minAngle && (
                    <text
                      transform={`translate(${centroid})`}
                      textAnchor="middle"
                      fontSize={38}
                      className="fill-zinc-800 dark:fill-zinc-200"
                    >
                      <tspan y="-0.4em" fontWeight="700" fontSize={52}>
                        {d.data.name}
                      </tspan>
                      <tspan x={0} y="0.7em">
                        {d.data.value.toLocaleString("en-US")}%
                      </tspan>
                    </text>
                  )}
                </AnimatedSlice>
              </g>
            </TooltipTrigger>
          );
        })}
      </svg>

      {hoveredDatum && (
        <TooltipContent>
          <div className="flex items-center gap-2">
            <div
              className="w-1 h-8 rounded-sm"
              style={{ backgroundColor: hoveredDatum.color }}
            />
            <div>
              <p className="text-sm font-semibold">{hoveredDatum.key}</p>
              <p className="text-xs text-gray-500">
                {format(".1f")(hoveredDatum.value)}%
              </p>
            </div>
          </div>
        </TooltipContent>
      )}
    </div>
  );
}

export function AnimatedDonutChart2({
  singleColor,
}: {
  singleColor?: "purple" | "blue" | "fuchsia" | "yellow";
}) {
  return (
    <ClientTooltip>
      <AnimatedDonutChartContent singleColor={singleColor} />
    </ClientTooltip>
  );
}
