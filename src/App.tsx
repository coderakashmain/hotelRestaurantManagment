import "./App.css";
import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";
const RoomSetting = lazy(() => import("./pages/RoomSetting"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const RoomChart = lazy(() => import("./components/rooms/RoomChart"));
const CompanySetupPage = lazy(() => import("./pages/CompanySetupPage"));
const CheckinPage = lazy(() => import("./pages/CheckinPage"));
const FinancialYearList = lazy(() => import("./pages/FinancialYearList"));
const FinancialYearCreate = lazy(() => import("./pages/FinancialYearCreate"));
const FinancialYearEdit = lazy(() => import("./pages/FinancialYearEdit"));
const UserCreatePage = lazy(() => import("./pages/masters/UserCreatePage"));
const ExtraCharge = lazy(() => import("./pages/masters/ExtraCharge"));
const Company = lazy(() => import("./pages/masters/Company"));
const RoomTypePage = lazy(() => import("./pages/masters/RoomType"));
const CheckOutType = lazy(() => import("./pages/masters/CheckOutType"));
const GSTPage = lazy(() => import("./pages/masters/GSTPage"));
import IndexRouter from "./Router/IndexRouter";
import OuterRouter from "./Router/OuterRouter";
import { CheckOutRuleProvider } from "./context/CheckOutRuleContext";
import { RoomTypeProvider } from "./context/RoomTypeContext";
import { GSTProvider } from "./context/GSTContext";

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<OuterRouter />}>
          <Route
            path=""
            element={
              <RoomTypeProvider>
                <GSTProvider>
                <CheckOutRuleProvider>
                  <IndexRouter />
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
            <Route path="fy-create" element={<FinancialYearCreate />} />
            <Route path="fy-edit/:id" element={<FinancialYearEdit />} />
            <Route path="hotel-info" element={<Company />} />
            <Route path="extra-charges" element={<ExtraCharge />} />
            <Route path="room-type" element={<RoomTypePage />} />
            <Route path="check-out-hours" element={<CheckOutType />} />
            <Route path="gst-management" element={<GSTPage />} />
          </Route>
          <Route path="setup/user-create" element={<UserCreatePage />} />
          <Route path="company-setup" element={<CompanySetupPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
