import { getDb } from "../db/database";
// import { PoliceReport } from "../types";

const db = getDb();

export const createPoliceReport = (data: any) => {
    const active = db.prepare(`
      SELECT id FROM check_in
      WHERE id = ? AND status = 'ACTIVE'
    `).get(data.check_in_id);

    if (!active) {
        throw new Error("Police report allowed only for ACTIVE stay");
    }

    //  2. Prevent duplicate report per stay
    const exists = db.prepare(`
      SELECT id FROM police_report WHERE check_in_id = ?
    `).get(data.check_in_id);

    if (exists) {
        throw new Error("Police report already exists for this stay");
    }

    //  3. Create report (snapshot)
    return db.prepare(`
      INSERT INTO police_report (
        check_in_id,
        guest_id,
        station_name,
        station_address,
        officer_name,
        purpose,
        remarks
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
        data.check_in_id,
        data.guest_id,
        data.station_name,
        data.station_address || "",
        data.officer_name || "",
        data.purpose || "",
        data.remarks || ""
    );
}

export const getByCheckIn= ( payload: number | { checkInId: number })=>{
  const checkInId =
    typeof payload === "number" ? payload : payload.checkInId;
    return db.prepare(`
      SELECT 
        pr.*,
        g.full_name,
        g.phone,
        g.address,
        g.id_proof_type,
        g.id_proof_number,
        c.checkin_id,
        c.check_in_time
      FROM police_report pr
      JOIN guest g ON g.id = pr.guest_id
      JOIN check_in c ON c.id = pr.check_in_id
      WHERE pr.check_in_id = ?
    `).get(checkInId);
}

export const markSubmitted = (payload: number | { id: number })=>{
  const id = typeof payload === "number" ? payload : payload.id;
     return db.prepare(`
      UPDATE police_report
      SET submitted = 1,
          submitted_at = datetime('now')
      WHERE id = ?
    `).run(id);
}