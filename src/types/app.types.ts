export type AppRole = 'admin' | 'staff';
export type MemberStatus = 'active' | 'no_work';

export interface AppRow {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface Member {
  id: string;
  app_id: string;
  parent_id: string | null;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  app_user_id: string | null;
  photo_path: string | null;
  photo_url?: string | null;
  status: MemberStatus;
  joined_at: string;
  custom: Record<string, string>;
  created_at?: string;
}

export interface Field {
  id: string;
  section: string;
  label: string;
  field_type: string;
  sort_order: number;
  created_at?: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  email: string;
  role: AppRole;
  created_at: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  role: AppRole;
  isAdmin: boolean;
}

export interface TreeNode {
  member: Member;
  children: TreeNode[];
  noWork: TreeNode[];
}
