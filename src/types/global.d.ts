export {};

declare global {
  interface Window {
    api: {
      on: (channel: string, callback: Function) => void;
      send: (channel: string, data?: any) => void;
       invoke(channel: string, ...args: any[]): Promise<any>;
      // loadRooms: () => Promise<any>;
      // saveRooms: (data: any) => Promise<void>;
      minimize: () => void;
      maximize: () => void;
      close: () => void;
    };
  }
}
