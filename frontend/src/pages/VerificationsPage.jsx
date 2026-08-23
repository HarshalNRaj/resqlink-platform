import { useEffect, useState } from "react";
import { auth as api } from "../api/endpoints";
import { Card, EmptyState } from "../components/ui";
import Button from "../components/Button";

export default function VerificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.pendingVerifications().then(({ data }) => setItems(data.results || data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const approve = async (id) => {
    await api.approveOrg(id);
    load();
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Pending verifications</h1>
      <p className="mt-1 text-sm text-ink-soft">NGO and blood bank accounts wait here until an admin confirms them.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {loading ? (
          <p className="text-sm text-ink-soft">Loading…</p>
        ) : items.length === 0 ? (
          <div className="sm:col-span-2">
            <EmptyState title="Nothing pending" body="All NGO and blood bank accounts are verified." />
          </div>
        ) : (
          items.map((org) => (
            <Card key={org.id}>
              <h3 className="font-display font-semibold text-ink">{org.organization_name}</h3>
              <p className="text-xs capitalize text-ink-soft">{org.role.replace("_", " ")} · {org.email}</p>
              <Button className="mt-3" onClick={() => approve(org.id)}>Approve</Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
