/* =========================================================
   GLOBAL API WRAPPER FOR RENDERER (FRONTEND)
   Clean & typed wrapper for all window.api.invoke calls.
========================================================= */

export const api = {
  /* ================================
     COMPANY
  ================================= */
  company: {
    get: () => window.api.invoke("company:get"),
    save: (data: any) => window.api.invoke("company:save", data),
  },

  financial: {
    getActive: () => window.api.invoke("financial:get-active"),
    create: (data: any) => window.api.invoke("financial:create", data),
    setActive: (id: number) => window.api.invoke("financial:set-active", id),
  },

  /* ================================
     FLOORS
  ================================= */
  floor: {
    list: () => window.api.invoke("floor:list"),
    add: (data: { floor_name: string; floor_number?: number }) =>
      window.api.invoke("floor:add", data),

    rename: (id: number, floor_name: string) =>
      window.api.invoke("floor:rename", { id, floor_name }),
  },

  room: {
    list: () => window.api.invoke("room:list"),

    add: (data: {
      room_number: string;
      floor_id?: number;
    }) => window.api.invoke("room:add", data),

    updateStatus: (room_id: number, status: string) =>
      window.api.invoke("room:updateStatus", { room_id, status }),

    update: (id: number, data: any) => window.api.invoke("room:update", { id, data }),
  },

  /* ================================
     GUESTS
  ================================= */
  guest: {
    add: (data: any) => window.api.invoke("guest:add", data),
    list: () => window.api.invoke("guest:list"),
    get: (id: number) => window.api.invoke("guest:get", id),
    search: (q: string) => window.api.invoke("guest:search", q),
    update: (id: number, payload: any) =>
      window.api.invoke("guest:update", { id, payload }),
    delete: (id: number) => window.api.invoke("guest:delete", id),
    getByPhone: (phone: string) => window.api.invoke("guest:get-by-phone", phone),
  },


  /* ================================
     CHECK-IN
  ================================= */
  checkin: {
    create: (data: {
      guest_id: number;
      room_id: number;
      check_in_time: string;
      expected_check_out_time?: string | null;
      stay_type?: string;
      rate_applied?: number;
      no_of_guests?: number;
      extra_time : number;
    }) => window.api.invoke("checkin:create", data),

    active: () => window.api.invoke("checkin:list-active"),
  },

  /* ================================
     BILLING
  ================================= */
  bill: {
    get: (billId: number) => window.api.invoke("bill:get", billId),
    getBillByRoom: (billId: number) => window.api.invoke("billBYroom:get", billId),

    addExtra: (data: {
      bill_id: number;
      bill_type_id: number;
      description: string;
      amount: number;
      quantity?: number;
      added_by?: number;
    }) => window.api.invoke("bill:add-extra", data),

    addPayment: (data: {
      bill_id: number;
      guest_id: number;
      payment_type: "ADVANCE" | "FINAL" | "REFUND";
      amount: number;
      method?: string;
      reference_no?: string;
      note?: string;
    }) => window.api.invoke("bill:add-payment", data),

    recalc: (billId: number) => window.api.invoke("bill:recalc", billId),

    checkout: (data: {
      billId: number;
      finalPaymentAmount?: number;
      finalPaymentMethod?: string;
      doRefundIfOverpaid?: boolean;
      userId?: number;
    }) => window.api.invoke("bill:checkout", data),

    updateDiscount: (data: {
      bill_id: number;
      value?: number;
      type?: "FLAT" | "PERCENT";
    }) => window.api.invoke("bill:discount_update", data),

    list: (filter?: { status?: string }) =>
      window.api.invoke("bill:list", filter),
  },

  /* ================================
     REPORTS
  ================================= */
  report: {
    dailyRevenue: (date: string) =>
      window.api.invoke("report:daily-revenue", date),

    outstanding: () => window.api.invoke("report:outstanding"),

    occupancy: (from: string, to: string) =>
      window.api.invoke("report:occupancy", { from, to }),
  },
  //financilayear

  fy: {
    list: () => window.api.invoke("fy:list"),
    active: () => window.api.invoke("fy:active"),
    create: (year: number, prefix?: string) => window.api.invoke("fy:create", year, prefix),
    setActive: (id: number) => window.api.invoke("fy:set-active", id),
    update: (id: number, data: any) => window.api.invoke("fy:update", id, data),
    delete: (id: number) => window.api.invoke("fy:delete", id),
    nextInvoice: (id: number) => window.api.invoke("fy:next-invoice", id),
    resetCounter: (id: number) => window.api.invoke("fy:reset-counter", id),
  },


  billType: {
    list: () => window.api.invoke("billType:list"),
    active: () => window.api.invoke("billType:active"),
    create: (data: any) => window.api.invoke("billType:create", data),
    update: (id: number, data: any) => window.api.invoke("billType:update", id, data),
    delete: (id: number) => window.api.invoke("billType:delete", id),
  },

  users: {
    create: (data: {
      name: string;
      username: string;
      password: string;
      email: string
    }) => window.api.invoke("users:create", data),
    list: () => window.api.invoke("users:list")
  },
  roomType: {
    list: () => window.api.invoke("roomType:list"),
    toggle: (id: number, active: number) => window.api.invoke("roomType:toggle", { id, active }),
    create: (data: any) => window.api.invoke("roomType:create", data),
    update: (id: number, data: any) => window.api.invoke("roomType:update", { id, data }),
    delete: (id: number) => window.api.invoke("roomType:delete", id),
  },

  checkOut: {
  list: () => window.api.invoke("checkout:list"),
  create: (data: any) => window.api.invoke("checkout:create", data),
  update: (data: any) => window.api.invoke("checkout:update", data),
  delete: (id: number) => window.api.invoke("checkout:delete", id),
  setDefault: (id: number) => window.api.invoke("checkout:setDefault", id),
},

gst: {
  list: () => window.api.invoke("gst:list"),
  create: (data: any) => window.api.invoke("gst:create", data),
  update: (data: any) => window.api.invoke("gst:update", data),
  delete: (id: number) => window.api.invoke("gst:delete", id),
  setActive: (id: number) => window.api.invoke("gst:setActive", id),
},




};







