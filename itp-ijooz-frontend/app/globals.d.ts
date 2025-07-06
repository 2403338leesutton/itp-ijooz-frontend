export {};

declare global {
  interface Window {
    initMap?: () => void;
  }

  const google: any;
}
