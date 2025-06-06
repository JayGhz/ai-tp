import { AnimatedOutlinedAreaChart } from "@/components/ui/AreaChart";
import { HorizontalBarChart } from "@/components/ui/HorizontalBarChart";
import { AnimatedLineChart } from "@/components/ui/Linechart";
import { AnimatedDonutChart } from "@/components/ui/PieChart";
import { BarChartVertical } from "@/components/ui/VerticalBarChart";

export default function EDA() {
    return (
        <div className="p-16 mx-24 mt-1 md:mt-5">
            <div className="grid grid-cols-2 grid-rows-3 lg:grid-cols-3 lg:grid-rows-2 gap-2">
                <div className="border border-zinc-300 dark:border-zinc-200/20 rounded-xl p-4">
                    <HorizontalBarChart />
                </div>
                <div className="border border-zinc-300 dark:border-zinc-200/20  rounded-xl p-4">
                    <AnimatedDonutChart />
                </div>
                <div className="border border-zinc-300 dark:border-zinc-200/20  rounded-xl p-4">
                    <BarChartVertical />
                </div>
                <div className="border border-zinc-300 dark:border-zinc-200/20  rounded-xl p-4">
                    <AnimatedLineChart />
                </div>
                <div className="border border-zinc-300 dark:border-zinc-200/20 col-span-2 rounded-xl p-4">
                    <AnimatedOutlinedAreaChart />
                </div>
            </div>
        </div>
    );
}