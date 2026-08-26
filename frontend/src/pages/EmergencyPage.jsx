import { useEffect, useState } from "react";
import { emergency } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import { Card, EmptyState, FieldLabel, Select, TextArea, TextInput } from "../components/ui";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import UrgencyBadge from "../components/UrgencyBadge";

const DEFAULT_FORM = { request_type: "", description: "", urgency: "medium", people_affected: 1, address_text: "" };

export default function EmergencyPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    emergency.list().then(({ data }) => setItems(data.results || data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await emergency.create(form);
    setForm(DEFAULT_FORM);
    setShowForm(false);
    load();
  };

  const act = async (fn, id) => {
    setBusyId(id);
    try {
      await fn(id);
      load();
    } catch (err) {
      alert(err.response?.data?.detail || "That action isn't available right now.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-ink">Emergency support</h1>
        {["receiver", "general", "admin"].includes(user?.role) && (
          <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "+ New request"}</Button>
        )}
      </div>

      {showForm && (
        <Card className="mt-4">
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>Type of need</FieldLabel>
              <Select value={form.request_type} onChange={(e) => setForm({ ...form, request_type: e.target.value })} required>
                <option value="" disabled>Select…</option>
                <option value="food">Food</option>
                <option value="shelter">Shelter</option>
                <option value="transport">Transport</option>
                <option value="volunteers">Volunteers</option>
                <option value="supplies">Supplies</option>
                <option value="other">Other</option>
              </Select>
            </div>
            <div>
              <FieldLabel>Urgency</FieldLabel>
              <Select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </Select>
            </div>
            <div>
              <FieldLabel>People affected</FieldLabel>
              <TextInput type="number" min="1" value={form.people_affected} onChange={(e) => setForm({ ...form, people_affected: e.target.value })} />
            </div>
            <div>
              <FieldLabel>Location</FieldLabel>
              <TextInput value={form.address_text} onChange={(e) => setForm({ ...form, address_text: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Description</FieldLabel>
              <TextArea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Post request</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-sm text-ink-soft">Loading…</p>
        ) : items.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3">
            <EmptyState title="No open emergency requests" body="Requests posted here need a fast responder." />
          </div>
        ) : (
          items.map((r) => {
            const isRequester = r.requester === user.id;
            const isResponder = r.assigned_to === user.id;
            const canClaim = user.role === "volunteer" || user.role === "ngo" || user.role === "admin";
            return (
              <Card key={r.id}>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-semibold capitalize text-ink">{r.request_type}</h3>
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge status={r.status} />
                    <UrgencyBadge urgency={r.urgency} />
                  </div>
                </div>
                <p className="mt-1.5 text-sm text-ink-soft">{r.description}</p>
                <p className="mt-2 text-xs text-ink-soft">
                  {r.people_affected} affected {r.address_text ? `· ${r.address_text}` : ""}
                </p>
                <p className="mt-1 text-xs text-ink-soft">Requested by {r.requester_username}</p>
                {r.assigned_to_username && <p className="text-xs text-ink-soft">Responder: {r.assigned_to_username}</p>}

                <div className="mt-3 flex flex-wrap gap-2">
                  {r.status === "open" && canClaim && (
                    <Button variant="outline" disabled={busyId === r.id} onClick={() => act(emergency.claim, r.id)}>
                      Respond to this
                    </Button>
                  )}
                  {r.status === "in_progress" && (isRequester || isResponder) && (
                    <Button disabled={busyId === r.id} onClick={() => act(emergency.fulfill, r.id)}>
                      Mark fulfilled
                    </Button>
                  )}
                  {isRequester && r.status !== "closed" && r.status !== "fulfilled" && (
                    <Button variant="ghost" disabled={busyId === r.id} onClick={() => act(emergency.close, r.id)}>
                      Close
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
