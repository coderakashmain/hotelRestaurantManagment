import {
    InformationCircleIcon,
    CommandLineIcon,
    SignalIcon,
  } from "@heroicons/react/24/outline";
  
  
  export default function BottomBar() {
    return (
      <div
        className="
          fixed bottom-0 left-0 right-0
          h-8
          bg-bg-primary
          border-t border-gray-200
          flex items-center justify-between
          px-4
          text-[11px]
          text-gray-500
          select-none
          z-40
        "
      >
        {/* LEFT — Company Info */}
        <div className="flex items-center gap-2">
          <InformationCircleIcon className="w-3.5 h-3.5" />
          <span>
            © {new Date().getFullYear()}{" "}
            <span className="font-medium text-gray-600">
              Sobeit Private Limited
            </span>
          </span>
        </div>
  
        {/* CENTER — App Info */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="font-medium text-gray-600">RestroX</span>
            <span>v1.0.0</span>
          </span>
  
          <span className="text-gray-400">•</span>
  
          <span className="uppercase text-[10px] tracking-wide">
            Production
          </span>
        </div>
  
        {/* RIGHT — Shortcuts & Status */}
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <CommandLineIcon className="w-3.5 h-3.5" />
            Ctrl + Tab
          </span>
  
          <span className="flex items-center gap-1 text-green-600">
            <SignalIcon className="w-3.5 h-3.5" />
            Online
          </span>
        </div>
      </div>
    );
  }
  