import {
  CompanyService,
  RoomService,
  GuestService,
  CheckInService,
  BillingService,
  ReportService,
  UserService,
  RoomTypeService,
  CheckOutService,
  PoliceReportService,
  DailyCollectionService 
} from "../services";
import './window'
import * as Category from "../services/restaurantServices/category";
import * as Dish from "../services/restaurantServices/dish";
import * as Table from "../services/restaurantServices/restaurantTable";
import * as Employee from "../services/restaurantServices/employee";
import * as KOT from "../services/restaurantServices/kot";
import * as Bill  from "../services/restaurantServices/restaurantBill";
import * as ServiceTax   from "../services/restaurantServices/serviceTax";
import * as GST   from "../services/restaurantServices/gst";
import { GSTService } from "../services/GSTService";
import * as FY from "../services/finalcialYear";
import * as BillTypeService from "../services/billType";
import { handleIPC } from "./handleIPC";

/* ================================
   COMPANY
================================ */
handleIPC("company:get", CompanyService.getCompanyInfo);
handleIPC("company:save", CompanyService.upsertCompanyInfo);
handleIPC("financial:get-active", CompanyService.getActiveFinancialYear);
handleIPC("financial:create", CompanyService.createFinancialYear);
handleIPC("financial:set-active", CompanyService.setActiveFinancialYear);

/* ================================
   FLOORS
================================ */
handleIPC("floor:list", RoomService.getFloors);
handleIPC("floor:add", RoomService.addFloor);
handleIPC("floor:rename", RoomService.renameFloor);

/* ================================
   ROOMS
================================ */
handleIPC("room:list", RoomService.getAllRooms);
handleIPC("room:get", RoomService.getRoomById);
handleIPC("room:add", RoomService.addRoom);
handleIPC("room:updateStatus", RoomService.updateRoomStatus);
handleIPC("room:update", RoomService.updateRoom);

/* ================================
   ROOM TYPES
================================ */
handleIPC("roomType:list", RoomTypeService.getRoomTypes);
handleIPC("roomType:create", RoomTypeService.createRoomType);
handleIPC("roomType:update", RoomTypeService.updateRoomType);
handleIPC("roomType:delete", RoomTypeService.deleteRoomType);
handleIPC("roomType:toggle", RoomTypeService.toggleRoomType);

/* ================================
   GUESTS
================================ */
handleIPC("guest:add", GuestService.addGuest);
handleIPC("guest:list", GuestService.getAllGuests);
handleIPC("guest:get", GuestService.getGuestById);
handleIPC("guest:search", GuestService.searchGuests);
handleIPC("guest:get-by-phone", GuestService.getGuestByPhone);
handleIPC("guest:update", GuestService.updateGuest);
handleIPC("guest:delete", GuestService.deleteGuest);

/* ================================
   CHECK-IN
================================ */
handleIPC("checkin:create", CheckInService.createCheckIn);
handleIPC("checkin:list-active", CheckInService.getActiveCheckins);

/* ================================
   BILLING
================================ */
handleIPC("bill:get", BillingService.getBillById);
handleIPC("billBYroom:get", BillingService.getBillByRoomId);
handleIPC("bill:add-extra", BillingService.addExtraCharge);
handleIPC("bill:add-payment", BillingService.addPayment);
handleIPC("bill:recalc", BillingService.recalcBillTotals);
handleIPC("bill:checkout", BillingService.checkout);
handleIPC("bill:discount_update", BillingService.updateDiscount);
handleIPC("bill:list", BillingService.getBills);

/* ================================
   REPORTS
================================ */
handleIPC("report:daily-revenue", ReportService.getDailyRevenue);
handleIPC("report:outstanding", ReportService.getOutstandingBills);
handleIPC("report:occupancy", ReportService.getOccupancyReport);

/* ================================
   FINANCIAL YEAR
================================ */
handleIPC("fy:list", FY.getAllFinancialYears);
handleIPC("fy:active", FY.getActiveFinancialYear);
handleIPC("fy:create", FY.createFinancialYear);

handleIPC("fy:set-active", FY.setActiveFinancialYear);
handleIPC("fy:update", FY.updateFinancialYear);
handleIPC("fy:delete", FY.deleteFinancialYear);
handleIPC("fy:next-invoice", FY.getNextInvoiceNumber);
handleIPC("fy:reset-counter", FY.resetInvoiceCounter);

/* ================================
   BILL TYPES
================================ */
handleIPC("billType:list", BillTypeService.list);
handleIPC("billType:active", () => BillTypeService.list({ active_only: true }));
handleIPC("billType:create", BillTypeService.create);
handleIPC("billType:update", BillTypeService.update);
handleIPC("billType:delete", BillTypeService.remove);

/* ================================
   USERS
================================ */
handleIPC("users:create", UserService.createUser);
handleIPC("users:list", UserService.listUsers);

/* ================================
   CHECKOUT SETTINGS
================================ */
handleIPC("checkout:list", CheckOutService.getCheckOutSettings);
handleIPC("checkout:create", CheckOutService.createCheckOutSetting);
handleIPC("checkout:update", CheckOutService.updateCheckOutSetting);
handleIPC("checkout:delete", CheckOutService.deleteCheckOutSetting);
handleIPC("checkout:setDefault", CheckOutService.setDefaultCheckOut);

/* ================================
   GST
================================ */
handleIPC("gst:list", GSTService.list);
handleIPC("gst:create", GSTService.create);
handleIPC("gst:update", GSTService.update);
handleIPC("gst:delete", GSTService.delete);
handleIPC("gst:setActive", GSTService.setActive);

/* ================================
   POLICE REPORT
================================ */
handleIPC("police-report:create", PoliceReportService.createPoliceReport);
handleIPC("police-report:getByCheckIn", PoliceReportService.getByCheckIn);
handleIPC("police-report:markSubmitted", PoliceReportService.markSubmitted);



//daily reports 
handleIPC(
  "dcr:add",
  DailyCollectionService.addDailyEntry
);

handleIPC(
  "dcr:list",
  DailyCollectionService.getDailyRegister
);

handleIPC(
  "dcr:delete",
  DailyCollectionService.deleteDailyEntry
);


//restaurant ipc


handleIPC("category:add", Category.addCategory);
handleIPC("category:list", Category.getAllCategories);
handleIPC("category:get", Category.getCategoryById);
handleIPC("category:update", Category.updateCategory);
handleIPC("category:delete", Category.deleteCategory);



handleIPC("dish:add", Dish.addDish);
handleIPC("dish:list", Dish.getAllDishes);
handleIPC("dish:get", Dish.getDishById);
handleIPC("dish:update", Dish.updateDish);
handleIPC("dish:delete", Dish.deleteDish);




handleIPC("table:add", Table.addRestaurantTable);
handleIPC("table:list", Table.getAllRestaurantTables);
handleIPC("table:get", Table.getRestaurantTableById);
handleIPC("table:update", Table.updateRestaurantTable);
handleIPC("table:delete", Table.deleteRestaurantTable);




handleIPC("employee:add", Employee.addEmployee);
handleIPC("employee:list", Employee.getAllEmployees);
handleIPC("employee:get", Employee.getEmployeeById);
handleIPC("employee:update", Employee.updateEmployee);
handleIPC("employee:delete", Employee.deleteEmployee);

/* =========================
   KOT (Kitchen Order Token)
========================= */


handleIPC("kot:create", KOT.createKOT);
handleIPC("kot:add-item", KOT.addKOTItem);
handleIPC("kot:get", KOT.getKOTDetails);
handleIPC("kot:close", KOT.closeKOT);
handleIPC("kot:list-closed", KOT.listClosedKOTs);





handleIPC("bill:create", Bill.createRestaurantBill);
handleIPC("bill:add-items", Bill.addBillItemsFromKOT);
handleIPC("restaurant-bill:checkout", Bill.checkoutRestaurantBill);

handleIPC("bill:preview", Bill.previewBillFromKOTs);



handleIPC("service-tax:add", ServiceTax.addServiceTax);
handleIPC("service-tax:list", ServiceTax.getAllServiceTaxes);
handleIPC("service-tax:get-active", ServiceTax.getActiveServiceTax);
handleIPC("service-tax:update", ServiceTax.updateServiceTax);



handleIPC("gst:add", GST.addGST);
handleIPC("gst:list", GST.getAllGST);
handleIPC("gst:get-active", GST.getActiveGST);
handleIPC("gst:update", GST.updateGST);