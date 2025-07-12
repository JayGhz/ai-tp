import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import warnings
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

from imblearn.over_sampling import SMOTE # Adding this for smote [not compatible with sklearn version] (changing to compatible version in requirements.txt)
from sklearn.metrics import precision_recall_curve

import torch
import torch.nn as nn
import torch.nn.functional as F
import os
from sklearn.metrics import f1_score, roc_auc_score, precision_score, recall_score, classification_report
from torch.utils.data import DataLoader, TensorDataset

warnings.filterwarnings("ignore")
print(torch.cuda.is_available())


#! --- [START] PREPROCESSING ---
df = pd.read_csv("./data/Variant V.csv")
df.head()
cols_to_flag = ["prev_address_months_count", "bank_months_count"]
for col in cols_to_flag:
  df[f"{col}_was_missing"] = (df[col] == -1).astype(int)
  df[col] = df[col].replace(-1, 0)
df["current_address_months_count"].replace(-1, df["current_address_months_count"].median(), inplace=True)
df["session_length_in_minutes"].replace(-1, df["session_length_in_minutes"].median(), inplace=True)
df["credit_risk_score"].replace(-1, df["credit_risk_score"].median(), inplace=True)
df["device_distinct_emails_8w"].replace(-1, df["device_distinct_emails_8w"].median(), inplace=True)
df.to_csv("data/preprocessed_data.csv", index=False)
#! --- [END] PREPROCESSING ---


#! --- [START] SPLITTING ---
df = pd.read_csv("./data/preprocessed_data.csv")
cols_to_drop = ["fraud_bool", "month", "x1", "x2"]
X = df.drop(columns=cols_to_drop)
y = df["fraud_bool"]
# Identificar variables categóricas
cat_cols = X.select_dtypes(include="object").columns
# Aplicar one-hot encoding
X = pd.get_dummies(X, columns=cat_cols, drop_first=True)
# División temporal: entrenamiento de 0–5, testing de 6–7
df_train = df[df["month"] <= 5]
df_test = df[df["month"] >= 6]
X_train = df_train.drop(columns=cols_to_drop)
X_test = df_test.drop(columns=cols_to_drop)
y_train = df_train["fraud_bool"]
y_test = df_test["fraud_bool"]
# One-hot encoding (aplicado a ambos)
X_train = pd.get_dummies(X_train, drop_first=True)
X_test = pd.get_dummies(X_test, drop_first=True)
# Alinear columnas entre train y test
X_train, X_test = X_train.align(X_test, join="left", axis=1, fill_value=0)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
np.save("./data/X_train_scaled.npy", X_train_scaled)
np.save("./data/X_test_scaled.npy", X_test_scaled)
np.save("./data/y_train.npy", y_train.to_numpy())
np.save("./data/y_test.npy", y_test.to_numpy())

#? Smoting part
# Implementing the files of smote
# [1][auto] -> Increase the number of frauds to an acceptable level [now in ≈1%]
# [2][0.3] -> Trying to increase the numbers of the training model
smote = SMOTE(random_state=42, sampling_strategy=0.3)
X_train_smote, y_train_smote = smote.fit_resample(X_train_scaled, y_train)

print(f"Distribución original: {np.bincount(y_train)}")
print(f"Distribución después de SMOTE: {np.bincount(y_train_smote)}")

np.save('./data/X_train_smote.npy', X_train_smote)
np.save('./data/y_train_smote.npy', y_train_smote)
#! --- [END] SPLITTING ---


#! --- [START] MLP ---
# X_train = np.load("./data/X_train_scaled.npy")
X_train = np.load('./data/X_train_smote.npy')
X_test = np.load("./data/X_test_scaled.npy")
# y_train = np.load("./data/y_train.npy")
y_train = np.load('./data/y_train_smote.npy')
y_test = np.load("./data/y_test.npy")

# Tensores
X_train_tensor = torch.tensor(X_train, dtype=torch.float32).to('cuda') #? using c|uda
y_train_tensor = torch.tensor(y_train, dtype=torch.float32).to('cuda')
X_test_tensor = torch.tensor(X_test, dtype=torch.float32).to('cuda')
y_test_tensor = torch.tensor(y_test, dtype=torch.float32).to('cuda')
train_dataset = TensorDataset(X_train_tensor, y_train_tensor)
test_dataset = TensorDataset(X_test_tensor, y_test_tensor)
train_loader = DataLoader(train_dataset, batch_size=512, shuffle=True)
test_loader = DataLoader(test_dataset, batch_size=512, shuffle=False)
class FocalLoss(nn.Module):
  def __init__(self, alpha=0.25, gamma=2.0, reduction="mean"):
    super(FocalLoss, self).__init__()
    self.alpha = alpha
    self.gamma = gamma
    self.reduction = reduction

  def forward(self, inputs, targets):
    BCE_loss = F.binary_cross_entropy_with_logits(inputs, targets, reduction="none")
    pt = torch.exp(-BCE_loss)
    loss = self.alpha * (1 - pt) ** self.gamma * BCE_loss
    if self.reduction == "mean":
      return loss.mean()
    elif self.reduction == "sum":
      return loss.sum()
    return loss
class MLP(nn.Module):
  def __init__(self, input_dim):
    super(MLP, self).__init__()
    self.net = nn.Sequential(
      nn.Linear(input_dim, 256),
      nn.ReLU(),
      nn.BatchNorm1d(256),
      nn.Dropout(0.3),

      nn.Linear(256, 128),
      nn.ReLU(),
      nn.BatchNorm1d(128),
      nn.Dropout(0.3),

      nn.Linear(128, 64),
      nn.ReLU(),
      nn.BatchNorm1d(64),
      nn.Dropout(0.3),

      nn.Linear(64, 1)
    )
  def forward(self, x):
    return self.net(x).squeeze(1)
def train_model(model, loss_fn, optimizer, n_epochs=20, patience=3): #? Changing in test
  model.train()

  for epoch in range(n_epochs):
    total_loss = 0
    for X_batch, y_batch in train_loader:
      X_batch = X_batch.to('cuda') #? using c|uda
      y_batch = y_batch.to('cuda') #? using c|uda
      optimizer.zero_grad()
      outputs = model(X_batch)
      loss = loss_fn(outputs, y_batch)
      loss.backward()
      optimizer.step()
      total_loss += loss.item()
    avg_loss = total_loss / len(train_loader)
    history.append(avg_loss)
    print(f"Epoch {epoch+1}/{n_epochs} - Loss: {avg_loss:.4f}")
  return history
input_dim = X_train.shape[1]
model = MLP(input_dim).to('cuda') #? using c|uda
loss_fn = FocalLoss(alpha=0.25, gamma=2)
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
history = train_model(model, loss_fn, optimizer, n_epochs=20)
model.eval()

with torch.no_grad():
  y_pred_logits = model(X_test_tensor)
  y_pred = torch.sigmoid(y_pred_logits).cpu().numpy() #? Changed if using c|uda
  
  #? Added in this test
  precisions, recalls, thresholds = precision_recall_curve(y_test, y_pred)
  f1s = 2 * (precisions * recalls) / (precisions + recalls + 1e-8)
  best_hreshold = thresholds[np.argmax(f1s)]
  threshold = best_hreshold

  y_pred_labels = (y_pred >= best_hreshold).astype(int)
print(classification_report(y_test, y_pred_labels, digits=4))
print("AUC:", roc_auc_score(y_test, y_pred))
os.makedirs("./models", exist_ok=True)
torch.save(model.state_dict(), "./models/mlp_model.pth")
#! --- [END] MLP ---


#! --- [START] PREDICTION
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import torch
import torch.nn as nn
from sklearn.metrics import (
    roc_auc_score,
    classification_report,
    confusion_matrix,
    roc_curve,
    RocCurveDisplay
)
import shap
import os

X_test = np.load("./data/X_test_scaled.npy")
y_test = np.load("./data/y_test.npy")

input_dim = X_test.shape[1]
model = MLP(input_dim)
model.load_state_dict(torch.load("./models/mlp_model.pth"))
model.eval()

with torch.no_grad():
  X_test_tensor = torch.tensor(X_test, dtype=torch.float32)
  y_pred_logits = model(X_test_tensor)
  y_pred_probs = torch.sigmoid(y_pred_logits).numpy()
  y_pred_labels = (y_pred_probs >= 0.5).astype(int)

results_df = pd.DataFrame({
  "true_label": y_test,
  "pred_label": y_pred_labels,
  "pred_prob": y_pred_probs
})

top_fraudes = results_df.sort_values("pred_prob", ascending=False).head(10)
print(top_fraudes)

RocCurveDisplay.from_predictions(y_test, y_pred_probs)
plt.title("Curva ROC - MLP")
plt.grid(True)
# plt.show()

explainer = shap.KernelExplainer(
  model=lambda x: torch.sigmoid(model(torch.tensor(x, dtype=torch.float32))).detach().numpy(),
  data=X_test[:100]
)

shap_values = explainer.shap_values(X_test[:100], nsamples=100)

df = pd.read_csv("./data/preprocessed_data.csv")
df_test = df[df["month"] >= 6].copy()

X_test_named = df_test.drop(columns=["fraud_bool", "month", "x1", "x2"], errors="ignore")
X_test_named = pd.get_dummies(X_test_named, drop_first=True)
X_test_np = np.load("./data/X_test_scaled.npy")
X_test_named = X_test_named.iloc[:, :X_test_np.shape[1]]
X_shap = pd.DataFrame(X_test_np[:100], columns=X_test_named.columns[:X_test_np.shape[1]])

print(classification_report(y_test, y_pred_labels, digits=4))
print("AUC final:", roc_auc_score(y_test, y_pred_probs))
print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred_labels))
#! --- [END] PREDICTION