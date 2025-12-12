import { ipcMain } from "electron";
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
  
} from "../services";
import {GSTService} from "../services/GSTService";
import * as FY from "../services/finalcialYear";
import * as BillTypeService from "../services/billType";

/* =========================================================
   COMPANY INFO
========================================================= */

ipcMain.handle("company:get", () => {
  return CompanyService.getCompanyInfo();
});

ipcMain.handle("company:save", (_, data) => {
  return CompanyService.upsertCompanyInfo(data);
});

ipcMain.handle("financial:get-active", () => {
  return CompanyService.getActiveFinancialYear();
});

ipcMain.handle("financial:create", (_, data) => {
  return CompanyService.createFinancialYear(
    data.year_name,
    data.start_date,
    data.end_date,
    data.prefix,
    data.is_active
  );
});

ipcMain.handle("financial:set-active", (_, id) => {
  return CompanyService.setActiveFinancialYear(id);
});

/* =========================================================
   FLOORS
========================================================= */
ipcMain.handle("floor:list", () => {
  return RoomService.getFloors();
});

ipcMain.handle("floor:add", (_, data) => {
  return RoomService.addFloor(data.floor_name, data.floor_number);
});

//  NEW — rename floor
ipcMain.handle("floor:rename", (_, { id, floor_name }) => {
  return RoomService.renameFloor(id, floor_name);
});

/* =========================================================
   ROOMS
========================================================= */

ipcMain.handle("room:list", () => {
  return RoomService.getAllRooms();
});

ipcMain.handle("room:get", (_, id) => {
  return RoomService.getRoomById(id);
});

ipcMain.handle("room:add", (_, data) => {
  return RoomService.addRoom(
    String(data.room_number),
    data.floor_id
  );
});

//  FIX — MATCH API: updateStatus()
ipcMain.handle("room:updateStatus", (_, data) => {
  return RoomService.updateRoomStatus(data.room_id, data.status);
});

//  NEW — update room (edit modal)
ipcMain.handle("room:update", (_, { id, data }) => {
  return RoomService.updateRoom(id, data);
});


//rooms types

ipcMain.handle("roomType:list", () => {
  return RoomTypeService.getRoomTypes();
});

ipcMain.handle("roomType:create", (_, data) => {
  return RoomTypeService.createRoomType(data);
});

ipcMain.handle("roomType:update", (_, {id, data}) => {
  return RoomTypeService.updateRoomType(id, data);
});

ipcMain.handle("roomType:delete", (_, id) => {
  return RoomTypeService.deleteRoomType(id);
});

ipcMain.handle("roomType:toggle", (_, { id, active }) => {
  return RoomTypeService.toggleRoomType(id, active);
});


/* =========================================================
   GUESTS
========================================================= */

ipcMain.handle("guest:add", (_, data) => GuestService.addGuest(
  data.full_name,
  data.phone,
  data.email,
  data.address,
  data.id_proof_type,
  data.id_proof_number,
  data.id_proof_image
));

ipcMain.handle("guest:list", () => GuestService.getAllGuests());
ipcMain.handle("guest:get", (_, id) => GuestService.getGuestById(id));
ipcMain.handle("guest:search", (_, query) => GuestService.searchGuests(query));

ipcMain.handle("guest:get-by-phone", (_, phone) => GuestService.getGuestByPhone(phone));

ipcMain.handle("guest:update", (_, { id, payload }) =>
  GuestService.updateGuest(id, payload)
);

ipcMain.handle("guest:delete", (_, id) => GuestService.deleteGuest(id));

/* =========================================================
   CHECK-IN
========================================================= */

ipcMain.handle("checkin:create", (_, data) => {
  return CheckInService.createCheckIn(data);
});

ipcMain.handle("checkin:list-active", () => {
  return CheckInService.getActiveCheckins();
});

/* =========================================================
   BILLING
========================================================= */

ipcMain.handle("bill:get", (_, billId) => {
  return BillingService.getBillById(billId);
});
ipcMain.handle("billBYroom:get", (_, billId) => {
  return BillingService.getBillByRoomId(billId);
});

ipcMain.handle("bill:add-extra", (_, data) => {
  return BillingService.addExtraCharge(
    data.bill_id,
    data.bill_type_id,
    data.description,
    data.amount,
    data.quantity,
    data.added_by
  );
});

ipcMain.handle("bill:add-payment", (_, data) => {
  return BillingService.addPayment(
    data.bill_id,
    data.guest_id,
    data.payment_type,
    data.amount,
    data.method,
    data.reference_no,
    data.note
  );
});

ipcMain.handle("bill:recalc", (_, billId) => {
  return BillingService.recalcBillTotals(billId);
});

ipcMain.handle("bill:checkout", (_, data) => {
  return BillingService.checkout(data);
});
ipcMain.handle("bill:discount_update", (_, data) => {
  return BillingService.updateDiscount(
    data.bill_id,
    data.value,
    data.type
  );
});


ipcMain.handle("bill:list", (_, filter) => {
  return BillingService.getBills(filter);
});

/* =========================================================
   REPORTS
========================================================= */

ipcMain.handle("report:daily-revenue", (_, date) => {
  return ReportService.getDailyRevenue(date);
});

ipcMain.handle("report:outstanding", () => {
  return ReportService.getOutstandingBills();
});

ipcMain.handle("report:occupancy", (_, data) => {
  return ReportService.getOccupancyReport(data.from, data.to);
});





//financialyear 

ipcMain.handle("fy:list", () => FY.getAllFinancialYears());
ipcMain.handle("fy:active", () => FY.getActiveFinancialYear());
ipcMain.handle("fy:create", (_, year, prefix) => FY.createFinancialYear(year, prefix));
ipcMain.handle("fy:set-active", (_, id) => FY.setActiveFinancialYear(id));
ipcMain.handle("fy:update", (_, id, data) => FY.updateFinancialYear(id, data));
ipcMain.handle("fy:delete", (_, id) => FY.deleteFinancialYear(id));
ipcMain.handle("fy:next-invoice", (_, fyId) => FY.getNextInvoiceNumber(fyId));
ipcMain.handle("fy:reset-counter", (_, fyId) => FY.resetInvoiceCounter(fyId));


//billtype

ipcMain.handle("billType:list", () => {
  return BillTypeService.list();
});

// GET ACTIVE BILL TYPES ONLY
ipcMain.handle("billType:active", () => {
  return BillTypeService.list({ active_only: true });
});

// CREATE BILL TYPE
ipcMain.handle("billType:create", (_, data) => {
  return BillTypeService.create(data);
});

// UPDATE BILL TYPE
ipcMain.handle("billType:update", (_, id, data) => {
  return BillTypeService.update(id, data);
});

// DELETE BILL TYPE
ipcMain.handle("billType:delete", (_, id) => {
  return BillTypeService.remove(id);
});


//users

ipcMain.handle("users:create",(_,data)=>{
  return UserService.createUser(data);
})

ipcMain.handle("users:list", () => {
  return UserService.listUsers();
});


//checkout Types 

ipcMain.handle("checkout:list", () => {
  return CheckOutService.getCheckOutSettings();
});

ipcMain.handle("checkout:create", (_, data) => {
  return CheckOutService.createCheckOutSetting(data);
});

ipcMain.handle("checkout:update", (_, data) => {
  return CheckOutService.updateCheckOutSetting(data);
});

ipcMain.handle("checkout:delete", (_, id) => {
  return CheckOutService.deleteCheckOutSetting(id);
});

ipcMain.handle("checkout:setDefault", (_, id) => {
  return CheckOutService.setDefaultCheckOut(id);
});

//GST Service
ipcMain.handle("gst:list", () =>  { 
  return GSTService.list()}
);
ipcMain.handle("gst:create", (_, data) => {  return GSTService.create(data)});
ipcMain.handle("gst:update", (_, data) => {  return GSTService.update(data)});
ipcMain.handle("gst:delete", (_, id) => { return GSTService.delete(id)});
ipcMain.handle("gst:setActive", (_, id) => { return GSTService.setActive(id)});