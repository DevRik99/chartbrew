export const API_HOST = "https://chartbrew-1-cx36.onrender.com";

export const SITE_HOST = import.meta.env.PROD
  ? import.meta.env.VITE_APP_CLIENT_HOST
  : (import.meta.env.VITE_APP_CLIENT_HOST_DEV || "http://localhost:4018");

export const DOCUMENTATION_HOST = "https://docs.chartbrew.com";

export const APP_VERSION = import.meta.env.VITE_APP_VERSION;
export const ONE_ACCOUNT_ENABLED = !!import.meta.env.VITE_APP_ONE_ACCOUNT_EXTERNAL_ID;
