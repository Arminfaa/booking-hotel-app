import { Flex, Spin, Typography } from "antd";

export default function Loader({ label = "Loading...", fullPage = true }) {
  return (
    <Flex
      vertical
      align="center"
      justify="center"
      gap="middle"
      className={
        fullPage
          ? "w-full min-h-[calc(100dvh-185px)] lg:min-h-[calc(100dvh-185px)]"
          : "w-full min-h-[42dvh]"
      }
      role="status"
      aria-live="polite"
    >
      <Spin size="large" />
      <Typography.Text type="secondary">{label}</Typography.Text>
    </Flex>
  );
}
