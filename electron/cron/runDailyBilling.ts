import { getActiveBills } from "./getActiveBills";
import { recalcBillTotals } from "../services/billing";

export const runDailyBilling = async () => {
  const bills = getActiveBills();

//   console.log(`[CRON] Active bills: ${bills.length}`);

  for (const { bill_id } of bills) {
    try {
      await recalcBillTotals(bill_id);
    //   console.log(`[CRON] Bill updated: ${bill_id}`);
    } catch (err) {
      console.error(`[CRON] Failed bill ${bill_id}`, err);
    }
  }
};
