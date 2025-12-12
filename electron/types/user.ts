export interface UserAccount {
  id: number;
  name: string;
  username: string;
  password_hash: string;

  role: string; // ADMIN, MANAGER, RECEPTION...

  phone?: string | null;
  email?: string | null;

  is_active: number;
  created_at: string;
}
