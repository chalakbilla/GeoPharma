// Builds an .ics calendar file with daily medicine reminders from a prescription result.
const SLOTS = [
  { key: "morning", label: "morning", hour: 8 },
  { key: "afternoon", label: "afternoon", hour: 14 },
  { key: "evening", label: "evening", hour: 18 },
  { key: "night", label: "night", hour: 21 },
];

const pad = (n) => String(n).padStart(2, "0");
const stamp = (d) =>
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
const escapeText = (s) => String(s).replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");

export function reminderCount(medicines = []) {
  return medicines.reduce(
    (n, m) => n + SLOTS.filter((s) => m[s.key]).length,
    0
  );
}

export function buildReminderIcs(medicines = []) {
  const now = new Date();
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GeoPharma//Medicine reminders//EN",
    "CALSCALE:GREGORIAN",
  ];

  medicines.forEach((med, mi) => {
    SLOTS.filter((s) => med[s.key]).forEach((slot) => {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), slot.hour, 0, 0);
      const days = med.durationDays > 0 ? med.durationDays : 7;
      const label = [med.name, med.strength].filter(Boolean).join(" ");
      const food = med.food && med.food !== "not specified" ? ` (${med.food})` : "";

      lines.push(
        "BEGIN:VEVENT",
        `UID:geopharma-${Date.now()}-${mi}-${slot.key}@geopharma`,
        `DTSTAMP:${stamp(now)}`,
        `DTSTART:${stamp(start)}`,
        `DURATION:PT15M`,
        `RRULE:FREQ=DAILY;COUNT=${days}`,
        `SUMMARY:${escapeText(`Take ${label}${food}`)}`,
        `DESCRIPTION:${escapeText(`${slot.label} dose. Follow your doctor's instructions. Set up by GeoPharma.`)}`,
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        `DESCRIPTION:${escapeText(`Time for ${label}`)}`,
        "TRIGGER:PT0M",
        "END:VALARM",
        "END:VEVENT"
      );
    });
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadIcs(medicines) {
  const blob = new Blob([buildReminderIcs(medicines)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "geopharma-medicine-reminders.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
