import LifecycleListingPage from "../components/LifecycleListingPage";
import { food } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";

const FIELDS = [
  { name: "title", label: "Title", required: true },
  { name: "quantity_servings", label: "Servings", type: "number", required: true },
  { name: "expiry_time", label: "Pick up before", type: "datetime-local", required: true },
  { name: "address_text", label: "Pickup location" },
  { name: "description", label: "Description", type: "textarea", wide: true },
];

export default function FoodPage() {
  const { user } = useAuth();
  return (
    <LifecycleListingPage
      title="Food rescue"
      api={food}
      ownerField="provider"
      fields={FIELDS}
      createDefaults={{ title: "", quantity_servings: 10, expiry_time: "", address_text: "", description: "" }}
      canCreate={["donor", "admin"].includes(user?.role)}
      canRequest={["receiver", "general", "admin"].includes(user?.role)}
      canAssign={["volunteer", "ngo", "admin"].includes(user?.role)}
    />
  );
}
