export {};

declare global {
  interface Window {
    initMap?: () => void; // <-- note the "?" here
  }

  const google: any;
}
