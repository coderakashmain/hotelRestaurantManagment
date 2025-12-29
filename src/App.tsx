import "./App.css";
import { lazy, Suspense } from "react";
import { Route, Navigate, Routes } from "react-router";
const RoomSetting = lazy(() => import("./pages/RoomSetting"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const RoomChart = lazy(() => import("./components/rooms/RoomChart"));
const CompanySetupPage = lazy(() => import("./pages/CompanySetupPage"));
const CheckinPage = lazy(() => import("./pages/CheckinPage"));
const FinancialYearList = lazy(() => import("./pages/FinancialYearList"));
const UserCreatePage = lazy(() => import("./pages/masters/UserCreatePage"));
const ExtraCharge = lazy(() => import("./pages/masters/ExtraCharge"));
const Company = lazy(() => import("./pages/masters/Company"));
const RoomTypePage = lazy(() => import("./pages/masters/RoomType"));
const CheckOutType = lazy(() => import("./pages/masters/CheckOutType"));
const GSTPage = lazy(() => import("./pages/masters/GSTPage"));
const UsersList = lazy(() => import("./pages/masters/UsersList"));
const InvoicePrint = lazy(() => import("./components/billing/InvoicePrint"));
const DualMrPage = lazy(() => import("./components/billing/DualMrPage"));
const KOT = lazy(() => import("./pages/restaurant/KOT"));
const CategoryPage = lazy(() => import("./pages/restaurant/CategoryPage"));
const DishPage = lazy(() => import("./pages/restaurant/DishPage"));
const RestaurantTablePage = lazy(
  () => import("./pages/restaurant/RestaurantTablePage")
);
const EmployeePage = lazy(() => import("./pages/restaurant/EmployeePage"));
const BillingPage = lazy(() => import("./pages/restaurant/BillingPage"));
const GstPageRestaurant = lazy(() => import("./pages/restaurant/GstPageRestaurant"));


import IndexRouter from "./Router/IndexRouter";
import OuterRouter from "./Router/OuterRouter";
import { CheckOutRuleProvider } from "./context/CheckOutRuleContext";
import { RoomTypeProvider } from "./context/RoomTypeContext";
import { GSTProvider } from "./context/GSTContext";
import PrintRouter from "./Router/PrintRouter";
import InvoiceDataContext from "./context/InvoiceDataContext";
import MrDataContext from "./context/MrDataContext";
import PoliceReport from "./pages/Reports/PoliceReport";
import DailyCollection from "./pages/Reports/DailyCollection";
import SwitchRouter from "./Router/SwitchRouter";
import RestaurantIndexRouter from "./Router/RestaurantIndexRouter";

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<SwitchRouter />}>
          <Route index element={<Navigate to="hotel" replace />} />
          <Route path="hotel" element={<OuterRouter />}>
            <Route
              path=""
              element={
                <RoomTypeProvider>
                  <GSTProvider>
                    <CheckOutRuleProvider>
                      <InvoiceDataContext>
                        <MrDataContext>
                          <IndexRouter />
                        </MrDataContext>
                      </InvoiceDataContext>
                    </CheckOutRuleProvider>
                  </GSTProvider>
                </RoomTypeProvider>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="rooms" element={<RoomSetting />} />
              <Route path="rooms-chart" element={<RoomChart />} />
              <Route path="checkin" element={<CheckinPage />} />
              <Route path="fy" element={<FinancialYearList />} />
              {/* <Route path="fy-create" element={<FinancialYearCreate />} />
              <Route path="fy-edit/:id" element={<FinancialYearEdit />} /> */}
              <Route path="hotel-info" element={<Company />} />
              <Route path="extra-charges" element={<ExtraCharge />} />
              <Route path="room-type" element={<RoomTypePage />} />
              <Route path="check-out-hours" element={<CheckOutType />} />
              <Route path="gst-management" element={<GSTPage />} />
              <Route path="users-list" element={<UsersList />} />
              <Route path="print" element={<PrintRouter />}>
                <Route path="invoice" index element={<InvoicePrint />} />
                <Route path="mr" index element={<DualMrPage />} />
              </Route>
              <Route path="police-reports" element={<PoliceReport />} />
              <Route path="daily-reports" element={<DailyCollection />} />
            </Route>
          </Route>
          <Route path="restaurant" element={<RestaurantIndexRouter />}>
            <Route path="category-master" element={<CategoryPage />} />
            <Route path="dish-master" element={<DishPage />} />
            <Route path="table-master" element={<RestaurantTablePage />} />
            <Route path="employee-master" element={<EmployeePage />} />
            <Route path="gst-master-restaurent" element={<GstPageRestaurant />} />
            <Route path="kot" element={<KOT />} />
            <Route path="kot-billing" element={<BillingPage />} />
          </Route>
          <Route path="setup/user-create" element={<UserCreatePage />} />
        <Route path="company-setup" element={<CompanySetupPage />} />
        </Route>
        
      </Routes>
    </Suspense>
  );
}

export default App;
