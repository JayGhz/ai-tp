import { AnimatedOutlinedAreaChart } from "@/components/ui/AreaChart";
import CorrelationHeatmap from "@/components/ui/CorrelationHeatmap";
import { HorizontalBarChartLogos } from "@/components/ui/HorizontaBarChartLogo";
import { HorizontalBarChart } from "@/components/ui/HorizontalBarChart";
import { AnimatedLineChart } from "@/components/ui/Linechart";
import { AnimatedDonutChart } from "@/components/ui/PieChart";
import { BarChartVertical } from "@/components/ui/VerticalBarChart";

export default function EDA() {
    return (
        <div className="md:p-[0em] mx-8 lg:m-20 mt-24 xl:mx-64 lg:mb-28 mb-32 md:mt-4">

            <div className="grid grid-cols-1 grid-rows-3 lg:grid-cols-2 lg:grid-rows-2 mt-20 xl:m-0 gap-8 lg:gap-4">


                <div className="border border-zinc-300 lg:col-span-2 dark:border-zinc-200/20 rounded-xl p-6">
                    <div className="text-sm dark:text-zinc-200/90 font-semibold text-center">
                        Transacciones por Mes
                    </div>
                    <AnimatedLineChart />
                </div>

                <div className="border border-zinc-300 dark:border-zinc-200/20 rounded-xl p-6">
                    <div className="text-sm dark:text-zinc-200/90 font-semibold text-center">
                        Distribución por Tipo de Empleo
                    </div>
                    <HorizontalBarChart />
                </div>



                <div className="border border-zinc-300 dark:border-zinc-200/20 rounded-xl p-6">
                    <div className="text-sm dark:text-zinc-200/90 font-semibold text-center">
                        Distribución por Tipo de Pago
                    </div>
                    <AnimatedDonutChart />
                </div>
            </div>

            <div className="lg:my-12 my-8" />

            <div className="grid grid-cols-1 grid-rows-3 lg:grid-cols-2 lg:grid-rows-2 gap-8 lg:gap-4">
                <div className="border border-zinc-300 lg:col-span-2 dark:border-zinc-200/20 rounded-xl pt-6 pb-11">
                    <div className="text-sm mb-6 dark:text-zinc-200/90 font-semibold text-center">
                        Evolución del Score de Riesgo
                    </div>
                    <div className="w-full h-full">
                        <AnimatedOutlinedAreaChart />
                    </div>
                </div>

                <div className="border border-zinc-300 dark:border-zinc-200/20 rounded-xl p-6">
                    <div className="text-sm dark:text-zinc-200/90 font-semibold text-center mb-2">
                        Distribución por Estado de Vivienda
                    </div>
                    <div className="w-full h-full">
                        <BarChartVertical />
                    </div>
                </div>

                <div className="border border-zinc-300 dark:border-zinc-200/20 rounded-xl p-6">
                    <div className="text-sm dark:text-zinc-200/90 font-semibold text-center mb-2">
                        Distribución por Sistema Operativo
                    </div>
                    <div className="w-full h-full">
                        <HorizontalBarChartLogos />
                    </div>
                </div>

                <div className="border border-zinc-300 lg:col-span-2 dark:border-zinc-200/20 rounded-xl p-6">
                    <div className="text-sm dark:text-zinc-200/90 font-semibold text-center mb-2">
                        Matriz de Correlación
                    </div>
                    <div className="w-full h-full">
                        <CorrelationHeatmap />
                    </div>
                </div>
            </div>
        </div>
    );
}
