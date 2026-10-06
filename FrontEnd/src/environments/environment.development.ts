declare global {
  interface Window { JMS_CONFIG?: { apiUrl?: string; ckeditorLicenseKey?: string }; }
}
const apiUrl = (window.JMS_CONFIG?.apiUrl ?? "http://localhost:8080").replace(/\/$/, '');
export const environment = {
  production: false,
  apiUrl,
  Url: '',
};
