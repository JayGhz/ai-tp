import { AnimatedOutlinedAreaChart } from "@/components/ui/AreaChart";
import { HorizontalBarChart } from "@/components/ui/HorizontalBarChart";
import { AnimatedLineChart } from "@/components/ui/Linechart";
import { AnimatedDonutChart } from "@/components/ui/PieChart";
import { BarChartVertical } from "@/components/ui/VerticalBarChart";

export default function EDA() {
    return (
        <div className="md:p-[14em] mx-28 mt-16 md:mt-[-157px]">
            <div className="grid grid-cols-2 grid-rows-3 lg:grid-cols-3 lg:grid-rows-2 gap-2">
                <div className="border border-zinc-300 dark:border-zinc-200/20 rounded-xl p-6">
                    <div className="text-sm dark:text-zinc-200/90  font-semibold text-center">
                        Distribución por tipo de empleo
                    </div>
                    <HorizontalBarChart />
                </div>
                <div className="border border-zinc-300 dark:border-zinc-200/20  rounded-xl p-6">
                    <div className="text-sm dark:text-zinc-200/90  font-semibold text-center">
                        Distribución por tipo de vivienda
                    </div>
                    <AnimatedDonutChart />
                </div>
                <div className="border border-zinc-300 dark:border-zinc-200/20  rounded-xl p-6">
                    <div className="text-sm dark:text-zinc-200/90  font-semibold text-center">
                        Métodos de pago
                    </div>
                    <BarChartVertical />
                </div>
                <div className="border border-zinc-300 dark:border-zinc-200/20  rounded-xl p-6">
                    <div className="text-sm dark:text-zinc-200/90  font-semibold text-center">
                        Transacciones por mes
                    </div>
                    <AnimatedLineChart />
                </div>
                <div className="border border-zinc-300 dark:border-zinc-200/20 col-span-2 rounded-xl p-6">
                    <div className="text-sm dark:text-zinc-200/90  font-semibold text-center">
                        Evolución del score de riesgo
                    </div>
                    <AnimatedOutlinedAreaChart />
                </div>
            </div>
        </div>
    );
}