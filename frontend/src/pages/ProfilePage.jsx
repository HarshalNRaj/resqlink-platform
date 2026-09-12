import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { auth as api } from "../api/endpoints";
import { Card, FieldLabel, Select, TextInput } from "../components/ui";
import Button from "../components/Button";

const BLOOD_GROUPS = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    phone: user?.phone || "",
    blood_group: user?.blood_group || "",
    is_donor_available: user?.is_donor_available || false,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    await api.updateMe(form);
    await refreshProfile();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl font-bold text-ink">Your profile</h1>

      <Card className="mt-4">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <FieldLabel>Username</FieldLabel>
            <TextInput value={user?.username} disabled />
          </div>
          <div>
            <FieldLabel>Role</FieldLabel>
            <TextInput value={user?.role?.replace("_", " ")} disabled className="capitalize" />
          </div>
          <div>
            <FieldLabel>First name</FieldLabel>
            <TextInput value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
          </div>
          <div>
            <FieldLabel>Phone</FieldLabel>
            <TextInput value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>

          {user?.role === "donor" && (
            <>
              <div>
                <FieldLabel>Blood group</FieldLabel>
                <Select value={form.blood_group} onChange={(e) => setForm({ ...form, blood_group: e.target.value })}>
                  {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g || "Prefer not to say"}</option>)}
                </Select>
              </div>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.is_donor_available}
                  onChange={(e) => setForm({ ...form, is_donor_available: e.target.checked })}
                />
                Available to donate right now
              </label>
            </>
          )}

          {(user?.role === "ngo" || user?.role === "blood_bank") && (
            <p className="text-sm text-ink-soft">
              Verification status: <strong>{user?.is_verified ? "Verified" : "Pending admin approval"}</strong>
            </p>
          )}

          <Button type="submit">{saved ? "Saved ✓" : "Save changes"}</Button>
        </form>
      </Card>
    </div>
  );
}
