export function Dataset() {
    return (
        <article className="flex flex-col items-center justify-center gap-8 text-gray-700 lg:mb-[-20px] dark:text-gray-300 p-32  2xl:p-48 2xl:mx-44 xl:my-12 md:flex-row">
            <div className="[&>p]:mb-4 [&>p>strong]:text-[#27c0ff] dark:[&>p>strong]:text-[#27c0ff] [&>p>strong]:font-normal [&>p>strong]:font-mono text-pretty order-2 md:order-1">
                <div className="flex items-center mb-6 text-3xl font-semibold gap-x-3 text-black/80 dark:text-white">

                    Origen del Dataset
                </div>
                <p>
                    El dataset <strong>Bank Account Fraud Dataset (NeurIPS 2022)</strong> fue creado por investigadores de Feedzai con el objetivo de evaluar el desempeño y la equidad de modelos de machine learning bajo condiciones extremas. Cada instancia representa una solicitud sintética de apertura de cuenta bancaria generada mediante un modelo CTGAN entrenado sobre datos reales anonimizados.
                </p>

                <p>
                    El conjunto está compuesto por <strong>6 millones de registros</strong> distribuidos en 6 datasets, cada uno con un enfoque distinto de sesgo (bias). Se incluye información como ingresos, edad, actividad reciente, tipo de dispositivo, validez de teléfonos, y un campo objetivo <code>fraud_bool</code> que indica si la solicitud fue fraudulenta o no. Los datos han sido procesados con técnicas de preservación de privacidad como ruido Laplaciano y codificación.
                </p>

                <p>
                    Para este trabajo se ha seleccionado la <strong>Variante V</strong> del dataset, disponible para su descarga en Kaggle a través de este <a className="text-[#27c0ff] dark:text-[#27c0ff] hover:underline" href="https://www.kaggle.com/datasets/sgpjesus/bank-account-fraud-dataset-neurips-2022/data" target="_blank" rel="noopener noreferrer">enlace</a>.
                </p>
            </div>

            <img
                width="200"
                height="200"
                src="Kaggle.png"
                alt="kaggle"
                className="order-1 object-contain w-64 h-64 p-6 md:order-2 rotate-3 lg:p-6 lg:w-64 rounded-2xl bg-black/30 dark:bg-zinc-500/5 ring-1 ring-black/70 dark:ring-white/20 transform-gpu animate-spinTilted"
            />
        </article>
    );
}
