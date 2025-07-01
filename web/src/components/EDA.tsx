import { AnimatedOutlinedAreaChart } from "@/components/ui/AreaChart";
import { HorizontalBarChart } from "@/components/ui/HorizontalBarChart";
import { AnimatedLineChart } from "@/components/ui/Linechart";
import { AnimatedDonutChart } from "@/components/ui/PieChart";
import { BarChartVertical } from "@/components/ui/VerticalBarChart";

export default function EDA() {
    return (
        <div className="md:p-[5em] mx-8 lg:m-28 mt-24 lg:mt-0 lg:mb-12 mb-32 md:mt-4">
            
            <div className="grid grid-cols-1 grid-rows-4 lg:grid-cols-2 lg:grid-rows-2 gap-8 lg:gap-4">
                <div className="border border-zinc-300 dark:border-zinc-200/20 rounded-xl p-6">
                    <div className="text-sm dark:text-zinc-200/90 font-semibold text-center">
                        Distribución por tipo de empleo
                    </div>
                    <HorizontalBarChart />
                </div>

                <div className="border border-zinc-300 dark:border-zinc-200/20 rounded-xl p-6">
                    <div className="text-sm dark:text-zinc-200/90 font-semibold text-center">
                        Distribución por tipo de vivienda
                    </div>
                    <AnimatedDonutChart />
                </div>

                <div className="border border-zinc-300 dark:border-zinc-200/20 rounded-xl p-6">
                    <div className="text-sm dark:text-zinc-200/90 font-semibold text-center">
                        Métodos de pago
                    </div>
                    <BarChartVertical />
                </div>

                <div className="border border-zinc-300 dark:border-zinc-200/20 rounded-xl p-6">
                    <div className="text-sm dark:text-zinc-200/90 font-semibold text-center">
                        Transacciones por mes
                    </div>
                    <AnimatedLineChart />
                </div>
            </div>

            <div className="lg:my-12 my-9" />

            <div className="grid grid-cols-1">
                <div className="border border-zinc-300 dark:border-zinc-200/20 rounded-xl p-6 lg:col-span-2 h-[400px] md:mb-[-60px] lg:mb-0">
                    <div className="text-sm dark:text-zinc-200/90 font-semibold text-center">
                        Evolución del score de riesgo
                    </div>
                    <div className="w-full h-full">
                        <AnimatedOutlinedAreaChart />
                    </div>
                </div>
            </div>
        </div>
    );
}
