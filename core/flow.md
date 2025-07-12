Collecting workspace informationRevisando tu workspace, puedo identificar el flujo completo para la detección de fraudes y los archivos necesarios para actualizar la web. Te explico paso a paso:

## Flow Principal para Detección de Fraudes

### 1. Preparación de Datos
**preprocessing.ipynb** - Punto de partida
- **Entrada**: [`core/data/Variant V.csv`](core/data/Variant V.csv) (dataset original)
- **Proceso**: Limpieza, manejo de valores faltantes, feature engineering
- **Salida**: preprocessed_data.csv

### 2. División de Datos
**splitting.ipynb**
- **Entrada**: preprocessed_data.csv
- **Proceso**: Train/test split, one-hot encoding, escalado con StandardScaler
- **Salidas**: 
  - `X_train_scaled.npy`, `X_test_scaled.npy`
  - `y_train.npy`, `y_test.npy`
  - Versiones con SMOTE: `X_train_smote.npy`, `y_train_smote.npy`

### 3. Entrenamiento de Modelos

#### Modelos Baseline
**baseline_models.ipynb**
- **Entrada**: Arrays numpy del splitting
- **Modelos**: Logistic Regression, Random Forest, XGBoost
- **Evaluación**: Classification report, confusion matrix, ROC AUC

#### Modelos MLP (Neural Networks)
- **mlp.ipynb** → mlp_model.pth
- **mlp.smote.ipynb** → mlp_smote.pth  
- **mlp.smoteenn.ipynb** → mlp_smoteenn.pth

### 4. Predicción e Interpretabilidad
- **prediction.ipynb** - Usa `mlp_model.pth`
- **prediction.smote.ipynb** - Usa `mlp_smote.pth`
- **prediction.smoteenn.ipynb** - Usa `mlp_smoteenn.pth`

Todos incluyen análisis SHAP para explicabilidad del modelo.

## Archivos para Actualizar la Web

### **eda.ipynb** - Análisis Exploratorio
- **Entrada**: preprocessed_data.csv
- **Proceso**: Genera estadísticas y visualizaciones para la web:
  - `horizontalBar`: Distribución por estado de vivienda (%)
  - `verticalBar`: Distribución por tipo de empleo (%)  
  - `lineChart`: Transacciones por mes
  - `deviceOSBar`: Conteo por sistema operativo
  - `areaChart`: Evolución del score de riesgo
  - `pieChart`: Distribución por tipo de pago (%)
  - `correlationHeatmap`: Matriz de correlación entre variables numéricas
- **Salida**: eda.json

### **view.ipynb** - Visualización de Red
- **Entrada**: preprocessed_data.csv (muestra de 2000 registros)
- **Proceso**: Crea un grafo de nodos y enlaces para visualizar transacciones:
  - **Nodos**: Cada transacción con su ID y estado de fraude
  - **Enlaces**: Conexiones simuladas entre transacciones (probabilidad 0.00033)
- **Salida**: nodes.json

## Componentes Web que Consumen los Datos

- **EDA.tsx** - Consume `eda.json`
- **ForceGraph.tsx** - Consume `nodes.json`

## Recomendación de Flujo de Actualización

Para actualizar todo el sistema:

1. **Datos nuevos** → Ejecutar `preprocessing.ipynb`
2. **Nuevos splits** → Ejecutar `splitting.ipynb`  
3. **Reentrenar modelos** → Ejecutar los notebooks MLP correspondientes
4. **Actualizar visualizaciones web** → Ejecutar `eda.ipynb` y `view.ipynb`
5. **Nuevas predicciones** → Ejecutar notebooks de predicción