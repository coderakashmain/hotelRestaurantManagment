export {};

declare global {
  interface Window {
    api: {
      loginAttempt: (data: {
        username: string;
        password: string;
      }) => void;
      activateLicense: (code: string) => void;
      onActivationResult: (callback: (result: { success: boolean; message?: string }) => void) => void;
      activationSuccess: () => void;
      buyLicense: () => void;

      onLoginResult: (callback: (result: {
        success: boolean;
        message?: string;
      }) => void) => void;
      loginSuccess: () => void;
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
