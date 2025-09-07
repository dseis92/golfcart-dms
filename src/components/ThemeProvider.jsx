"use client";
import { createContext, useContext } from "react";
import { ConfigProvider, App as AntdApp } from "antd";
import { themes } from "@/styles/themes";

const ThemeCtx = createContext({ themeKey: "navy", setThemeKey: () => {} });

export function useTheme() {
  return useContext(ThemeCtx);
}

export default function ThemeProvider({ children }) {
  const themeConfig = themes.navy;

  return (
    <ThemeCtx.Provider value={{ themeKey: "navy", setThemeKey: () => {} }}>
      <ConfigProvider theme={{ ...themeConfig }}>
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </ThemeCtx.Provider>
  );
}
