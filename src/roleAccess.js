// Role based permission configuration for ResQLink

export const ROLES = {
  RECEIVER: "receiver",
  GENERAL: "general",
  DONOR: "donor",
  VOLUNTEER: "volunteer",
  NGO: "ngo",
  BLOOD_BANK: "blood_bank",
  ADMIN: "admin",
};

export const ROLE_LABELS = {
  general: "Receiver",
  receiver: "Receiver",
  donor: "Donor",
  volunteer: "Volunteer",
  ngo: "NGO / Community Org",
  blood_bank: "Blood Bank",
  admin: "Administrator",
};

export function isReceiver(role) {
  return role === "general" || role === "receiver";
}

export function isDonor(role) {
  return role === "donor";
}

export function isVolunteer(role) {
  return role === "volunteer";
}

export function isNGO(role) {
  return role === "ngo";
}

export function isBloodBank(role) {
  return role === "blood_bank";
}

export function isAdmin(role) {
  return role === "admin";
}

export function canAccess(role, section) {
  if (!role) return false;
  if (role === "admin") return true;

  switch (section) {
    case "verifications":
      return role === "admin";
    case "dashboard":
    case "impact":
    case "profile":
      return true;
    case "resources":
      return ["general", "receiver", "donor", "volunteer", "ngo", "admin"].includes(role);
    case "food":
      return ["general", "receiver", "donor", "volunteer", "ngo", "admin"].includes(role);
    case "blood":
      return ["general", "receiver", "donor", "blood_bank", "ngo", "admin"].includes(role);
    case "emergency":
      return ["general", "receiver", "volunteer", "ngo", "donor", "admin"].includes(role);
    default:
      return true;
  }
}

