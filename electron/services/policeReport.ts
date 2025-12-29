import { getDb } from "../db/database";

const db = getDb();

export const createPoliceReport = (data: {
  station_name: string;
  station_address?: string;
  officer_name?: string;
  purpose?: string;
  remarks?: string;
}) => {
  const tx = db.transaction(() => {

    /* ================= 1️⃣ Fetch ACTIVE + unreported check-ins ================= */
    const checkIns = db.prepare(`
      SELECT id
      FROM check_in
      WHERE status = 'ACTIVE'
        AND police_reported = 0
    `).all() as { id: number }[];

    if (!checkIns.length) {
      throw new Error("No ACTIVE check-ins available for police report");
    }

    /* ================= 2️⃣ Generate REPORT NUMBER ================= */
    const year = new Date().getFullYear();

    const lastReport = db.prepare(`
      SELECT report_no
      FROM police_report
      WHERE report_no LIKE ?
      ORDER BY id DESC
      LIMIT 1
    `).get(`PR-${year}-%`) as { report_no?: string };

    let nextNumber = 1;

    if (lastReport?.report_no) {
      const parts = lastReport.report_no.split("-");
      nextNumber = Number(parts[2]) + 1;
    }

    const report_no = `PR-${year}-${String(nextNumber).padStart(4, "0")}`;

    /* ================= 3️⃣ Create police report ================= */
    const result = db.prepare(`
      INSERT INTO police_report (
        report_no,
        station_name,
        station_address,
        officer_name,
        purpose,
        remarks
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      report_no,
      data.station_name,
      data.station_address || "",
      data.officer_name || "",
      data.purpose || "",
      data.remarks || ""
    );

    const policeReportId = Number(result.lastInsertRowid);

    /* ================= 4️⃣ Attach check-ins ================= */
    const attach = db.prepare(`
      INSERT INTO police_report_checkin (police_report_id, check_in_id)
      VALUES (?, ?)
    `);

    for (const row of checkIns) {
      attach.run(policeReportId, row.id);
    }

    /* ================= 5️⃣ Mark check-ins as reported ================= */
    db.prepare(`
      UPDATE check_in
      SET police_reported = 1
      WHERE id IN (${checkIns.map(() => "?").join(",")})
    `).run(...checkIns.map(c => c.id));

    return {
      police_report_id: policeReportId,
      report_no,
      total_checkins: checkIns.length,
    };
  });

  return tx();
};


export const getPoliceReportById = (id: number) => {
  const report = db.prepare(`
    SELECT * FROM police_report WHERE id = ?
  `).get(id);

  if (!report) return null;

  const checkins = db.prepare(`
    SELECT
      c.id,
      c.checkin_id,
      c.check_in_time,
      g.full_name,
      g.phone,
      g.address,
      g.id_proof_type,
      g.id_proof_number
    FROM police_report_checkin prc
    JOIN check_in c ON c.id = prc.check_in_id
    JOIN guest g ON g.id = c.guest_id
    WHERE prc.police_report_id = ?
  `).all(id);

  return { ...report, checkins };
};

/**
 * GET POLICE REPORT BY CHECK-IN ID
 */
export const getPoliceReportByCheckIn = (checkInId: number) => {
  return db.prepare(`
    SELECT pr.*
    FROM police_report pr
    JOIN police_report_checkin prc ON prc.police_report_id = pr.id
    WHERE prc.check_in_id = ?
  `).get(checkInId);
};

/**
 * LIST ALL POLICE REPORTS
 */
export const listPoliceReports = () => {
  return db.prepare(`
    SELECT
      pr.id,
      pr.report_no,
      pr.station_name,
      pr.submitted,
      pr.created_at,
      COUNT(prc.id) AS total_checkins
    FROM police_report pr
    LEFT JOIN police_report_checkin prc
      ON prc.police_report_id = pr.id
    GROUP BY pr.id
    ORDER BY pr.created_at DESC
  `).all();
};

/**
 * MARK REPORT AS SUBMITTED
 */
export const markPoliceReportSubmitted = (id: number) => {
  return db.prepare(`
    UPDATE police_report
    SET submitted = 1,
        submitted_at = datetime('now')
    WHERE id = ?
  `).run(id);
};

/**
 * DELETE POLICE REPORT (auto removes mapping & frees check-ins)
 */
export const deletePoliceReport = (id: number) => {
  const tx = db.transaction(() => {
    const checkins = db.prepare(`
      SELECT check_in_id
      FROM police_report_checkin
      WHERE police_report_id = ?
    `).all(id);

    if (checkins.length) {
      db.prepare(`
        UPDATE check_in
        SET police_reported = 0
        WHERE id IN (${checkins.map(() => "?").join(",")})
      `).run(...checkins.map((c: any) => c.check_in_id));
    }

    db.prepare(`DELETE FROM police_report WHERE id = ?`).run(id);
  });
  return tx();
};
