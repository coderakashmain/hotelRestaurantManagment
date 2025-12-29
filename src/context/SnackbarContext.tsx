import { createContext, useContext, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

type SnackbarType = "success" | "error" | "warning";

type SnackbarState = {
  open: boolean;
  message: string;
  type: SnackbarType;
};

const SnackbarContext = createContext<{
  showSnackbar: (msg: string, type?: SnackbarType) => void;
} | null>(null);

export const useSnackbar = () => {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error("useSnackbar must be used inside provider");
  return ctx;
};

export const SnackbarProvider = ({ children }: { children: any }) => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    type: "success",
  });

  const showSnackbar = (message: string, type: SnackbarType = "success") => {
    setSnackbar({ open: true, message, type });
    setTimeout(() => {
      setSnackbar((s) => ({ ...s, open: false }));
    }, 3000);
  };

  const bg =
    snackbar.type === "success"
      ? "bg-success"
      : snackbar.type === "error"
      ? "bg-error"
      : "bg-warning";

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}

      {snackbar.open && (
        <div className="fixed bottom-10 right-3 z-[9999] snackbar-enter">
          <div
            className={`${bg} text-white rounded-sm shadow-card px-4 py-3 flex items-start gap-3 min-w-[260px]`}
          >
            <span className="text-sm flex-1">{snackbar.message}</span>
            <button
              onClick={() => setSnackbar((s) => ({ ...s, open: false }))}
              className="opacity-80 hover:opacity-100 transition"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </SnackbarContext.Provider>
  );
};
