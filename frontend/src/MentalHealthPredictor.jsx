import React, { useState } from "react";
import "./MentalHealthPredictor.css";

/**
 * MentalHealthPredictor
 *
 * Calls the FastAPI backend at http://127.0.0.1:8000/predict.
 *
 * NOTE ON FIELDS: option lists match the Pydantic `StudentData` model in
 * main.py exactly — the backend returns a 422 on anything else. If main.py
 * changes, update PLATFORM_OPTIONS / PURPOSE_OPTIONS / STRESS_OPTIONS /
 * COUNTRY_SUGGESTIONS below to match.
 */
const API_URL = "https://mental-health-predictor-0va6.onrender.com/predict";

const PLATFORM_OPTIONS = [
  "Facebook", "LinkedIn", "Instagram", "Snapchat", "Twitter", "YouTube",
  "TikTok", "LINE", "KakaoTalk", "VKontakte", "WhatsApp", "WeChat",
];

const PURPOSE_OPTIONS = ["Networking", "Education", "Entertainment", "News"];

// These are the only values main.py groups by name (top_countries); anything
// else typed is still accepted by the backend, just bucketed as "Other".
const COUNTRY_SUGGESTIONS = [
  "India", "USA", "Canada", "Australia", "UK", "Germany", "Mexico", "Turkey", "France",
];

const STRESS_OPTIONS = ["Low", "Medium", "High", "Very High"];

const initialForm = {
  age: "",
  gender: "",
  country: "",
  academic_level: "",
  most_used_platform: "",
  purpose_of_use: "",
  avg_daily_usage_hours: "",
  daily_unlocks: "",
  study_hours: "",
  physical_activity_hours: "",
  sleep_hours_per_night: "",
  stress_level: "Medium",
};

const numberFields = new Set([
  "age", "avg_daily_usage_hours", "daily_unlocks",
  "study_hours", "physical_activity_hours", "sleep_hours_per_night",
]);

function scoreMeta(score) {
  // Assumes a 0-10 scale, higher = better wellbeing. Adjust thresholds if
  // your model's target range differs.
  if (score >= 7) return { label: "Thriving" };
  if (score >= 4) return { label: "Steady" };
  return { label: "Under strain" };
}

export default function MentalHealthPredictor() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function setStress(level) {
    setForm((prev) => ({ ...prev, stress_level: level }));
  }

  function buildPayload() {
    const payload = { ...form };
    for (const key of numberFields) {
      payload[key] = payload[key] === "" ? 0 : Number(payload[key]);
    }
    return payload;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    setResult(null);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });

      if (!res.ok) {
        let detail = `Request failed with status ${res.status}.`;
        try {
          const body = await res.json();
          if (body?.detail) {
            detail = Array.isArray(body.detail)
              ? body.detail.map((d) => d.msg).join(" ")
              : String(body.detail);
          }
        } catch {
          /* keep generic message */
        }
        throw new Error(detail);
      }

      const data = await res.json();
      setResult(data.predicted_mental_health_score);
      setStatus("success");
    } catch (err) {
      setErrorMsg(
        err.message === "Failed to fetch"
          ? "Couldn't reach the prediction server. Make sure the FastAPI backend is running on port 8000."
          : err.message
      );
      setStatus("error");
    }
  }

  const meta = result != null ? scoreMeta(result) : null;
  const gaugePercent = result != null ? Math.min(100, Math.max(0, (result / 10) * 100)) : 0;
  const isLoading = status === "loading";

  return (
    <div className="mh-page">
      <div className="mh-shell">
        <h1 className="mh-title">Mental Health Signal</h1>
        

        <div className="mh-layout">
          <form onSubmit={handleSubmit} className="mh-form" noValidate>
            <section className="mh-section">
              <div className="mh-section-head">
                <span className="mh-badge">01</span>
                <span className="mh-section-title">Profile</span>
              </div>
              <div className="mh-grid2">
                <Field label="Age" hint="10–100">
                  <input
                    type="number" name="age" min="10" max="100" required
                    placeholder="e.g. 21"
                    value={form.age} onChange={handleChange} className="mh-input"
                  />
                </Field>

                <Field label="Gender">
                  <SelectField name="gender" value={form.gender} onChange={handleChange}>
                    <option value="" disabled>Select</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </SelectField>
                </Field>

                <Field label="Country" hint="Not listed? Type it anyway.">
                  <input
                    list="mh-country-list" type="text" name="country" required
                    placeholder="e.g. India"
                    value={form.country} onChange={handleChange} className="mh-input"
                  />
                  <datalist id="mh-country-list">
                    {COUNTRY_SUGGESTIONS.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </Field>
              </div>
            </section>

            <section className="mh-section">
              <div className="mh-section-head">
                <span className="mh-badge">02</span>
                <span className="mh-section-title">Academic &amp; Digital Habits</span>
              </div>
              <div className="mh-grid2">
                <Field label="Academic level">
                  <SelectField name="academic_level" value={form.academic_level} onChange={handleChange}>
                    <option value="" disabled>Select</option>
                    <option value="High School">High School</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Graduate">Graduate</option>
                  </SelectField>
                </Field>

                <Field label="Most-used platform">
                  <SelectField name="most_used_platform" value={form.most_used_platform} onChange={handleChange}>
                    <option value="" disabled>Select</option>
                    {PLATFORM_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </SelectField>
                </Field>

                <Field label="Primary purpose">
                  <SelectField name="purpose_of_use" value={form.purpose_of_use} onChange={handleChange}>
                    <option value="" disabled>Select</option>
                    {PURPOSE_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </SelectField>
                </Field>

                <Field label="Avg. daily screen time">
                  <UnitField unit="hrs">
                    <input
                      type="number" name="avg_daily_usage_hours" step="0.5" min="0" max="24" required
                      placeholder="0.0"
                      value={form.avg_daily_usage_hours} onChange={handleChange} className="mh-input"
                    />
                  </UnitField>
                </Field>

                <Field label="Daily phone unlocks">
                  <input
                    type="number" name="daily_unlocks" min="0" required
                    placeholder="e.g. 60"
                    value={form.daily_unlocks} onChange={handleChange} className="mh-input"
                  />
                </Field>
              </div>
            </section>

            <section className="mh-section">
              <div className="mh-section-head">
                <span className="mh-badge">03</span>
                <span className="mh-section-title">Lifestyle &amp; Stress</span>
              </div>
              <div className="mh-grid2">
                <Field label="Study hours / day">
                  <UnitField unit="hrs">
                    <input
                      type="number" name="study_hours" step="0.5" min="0" max="24" required
                      placeholder="0.0"
                      value={form.study_hours} onChange={handleChange} className="mh-input"
                    />
                  </UnitField>
                </Field>

                <Field label="Physical activity / day">
                  <UnitField unit="hrs">
                    <input
                      type="number" name="physical_activity_hours" step="0.5" min="0" max="24" required
                      placeholder="0.0"
                      value={form.physical_activity_hours} onChange={handleChange} className="mh-input"
                    />
                  </UnitField>
                </Field>

                <Field label="Sleep / night">
                  <UnitField unit="hrs">
                    <input
                      type="number" name="sleep_hours_per_night" step="0.5" min="0" max="24" required
                      placeholder="0.0"
                      value={form.sleep_hours_per_night} onChange={handleChange} className="mh-input"
                    />
                  </UnitField>
                </Field>
              </div>

              <div style={{ marginTop: 20 }}>
                <span className="mh-label" style={{ display: "block", marginBottom: 10 }}>
                  Perceived stress level
                </span>
                <div className="mh-pill-row" role="radiogroup" aria-label="Perceived stress level">
                  {STRESS_OPTIONS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      role="radio"
                      aria-checked={form.stress_level === level}
                      onClick={() => setStress(level)}
                      className={`mh-pill${form.stress_level === level ? " is-active" : ""}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <button type="submit" disabled={isLoading} className="mh-submit">
              {isLoading ? (
                <>
                  <span className="mh-spinner" aria-hidden="true" /> Reading…
                </>
              ) : (
                "Read my signal"
              )}
            </button>

            {status === "error" && (
              <div role="alert" className="mh-error-box">
                <strong>We couldn't complete that prediction.</strong>
                {errorMsg}
              </div>
            )}
          </form>

          <aside className="mh-panel" aria-live="polite">
            <span className="mh-panel-eyebrow">
              <span className="mh-live-dot" aria-hidden="true" />
              {status === "success" ? "Signal received" : isLoading ? "Receiving signal" : "Awaiting signal"}
            </span>

            <Waveform active={isLoading || status === "success"} />

            {status === "success" && result != null ? (
              <>
                <div
                  className="mh-dial has-result"
                  style={{ "--mh-pct": `${gaugePercent}%` }}
                >
                  <div className="mh-dial-inner">
                    <span className="mh-panel-score">
                      {result}
                      <span className="mh-panel-max"> /10</span>
                    </span>
                  </div>
                </div>
                <div>
                  <p className="mh-panel-heading">{meta.label}</p>
                  <p className="mh-panel-copy">
                    That's your modeled score based on today's habits — not a diagnosis.
                  </p>
                </div>
              </>
            ) : isLoading ? (
              <>
                <div className="mh-dial is-loading">
                  <div className="mh-dial-inner">
                    <span className="mh-panel-score" style={{ fontSize: 20 }}>…</span>
                  </div>
                </div>
                <div>
                  <p className="mh-panel-heading">Tuning in…</p>
                  <p className="mh-panel-copy">Running your habits through the model.</p>
                </div>
              </>
            ) : (
              <>
                <div className="mh-dial">
                  <div className="mh-dial-inner">
                    <span className="mh-panel-score" style={{ fontSize: 20 }}>0.0</span>
                  </div>
                </div>
                <div>
                  <p className="mh-panel-heading">Your score will appear here</p>
                  <p className="mh-panel-copy">
                    Fill in the form and submit to generate a predicted mental health
                    score from 0–10.
                  </p>
                </div>
              </>
            )}

            <div style={{ height: 4 }} />
          </aside>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="mh-field">
      <span className="mh-label">{label}</span>
      {children}
      {hint && <span className="mh-hint">{hint}</span>}
    </label>
  );
}

function SelectField({ name, value, onChange, children }) {
  return (
    <div className="mh-select-wrap">
      <select name={name} value={value} onChange={onChange} className="mh-input" required>
        {children}
      </select>
    </div>
  );
}

function UnitField({ unit, children }) {
  return (
    <div className="mh-unit-wrap">
      {children}
      <span className="mh-unit">{unit}</span>
    </div>
  );
}

function Waveform({ active }) {
  return (
    <svg
      className={`mh-waveform${active ? " is-active" : ""}`}
      viewBox="0 0 260 46" preserveAspectRatio="none" aria-hidden="true"
    >
      <path d="M0 23 L18 23 L26 8 L36 38 L46 14 L56 30 L66 23 L86 23 L94 4 L104 42 L114 18 L124 28 L134 23 L260 23" />
    </svg>
  );
}
