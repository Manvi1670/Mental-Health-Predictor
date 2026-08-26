<div align="center">

# 🎧 Mental Health Signal

### Predicting a student's mental health score from their daily digital and lifestyle rhythm

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-RandomForest-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)](https://scikit-learn.org/)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

<br/>

> A full-stack ML app that scores a student's mental wellbeing (0–10) from their screen habits, study load, sleep, and stress — not a diagnosis, a signal, surfaced instantly through a live model API rather than a static survey.

<br/>

**[Live Demo](https://mental-health-predictor-delta.vercel.app/)** · **[GitHub Repo](https://github.com/Manvi1670/Mental-Health-Predictor)**

> The backend may take ~30–50 seconds to wake up on first load (Render free tier spins down when idle).

</div>

---

## The Problem

Most student wellbeing tools are either a static self-report survey or a black-box score with no visible reasoning. Neither tells a student *what specifically* in their day is dragging their wellbeing down, or gives them something they can act on in the moment.

**Mental Health Signal** takes a different angle: it treats a student's digital and lifestyle habits — screen time, phone unlocks, study hours, sleep, activity, and self-reported stress — as inputs to a trained regression model, and returns a live, numeric wellbeing signal instead of a generic questionnaire result.

---

## ✨ Features

- 🧠 **ML-Backed Prediction** — a scikit-learn `RandomForestRegressor` pipeline trained on 5,000 student records predicts a 0–10 mental health score from 12 lifestyle and platform-usage features
- ⚡ **Live Inference API** — FastAPI backend serves predictions in real time via a single `POST /predict` endpoint, validated end-to-end with Pydantic
- 🎛️ **Full-Featured Form UI** — every model input (age, gender, country, academic level, platform, purpose of use, screen time, unlocks, study/activity/sleep hours, stress level) is captured through a guided, sectioned form
- 🌍 **Smart Country Handling** — a type-or-pick country field with autocomplete suggestions, mirroring exactly how the model groups countries at inference time (top 9 by frequency, everything else bucketed as "Other")
- 📡 **Live Result Console** — a custom "signal" panel with a real-time status (`Awaiting signal` → `Receiving signal` → `Signal received`), an animated waveform, and a radial dial that fills to the predicted score
- 🖥️ **Responsive, Accessible Form** — grouped fieldsets, inline validation, loading and error states, and keyboard-friendly custom controls (pill-style stress selector, native `<select>`/`<datalist>` throughout)

## 🖥️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React (Vite), plain CSS — deployed on Vercel |
| **Backend** | FastAPI, Pydantic, Uvicorn — deployed on Render |
| **Model** | scikit-learn `Pipeline` (`ColumnTransformer` + `RandomForestRegressor`), persisted with `joblib` |
| **Data Processing** | Pandas, NumPy |
| **Training Environment** | Jupyter / Google Colab |

## 🏗️ Architecture

```
React frontend (Vercel)
        │  student profile + habits form
        ▼
FastAPI  /predict  (Render)
        │
        ├── Pydantic validation (StudentData schema)
        │
        ├── Country grouped into top-9 + "Other"
        │   (matches training-time grouping exactly)
        │
        ▼
joblib-loaded sklearn Pipeline
        │
        ├── ColumnTransformer
        │     ├── log1p + StandardScaler   → Study_Hours (skewed)
        │     ├── StandardScaler           → Age, Usage Hours, Unlocks,
        │     │                              Physical Activity, Sleep
        │     ├── OrdinalEncoder           → Stress_Level (Low→Very High)
        │     └── OneHotEncoder            → Gender, Academic_Level,
        │                                    Platform, Purpose, Country
        │
        └── RandomForestRegressor  →  predicted_mental_health_score (0–10)
        │
        ▼
JSON response  →  rendered live in the signal panel
```

## 🧠 Model & Data

**Dataset:** *Student Social Media & Mental Health Impact* — 5,000 student records, 13 raw columns (demographics, platform usage, academic/lifestyle habits, self-reported stress, and the target `Mental_Health_Score`).

**Feature engineering:**
- `Country` grouped into the 9 most frequent values in the training data, everything else mapped to `"Other"` — reproduced exactly in `main.py` at inference time
- `Study_Hours` is right-skewed, so it gets a `log1p` transform before scaling; all other numeric features are standard-scaled directly
- `Stress_Level` is treated as ordinal (`Low` < `Medium` < `High` < `Very High`) rather than one-hot encoded, preserving its natural ordering
- Remaining categorical features (`Gender`, `Academic_Level`, `Most_Used_Platform`, `Purpose_Of_Use`, grouped `Country`) are one-hot encoded

**Model selection:** three candidates were trained and compared on a held-out 30% test split (`random_state=42`):

| Model | R² (test) | R² (train) | MAE | RMSE |
|---|---|---|---|---|
| Linear Regression | 0.740 | 0.724 | 0.536 | 0.676 |
| **Random Forest (default)** | **0.878** | 0.981 | **0.347** | **0.464** |
| Random Forest (`RandomizedSearchCV`-tuned) | 0.865 | 0.955 | 0.369 | 0.487 |

The default `RandomForestRegressor` generalized best on this split and is the model served in production — hyperparameter tuning (grid over `n_estimators`, `max_depth`, `min_samples_split`, `min_samples_leaf`, 5-fold CV) was explored but didn't outperform it here, and is kept in the notebook for transparency.

Full training, EDA, and evaluation code lives in `Mental_Health_Score_Predictor.ipynb`.

## 📌 Local Setup

```bash
git clone https://github.com/Manvi1670/Mental-Health-Predictor.git
cd Mental-Health-Predictor
```

**Backend (FastAPI):**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
API docs available at `http://127.0.0.1:8000/docs`.

**Frontend (React + Vite):**
```bash
cd frontend
npm install
npm run dev
```
App at `http://localhost:5173`. Update `API_URL` in `src/MentalHealthPredictor.jsx` to point at your backend if it's not running on `http://127.0.0.1:8000`.

## 🔑 API Reference

**Base URL (production):** `https://mental-health-predictor-0va6.onrender.com`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check / welcome message |
| `POST` | `/predict` | Accepts a student profile, returns `{ "predicted_mental_health_score": number }` |

**Request body (`POST /predict`):**
```json
{
  "age": 21,
  "gender": "Female",
  "country": "India",
  "academic_level": "Undergraduate",
  "most_used_platform": "Instagram",
  "purpose_of_use": "Education",
  "avg_daily_usage_hours": 4.5,
  "daily_unlocks": 60,
  "study_hours": 3,
  "physical_activity_hours": 1,
  "sleep_hours_per_night": 7,
  "stress_level": "Medium"
}
```

## 👩‍💻 Author

**Manvitha** — [github.com/Manvi1670](https://github.com/Manvi1670)
