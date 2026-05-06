"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { isAdminEmail } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  adminGetAllSessions,
  adminGetDaySummaries,
  adminUpdateSession,
  adminDeleteSession,
  adminMarkDayComplete,
  adminGetUsers,
  type AdminStudySession,
  type AdminDaySummary,
} from "./actions";
import { ArrowLeft, Check, Pencil, Trash2, X } from "lucide-react";

function formatSeconds(s: number): string {
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}m ${secs}s`;
}

function toLocalDatetimeValue(iso: string): string {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function fromLocalDatetimeValue(val: string): string {
  return new Date(val).toISOString();
}

export default function AdminPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [tab, setTab] = useState<"days" | "sessions">("days");
  const [daySummaries, setDaySummaries] = useState<AdminDaySummary[]>([]);
  const [sessions, setSessions] = useState<AdminStudySession[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    startTime: "",
    endTime: "",
    elapsedSeconds: 0,
  });
  const [saving, setSaving] = useState(false);
  const [filterDay, setFilterDay] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const isAdmin = isAdminEmail(session?.user?.email);

  useEffect(() => {
    if (!isPending && (!session?.user || !isAdmin)) {
      router.push("/");
    }
  }, [isPending, session, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  // Reload day summaries when selected user changes
  useEffect(() => {
    if (isAdmin && selectedUserId) {
      adminGetDaySummaries(selectedUserId).then(setDaySummaries).catch(console.error);
    }
  }, [isAdmin, selectedUserId]);

  async function loadData() {
    setLoading(true);
    try {
      const [allSessions, allUsers] = await Promise.all([
        adminGetAllSessions(),
        adminGetUsers(),
      ]);
      setSessions(allSessions);
      setUsers(allUsers);
      // Auto-select first user if none selected yet
      const userId = selectedUserId || (allUsers.length > 0 ? allUsers[0].id : "");
      if (!selectedUserId && userId) {
        setSelectedUserId(userId);
      }
      // Load day summaries for the selected user
      if (userId) {
        const days = await adminGetDaySummaries(userId);
        setDaySummaries(days);
      }
    } catch (e) {
      console.error("Failed to load admin data", e);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(s: AdminStudySession) {
    setEditingId(s.id);
    setEditForm({
      startTime: s.startTime ? toLocalDatetimeValue(s.startTime) : "",
      endTime: s.endTime ? toLocalDatetimeValue(s.endTime) : "",
      elapsedSeconds: s.elapsedSeconds,
    });
  }

  async function saveEdit() {
    if (editingId === null) return;
    setSaving(true);
    try {
      await adminUpdateSession({
        sessionId: editingId,
        startTime: editForm.startTime
          ? fromLocalDatetimeValue(editForm.startTime)
          : undefined,
        endTime: editForm.endTime
          ? fromLocalDatetimeValue(editForm.endTime)
          : null,
        elapsedSeconds: editForm.elapsedSeconds,
      });
      setEditingId(null);
      await loadData();
    } catch (e) {
      console.error("Failed to save", e);
      alert("Failed to save session update");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this session?")) return;
    try {
      await adminDeleteSession(id);
      await loadData();
    } catch (e) {
      console.error("Failed to delete", e);
    }
  }

  async function handleMarkComplete(dayNumber: number) {
    if (!selectedUserId) {
      alert("Please select a user first (dropdown at the top).");
      return;
    }
    const user = users.find((u) => u.id === selectedUserId);
    if (!confirm(`Mark Day ${dayNumber} as complete for ${user?.name ?? "unknown"}?`)) return;
    try {
      await adminMarkDayComplete({ dayNumber, userId: selectedUserId });
      await loadData();
    } catch (e) {
      console.error("Failed to mark complete", e);
    }
  }

  if (isPending || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  const filteredSessions = filterDay
    ? sessions.filter((s) => s.dayNumber === filterDay)
    : sessions;

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      {/* User selector + Tab navigation */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Label className="text-sm whitespace-nowrap">User:</Label>
          <select
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">Select a user</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button
            variant={tab === "days" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("days")}
          >
            Day Summaries
          </Button>
          <Button
            variant={tab === "sessions" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("sessions")}
          >
            All Sessions
          </Button>
        </div>
      </div>

      {tab === "days" && (
        <div className="space-y-2">
          {daySummaries.map((day) => (
            <Card
              key={day.dayNumber}
              className={`p-4 flex items-center justify-between ${
                day.isComplete
                  ? "border-green-500/50 bg-green-500/5"
                  : day.sessionCount > 0
                  ? "border-yellow-500/50 bg-yellow-500/5"
                  : ""
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm">
                    Day {day.dayNumber}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {day.section}
                  </span>
                  {day.isComplete && (
                    <span className="text-green-500 text-xs font-medium">
                      ✓ Complete
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate max-w-md">
                  {day.topic}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span>
                  {formatSeconds(day.totalElapsedSeconds)} /{" "}
                  {day.timeMinutes}m required
                </span>
                <span className="text-muted-foreground">
                  {day.sessionCount} session{day.sessionCount !== 1 ? "s" : ""}
                </span>
                {!day.isComplete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkComplete(day.dayNumber)}
                  >
                    Mark Complete
                  </Button>
                )}
                {day.sessionCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFilterDay(day.dayNumber);
                      setTab("sessions");
                    }}
                  >
                    View Sessions
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "sessions" && (
        <div className="space-y-4">
          {/* Filter controls */}
          <div className="flex items-center gap-4">
            <Label className="text-sm">Filter by day:</Label>
            <Input
              type="number"
              min={1}
              max={41}
              value={filterDay ?? ""}
              onChange={(e) =>
                setFilterDay(e.target.value ? Number(e.target.value) : null)
              }
              className="w-20"
              placeholder="All"
            />
            {filterDay && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterDay(null)}
              >
                Clear
              </Button>
            )}
            <span className="text-sm text-muted-foreground">
              {filteredSessions.length} session
              {filteredSessions.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Sessions list */}
          <div className="space-y-2">
            {filteredSessions.map((s) => (
              <Card key={s.id} className="p-4">
                {editingId === s.id ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span>Editing Session #{s.id}</span>
                      <span className="text-muted-foreground">
                        — Day {s.dayNumber} ({s.section})
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">Start Time</Label>
                        <Input
                          type="datetime-local"
                          value={editForm.startTime}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              startTime: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">End Time</Label>
                        <Input
                          type="datetime-local"
                          value={editForm.endTime}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              endTime: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Elapsed Seconds</Label>
                        <Input
                          type="number"
                          min={0}
                          value={editForm.elapsedSeconds}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              elapsedSeconds: Number(e.target.value),
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={saveEdit}
                        disabled={saving}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        {saving ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="w-3 h-3 mr-1" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-mono font-bold">
                          Day {s.dayNumber}
                        </span>
                        <span className="text-muted-foreground">
                          {s.section} — {s.topic}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 space-x-3">
                        <span>
                          Start:{" "}
                          {new Date(s.startTime).toLocaleString()}
                        </span>
                        <span>
                          End:{" "}
                          {s.endTime
                            ? new Date(s.endTime).toLocaleString()
                            : "—"}
                        </span>
                        <span>
                          Elapsed: {formatSeconds(s.elapsedSeconds)}
                        </span>
                      </div>
                      {s.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          {s.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(s)}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(s.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
            {filteredSessions.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-8">
                No sessions found.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
