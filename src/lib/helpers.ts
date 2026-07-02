export { cn } from "./utils";

export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function dateKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Resting hours";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

export function greetingSub(): string {
  const h = new Date().getHours();
  if (h < 5) return "Hope you're sleeping soundly.";
  if (h < 12) return "A soft start to your day.";
  if (h < 17) return "Take a breath, you're doing well.";
  if (h < 21) return "Time to unwind a little.";
  return "Be gentle with yourself tonight.";
}

export function formatTime(time: string): string {
  // "08:00" -> "8:00 AM"
  const [hStr, m] = time.split(":");
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

export function timeUntil(time: string): string {
  const now = new Date();
  const [h, m] = time.split(":").map((n) => parseInt(n, 10));
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  const diff = target.getTime() - now.getTime();
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours === 0) return `in ${mins}m`;
  if (mins === 0) return `in ${hours}h`;
  return `in ${hours}h ${mins}m`;
}

export function downloadJson(data: string, filename: string) {
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
