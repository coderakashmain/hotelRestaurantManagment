import cron from "node-cron";
import { runDailyBilling } from "./runDailyBilling";

export const startDailyBillingCron = () => {
  // Runs every day at 00:05
  cron.schedule("5 0 * * *", async () => {
    // console.log(
    //   "[CRON] Daily billing started",
    //   new Date().toISOString()
    // );

    try {
      await runDailyBilling();
    //   console.log(
    //     "[CRON] Daily billing completed",
    //     new Date().toISOString()
    //   );
    } catch (err) {
      console.error("[CRON] Billing failed", err);
    }
  });

//   console.log("[CRON] Daily billing scheduler initialized");
};
