export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "App";

export const APP_LOGO =
  import.meta.env.VITE_APP_LOGO ||
  "https://placehold.co/128x128/E1E7EF/1F2937?text=App";

// Generate login URL at runtime so redirect URI reflects the current origin.
export function getLoginUrl() {
  // ใช้ import.meta.env สำหรับ client-side
  const base = import.meta.env.VITE_OAUTH_PORTAL_URL || "";

  if (!base) {
    // ถ้าไม่มีค่า ให้คืนค่าว่างหรือ null แทนการสร้าง URL ผิดพลาด
    return null;
  }

  try {
    // ปรับ path ตามโปรเจค ถ้าจำเป็น
    return new URL("/auth/oidc/login", base).toString();
  } catch (err) {
    console.warn("getLoginUrl: invalid base url", base, err);
    return null;
  }
}