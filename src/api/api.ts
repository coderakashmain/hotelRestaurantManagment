import { safeInvoke } from "./invoke";

export const api = {

  /* ================================
     COMPANY
  ================================= */
  company: {
    get: () => safeInvoke("company:get"),
    save: (data: any) => safeInvoke("company:save", data),
  },

  financial: {
    getActive: () => safeInvoke("financial:get-active"),
    create: (data: any) => safeInvoke("financial:create", data),
    setActive: (id: number) => safeInvoke("financial:set-active", id),
  },

  floor: {
    list: () => safeInvoke("floor:list"),
    add: (data: { floor_name: string; floor_number?: number }) =>
      safeInvoke("floor:add", data),
    rename: (id: number, floor_name: string) =>
      safeInvoke("floor:rename", { id, floor_name }),
  },

  room: {
    list: () => safeInvoke("room:list"),
    add: (data: any) => safeInvoke("room:add", data),
    updateStatus: (room_id: number, status: string) =>
      safeInvoke("room:updateStatus", { room_id, status }),
    update: (id: number, data: any) =>
      safeInvoke("room:update", { id, data }),
  },

  guest: {
    add: (data: any) => safeInvoke("guest:add", data),
    list: () => safeInvoke("guest:list"),
    get: (id: number) => safeInvoke("guest:get", id),
    search: (q: string) => safeInvoke("guest:search", q),
    update: (id: number, payload: any) =>
      safeInvoke("guest:update", { id, payload }),
    delete: (id: number) => safeInvoke("guest:delete", id),
    getByPhone: (phone: string) =>
      safeInvoke("guest:get-by-phone", phone),
  },

  checkin: {
    create: (data: any) => safeInvoke("checkin:create", data),
    active: () => safeInvoke("checkin:list-active"),
  },

  bill: {
    get: (billId: number) => safeInvoke("bill:get", billId),
    getBillByRoom: (billId: number) =>
      safeInvoke("billBYroom:get", billId),
    addExtra: (data: any) =>
      safeInvoke("bill:add-extra", data),
    addPayment: (data: any) =>
      safeInvoke("bill:add-payment", data),
    recalc: (billId: number) =>
      safeInvoke("bill:recalc", billId),
    checkout: (data: any) =>
      safeInvoke("bill:checkout", data),
    updateDiscount: (data: any) =>
      safeInvoke("bill:discount_update", data),
    list: (filter?: any) =>
      safeInvoke("bill:list", filter),
  },

  report: {
    dailyRevenue: (date: string) =>
      safeInvoke("report:daily-revenue", date),
    outstanding: () =>
      safeInvoke("report:outstanding"),
    occupancy: (from: string, to: string) =>
      safeInvoke("report:occupancy", { from, to }),
  },

  fy: {
    list: () => safeInvoke("fy:list"),
    active: () => safeInvoke("fy:active"),
      create: (data: { year: number; prefix?: string }) =>
        safeInvoke("fy:create", data ),
    setActive: (id: number) =>
      safeInvoke("fy:set-active", id),
    update: (id: number, data: any) =>
      safeInvoke("fy:update", { id, data }),
    delete: (id: number) =>
      safeInvoke("fy:delete", id),
    nextInvoice: (id: number) =>
      safeInvoke("fy:next-invoice", id),
    resetCounter: (id: number) =>
      safeInvoke("fy:reset-counter", id),
  },

  billType: {
    list: () => safeInvoke("billType:list"),
    active: () => safeInvoke("billType:active"),
    create: (data: any) =>
      safeInvoke("billType:create", data),
    update: (id: number, data: any) =>
      safeInvoke("billType:update", { id, data }),
    delete: (id: number) =>
      safeInvoke("billType:delete", id),
  },

  users: {
    create: (data: any) =>
      safeInvoke("users:create", data),
    list: () => safeInvoke("users:list"),
  },

  roomType: {
    list: () => safeInvoke("roomType:list"),
    toggle: (id: number, active: number) =>
      safeInvoke("roomType:toggle", { id, active }),
    create: (data: any) =>
      safeInvoke("roomType:create", data),
    update: (id: number, data: any) =>
      safeInvoke("roomType:update", { id, data }),
    delete: (id: number) =>
      safeInvoke("roomType:delete", id),
  },

  checkOut: {
    list: () => safeInvoke("checkout:list"),
    create: (data: any) =>
      safeInvoke("checkout:create", data),
    update: (data: any) =>
      safeInvoke("checkout:update", data),
    delete: (id: number) =>
      safeInvoke("checkout:delete", id),
    setDefault: (id: number) =>
      safeInvoke("checkout:setDefault", id),
  },

  gst: {
    list: () => safeInvoke("gst:list"),
    create: (data: any) =>
      safeInvoke("gst:create", data),
    update: (data: any) =>
      safeInvoke("gst:update", data),
    delete: (id: number) =>
      safeInvoke("gst:delete", id),
    setActive: (id: number) =>
      safeInvoke("gst:setActive", id),
  },

  policeReport: {
    create: (data: any) =>
      safeInvoke("police-report:create", data),
    getByCheckIn: (checkInId: number) =>
      safeInvoke("police-report:getByCheckIn", checkInId),
    markSubmitted: (id: number) =>
      safeInvoke("police-report:markSubmitted", id),
  },
    dcr: {
    add: (data: any) =>
      safeInvoke("dcr:add", data),

    list: (date: string) =>
      safeInvoke("dcr:list", date),

    delete: (id: number) =>
      safeInvoke("dcr:delete", id),
  },

//restaurent apis

  category: {
    add: (data: any) =>
      safeInvoke("category:add", data),

    list: () =>
      safeInvoke("category:list"),

    get: (id: number) =>
      safeInvoke("category:get", id),

    update: (id: number, data: any) =>
      safeInvoke("category:update", {id, data}),

    delete: (id: number) =>
      safeInvoke("category:delete", id),
  },

  /* =========================
     DISH
  ========================= */
  dish: {
    add: (data: any) =>
      safeInvoke("dish:add", data),

    list: () =>
      safeInvoke("dish:list"),

    get: (id: number) =>
      safeInvoke("dish:get", id),

    update: (id: number, data: any) =>
      safeInvoke("dish:update", {id, data}),

    delete: (id: number) =>
      safeInvoke("dish:delete", id),
  },

  /* =========================
     RESTAURANT TABLE
  ========================= */
  table: {
    add: (data: any) =>
      safeInvoke("table:add", data),

    list: () =>
      safeInvoke("table:list"),

    get: (id: number) =>
      safeInvoke("table:get", id),

    update: (id: number, data: any) =>
      safeInvoke("table:update", {id, data}),

    delete: (id: number) =>
      safeInvoke("table:delete", id),
  },

  /* =========================
     EMPLOYEE
  ========================= */
  employee: {
    add: (data: any) =>
      safeInvoke("employee:add", data),

    list: () =>
      safeInvoke("employee:list"),

    get: (id: number) =>
      safeInvoke("employee:get", id),

    update: (id: number, data: any) =>
      safeInvoke("employee:update", {id, data}),

    delete: (id: number) =>
      safeInvoke("employee:delete", id),
  },

  /* =========================
     KOT
  ========================= */
  kot: {
    create: (data: any) =>
      safeInvoke("kot:create", data),

    addItem: (data: any) =>
      safeInvoke("kot:add-item", data),

    get: (kotId: number) =>
      safeInvoke("kot:get", kotId),

    close: (kotId: number) =>
      safeInvoke("kot:close", kotId),
    listClosed: () => safeInvoke("kot:list-closed")

  },

  /* =========================
     BILLING
  ========================= */
  restaurant_bill: {
    preview: (data: { kotIds: number[] }) =>
      safeInvoke("bill:preview", data),
    create: (data: any) =>
      safeInvoke("bill:create", data),

    addItemsFromKot: (billId: number) =>
      safeInvoke("bill:add-items", billId),

    checkout: (data: any) =>
      safeInvoke("bill:checkout", data),
  },

  /* =========================
     GST
  ========================= */
  restaurant_gst: {
    add: (data: any) =>
      safeInvoke("gst:add", data),

    list: () =>
      safeInvoke("gst:list"),

    getActive: () =>
      safeInvoke("gst:get-active"),

    update: (id: number, data: any) =>
      safeInvoke("gst:update", {id, data}),
  },

  /* =========================
     SERVICE TAX
  ========================= */
  serviceTax: {
    add: (data: any) =>
      safeInvoke("service-tax:add", data),

    list: () =>
      safeInvoke("service-tax:list"),

    getActive: () =>
      safeInvoke("service-tax:get-active"),

    update: (id: number, data: any) =>
      safeInvoke("service-tax:update", {id, data}),
  },
};
