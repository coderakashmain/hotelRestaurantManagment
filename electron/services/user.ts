import { getDb } from "../db/database";
import bcrypt from "bcryptjs";

const db = getDb();

export const createUser = (data: {
    name: string;
    username: string;
    password: string;
    email: string
}) => {
    const hashedPassword = bcrypt.hashSync(data.password, 10);

    return db.prepare(`
        INSERT INTO user_account (name,username,password_hash,email) VALUES (?,?,?,?);
        `).run(
        data.name,
        data.username,
        hashedPassword,
        data.email
    );
}

export const listUsers = (_payload?: any) => {
  const userdta = db.prepare(`
    SELECT id, name, username, email, role, is_active
    FROM user_account
    ORDER BY created_at DESC
  `).all();
  
  return userdta;
}; 

