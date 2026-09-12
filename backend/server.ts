import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import jwt from "jsonwebtoken";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "resqlink-jwt-secret-ai-studio-2026";

// In-memory data store with demo records
interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  role: string;
  phone?: string;
  organization_name?: string;
  blood_group?: string;
  is_donor_available?: boolean;
  is_verified: boolean;
  is_staff?: boolean;
  lat?: number | null;
  lng?: number | null;
  date_joined: string;
}

interface BloodBank {
  id: number;
  user: number;
  username: string;
  name: string;
  address_text: string;
  lat: number;
  lng: number;
  contact_phone: string;
}

interface Resource {
  id: number;
  owner: number;
  owner_username: string;
  title: string;
  category: string;
  condition: string;
  description: string;
  quantity: number;
  status: string;
  requester: number | null;
  requester_username: string | null;
  volunteer: number | null;
  volunteer_username: string | null;
  address_text: string;
  lat: number | null;
  lng: number | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

interface FoodListing {
  id: number;
  provider: number;
  provider_username: string;
  title: string;
  description: string;
  quantity_servings: number;
  expiry_time: string;
  status: string;
  requester: number | null;
  requester_username: string | null;
  volunteer: number | null;
  volunteer_username: string | null;
  address_text: string;
  lat: number | null;
  lng: number | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

interface BloodRequest {
  id: number;
  requester: number;
  requester_username: string;
  blood_group: string;
  units_needed: number;
  urgency: string;
  hospital_name: string;
  address_text: string;
  lat: number | null;
  lng: number | null;
  notes: string;
  status: string;
  matched_donor: number | null;
  matched_donor_username: string | null;
  matched_blood_bank: number | null;
  matched_blood_bank_name: string | null;
  created_at: string;
  updated_at: string;
  fulfilled_at: string | null;
}

interface EmergencyRequest {
  id: number;
  requester: number;
  requester_username: string;
  request_type: string;
  description: string;
  urgency: string;
  people_affected: number;
  address_text: string;
  lat: number | null;
  lng: number | null;
  status: string;
  assigned_to: number | null;
  assigned_to_username: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

interface Notification {
  id: number;
  user: number;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

const MYSURU = { lat: 12.2958, lng: 76.6394 };

// Seed Users
const users: User[] = [
  {
    id: 1,
    username: "admin",
    email: "admin@resqlink.local",
    password: "password123",
    role: "admin",
    first_name: "Admin",
    last_name: "User",
    is_verified: true,
    date_joined: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    username: "asha_donor",
    email: "asha@example.com",
    password: "password123",
    role: "donor",
    first_name: "Asha",
    blood_group: "O+",
    is_donor_available: true,
    is_verified: true,
    lat: MYSURU.lat,
    lng: MYSURU.lng,
    phone: "+91 98888 11111",
    date_joined: "2026-01-02T00:00:00.000Z",
  },
  {
    id: 3,
    username: "ravi_volunteer",
    email: "ravi@example.com",
    password: "password123",
    role: "volunteer",
    first_name: "Ravi",
    is_verified: true,
    lat: MYSURU.lat + 0.01,
    lng: MYSURU.lng + 0.01,
    phone: "+91 98888 22222",
    date_joined: "2026-01-03T00:00:00.000Z",
  },
  {
    id: 4,
    username: "hope_ngo",
    email: "hope@example.com",
    password: "password123",
    role: "ngo",
    organization_name: "Hope Community Foundation",
    is_verified: true,
    lat: MYSURU.lat - 0.01,
    lng: MYSURU.lng - 0.01,
    phone: "+91 98888 33333",
    date_joined: "2026-01-04T00:00:00.000Z",
  },
  {
    id: 5,
    username: "citycare_bloodbank",
    email: "citycare@example.com",
    password: "password123",
    role: "blood_bank",
    organization_name: "CityCare Blood Bank",
    is_verified: true,
    lat: MYSURU.lat + 0.02,
    lng: MYSURU.lng,
    phone: "+91 90000 00000",
    date_joined: "2026-01-05T00:00:00.000Z",
  },
  {
    id: 6,
    username: "meera",
    email: "meera@example.com",
    password: "password123",
    role: "general",
    first_name: "Meera",
    is_verified: true,
    lat: MYSURU.lat,
    lng: MYSURU.lng + 0.02,
    phone: "+91 98888 44444",
    date_joined: "2026-01-06T00:00:00.000Z",
  },
  {
    id: 7,
    username: "green_earth_ngo",
    email: "green@example.com",
    password: "password123",
    role: "ngo",
    organization_name: "Green Earth Community Kitchen",
    is_verified: false,
    lat: MYSURU.lat - 0.015,
    lng: MYSURU.lng + 0.01,
    phone: "+91 98888 55555",
    date_joined: "2026-09-01T00:00:00.000Z",
  },
];

// Seed Blood Banks
const bloodBanks: BloodBank[] = [
  {
    id: 1,
    user: 5,
    username: "citycare_bloodbank",
    name: "CityCare Blood Bank",
    address_text: "Sayyaji Rao Road, Mysuru",
    lat: MYSURU.lat + 0.02,
    lng: MYSURU.lng,
    contact_phone: "+91 90000 00000",
  },
];

// Seed Resources
let resources: Resource[] = [
  {
    id: 1,
    owner: 2,
    owner_username: "asha_donor",
    title: "Study table + chair",
    category: "furniture",
    condition: "good",
    description: "Barely used, moving out of Mysuru.",
    quantity: 1,
    status: "available",
    requester: null,
    requester_username: null,
    volunteer: null,
    volunteer_username: null,
    address_text: "Vijayanagar, Mysuru",
    lat: MYSURU.lat,
    lng: MYSURU.lng,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    completed_at: null,
  },
  {
    id: 2,
    owner: 2,
    owner_username: "asha_donor",
    title: "Winter jackets (set of 4)",
    category: "clothes",
    condition: "good",
    description: "Kids' sizes 8-12 years.",
    quantity: 4,
    status: "available",
    requester: null,
    requester_username: null,
    volunteer: null,
    volunteer_username: null,
    address_text: "Vijayanagar, Mysuru",
    lat: MYSURU.lat + 0.005,
    lng: MYSURU.lng - 0.005,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    completed_at: null,
  },
  {
    id: 3,
    owner: 2,
    owner_username: "asha_donor",
    title: "Working laptop charger",
    category: "electronics",
    condition: "fair",
    description: "Dell 65W, tested working.",
    quantity: 1,
    status: "completed",
    requester: 6,
    requester_username: "meera",
    volunteer: 3,
    volunteer_username: "ravi_volunteer",
    address_text: "Vijayanagar, Mysuru",
    lat: MYSURU.lat,
    lng: MYSURU.lng,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    completed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

// Seed Food Listings
let foodListings: FoodListing[] = [
  {
    id: 1,
    provider: 4,
    provider_username: "hope_ngo",
    title: "Surplus rice + sambar (event leftovers)",
    description: "From a college seminar, still warm, packed hygienically.",
    quantity_servings: 40,
    expiry_time: new Date(Date.now() + 8 * 3600000).toISOString(),
    status: "available",
    requester: null,
    requester_username: null,
    volunteer: null,
    volunteer_username: null,
    address_text: "NIE Campus, Mysuru",
    lat: MYSURU.lat - 0.01,
    lng: MYSURU.lng - 0.01,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    completed_at: null,
  },
];

// Seed Blood Requests
let bloodRequests: BloodRequest[] = [
  {
    id: 1,
    requester: 6,
    requester_username: "meera",
    blood_group: "O+",
    units_needed: 2,
    urgency: "high",
    hospital_name: "K R Hospital",
    address_text: "Sayyaji Rao Road, Mysuru",
    lat: MYSURU.lat + 0.015,
    lng: MYSURU.lng + 0.003,
    notes: "Scheduled surgery on Thursday.",
    status: "open",
    matched_donor: null,
    matched_donor_username: null,
    matched_blood_bank: null,
    matched_blood_bank_name: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    fulfilled_at: null,
  },
];

// Seed Emergency Requests
let emergencyRequests: EmergencyRequest[] = [
  {
    id: 1,
    requester: 6,
    requester_username: "meera",
    request_type: "shelter",
    description: "Family of 4 displaced after flooding.",
    urgency: "critical",
    people_affected: 4,
    address_text: "Kesare, Mysuru",
    lat: MYSURU.lat - 0.02,
    lng: MYSURU.lng + 0.015,
    status: "open",
    assigned_to: null,
    assigned_to_username: null,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
    closed_at: null,
  },
];

// Seed Notifications
let notifications: Notification[] = [
  {
    id: 1,
    user: 2,
    message: "Welcome to ResQLink! You can list items you'd like to share.",
    link: "/app/resources",
    is_read: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 2,
    user: 6,
    message: "Your emergency request has been posted and local volunteers alerted.",
    link: "/app/emergency",
    is_read: false,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

let nextId = {
  user: 8,
  resource: 4,
  food: 2,
  blood: 2,
  emergency: 2,
  notification: 3,
  bloodBank: 2,
};

function sanitizeUser(u: User) {
  const { password, ...safe } = u;
  return safe;
}

function notifyUser(userId: number | null, message: string, link = "") {
  if (!userId) return;
  notifications.unshift({
    id: nextId.notification++,
    user: userId,
    message,
    link,
    is_read: false,
    created_at: new Date().toISOString(),
  });
}

interface AuthenticatedRequest extends Request {
  user?: User;
}

function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string };
    const found = users.find((u) => u.id === decoded.id);
    if (found) {
      req.user = found;
    }
  } catch {
    // Ignore invalid token, req.user remains undefined
  }
  next();
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ detail: "Authentication credentials were not provided." });
  }
  next();
}

async function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(authMiddleware);

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Auth: Login
  app.post("/api/auth/login/", (req, res) => {
    const { username, password } = req.body || {};
    const user = users.find(
      (u) =>
        u.username.toLowerCase() === (username || "").toLowerCase() &&
        (u.password === password || (!u.password && password === "password123"))
    );
    if (!user) {
      return res.status(401).json({ detail: "Invalid username or password." });
    }
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      is_verified: user.is_verified,
    };
    const access = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
    const refresh = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "30d" });

    return res.json({
      access,
      refresh,
      user: sanitizeUser(user),
    });
  });

  // Auth: Refresh
  app.post("/api/auth/login/refresh/", (req, res) => {
    const { refresh } = req.body || {};
    if (!refresh) {
      return res.status(400).json({ detail: "Refresh token required." });
    }
    try {
      const decoded = jwt.verify(refresh, JWT_SECRET) as { id: number };
      const user = users.find((u) => u.id === decoded.id);
      if (!user) {
        return res.status(401).json({ detail: "User not found." });
      }
      const access = jwt.sign(
        { id: user.id, username: user.username, role: user.role, is_verified: user.is_verified },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      return res.json({ access });
    } catch {
      return res.status(401).json({ detail: "Token is invalid or expired." });
    }
  });

  // Helper to enforce Django-standard password requirements
  function validateDjangoPassword(
    password: string,
    userAttributes: { username?: string; email?: string; first_name?: string; last_name?: string } = {}
  ): string[] {
    const errors: string[] = [];
    if (!password || password.length < 8) {
      errors.push("This password is too short. It must contain at least 8 characters.");
      return errors;
    }
    if (/^\d+$/.test(password)) {
      errors.push("This password cannot be entirely numeric.");
    }
    const commonPasswords = [
      "password", "password123", "12345678", "123456789", "qwertyuiop",
      "letmein1", "welcome1", "admin123", "admin1234", "administrator", "resqlink123"
    ];
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push("This password is too common.");
    }
    const checkSimilarity = (val?: string, label?: string) => {
      if (!val || val.length < 3) return;
      const lVal = val.toLowerCase();
      const lPass = password.toLowerCase();
      if (lPass.includes(lVal) || lVal.includes(lPass)) {
        errors.push(`The password is too similar to the ${label}.`);
      }
    };
    checkSimilarity(userAttributes.username, "username");
    if (userAttributes.email) {
      const emailPrefix = userAttributes.email.split("@")[0];
      checkSimilarity(emailPrefix, "email address");
    }
    return errors;
  }

  function checkVerifiedOrg(user: User): boolean {
    if (user.role === "admin") return true;
    if (["ngo", "blood_bank"].includes(user.role)) {
      return !!user.is_verified;
    }
    return true;
  }

  // Auth: Register
  app.post("/api/auth/register/", (req, res) => {
    let {
      username,
      email,
      password,
      first_name,
      last_name,
      role = "general",
      phone,
      organization_name,
      blood_group,
    } = req.body || {};

    const errors: Record<string, string[]> = {};

    if (role === "receiver") role = "general";

    // Username validation
    if (!username || typeof username !== "string" || !username.trim()) {
      errors.username = ["This field is required."];
    } else if (username.trim().length < 3) {
      errors.username = ["Ensure this field has at least 3 characters."];
    } else if (users.some((u) => u.username.toLowerCase() === username.trim().toLowerCase())) {
      errors.username = ["A user with that username already exists."];
    }

    // Email validation
    if (!email || typeof email !== "string" || !email.trim()) {
      errors.email = ["This field is required."];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = ["Enter a valid email address."];
    } else if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      errors.email = ["A user with that email already exists."];
    }

    // Password validation (Django standards: >= 8 chars, not numeric, not common, not similar)
    if (!password || typeof password !== "string") {
      errors.password = ["This field is required."];
    } else {
      const pwdErrors = validateDjangoPassword(password, {
        username: typeof username === "string" ? username.trim() : "",
        email: typeof email === "string" ? email.trim() : "",
        first_name: typeof first_name === "string" ? first_name.trim() : "",
        last_name: typeof last_name === "string" ? last_name.trim() : "",
      });
      if (pwdErrors.length > 0) {
        errors.password = pwdErrors;
      }
    }

    // Role validation
    if (role === "admin") {
      errors.role = ["Admin accounts cannot self-register."];
    } else if (!["general", "donor", "volunteer", "ngo", "blood_bank"].includes(role)) {
      errors.role = ["Invalid role selected."];
    }

    // Role-specific fields
    if (["ngo", "blood_bank"].includes(role)) {
      if (!organization_name || typeof organization_name !== "string" || !organization_name.trim()) {
        errors.organization_name = ["Organization name is required for NGO and blood bank accounts."];
      }
    }

    if (role === "donor" && blood_group) {
      const validGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
      if (!validGroups.includes(blood_group)) {
        errors.blood_group = ["Invalid blood group selected."];
      }
    }

    // Phone validation
    if (phone && typeof phone === "string" && phone.trim()) {
      const digits = phone.replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 15) {
        errors.phone = ["Enter a valid phone number (7-15 digits)."];
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    const is_verified = !["ngo", "blood_bank"].includes(role);
    const newUser: User = {
      id: nextId.user++,
      username: username.trim(),
      email: email.trim(),
      password,
      first_name: first_name ? first_name.trim() : "",
      last_name: last_name ? last_name.trim() : "",
      role,
      phone: phone ? phone.trim() : "",
      organization_name: ["ngo", "blood_bank"].includes(role) ? organization_name.trim() : "",
      blood_group: role === "donor" && blood_group ? blood_group : "",
      is_donor_available: role === "donor",
      is_verified,
      lat: MYSURU.lat,
      lng: MYSURU.lng,
      date_joined: new Date().toISOString(),
    };
    users.push(newUser);

    return res.status(201).json({
      user: sanitizeUser(newUser),
      message:
        role === "ngo" || role === "blood_bank"
          ? "Account created. Verification by an admin is pending."
          : "Account created successfully.",
    });
  });

  // Auth: Me
  app.get("/api/auth/me/", requireAuth, (req: AuthenticatedRequest, res) => {
    res.json(sanitizeUser(req.user!));
  });

  app.patch("/api/auth/me/", requireAuth, (req: AuthenticatedRequest, res) => {
    const user = req.user!;
    const fields = [
      "first_name",
      "last_name",
      "phone",
      "organization_name",
      "blood_group",
      "is_donor_available",
      "lat",
      "lng",
    ] as const;
    for (const f of fields) {
      if (req.body[f] !== undefined) {
        ((user as unknown) as Record<string, unknown>)[f] = req.body[f];
      }
    }
    res.json(sanitizeUser(user));
  });

  // Auth: Donors
  app.get("/api/auth/donors/", (_req, res) => {
    const bg = _req.query.blood_group as string | undefined;
    let list = users.filter((u) => u.role === "donor" && u.is_donor_available);
    if (bg) {
      list = list.filter((u) => u.blood_group === bg);
    }
    res.json(list.map(sanitizeUser));
  });

  // Auth: Pending verifications (Admin only)
  app.get("/api/auth/verifications/pending/", requireAuth, (req: AuthenticatedRequest, res) => {
    if (req.user!.role !== "admin") {
      return res.status(403).json({ detail: "Admins only." });
    }
    const pending = users.filter((u) => ["ngo", "blood_bank"].includes(u.role) && !u.is_verified);
    res.json(pending.map(sanitizeUser));
  });

  // Auth: Approve organization
  app.post("/api/auth/verifications/:id/approve/", requireAuth, (req: AuthenticatedRequest, res) => {
    if (req.user!.role !== "admin") {
      return res.status(403).json({ detail: "Admins only." });
    }
    const org = users.find((u) => u.id === Number(req.params.id) && ["ngo", "blood_bank"].includes(u.role));
    if (!org) {
      return res.status(404).json({ detail: "Not found." });
    }
    org.is_verified = true;
    notifyUser(org.id, "Your organization profile has been verified by an administrator!", "/app");
    res.json(sanitizeUser(org));
  });

  // Resources
  app.get("/api/resources/", (req: AuthenticatedRequest, res) => {
    let result = [...resources];
    const { mine, category, status, condition } = req.query as Record<string, string>;

    if (mine === "owned" && req.user) {
      result = result.filter((r) => r.owner === req.user!.id);
    } else if (mine === "requested" && req.user) {
      result = result.filter((r) => r.requester === req.user!.id);
    } else if (mine === "volunteering" && req.user) {
      result = result.filter((r) => r.volunteer === req.user!.id);
    }

    if (category) result = result.filter((r) => r.category === category);
    if (status) result = result.filter((r) => r.status === status);
    if (condition) result = result.filter((r) => r.condition === condition);

    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json(result);
  });

  app.get("/api/resources/:id/", (req, res) => {
    const item = resources.find((r) => r.id === Number(req.params.id));
    if (!item) return res.status(404).json({ detail: "Not found." });
    res.json(item);
  });

  app.post("/api/resources/", requireAuth, (req: AuthenticatedRequest, res) => {
    const user = req.user!;
    if (["receiver", "general", "volunteer", "blood_bank"].includes(user.role)) {
      return res.status(403).json({ detail: "Only donor and organization accounts can create resource listings." });
    }
    if (!checkVerifiedOrg(user)) {
      return res.status(403).json({ detail: "Organization account is pending administrator verification." });
    }
    const { title, category, condition = "good", description = "", quantity = 1, address_text = "", lat, lng } = req.body;
    if (!title || !category) {
      return res.status(400).json({ detail: "Title and category are required." });
    }
    const item: Resource = {
      id: nextId.resource++,
      owner: user.id,
      owner_username: user.username,
      title,
      category,
      condition,
      description,
      quantity: Number(quantity) || 1,
      status: "available",
      requester: null,
      requester_username: null,
      volunteer: null,
      volunteer_username: null,
      address_text,
      lat: lat ?? user.lat ?? MYSURU.lat,
      lng: lng ?? user.lng ?? MYSURU.lng,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null,
    };
    resources.unshift(item);
    res.status(201).json(item);
  });

  app.patch("/api/resources/:id/", requireAuth, (req: AuthenticatedRequest, res) => {
    const item = resources.find((r) => r.id === Number(req.params.id));
    if (!item) return res.status(404).json({ detail: "Not found." });
    if (item.owner !== req.user!.id && req.user!.role !== "admin") {
      return res.status(403).json({ detail: "You do not have permission to edit this item." });
    }
    Object.assign(item, req.body, { updated_at: new Date().toISOString() });
    res.json(item);
  });

  app.delete("/api/resources/:id/", requireAuth, (req: AuthenticatedRequest, res) => {
    const idx = resources.findIndex((r) => r.id === Number(req.params.id));
    if (idx === -1) return res.status(404).json({ detail: "Not found." });
    if (resources[idx].owner !== req.user!.id && req.user!.role !== "admin") {
      return res.status(403).json({ detail: "You do not have permission to delete this item." });
    }
    resources.splice(idx, 1);
    res.status(204).send();
  });

  app.post("/api/resources/:id/request_item/", requireAuth, (req: AuthenticatedRequest, res) => {
    const item = resources.find((r) => r.id === Number(req.params.id));
    if (!item) return res.status(404).json({ detail: "Not found." });
    if (item.status !== "available") {
      return res.status(400).json({ detail: "This resource is no longer available." });
    }
    if (item.owner === req.user!.id) {
      return res.status(400).json({ detail: "You can't request your own listing." });
    }
    item.requester = req.user!.id;
    item.requester_username = req.user!.username;
    item.status = "requested";
    item.updated_at = new Date().toISOString();

    notifyUser(item.owner, `${req.user!.username} requested your item '${item.title}'.`, "/app/resources");
    res.json(item);
  });

  app.post("/api/resources/:id/assign/", requireAuth, (req: AuthenticatedRequest, res) => {
    const item = resources.find((r) => r.id === Number(req.params.id));
    if (!item) return res.status(404).json({ detail: "Not found." });
    if (req.user!.role === "receiver" || req.user!.role === "general") {
      return res.status(403).json({ detail: "Receivers cannot accept volunteer delivery assignments." });
    }
    if (!["volunteer", "ngo", "admin"].includes(req.user!.role)) {
      return res.status(403).json({ detail: "Only volunteers and organizations can accept delivery assignments." });
    }
    if (item.status !== "requested") {
      return res.status(400).json({ detail: "This item isn't awaiting a volunteer yet." });
    }
    item.volunteer = req.user!.id;
    item.volunteer_username = req.user!.username;
    item.status = "assigned";
    item.updated_at = new Date().toISOString();

    notifyUser(item.owner, `${req.user!.username} stepped in as volunteer for '${item.title}'.`, "/app/resources");
    notifyUser(item.requester, `${req.user!.username} volunteered to deliver '${item.title}'.`, "/app/resources");
    res.json(item);
  });

  app.post("/api/resources/:id/complete/", requireAuth, (req: AuthenticatedRequest, res) => {
    const item = resources.find((r) => r.id === Number(req.params.id));
    if (!item) return res.status(404).json({ detail: "Not found." });
    if (item.status !== "assigned" && item.status !== "requested") {
      return res.status(400).json({ detail: "This item isn't ready to be marked complete." });
    }
    const allowed = [item.owner, item.requester, item.volunteer];
    if (!allowed.includes(req.user!.id) && req.user!.role !== "admin") {
      return res.status(403).json({ detail: "You do not have permission to mark this resource complete." });
    }
    item.status = "completed";
    item.completed_at = new Date().toISOString();
    item.updated_at = new Date().toISOString();

    [item.owner, item.requester, item.volunteer].forEach((uid) => {
      notifyUser(uid, `'${item.title}' has been delivered and marked completed!`, "/app/impact");
    });
    res.json(item);
  });

  app.post("/api/resources/:id/cancel/", requireAuth, (req: AuthenticatedRequest, res) => {
    const item = resources.find((r) => r.id === Number(req.params.id));
    if (!item) return res.status(404).json({ detail: "Not found." });
    if (item.owner !== req.user!.id && req.user!.role !== "admin") {
      return res.status(403).json({ detail: "Only the owner can cancel this listing." });
    }
    item.status = "cancelled";
    item.updated_at = new Date().toISOString();
    res.json(item);
  });

  // Food Listings
  app.get("/api/food/", (req: AuthenticatedRequest, res) => {
    let result = [...foodListings];
    const { mine, status } = req.query as Record<string, string>;

    if (mine === "provided" && req.user) {
      result = result.filter((f) => f.provider === req.user!.id);
    } else if (mine === "requested" && req.user) {
      result = result.filter((f) => f.requester === req.user!.id);
    } else if (mine === "volunteering" && req.user) {
      result = result.filter((f) => f.volunteer === req.user!.id);
    }

    if (status) result = result.filter((f) => f.status === status);
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json(result);
  });

  app.get("/api/food/:id/", (req, res) => {
    const item = foodListings.find((f) => f.id === Number(req.params.id));
    if (!item) return res.status(404).json({ detail: "Not found." });
    res.json(item);
  });

  app.post("/api/food/", requireAuth, (req: AuthenticatedRequest, res) => {
    const user = req.user!;
    if (["receiver", "general", "volunteer", "blood_bank"].includes(user.role)) {
      return res.status(403).json({ detail: "Only food donors and organization accounts can create food listings." });
    }
    if (!checkVerifiedOrg(user)) {
      return res.status(403).json({ detail: "Organization account is pending administrator verification." });
    }
    const { title, description = "", quantity_servings = 1, expiry_time, address_text = "", lat, lng } = req.body;
    if (!title || !quantity_servings) {
      return res.status(400).json({ detail: "Title and quantity servings are required." });
    }
    const item: FoodListing = {
      id: nextId.food++,
      provider: user.id,
      provider_username: user.username,
      title,
      description,
      quantity_servings: Number(quantity_servings) || 1,
      expiry_time: expiry_time || new Date(Date.now() + 6 * 3600000).toISOString(),
      status: "available",
      requester: null,
      requester_username: null,
      volunteer: null,
      volunteer_username: null,
      address_text,
      lat: lat ?? user.lat ?? MYSURU.lat,
      lng: lng ?? user.lng ?? MYSURU.lng,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null,
    };
    foodListings.unshift(item);
    res.status(201).json(item);
  });

  app.patch("/api/food/:id/", requireAuth, (req: AuthenticatedRequest, res) => {
    const item = foodListings.find((f) => f.id === Number(req.params.id));
    if (!item) return res.status(404).json({ detail: "Not found." });
    if (item.provider !== req.user!.id && req.user!.role !== "admin") {
      return res.status(403).json({ detail: "You do not have permission to edit this food listing." });
    }
    Object.assign(item, req.body, { updated_at: new Date().toISOString() });
    res.json(item);
  });

  app.delete("/api/food/:id/", requireAuth, (req: AuthenticatedRequest, res) => {
    const idx = foodListings.findIndex((f) => f.id === Number(req.params.id));
    if (idx === -1) return res.status(404).json({ detail: "Not found." });
    if (foodListings[idx].provider !== req.user!.id && req.user!.role !== "admin") {
      return res.status(403).json({ detail: "You do not have permission to delete this food listing." });
    }
    foodListings.splice(idx, 1);
    res.status(204).send();
  });

  app.post("/api/food/:id/request_item/", requireAuth, (req: AuthenticatedRequest, res) => {
    const item = foodListings.find((f) => f.id === Number(req.params.id));
    if (!item) return res.status(404).json({ detail: "Not found." });
    if (item.status !== "available") {
      return res.status(400).json({ detail: "This food listing is no longer available." });
    }
    if (item.provider === req.user!.id) {
      return res.status(400).json({ detail: "You can't claim your own listing." });
    }
    item.requester = req.user!.id;
    item.requester_username = req.user!.username;
    item.status = "requested";
    item.updated_at = new Date().toISOString();

    notifyUser(item.provider, `${req.user!.username} claimed your food listing '${item.title}'.`, "/app/food");
    res.json(item);
  });

  app.post("/api/food/:id/assign/", requireAuth, (req: AuthenticatedRequest, res) => {
    const item = foodListings.find((f) => f.id === Number(req.params.id));
    if (!item) return res.status(404).json({ detail: "Not found." });
    if (req.user!.role === "receiver" || req.user!.role === "general") {
      return res.status(403).json({ detail: "Receivers cannot accept volunteer delivery assignments." });
    }
    if (!["volunteer", "ngo", "admin"].includes(req.user!.role)) {
      return res.status(403).json({ detail: "Only volunteers and organizations can accept delivery assignments." });
    }
    if (item.status !== "requested") {
      return res.status(400).json({ detail: "This listing isn't awaiting a volunteer yet." });
    }
    item.volunteer = req.user!.id;
    item.volunteer_username = req.user!.username;
    item.status = "assigned";
    item.updated_at = new Date().toISOString();

    notifyUser(item.provider, `${req.user!.username} will pick up '${item.title}'.`, "/app/food");
    notifyUser(item.requester, `${req.user!.username} will deliver '${item.title}' to you.`, "/app/food");
    res.json(item);
  });

  app.post("/api/food/:id/complete/", requireAuth, (req: AuthenticatedRequest, res) => {
    const item = foodListings.find((f) => f.id === Number(req.params.id));
    if (!item) return res.status(404).json({ detail: "Not found." });
    if (item.status !== "assigned" && item.status !== "requested") {
      return res.status(400).json({ detail: "This listing isn't ready to be marked complete." });
    }
    const allowed = [item.provider, item.requester, item.volunteer];
    if (!allowed.includes(req.user!.id) && req.user!.role !== "admin") {
      return res.status(403).json({ detail: "You do not have permission to mark this food listing complete." });
    }
    item.status = "completed";
    item.completed_at = new Date().toISOString();
    item.updated_at = new Date().toISOString();

    [item.provider, item.requester, item.volunteer].forEach((uid) => {
      notifyUser(uid, `'${item.title}' was rescued successfully. Thanks for the impact!`, "/app/impact");
    });
    res.json(item);
  });

  app.post("/api/food/:id/cancel/", requireAuth, (req: AuthenticatedRequest, res) => {
    const item = foodListings.find((f) => f.id === Number(req.params.id));
    if (!item) return res.status(404).json({ detail: "Not found." });
    if (item.provider !== req.user!.id && req.user!.role !== "admin") {
      return res.status(403).json({ detail: "Only the provider can cancel this listing." });
    }
    item.status = "cancelled";
    item.updated_at = new Date().toISOString();
    res.json(item);
  });

  // Blood
  app.get("/api/blood/requests/", (req: AuthenticatedRequest, res) => {
    let result = [...bloodRequests];
    const { mine, blood_group, status, urgency } = req.query as Record<string, string>;

    if (mine === "requested" && req.user) {
      result = result.filter((b) => b.requester === req.user!.id);
    } else if (mine === "matched" && req.user) {
      result = result.filter((b) => b.matched_donor === req.user!.id);
    }

    if (blood_group) result = result.filter((b) => b.blood_group === blood_group);
    if (status) result = result.filter((b) => b.status === status);
    if (urgency) result = result.filter((b) => b.urgency === urgency);

    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json(result);
  });

  app.get("/api/blood/requests/:id/", (req, res) => {
    const item = bloodRequests.find((b) => b.id === Number(req.params.id));
    if (!item) return res.status(404).json({ detail: "Not found." });
    res.json(item);
  });

  app.post("/api/blood/requests/", requireAuth, (req: AuthenticatedRequest, res) => {
    const user = req.user!;
    const {
      blood_group,
      units_needed = 1,
      urgency = "medium",
      hospital_name = "",
      address_text = "",
      lat,
      lng,
      notes = "",
    } = req.body;

    if (!blood_group) {
      return res.status(400).json({ detail: "Blood group is required." });
    }
    const item: BloodRequest = {
      id: nextId.blood++,
      requester: user.id,
      requester_username: user.username,
      blood_group,
      units_needed: Number(units_needed) || 1,
      urgency,
      hospital_name,
      address_text,
      lat: lat ?? user.lat ?? MYSURU.lat,
      lng: lng ?? user.lng ?? MYSURU.lng,
      notes,
      status: "open",
      matched_donor: null,
      matched_donor_username: null,
      matched_blood_bank: null,
      matched_blood_bank_name: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      fulfilled_at: null,
    };
    bloodRequests.unshift(item);
    res.status(201).json(item);
  });

  app.post("/api/blood/requests/:id/offer_to_donate/", requireAuth, (req: AuthenticatedRequest, res) => {
    const item = bloodRequests.find((b) => b.id === Number(req.params.id));
    if (!item) return res.status(404).json({ detail: "Not found." });
    if (req.user!.role !== "donor") {
      return res.status(403).json({ detail: "Only donor accounts can offer to donate." });
    }
    if (item.status !== "open") {
      return res.status(400).json({ detail: "This request already has a match." });
    }
    item.matched_donor = req.user!.id;
    item.matched_donor_username = req.user!.username;
    item.status = "matched";
    item.updated_at = new Date().toISOString();

    notifyUser(
      item.requester,
      `${req.user!.username} (${req.user!.blood_group || "Donor"}) offered to donate for your blood request.`,
      "/app/blood"
    );
    res.json(item);
  });

  app.post("/api/blood/requests/:id/match_blood_bank/", requireAuth, (req: AuthenticatedRequest, res) => {
    const item = bloodRequests.find((b) => b.id === Number(req.params.id));
    if (!item) return res.status(404).json({ detail: "Not found." });
    if (!checkVerifiedOrg(req.user!)) {
      return res.status(403).json({ detail: "Blood bank account is pending administrator verification." });
    }
    const bank = bloodBanks.find((bk) => bk.user === req.user!.id);
    if (!bank && req.user!.role !== "blood_bank") {
      return res.status(403).json({ detail: "Only a registered blood bank profile can do this." });
    }
    if (item.status !== "open") {
      return res.status(400).json({ detail: "This request already has a match." });
    }
    item.matched_blood_bank = bank ? bank.id : 1;
    item.matched_blood_bank_name = bank ? bank.name : req.user!.organization_name || "Blood Bank";
    item.status = "matched";
    item.updated_at = new Date().toISOString();

    notifyUser(
      item.requester,
      `${item.matched_blood_bank_name} committed to supply ${item.units_needed} unit(s) of ${item.blood_group}.`,
      "/app/blood"
    );
    res.json(item);
  });

  app.post("/api/blood/requests/:id/fulfill/", requireAuth, (req: AuthenticatedRequest, res) => {
    const item = bloodRequests.find((b) => b.id === Number(req.params.id));
    if (!item) return res.status(404).json({ detail: "Not found." });
    if (item.status !== "matched") {
      return res.status(400).json({ detail: "This request isn't matched yet." });
    }

    const bank = bloodBanks.find((bk) => bk.user === req.user!.id);
    const isRequester = item.requester === req.user!.id;
    const isMatchedDonor = item.matched_donor === req.user!.id;
    const isMatchedBank = (bank && item.matched_blood_bank === bank.id) || (req.user!.organization_name && item.matched_blood_bank_name === req.user!.organization_name);
    const isStaff = req.user!.is_staff || req.user!.role === "admin";

    if (!isRequester && !isMatchedDonor && !isMatchedBank && !isStaff) {
      return res.status(403).json({ detail: "You are not authorized to mark this blood request fulfilled." });
    }

    if (req.user!.role === "blood_bank" && !isStaff && !checkVerifiedOrg(req.user!)) {
      return res.status(403).json({ detail: "Blood bank account is pending administrator verification." });
    }

    item.status = "fulfilled";
    item.fulfilled_at = new Date().toISOString();
    item.updated_at = new Date().toISOString();

    notifyUser(item.requester, "Your blood request has been marked fulfilled. Thank you for using ResQLink.", "/app/blood");
    if (item.matched_donor) {
      notifyUser(item.matched_donor, "Thanks for donating — your contribution is recorded on the impact dashboard!", "/app/impact");
    }
    res.json(item);
  });

  app.post("/api/blood/requests/:id/cancel/", requireAuth, (req: AuthenticatedRequest, res) => {
    const item = bloodRequests.find((b) => b.id === Number(req.params.id));
    if (!item) return res.status(404).json({ detail: "Not found." });
    if (item.requester !== req.user!.id && req.user!.role !== "admin") {
      return res.status(403).json({ detail: "Only the requester can cancel." });
    }
    item.status = "cancelled";
    item.updated_at = new Date().toISOString();
    res.json(item);
  });

  app.get("/api/blood/banks/", (_req, res) => {
    res.json(bloodBanks);
  });

  app.get("/api/blood/banks/me/", requireAuth, (req: AuthenticatedRequest, res) => {
    if (req.user!.role !== "blood_bank" && req.user!.role !== "admin") {
      return res.status(403).json({ detail: "Only blood bank accounts can access facility profiles." });
    }
    const bank = bloodBanks.find((bk) => bk.user === req.user!.id);
    if (!bank) {
      return res.status(404).json({ detail: "No profile found for this blood bank account." });
    }
    res.json(bank);
  });

  const handleSaveBankProfile = (req: AuthenticatedRequest, res: express.Response) => {
    if (req.user!.role !== "blood_bank" && req.user!.role !== "admin") {
      return res.status(403).json({ detail: "Only blood bank accounts can manage a blood bank profile." });
    }
    const { name, address_text = "", lat, lng, contact_phone = "" } = req.body;
    let bank = bloodBanks.find((bk) => bk.user === req.user!.id);
    if (bank) {
      if (name) bank.name = name;
      if (address_text !== undefined) bank.address_text = address_text;
      if (contact_phone !== undefined) bank.contact_phone = contact_phone;
      if (lat !== undefined) bank.lat = lat;
      if (lng !== undefined) bank.lng = lng;
      return res.json(bank);
    }
    bank = {
      id: nextId.bloodBank++,
      user: req.user!.id,
      username: req.user!.username,
      name: name || req.user!.organization_name || "Blood Bank",
      address_text,
      lat: lat ?? req.user!.lat ?? MYSURU.lat,
      lng: lng ?? req.user!.lng ?? MYSURU.lng,
      contact_phone,
    };
    bloodBanks.push(bank);
    res.status(201).json(bank);
  };

  app.post("/api/blood/banks/me/", requireAuth, handleSaveBankProfile);
  app.patch("/api/blood/banks/me/", requireAuth, handleSaveBankProfile);
  app.put("/api/blood/banks/me/", requireAuth, handleSaveBankProfile);

  app.post("/api/blood/banks/", requireAuth, handleSaveBankProfile);

  app.patch("/api/blood/banks/:id/", requireAuth, (req: AuthenticatedRequest, res) => {
    const bank = bloodBanks.find((b) => b.id === Number(req.params.id));
    if (!bank) return res.status(404).json({ detail: "Not found." });
    if (bank.user !== req.user!.id && req.user!.role !== "admin") {
      return res.status(403).json({ detail: "You cannot modify another blood bank's profile." });
    }
    const { name, address_text, lat, lng, contact_phone } = req.body;
    if (name) bank.name = name;
    if (address_text !== undefined) bank.address_text = address_text;
    if (contact_phone !== undefined) bank.contact_phone = contact_phone;
    if (lat !== undefined) bank.lat = lat;
    if (lng !== undefined) bank.lng = lng;
    res.json(bank);
  });

  // Emergency Requests
  app.get("/api/emergency/", (req: AuthenticatedRequest, res) => {
    let result = [...emergencyRequests];
    const { mine, request_type, status, urgency } = req.query as Record<string, string>;

    if (mine === "requested" && req.user) {
      result = result.filter((e) => e.requester === req.user!.id);
    } else if (mine === "assigned" && req.user) {
      result = result.filter((e) => e.assigned_to === req.user!.id);
    }

    if (request_type) result = result.filter((e) => e.request_type === request_type);
    if (status) result = result.filter((e) => e.status === status);
    if (urgency) result = result.filter((e) => e.urgency === urgency);

    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json(result);
  });

  app.get("/api/emergency/:id/", (req, res) => {
    const item = emergencyRequests.find((e) => e.id === Number(req.params.id));
    if (!item) return res.status(404).json({ detail: "Not found." });
    res.json(item);
  });

  app.post("/api/emergency/", requireAuth, (req: AuthenticatedRequest, res) => {
    const user = req.user!;
    const {
      request_type = "supplies",
      description = "",
      urgency = "medium",
      people_affected = 1,
      address_text = "",
      lat,
      lng,
    } = req.body;
    const item: EmergencyRequest = {
      id: nextId.emergency++,
      requester: user.id,
      requester_username: user.username,
      request_type,
      description,
      urgency,
      people_affected: Number(people_affected) || 1,
      address_text,
      lat: lat ?? user.lat ?? MYSURU.lat,
      lng: lng ?? user.lng ?? MYSURU.lng,
      status: "open",
      assigned_to: null,
      assigned_to_username: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      closed_at: null,
    };
    emergencyRequests.unshift(item);
    res.status(201).json(item);
  });

  app.post("/api/emergency/:id/claim/", requireAuth, (req: AuthenticatedRequest, res) => {
    const item = emergencyRequests.find((e) => e.id === Number(req.params.id));
    if (!item) return res.status(404).json({ detail: "Not found." });
    if (req.user!.role === "receiver" || req.user!.role === "general") {
      return res.status(403).json({ detail: "Receivers cannot claim emergency response operations." });
    }
    if (!["volunteer", "ngo", "admin"].includes(req.user!.role)) {
      return res.status(403).json({ detail: "Only volunteers and organizations can respond to emergency calls." });
    }
    if (!checkVerifiedOrg(req.user!)) {
      return res.status(403).json({ detail: "Organization account is pending administrator verification." });
    }
    if (item.requester === req.user!.id) {
      return res.status(400).json({ detail: "You cannot claim your own emergency request." });
    }
    if (item.status !== "open") {
      return res.status(400).json({ detail: "This request already has a responder." });
    }
    item.assigned_to = req.user!.id;
    item.assigned_to_username = req.user!.username;
    item.status = "in_progress";
    item.updated_at = new Date().toISOString();

    notifyUser(item.requester, `${req.user!.username} is responding to your emergency request.`, "/app/emergency");
    res.json(item);
  });

  app.post("/api/emergency/:id/fulfill/", requireAuth, (req: AuthenticatedRequest, res) => {
    const item = emergencyRequests.find((e) => e.id === Number(req.params.id));
    if (!item) return res.status(404).json({ detail: "Not found." });
    if (item.status !== "in_progress") {
      return res.status(400).json({ detail: "This request isn't in progress." });
    }
    const isRequester = item.requester === req.user!.id;
    const isResponder = item.assigned_to === req.user!.id;
    if (!isRequester && !isResponder && req.user!.role !== "admin") {
      return res.status(403).json({ detail: "You are not authorized to fulfill this emergency request." });
    }
    item.status = "fulfilled";
    item.closed_at = new Date().toISOString();
    item.updated_at = new Date().toISOString();

    [item.requester, item.assigned_to].forEach((uid) => {
      notifyUser(uid, "The emergency request has been marked fulfilled. Stay safe!", "/app/impact");
    });
    res.json(item);
  });

  app.post("/api/emergency/:id/close/", requireAuth, (req: AuthenticatedRequest, res) => {
    const item = emergencyRequests.find((e) => e.id === Number(req.params.id));
    if (!item) return res.status(404).json({ detail: "Not found." });
    if (item.requester !== req.user!.id && req.user!.role !== "admin") {
      return res.status(403).json({ detail: "Only the requester can close this." });
    }
    item.status = "closed";
    item.closed_at = new Date().toISOString();
    item.updated_at = new Date().toISOString();
    res.json(item);
  });

  // Notifications
  app.get("/api/notifications/", requireAuth, (req: AuthenticatedRequest, res) => {
    const userNotifs = notifications.filter((n) => n.user === req.user!.id);
    userNotifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json(userNotifs);
  });

  app.post("/api/notifications/:id/read/", requireAuth, (req: AuthenticatedRequest, res) => {
    const notif = notifications.find((n) => n.id === Number(req.params.id) && n.user === req.user!.id);
    if (!notif) return res.status(404).json({ detail: "Not found." });
    notif.is_read = true;
    res.json(notif);
  });

  app.post("/api/notifications/read-all/", requireAuth, (req: AuthenticatedRequest, res) => {
    notifications
      .filter((n) => n.user === req.user!.id && !n.is_read)
      .forEach((n) => {
        n.is_read = true;
      });
    res.json({ detail: "All notifications marked read." });
  });

  // Impact Summary
  app.get("/api/impact/summary/", requireAuth, (_req, res) => {
    const items_reused = resources.filter((r) => r.status === "completed").length;
    const food_portions_rescued = foodListings
      .filter((f) => f.status === "completed")
      .reduce((sum, f) => sum + (f.quantity_servings || 0), 0);
    const blood_units_fulfilled = bloodRequests
      .filter((b) => b.status === "fulfilled")
      .reduce((sum, b) => sum + (b.units_needed || 0), 0);
    const emergencies_fulfilled = emergencyRequests.filter((e) =>
      ["fulfilled", "closed"].includes(e.status)
    ).length;

    const active_listings =
      resources.filter((r) => !["completed", "cancelled"].includes(r.status)).length +
      foodListings.filter((f) => !["completed", "cancelled"].includes(f.status)).length;
    const open_emergencies = emergencyRequests.filter((e) => e.status === "open").length;
    const open_blood_requests = bloodRequests.filter((b) => b.status === "open").length;

    // Monthly items reused breakdown
    const monthlyMap: Record<string, number> = {
      "Jul 2026": 4,
      "Aug 2026": 12,
      "Sep 2026": items_reused || 1,
    };
    const monthly_items_reused = Object.entries(monthlyMap).map(([month, count]) => ({
      month,
      count,
    }));

    res.json({
      items_reused,
      food_portions_rescued,
      blood_units_fulfilled,
      emergencies_fulfilled,
      active_listings,
      open_emergencies,
      open_blood_requests,
      monthly_items_reused,
    });
  });

  // Frontend Integration: Vite in development, static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: "0.0.0.0",
        port: PORT,
      },
      appType: "spa",
      root: path.resolve(process.cwd(), "frontend"),
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.use((req, res, next) => {
      if (req.path.startsWith("/api")) {
        return next();
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ResQLink server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
