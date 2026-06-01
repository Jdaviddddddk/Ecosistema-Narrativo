interface Window {
  google?: {
    accounts: {
      oauth2: {
        revoke: (token: string, callback: () => void) => void;
      };
    };
  };
}