import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { HashRouter } from "react-router";
import { FinancialYearProvider } from "./context/FinancialYearContext.tsx";
import { UserProvider } from "./context/UserContext.tsx";
import { CompanyProvider } from "./context/CompanyInfoContext.tsx";


ReactDOM.createRoot(document.getElementById("root")!).render(

  <HashRouter>
    <CompanyProvider>
    <UserProvider>
      <FinancialYearProvider>
        <App />
      </FinancialYearProvider>
    </UserProvider>
    </CompanyProvider>
  </HashRouter>

);

if (window.api?.on) {
  window.api.on("main-process-message", (message: string) => {
    console.log("Message from main:", message);
  });
} else {
  console.error("Electron API not loaded");
}
