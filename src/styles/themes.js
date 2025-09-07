import { theme as antdTheme } from "antd";

export const themes = {
  navy: {
    name: "Navy Pro",
    algorithm: [antdTheme.defaultAlgorithm, antdTheme.compactAlgorithm],
    token: {
      colorPrimary: "#1f3a8a",     // deep navy
      colorInfo: "#2563eb",
      colorBgLayout: "#eef2ff",    // soft indigo background
      colorBgContainer: "#ffffff",
      colorText: "#0b1220",
      colorBorder: "#e5e7eb",
      borderRadius: 10,
      controlHeight: 38,
      fontSize: 14,
      fontFamily: "'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    },
    components: {
      Layout: { headerBg: "#ffffff" },
      Menu: { itemBorderRadius: 8, itemSelectedBg: "#e0e7ff", itemSelectedColor: "#1f3a8a" },
      Card: { borderRadiusLG: 12, boxShadow: "0 1px 2px rgba(16,24,40,.06), 0 8px 24px rgba(16,24,40,.06)" },
      Button: { borderRadius: 8, fontWeight: 600 },
      Input: { borderRadius: 10 },
      Table: { borderRadius: 10, headerBg: "#eef2ff" },
      Tabs: { inkBarColor: "#1f3a8a" },
      Tag: { borderRadiusSM: 6 }
    }
  }
};

// Export options in case you re-enable switching later
export const themeOptions = [{ value: "navy", label: "Navy Pro" }];
