import { getDb } from "../../db/database";

const db = getDb();
import { Employee } from "../../types/restaurantType/Employee";

/**
 * Add Employee
import db from "../db";
import { Employee } from "../types/Employee";

/**
 * Add Employee
 */
export const addEmployee = (data: {
    emp_code: number;
    name: string;
    father_name?: string;
    location?: string;
    city?: string;
    district?: string;
    state?: string;
    country?: string;
    nationality?: string;
    aadhaar_no?: string;
    mobile?: string;
    designation?: string;
    is_active?: number;
  }): Employee => {
  
    if (!data.emp_code) {
      throw new Error("Employee code is required");
    }
  
    if (!data.name) {
      throw new Error("Employee name is required");
    }
  
    const exists = db.prepare(`
      SELECT id FROM employee WHERE emp_code = ?
    `).get(data.emp_code);
  
    if (exists) {
      throw new Error("Employee code already exists");
    }
  
    const result = db.prepare(`
      INSERT INTO employee
      (
        emp_code,
        name,
        father_name,
        location,
        city,
        district,
        state,
        country,
        nationality,
        aadhaar_no,
        mobile,
        designation,
        is_active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.emp_code,
      data.name,
      data.father_name ?? null,
      data.location ?? null,
      data.city ?? null,
      data.district ?? null,
      data.state ?? null,
      data.country ?? null,
      data.nationality ?? null,
      data.aadhaar_no ?? null,
      data.mobile ?? null,
      data.designation ?? null,
      data.is_active ?? 1
    );
  
    return db.prepare(`
      SELECT * FROM employee WHERE id = ?
    `).get(result.lastInsertRowid) as Employee;
  };
  
  /**
   * Get All Employees
   */
  export const getAllEmployees = (): Employee[] => {
    return db.prepare(`
      SELECT * FROM employee
      ORDER BY emp_code ASC
    `).all() as Employee[];
  };
  
  /**
   * Get Employee by ID
   */
  export const getEmployeeById = (id: number): Employee => {
    if (!id) {
      throw new Error("Employee id is required");
    }
  
    const row = db.prepare(`
      SELECT * FROM employee WHERE id = ?
    `).get(id) as Employee | undefined;
  
    if (!row) {
      throw new Error("Employee not found");
    }
  
    return row;
  };
  
  /**
   * Update Employee
   */
  export const updateEmployee = (payload :{
    id: number,
    data: {
      name?: string;
      father_name?: string;
      location?: string;
      city?: string;
      district?: string;
      state?: string;
      country?: string;
      nationality?: string;
      aadhaar_no?: string;
      mobile?: string;
      designation?: string;
      is_active?: number;
    }
 } ): Employee => {
  const {id,data} = payload;
    if (!id) {
      throw new Error("Employee id is required");
    }
  
    db.prepare(`
      UPDATE employee SET
        name = COALESCE(?, name),
        father_name = COALESCE(?, father_name),
        location = COALESCE(?, location),
        city = COALESCE(?, city),
        district = COALESCE(?, district),
        state = COALESCE(?, state),
        country = COALESCE(?, country),
        nationality = COALESCE(?, nationality),
        aadhaar_no = COALESCE(?, aadhaar_no),
        mobile = COALESCE(?, mobile),
        designation = COALESCE(?, designation),
        is_active = COALESCE(?, is_active)
      WHERE id = ?
    `).run(
      data.name ?? null,
      data.father_name ?? null,
      data.location ?? null,
      data.city ?? null,
      data.district ?? null,
      data.state ?? null,
      data.country ?? null,
      data.nationality ?? null,
      data.aadhaar_no ?? null,
      data.mobile ?? null,
      data.designation ?? null,
      data.is_active ?? null,
      id
    );
  
    return getEmployeeById(id);
  };
  
  /**
   * Delete Employee
   */
  export const deleteEmployee = (id: number): void => {
    if (!id) {
      throw new Error("Employee id is required");
    }
  
    const inUse = db.prepare(`
      SELECT id FROM kot WHERE waiter_id = ? AND status = 'OPEN'
    `).get(id);
  
    if (inUse) {
      throw new Error("Employee has open KOTs, cannot delete");
    }
  
    db.prepare(`
      DELETE FROM employee WHERE id = ?
    `).run(id);
  };
  