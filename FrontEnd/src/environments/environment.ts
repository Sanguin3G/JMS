declare global {
  interface Window { JMS_CONFIG?: { apiUrl?: string; ckeditorLicenseKey?: string }; }
}
const apiUrl = (window.JMS_CONFIG?.apiUrl ?? "").replace(/\/$/, '');
export const environment = {
  production: true,
  apiUrl,
  Url: '',
};
