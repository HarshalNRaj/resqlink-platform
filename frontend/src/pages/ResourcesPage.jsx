import LifecycleListingPage from "../components/LifecycleListingPage";
import { resources } from "../api/endpoints";

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
  return (
    <LifecycleListingPage
      title="Donate & reuse"
      api={resources}
      ownerField="owner"
      fields={FIELDS}
      createDefaults={{ title: "", category: "", condition: "good", quantity: 1, address_text: "", description: "" }}
    />
  );
}
