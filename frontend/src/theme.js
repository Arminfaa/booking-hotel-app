import { theme } from "antd";

/** Cove dark theme — deep night harbour with seafoam accent */
export const coveTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#5ec4a8",
    colorInfo: "#5ec4a8",
    colorSuccess: "#5ec4a8",
    colorWarning: "#c9a87c",
    colorError: "#e07a5f",
    colorBgBase: "#070e14",
    colorBgContainer: "#0f1a24",
    colorBgElevated: "#13202c",
    colorBgLayout: "#070e14",
    colorBorder: "rgba(148, 183, 200, 0.14)",
    colorBorderSecondary: "rgba(148, 183, 200, 0.08)",
    colorText: "#e8eef2",
    colorTextSecondary: "#9ab0c0",
    colorTextTertiary: "#7a8fa3",
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,
    fontFamily: '"Manrope", system-ui, sans-serif',
    fontSize: 15,
    controlHeightLG: 48,
    wireframe: false,
  },
  components: {
    Layout: {
      headerBg: "rgba(7, 14, 20, 0.72)",
      bodyBg: "transparent",
      footerBg: "transparent",
      siderBg: "#0f1a24",
    },
    Menu: {
      darkItemBg: "transparent",
      darkItemSelectedBg: "rgba(94, 196, 168, 0.14)",
      darkItemHoverBg: "rgba(94, 196, 168, 0.08)",
      itemBorderRadius: 10,
    },
    Card: {
      colorBgContainer: "rgba(15, 26, 36, 0.88)",
      colorBorderSecondary: "rgba(148, 183, 200, 0.12)",
    },
    Button: {
      primaryShadow: "0 8px 24px rgba(94, 196, 168, 0.22)",
      defaultShadow: "none",
      fontWeight: 600,
    },
    Input: {
      activeBorderColor: "#5ec4a8",
      hoverBorderColor: "rgba(94, 196, 168, 0.55)",
      colorBgContainer: "rgba(7, 14, 20, 0.55)",
    },
    DatePicker: {
      colorBgContainer: "rgba(7, 14, 20, 0.55)",
    },
    Select: {
      colorBgContainer: "rgba(7, 14, 20, 0.55)",
    },
    InputNumber: {
      colorBgContainer: "rgba(7, 14, 20, 0.55)",
    },
    Modal: {
      contentBg: "#13202c",
      headerBg: "#13202c",
    },
    Drawer: {
      colorBgElevated: "#0f1a24",
    },
    Tag: {
      defaultBg: "rgba(94, 196, 168, 0.12)",
      defaultColor: "#5ec4a8",
    },
    Typography: {
      titleMarginBottom: "0.35em",
      titleMarginTop: 0,
    },
  },
};
