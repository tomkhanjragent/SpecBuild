import express, { Request, Response, NextFunction } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// ================= DATA STORE =================
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'teamtree.json');
const STORAGE_DIR = path.resolve(__dirname, 'storage', 'member-photos');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

interface UserRoleRecord {
  id: string;
  user_id: string;
  email: string;
  role: 'admin' | 'staff';
  created_at: string;
}

interface AppRecord {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

interface CustomFieldRecord {
  id: string;
  section: string;
  label: string;
  field_type: string;
  sort_order: number;
  created_at: string;
}

interface MemberRecord {
  id: string;
  app_id: string;
  parent_id: string | null;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  app_user_id: string | null;
  photo_path: string | null;
  status: 'active' | 'no_work';
  joined_at: string;
  custom: Record<string, string>;
  created_at: string;
}

interface SessionRecord {
  token: string;
  user_id: string;
  expires_at: number;
}

interface DatabaseSchema {
  users: UserRecord[];
  user_roles: UserRoleRecord[];
  apps: AppRecord[];
  custom_fields: CustomFieldRecord[];
  members: MemberRecord[];
  sessions: SessionRecord[];
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(`tt_${password}_salt_2026`).digest('hex');
}

function generateId(): string {
  return crypto.randomUUID();
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function initDatabase(): DatabaseSchema {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (err) {
      console.error('Error reading db file, re-initializing:', err);
    }
  }

  // Initial default data from §5 SQL
  const makoId = generateId();
  const ayarId = generateId();
  const chametId = generateId();
  const tigoId = generateId();

  const paymentMethodId = generateId();
  const targetId = generateId();
  const noteId = generateId();

  const initialApps: AppRecord[] = [
    { id: makoId, name: 'Mako', sort_order: 1, created_at: new Date().toISOString() },
    { id: ayarId, name: 'Ayar', sort_order: 2, created_at: new Date().toISOString() },
    { id: chametId, name: 'Chamet', sort_order: 3, created_at: new Date().toISOString() },
    { id: tigoId, name: 'Tigo', sort_order: 4, created_at: new Date().toISOString() },
  ];

  const initialFields: CustomFieldRecord[] = [
    { id: paymentMethodId, section: 'Payment', label: 'Payment Method', field_type: 'text', sort_order: 1, created_at: new Date().toISOString() },
    { id: targetId, section: 'Work', label: 'Target', field_type: 'text', sort_order: 2, created_at: new Date().toISOString() },
    { id: noteId, section: 'Work', label: 'Note', field_type: 'text', sort_order: 3, created_at: new Date().toISOString() },
  ];

  // Seed initial Mako members matching §1 & §8.3 wireframe
  const mahaId = generateId();
  const fariaId = generateId();
  const lizaId = generateId();
  const mimId = generateId();
  const pinkyId = generateId();

  const initialMembers: MemberRecord[] = [
    {
      id: mahaId,
      app_id: makoId,
      parent_id: null,
      name: 'Maha',
      phone: '+8801700000001',
      whatsapp: '8801700000001',
      app_user_id: 'MK-1001',
      photo_path: null,
      status: 'active',
      joined_at: new Date('2026-10-07T21:04:00Z').toISOString(),
      custom: {
        [paymentMethodId]: 'bKash Merchant',
        [targetId]: '$5,000 / month',
        [noteId]: 'Top Leader Agent for South Asia',
      },
      created_at: new Date().toISOString(),
    },
    {
      id: fariaId,
      app_id: makoId,
      parent_id: mahaId,
      name: 'Faria',
      phone: '+8801700000002',
      whatsapp: '8801700000002',
      app_user_id: 'MK-1021',
      photo_path: null,
      status: 'active',
      joined_at: new Date().toISOString(),
      custom: {
        [paymentMethodId]: 'Nagad',
        [targetId]: '$1,500',
        [noteId]: 'Consistent live streamer',
      },
      created_at: new Date().toISOString(),
    },
    {
      id: lizaId,
      app_id: makoId,
      parent_id: mahaId,
      name: 'Liza',
      phone: '+8801700000003',
      whatsapp: '8801700000003',
      app_user_id: 'MK-1022',
      photo_path: null,
      status: 'active',
      joined_at: new Date().toISOString(),
      custom: {
        [paymentMethodId]: 'Bank Transfer',
        [targetId]: '$2,000',
        [noteId]: 'Recruiting new hosts',
      },
      created_at: new Date().toISOString(),
    },
    {
      id: mimId,
      app_id: makoId,
      parent_id: mahaId,
      name: 'Mim',
      phone: '+8801700000004',
      whatsapp: '8801700000004',
      app_user_id: 'MK-1023',
      photo_path: null,
      status: 'no_work', // Critical: direct child of Maha in No Work folder!
      joined_at: new Date().toISOString(),
      custom: {
        [noteId]: 'Temporarily on leave due to exams',
      },
      created_at: new Date().toISOString(),
    },
    {
      id: pinkyId,
      app_id: makoId,
      parent_id: null,
      name: 'Pinky',
      phone: '+8801700000005',
      whatsapp: '8801700000005',
      app_user_id: 'MK-1002',
      photo_path: null,
      status: 'active',
      joined_at: new Date().toISOString(),
      custom: {
        [paymentMethodId]: 'bKash Personal',
        [targetId]: '$1,800',
        [noteId]: 'Independent agent branch',
      },
      created_at: new Date().toISOString(),
    },
  ];

  const db: DatabaseSchema = {
    users: [],
    user_roles: [],
    apps: initialApps,
    custom_fields: initialFields,
    members: initialMembers,
    sessions: [],
  };

  saveDatabase(db);
  return db;
}

function saveDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save db file:', err);
  }
}

let db = initDatabase();

// ================= AUTH MIDDLEWARE =================
interface AuthenticatedRequest extends Request {
  user?: UserRecord;
  role?: 'admin' | 'staff';
}

function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: missing token' });
    return;
  }

  const token = authHeader.substring(7);
  const session = db.sessions.find((s) => s.token === token && s.expires_at > Date.now());
  if (!session) {
    res.status(401).json({ error: 'Session expired or invalid' });
    return;
  }

  const user = db.users.find((u) => u.id === session.user_id);
  const userRole = db.user_roles.find((r) => r.user_id === session.user_id);

  if (!user || !userRole) {
    res.status(401).json({ error: 'User no longer exists' });
    return;
  }

  req.user = user;
  req.role = userRole.role;
  next();
}

function adminOnlyMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.role !== 'admin') {
    res.status(403).json({ error: 'Only the admin can open settings.' });
    return;
  }
  next();
}

// ================= API ROUTES =================

// 1. Setup Status (Public)
// Returns needsSetup: true iff zero admin rows exist
app.get('/api/setup-status', (req: Request, res: Response) => {
  const adminCount = db.user_roles.filter((r) => r.role === 'admin').length;
  res.json({ needsSetup: adminCount === 0 });
});

// 2. Create First Admin (Public, but ONLY allowed when 0 admins exist)
app.post('/api/auth/setup-admin', (req: Request, res: Response) => {
  const adminCount = db.user_roles.filter((r) => r.role === 'admin').length;
  if (adminCount > 0) {
    res.status(403).json({ error: 'Admin already configured. Please sign in.' });
    return;
  }

  const { email, password } = req.body;
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const userId = generateId();
  const newUser: UserRecord = {
    id: userId,
    email: normalizedEmail,
    password_hash: hashPassword(password),
    created_at: new Date().toISOString(),
  };

  const newRole: UserRoleRecord = {
    id: generateId(),
    user_id: userId,
    email: normalizedEmail,
    role: 'admin',
    created_at: new Date().toISOString(),
  };

  const token = generateToken();
  const session: SessionRecord = {
    token,
    user_id: userId,
    expires_at: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  };

  db.users.push(newUser);
  db.user_roles.push(newRole);
  db.sessions.push(session);
  saveDatabase(db);

  res.json({
    user: {
      id: userId,
      email: normalizedEmail,
      role: 'admin',
      isAdmin: true,
    },
    token,
  });
});

// 3. Sign In (Public)
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  const normalizedEmail = (email as string).trim().toLowerCase();
  const passHash = hashPassword(password as string);

  const user = db.users.find((u) => u.email === normalizedEmail && u.password_hash === passHash);
  if (!user) {
    res.status(401).json({ error: 'Sign in failed — invalid email or password' });
    return;
  }

  const userRole = db.user_roles.find((r) => r.user_id === user.id);
  if (!userRole) {
    res.status(403).json({ error: 'Account does not have assigned roles' });
    return;
  }

  const token = generateToken();
  const session: SessionRecord = {
    token,
    user_id: user.id,
    expires_at: Date.now() + 30 * 24 * 60 * 60 * 1000,
  };

  db.sessions.push(session);
  saveDatabase(db);

  res.json({
    user: {
      id: user.id,
      email: user.email,
      role: userRole.role,
      isAdmin: userRole.role === 'admin',
    },
    token,
  });
});

// 4. Current User (Auth)
app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    user: {
      id: req.user!.id,
      email: req.user!.email,
      role: req.role!,
      isAdmin: req.role === 'admin',
    },
  });
});

// 5. Logout
app.post('/api/auth/logout', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.substring(7);
    db.sessions = db.sessions.filter((s) => s.token !== token);
    saveDatabase(db);
  }
  res.json({ success: true });
});

// 6. Apps API
app.get('/api/apps', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const sorted = [...db.apps].sort((a, b) => a.sort_order - b.sort_order);
  res.json(sorted);
});

app.post('/api/apps', authMiddleware, adminOnlyMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'App name is required' });
    return;
  }

  const maxOrder = db.apps.reduce((max, a) => Math.max(max, a.sort_order), 0);
  const newApp: AppRecord = {
    id: generateId(),
    name: name.trim(),
    sort_order: maxOrder + 1,
    created_at: new Date().toISOString(),
  };

  db.apps.push(newApp);
  saveDatabase(db);
  res.json(newApp);
});

app.delete('/api/apps/:id', authMiddleware, adminOnlyMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const appId = req.params.id;
  const index = db.apps.findIndex((a) => a.id === appId);
  if (index === -1) {
    res.status(404).json({ error: 'App not found' });
    return;
  }

  // Cascade delete all members of this app
  db.members = db.members.filter((m) => m.app_id !== appId);
  db.apps.splice(index, 1);
  saveDatabase(db);
  res.json({ success: true });
});

// 7. Custom Fields API
app.get('/api/custom-fields', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const sorted = [...db.custom_fields].sort((a, b) => a.sort_order - b.sort_order);
  res.json(sorted);
});

app.post('/api/custom-fields', authMiddleware, adminOnlyMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { section, label, field_type } = req.body;
  if (!label || typeof label !== 'string' || !label.trim()) {
    res.status(400).json({ error: 'Label is required' });
    return;
  }

  const maxOrder = db.custom_fields.reduce((max, f) => Math.max(max, f.sort_order), 0);
  const newField: CustomFieldRecord = {
    id: generateId(),
    section: (section && section.trim()) || 'Other',
    label: label.trim(),
    field_type: field_type || 'text',
    sort_order: maxOrder + 1,
    created_at: new Date().toISOString(),
  };

  db.custom_fields.push(newField);
  saveDatabase(db);
  res.json(newField);
});

app.put('/api/custom-fields/:id', authMiddleware, adminOnlyMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const fieldId = req.params.id;
  const field = db.custom_fields.find((f) => f.id === fieldId);
  if (!field) {
    res.status(404).json({ error: 'Field not found' });
    return;
  }

  const { section, label, field_type, sort_order } = req.body;
  if (section !== undefined) field.section = section.trim();
  if (label !== undefined) field.label = label.trim();
  if (field_type !== undefined) field.field_type = field_type;
  if (sort_order !== undefined) field.sort_order = Number(sort_order);

  saveDatabase(db);
  res.json(field);
});

app.delete('/api/custom-fields/:id', authMiddleware, adminOnlyMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const fieldId = req.params.id;
  const index = db.custom_fields.findIndex((f) => f.id === fieldId);
  if (index === -1) {
    res.status(404).json({ error: 'Field not found' });
    return;
  }

  // Old values remain in members.custom (harmless per §3.3 rule 7)
  db.custom_fields.splice(index, 1);
  saveDatabase(db);
  res.json({ success: true });
});

// 8. Members API
app.get('/api/members', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const appId = req.query.app_id as string;
  let members = db.members;
  if (appId) {
    members = members.filter((m) => m.app_id === appId);
  }
  res.json(members);
});

app.post('/api/members', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { app_id, parent_id, name, phone, whatsapp, app_user_id, photo_path, status, custom } = req.body;

  if (!app_id || !name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'App ID and member name are required' });
    return;
  }

  // Validate parent_id belongs to the same app if provided
  if (parent_id) {
    const parent = db.members.find((m) => m.id === parent_id && m.app_id === app_id);
    if (!parent) {
      res.status(400).json({ error: 'Parent member does not exist in this app' });
      return;
    }
  }

  const newMember: MemberRecord = {
    id: generateId(),
    app_id,
    parent_id: parent_id || null,
    name: name.trim(),
    phone: phone ? String(phone).trim() : null,
    whatsapp: whatsapp ? String(whatsapp).trim() : null,
    app_user_id: app_user_id ? String(app_user_id).trim() : null,
    photo_path: photo_path || null,
    status: status === 'no_work' ? 'no_work' : 'active',
    joined_at: new Date().toISOString(),
    custom: typeof custom === 'object' && custom !== null ? custom : {},
    created_at: new Date().toISOString(),
  };

  db.members.push(newMember);
  saveDatabase(db);
  res.json(newMember);
});

// Helper: cycle check for members
function isDescendant(memberId: string, potentialDescendantId: string, allMembers: MemberRecord[]): boolean {
  if (memberId === potentialDescendantId) return true;
  const queue = [memberId];
  while (queue.length > 0) {
    const curr = queue.shift()!;
    const children = allMembers.filter((m) => m.parent_id === curr);
    for (const child of children) {
      if (child.id === potentialDescendantId) return true;
      queue.push(child.id);
    }
  }
  return false;
}

app.put('/api/members/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const memberId = req.params.id;
  const member = db.members.find((m) => m.id === memberId);
  if (!member) {
    res.status(404).json({ error: 'Member not found' });
    return;
  }

  const { parent_id, name, phone, whatsapp, app_user_id, photo_path, status, custom } = req.body;

  // Cycle & boundary validation if parent_id is being changed
  if (parent_id !== undefined && parent_id !== member.parent_id) {
    if (parent_id !== null) {
      if (parent_id === member.id) {
        res.status(400).json({ error: 'A member cannot be their own parent' });
        return;
      }
      const targetParent = db.members.find((m) => m.id === parent_id);
      if (!targetParent) {
        res.status(400).json({ error: 'Target parent not found' });
        return;
      }
      if (targetParent.app_id !== member.app_id) {
        res.status(400).json({ error: 'Cannot move member across different apps' });
        return;
      }
      if (isDescendant(member.id, parent_id, db.members)) {
        res.status(400).json({ error: 'Cannot move member under their own descendant (cycle detected)' });
        return;
      }
      member.parent_id = parent_id;
    } else {
      member.parent_id = null;
    }
  }

  if (name !== undefined) member.name = String(name).trim();
  if (phone !== undefined) member.phone = phone ? String(phone).trim() : null;
  if (whatsapp !== undefined) member.whatsapp = whatsapp ? String(whatsapp).trim() : null;
  if (app_user_id !== undefined) member.app_user_id = app_user_id ? String(app_user_id).trim() : null;
  if (photo_path !== undefined) member.photo_path = photo_path || null;
  if (status !== undefined) {
    if (status === 'active' || status === 'no_work') {
      member.status = status;
    }
  }
  if (custom !== undefined && typeof custom === 'object' && custom !== null) {
    member.custom = { ...member.custom, ...custom };
  }

  saveDatabase(db);
  res.json(member);
});

// Cascading delete member + all descendants
app.delete('/api/members/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const memberId = req.params.id;
  const member = db.members.find((m) => m.id === memberId);
  if (!member) {
    res.status(404).json({ error: 'Member not found' });
    return;
  }

  // Find all descendant IDs
  const toDelete = new Set<string>([memberId]);
  const queue = [memberId];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const children = db.members.filter((m) => m.parent_id === curr);
    for (const child of children) {
      if (!toDelete.has(child.id)) {
        toDelete.add(child.id);
        queue.push(child.id);
      }
    }
  }

  db.members = db.members.filter((m) => !toDelete.has(m.id));
  saveDatabase(db);
  res.json({ success: true, deletedCount: toDelete.size });
});

// 9. Staff Management API (Admin only)
app.get('/api/staff', authMiddleware, adminOnlyMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const list = db.user_roles.map((ur) => ({
    id: ur.id,
    user_id: ur.user_id,
    email: ur.email,
    role: ur.role,
    created_at: ur.created_at,
  }));
  res.json(list);
});

app.post('/api/staff', authMiddleware, adminOnlyMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = db.users.find((u) => u.email === normalizedEmail);
  if (existing) {
    res.status(400).json({ error: 'A user with this email already exists' });
    return;
  }

  const userId = generateId();
  const newUser: UserRecord = {
    id: userId,
    email: normalizedEmail,
    password_hash: hashPassword(password),
    created_at: new Date().toISOString(),
  };

  const newRole: UserRoleRecord = {
    id: generateId(),
    user_id: userId,
    email: normalizedEmail,
    role: 'staff',
    created_at: new Date().toISOString(),
  };

  db.users.push(newUser);
  db.user_roles.push(newRole);
  saveDatabase(db);

  res.json(newRole);
});

app.delete('/api/staff/:id', authMiddleware, adminOnlyMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const targetId = req.params.id;
  const userRole = db.user_roles.find((ur) => ur.user_id === targetId || ur.id === targetId);

  if (!userRole) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  if (userRole.user_id === req.user!.id) {
    res.status(400).json({ error: 'Cannot remove your own account' });
    return;
  }

  if (userRole.role === 'admin') {
    const adminCount = db.user_roles.filter((ur) => ur.role === 'admin').length;
    if (adminCount <= 1) {
      res.status(400).json({ error: 'Cannot remove the last admin' });
      return;
    }
  }

  db.user_roles = db.user_roles.filter((ur) => ur.id !== userRole.id);
  db.users = db.users.filter((u) => u.id !== userRole.user_id);
  db.sessions = db.sessions.filter((s) => s.user_id !== userRole.user_id);
  saveDatabase(db);

  res.json({ success: true });
});

// 10. Private Storage Upload & Signed URL
app.post('/api/storage/upload', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const photo = req.body.photo || req.body.data;
  const memberId = req.body.member_id || generateId();
  const ext = req.body.ext || 'jpg';

  if (!photo) {
    res.status(400).json({ error: 'No photo payload provided' });
    return;
  }

  const fileName = `${Date.now()}.${ext}`;
  const memberFolder = path.join(STORAGE_DIR, memberId);
  if (!fs.existsSync(memberFolder)) {
    fs.mkdirSync(memberFolder, { recursive: true });
  }

  const filePath = path.join(memberFolder, fileName);
  const relativePath = `${memberId}/${fileName}`;

  // If base64 data URL
  if (typeof photo === 'string' && photo.includes(',')) {
    const base64Data = photo.split(',')[1];
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
  } else if (typeof photo === 'string') {
    fs.writeFileSync(filePath, Buffer.from(photo, 'base64'));
  }

  const token = generateToken();
  const signedUrl = `/api/storage/file?path=${encodeURIComponent(relativePath)}&token=${token}`;

  res.json({
    photo_path: relativePath,
    signed_url: signedUrl,
  });
});

app.get('/api/storage/signed-url', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const photoPath = req.query.path as string;
  if (!photoPath) {
    res.status(400).json({ error: 'Missing path' });
    return;
  }

  const token = generateToken();
  const signedUrl = `/api/storage/file?path=${encodeURIComponent(photoPath)}&token=${token}`;
  res.json({ signedUrl });
});

// Serve storage file securely
app.get('/api/storage/file', (req: Request, res: Response) => {
  const photoPath = req.query.path as string;
  if (!photoPath) {
    res.status(400).send('Missing path');
    return;
  }

  // Prevent directory traversal
  const normalized = path.normalize(photoPath).replace(/^(\.\.(\/|\\|$))+/, '');
  const fullPath = path.join(STORAGE_DIR, normalized);

  if (!fs.existsSync(fullPath)) {
    res.status(404).send('File not found');
    return;
  }

  res.sendFile(fullPath);
});

// ================= VITE DEV MIDDLEWARE =================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TeamTree server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
