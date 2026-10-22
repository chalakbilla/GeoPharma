import { generateJSON } from "./vertexAI.js";
import { searchDrugs } from "./drugDatabase.js";

/* ------------------------------------------------------------------ schemas */

const S = { type: "STRING" };
const B = { type: "BOOLEAN" };
const I = { type: "INTEGER" };
const arr = (items) => ({ type: "ARRAY", items });
const obj = (properties) => ({
  type: "OBJECT",
  properties,
  required: Object.keys(properties),
});

const MEDICINE_SCHEMA = obj({
  name: S,
  genericName: S,
  strength: S,
  form: S,
  dose: S,
  timesPerDay: I,
  morning: B,
  afternoon: B,
  evening: B,
  night: B,
  durationDays: I,
  durationText: S,
  food: S,
  purpose: S,
  howToTake: S,
  sideEffects: arr(S),
  precautions: arr(S),
  alternatives: arr(S),
  approxPrice: S,
  confidence: S,
});

const PRESCRIPTION_SCHEMA = obj({
  isPrescription: B,
  extractedText: S,
  summary: S,
  doctor: obj({ name: S, qualification: S, registrationNo: S, clinic: S }),
  patient: obj({ name: S, age: S, gender: S }),
  date: S,
  validity: obj({ doctor: B, patient: B, medicines: B, signature: B, date: B }),
  diagnoses: arr(S),
  medicines: arr(MEDICINE_SCHEMA),
  interactions: arr(obj({ medicines: arr(S), severity: S, note: S })),
  warnings: arr(S),
});

const SUGGEST_SCHEMA = obj({
  results: arr(obj({ name: S, generic: S, note: S })),
});

/* ------------------------------------------------------------------ prompts */

const MEDICINE_RULES = `
- name: the medicine exactly as written (expand abbreviations like Tab./Cap./Syp. into the name, e.g. "Tab. Metformin").
  If you cannot read part of a name, give your best reading and set confidence to "low".
- genericName: active ingredient(s), e.g. "Metformin Hydrochloride". "" if unsure.
- strength: e.g. "500mg". form: tablet, capsule, syrup, injection, cream, drops, etc.
- dose: as written (e.g. "1-0-1", "BD", "twice daily"). timesPerDay: integer.
- morning/afternoon/evening/night: true for each slot that applies
  (1-0-1 => morning + night; 1-1-1 => morning + afternoon + night; OD with no time => morning; HS => night).
- durationDays: total days as an integer (1 month = 30, 6 months = 180), 0 if not stated.
  durationText: as written, e.g. "6 months", or "".
- food: one of "before food", "after food", "with food", "empty stomach", "any time", "not specified".
- purpose: at most 12 words, what this medicine is commonly used for, in plain language.
- howToTake: a short instruction based ONLY on what is written; "" if nothing beyond the dose.
- sideEffects: up to 4 common ones. precautions: up to 3 short ones. Plain language.
- alternatives: up to 3 options with the SAME active ingredient and strength
  (e.g. "Glycomet 500 (brand)", "Metformin 500 mg (generic)"). Never suggest a different active ingredient. [] if unsure.
- approxPrice: an indicative Indian MRP such as "₹20–40 per strip of 10", or "" if unsure. Never invent a precise price.
- confidence: "high", "medium" or "low".`;

const OUTPUT_RULES = `Use "" for unknown strings, 0 for unknown numbers, false for unknown flags and [] for empty lists. Respond with JSON only.`;

const PRESCRIPTION_SYSTEM = `You are a careful pharmacy assistant that reads doctors' prescriptions for an Indian online pharmacy.
The input may be handwritten or printed, a photo, scan or PDF, in English, Hindi or a mix.

Rules:
- Only list medicines that are actually written on the document. Never add medicines for a diagnosis.
- If the document is a lab/radiology/medical report or anything that is not a prescription, set isPrescription=false,
  still fill extractedText and diagnoses (the findings), leave medicines empty and say so in summary.
- If it is unreadable or not medical at all, set isPrescription=false and explain briefly in extractedText.
- extractedText: the full readable text in reading order, plain text.
- summary: 1-2 plain-language sentences for the patient.
- doctor / patient / date: fill what is written, "" otherwise.
- validity: doctor = doctor's name/qualification/registration visible; patient = patient name visible;
  medicines = at least one medicine with a dose; signature = doctor's signature or stamp visible; date = visit date visible.
- diagnoses: conditions or findings written on the page (not guesses).
- Medicine fields:${MEDICINE_RULES}
- interactions: only real, clinically recognised interactions between medicines on THIS prescription.
  severity is "low", "moderate" or "high". [] if none.
- warnings: at most 4 short, practical notes (unclear handwriting, missing doctor signature, missing dose,
  unusually high dose, medicines that need strict doctor supervision such as antibiotics or steroids).
- ${OUTPUT_RULES}`;

const MEDICINE_INFO_SYSTEM = `You are a careful pharmacy assistant for an Indian online pharmacy.
Describe ONE medicine in plain language for a patient. The user only supplies a name, so there is no prescription:
leave dose, timesPerDay, durationDays, durationText and howToTake as typical-use information or empty, set the slot flags to false,
and set food to "not specified" unless the medicine is normally taken a specific way.
Fields:${MEDICINE_RULES}
${OUTPUT_RULES}`;

/* ------------------------------------------------------------ normalisation */

const str = (v) => (typeof v === "string" ? v.trim() : "");
const bool = (v) => v === true;
const int = (v) => (Number.isFinite(Number(v)) ? Math.max(0, Math.round(Number(v))) : 0);
const strList = (v, max = 8) =>
  Array.isArray(v) ? v.map(str).filter(Boolean).slice(0, max) : [];

export function normalizeMedicine(m = {}) {
  const confidence = ["high", "medium", "low"].includes(str(m.confidence).toLowerCase())
    ? str(m.confidence).toLowerCase()
    : "medium";
  return {
    name: str(m.name) || "Unknown medicine",
    genericName: str(m.genericName),
    strength: str(m.strength),
    form: str(m.form),
    dose: str(m.dose),
    timesPerDay: int(m.timesPerDay),
    morning: bool(m.morning),
    afternoon: bool(m.afternoon),
    evening: bool(m.evening),
    night: bool(m.night),
    durationDays: int(m.durationDays),
    durationText: str(m.durationText),
    food: str(m.food) || "not specified",
    purpose: str(m.purpose),
    howToTake: str(m.howToTake),
    sideEffects: strList(m.sideEffects, 4),
    precautions: strList(m.precautions, 3),
    alternatives: strList(m.alternatives, 3),
    approxPrice: str(m.approxPrice),
    confidence,
    catalog: null,
  };
}

function normalizePrescription(raw = {}) {
  const severity = (s) => (["low", "moderate", "high"].includes(str(s).toLowerCase()) ? str(s).toLowerCase() : "moderate");
  const doctor = raw.doctor || {};
  const patient = raw.patient || {};
  const validity = raw.validity || {};
  return {
    isPrescription: raw.isPrescription !== false,
    extractedText: str(raw.extractedText),
    summary: str(raw.summary),
    doctor: {
      name: str(doctor.name),
      qualification: str(doctor.qualification),
      registrationNo: str(doctor.registrationNo),
      clinic: str(doctor.clinic),
    },
    patient: { name: str(patient.name), age: str(patient.age), gender: str(patient.gender) },
    date: str(raw.date),
    validity: {
      doctor: bool(validity.doctor),
      patient: bool(validity.patient),
      medicines: bool(validity.medicines),
      signature: bool(validity.signature),
      date: bool(validity.date),
    },
    diagnoses: strList(raw.diagnoses, 10),
    medicines: Array.isArray(raw.medicines) ? raw.medicines.slice(0, 20).map(normalizeMedicine) : [],
    interactions: Array.isArray(raw.interactions)
      ? raw.interactions
          .map((i) => ({
            medicines: strList(i?.medicines, 4),
            severity: severity(i?.severity),
            note: str(i?.note),
          }))
          .filter((i) => i.note)
          .slice(0, 6)
      : [],
    warnings: strList(raw.warnings, 4),
  };
}

/* ------------------------------------------------------- catalogue matching */

function cleanSearchName(name) {
  return name
    .replace(/^(tab(let)?s?|cap(sule)?s?|syp|syrup|inj(ection)?|oint(ment)?|cream|drops?)\.?\s+/i, "")
    .replace(/\s+\d+(\.\d+)?\s*(mg|mcg|g|ml|iu)\b.*$/i, "")
    .trim();
}

// Optional: link each medicine to the drug catalogue. Never blocks the analysis.
async function attachCatalogMatches(medicines) {
  if (!process.env.DRUG_DB_API_KEY) return medicines;
  return Promise.all(
    medicines.map(async (med) => {
      try {
        const [hit] = await searchDrugs(cleanSearchName(med.name), 1);
        if (hit) {
          return {
            ...med,
            catalog: { name: hit.product_name || "", manufacturer: hit.manufacturer || "" },
          };
        }
      } catch (err) {
        console.warn(`Catalogue lookup skipped for "${med.name}": ${err.message}`);
      }
      return med;
    })
  );
}

/* ------------------------------------------------------------------- public */

export async function analyzePrescription({ file, text }) {
  const parts = file
    ? [
        { text: "Read this prescription and return the JSON." },
        { inlineData: { mimeType: file.mimetype, data: file.buffer.toString("base64") } },
      ]
    : [
        {
          text: `Read this prescription text (already extracted, may contain OCR mistakes) and return the JSON.\n\n"""\n${text}\n"""`,
        },
      ];

  const raw = await generateJSON({
    parts,
    system: PRESCRIPTION_SYSTEM,
    schema: PRESCRIPTION_SCHEMA,
    temperature: 0.1,
  });

  const result = normalizePrescription(raw);
  result.medicines = await attachCatalogMatches(result.medicines);
  return result;
}

export async function getMedicineInfo(name) {
  const raw = await generateJSON({
    parts: [{ text: `Medicine: ${name}` }],
    system: MEDICINE_INFO_SYSTEM,
    schema: MEDICINE_SCHEMA,
    temperature: 0.2,
    maxOutputTokens: 2048,
  });
  const med = normalizeMedicine(raw);
  if (med.name === "Unknown medicine") med.name = name;
  return med;
}

export async function suggestMedicines(q) {
  const raw = await generateJSON({
    parts: [{ text: `Search term: ${q}` }],
    system: `You power the medicine search box of an Indian online pharmacy.
Return up to 6 real medicines (brand or generic names sold in India) that best match the search term, most likely first.
For each: name (as sold, with typical strength if obvious), generic (active ingredient), note (max 8 words on what it is used for).
Return {"results": []} if the term is clearly not a medicine. ${OUTPUT_RULES}`,
    schema: SUGGEST_SCHEMA,
    temperature: 0.1,
    maxOutputTokens: 1024,
  });
  return (Array.isArray(raw.results) ? raw.results : [])
    .map((r) => ({ name: str(r?.name), generic: str(r?.generic), note: str(r?.note) }))
    .filter((r) => r.name)
    .slice(0, 6);
}
