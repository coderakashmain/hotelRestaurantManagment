export interface Guest {
  id: number;
  full_name: string;

  phone?: string | null;
  email?: string | null;
  address?: string | null;

  id_proof_type?: string | null;
  id_proof_number?: string | null;
  id_proof_image?: string | null;

  created_at: string;
}
