export const ROLE_ACCESS = {
  donor: ["resources", "food", "blood", "impact", "profile"],
  receiver: ["resources", "food", "blood", "emergency", "impact", "profile"],
  general: ["resources", "food", "blood", "emergency", "impact", "profile"],
  volunteer: ["resources", "food", "emergency", "impact", "profile"],
  ngo: ["resources", "food", "emergency", "impact", "profile"],
  blood_bank: ["blood", "impact", "profile"],
  admin: ["resources", "food", "blood", "emergency", "impact", "profile", "verifications"],
};

export function canAccess(role, section) {
  return ROLE_ACCESS[role]?.includes(section) ?? false;
}