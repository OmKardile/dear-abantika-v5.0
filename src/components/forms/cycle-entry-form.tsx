"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Droplet, Activity, Scale, Thermometer, Pill, StickyNote } from "lucide-react";
import { SYMPTOMS, type CycleEntry } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Portal } from "@/components/premium/portal";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  date: string; // YYYY-MM-DD
  existing?: CycleEntry;
  onSave: (entry: Omit<CycleEntry, "id">) => void;
  onDelete?: (id: string) => void;
}

const FLOWS = [
  { id: "light", label: "Light", color: "#F0A8B8" },
  { id: "medium", label: "Medium", color: "#E0758A" },
  { id: "heavy", label: "Heavy", color: "#C04960" },
] as const;

export function CycleEntryForm({
  open,
  onOpenChange,
  date,
  existing,
  onSave,
  onDelete,
}: Props) {
  const [isPeriod, setIsPeriod] = React.useState(existing?.isPeriod ?? false);
  const [flow, setFlow] = React.useState<CycleEntry["flow"]>(existing?.flow);
  const [symptoms, setSymptoms] = React.useState<string[]>(existing?.symptoms ?? []);
  const [weight, setWeight] = React.useState(existing?.weight?.toString() ?? "");
  const [bbt, setBbt] = React.useState(existing?.bbt?.toString() ?? "");
  const [medication, setMedication] = React.useState(existing?.medication ?? "");
  const [notes, setNotes] = React.useState(existing?.notes ?? "");

  React.useEffect(() => {
    if (open) {
      setIsPeriod(existing?.isPeriod ?? false);
      setFlow(existing?.flow);
      setSymptoms(existing?.symptoms ?? []);
      setWeight(existing?.weight?.toString() ?? "");
      setBbt(existing?.bbt?.toString() ?? "");
      setMedication(existing?.medication ?? "");
      setNotes(existing?.notes ?? "");
    }
  }, [open, existing]);

  const toggleSymptom = (s: string) =>
    setSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const save = () => {
    onSave({
      date,
      isPeriod,
      flow: isPeriod ? flow : undefined,
      symptoms,
      weight: weight ? Number(weight) : undefined,
      bbt: bbt ? Number(bbt) : undefined,
      medication: medication || undefined,
      notes: notes || undefined,
    });
    onOpenChange(false);
  };

  return (
    <AnimatePresence>
      {open && (
          <Portal>
                  <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="relative w-full max-w-md max-h-[92dvh] overflow-y-auto no-scrollbar rounded-[32px] surface-elevated"
          >
            {/* drag handle */}
            <div className="sticky top-0 z-10 pt-3 pb-2 bg-elevated/80 backdrop-blur-xl rounded-t-[32px]">
              <div className="mx-auto w-10 h-1.5 rounded-full bg-border" />
              <div className="flex items-center justify-between px-6 pt-3">
                <div>
                  <p className="text-label text-text-tertiary">
                    {existing ? "Edit entry" : "New entry"}
                  </p>
                  <h2 className="text-headline text-text-primary">
                    Cycle check-in
                  </h2>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="w-9 h-9 rounded-full bg-surface-secondary flex items-center justify-center"
                  aria-label="Close"
                >
                  <X size={18} className="text-text-secondary" />
                </button>
              </div>
            </div>

            <div className="px-6 pb-8 pt-3 space-y-6">
              {/* Period toggle */}
              <div className="rounded-[22px] bg-surface-secondary p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl gradient-primary-bg flex items-center justify-center">
                      <Droplet size={18} className="text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-title text-text-primary">Period day</p>
                      <p className="text-caption text-text-secondary">
                        Is this a flow day?
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsPeriod((v) => !v)}
                    className={cn(
                      "relative w-14 h-8 rounded-full transition-colors",
                      isPeriod ? "gradient-primary-bg" : "bg-border"
                    )}
                    aria-pressed={isPeriod}
                  >
                    <motion.span
                      layout
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className={cn(
                        "absolute top-1 w-6 h-6 rounded-full bg-white shadow-md",
                        isPeriod ? "left-7" : "left-1"
                      )}
                    />
                  </button>
                </div>
              </div>

              {/* Flow intensity */}
              <AnimatePresence>
                {isPeriod && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-label text-text-tertiary mb-3">Flow intensity</p>
                    <div className="grid grid-cols-3 gap-2.5">
                      {FLOWS.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setFlow(f.id as CycleEntry["flow"])}
                          className={cn(
                            "rounded-2xl p-3 border-2 transition-all flex flex-col items-center gap-2",
                            flow === f.id
                              ? "border-primary bg-surface"
                              : "border-border bg-surface"
                          )}
                        >
                          <span
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: f.color }}
                          />
                          <span className="text-caption font-semibold text-text-primary">
                            {f.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Symptoms */}
              <div>
                <p className="text-label text-text-tertiary mb-3">
                  Symptoms · {symptoms.length}
                </p>
                <div className="flex flex-wrap gap-2">
                  {SYMPTOMS.map((s) => {
                    const active = symptoms.includes(s);
                    return (
                      <motion.button
                        key={s}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => toggleSymptom(s)}
                        className={cn(
                          "px-3.5 py-2 rounded-full text-sm font-medium border transition-colors",
                          active
                            ? "gradient-primary-bg text-primary-foreground border-transparent shadow-glow"
                            : "bg-surface text-text-secondary border-border"
                        )}
                      >
                        {s}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <MetricField
                  icon={Scale}
                  label="Weight (kg)"
                  value={weight}
                  onChange={setWeight}
                  placeholder="—"
                />
                <MetricField
                  icon={Thermometer}
                  label="BBT (°C)"
                  value={bbt}
                  onChange={setBbt}
                  placeholder="—"
                />
              </div>

              <MetricField
                icon={Pill}
                label="Medication"
                value={medication}
                onChange={setMedication}
                placeholder="e.g. Iron supplement"
              />

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <StickyNote size={15} className="text-text-tertiary" />
                  <p className="text-label text-text-tertiary">Private notes</p>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Anything you'd like to remember…"
                  className="w-full rounded-2xl bg-surface-secondary border border-border p-4 text-body text-text-primary placeholder:text-text-tertiary outline-none focus:border-primary/40 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                {existing && onDelete && (
                  <button
                    onClick={() => {
                      onDelete(existing.id);
                      onOpenChange(false);
                    }}
                    className="px-5 py-3.5 rounded-2xl border border-error/30 text-error text-sm font-semibold"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={save}
                  className="flex-1 py-3.5 rounded-2xl gradient-primary-bg text-primary-foreground text-sm font-bold shadow-glow"
                >
                  {existing ? "Save changes" : "Add entry"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
        </Portal>
      )}
    </AnimatePresence>
  );
}

function MetricField({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={15} className="text-text-tertiary" />
        <p className="text-label text-text-tertiary">{label}</p>
      </div>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl bg-surface-secondary border border-border px-4 py-3 text-body text-text-primary placeholder:text-text-tertiary outline-none focus:border-primary/40"
      />
    </div>
  );
}
