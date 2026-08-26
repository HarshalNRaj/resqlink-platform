import LifecycleListingPage from "../components/LifecycleListingPage";
import { resources } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";

const FIELDS = [
  { name: "title", label: "Title", required: true },
  { name: "category", label: "Category", type: "select", required: true, options: [
    { value: "clothes", label: "Clothes" },
    { value: "electronics", label: "Electronics" },
    { value: "furniture", label: "Furniture" },
    { value: "books", label: "Books" },
    { value: "other", label: "Other" },
  ]},
  { name: "condition", label: "Condition", type: "select", options: [
    { value: "new", label: "New" },
    { value: "good", label: "Good" },
    { value: "fair", label: "Fair" },
  ]},
  { name: "quantity", label: "Quantity", type: "number" },
  { name: "address_text", label: "Pickup location" },
  { name: "description", label: "Description", type: "textarea", wide: true },
];

export default function ResourcesPage() {
  const { user } = useAuth();
  return (
    <LifecycleListingPage
      title="Donate & reuse"
      api={resources}
      ownerField="owner"
      fields={FIELDS}
      createDefaults={{ title: "", category: "", condition: "good", quantity: 1, address_text: "", description: "" }}
      canCreate={["donor", "admin"].includes(user?.role)}
      canRequest={["receiver", "general", "admin"].includes(user?.role)}
      canAssign={["volunteer", "ngo", "admin"].includes(user?.role)}
    />
  );
}
