import { Flex, Spin, Typography } from "antd";

export default function Loader({ label = "Loading..." }) {
  return (
    <Flex
      vertical
      align="center"
      justify="center"
      gap="middle"
      style={{ minHeight: "42vh" }}
      role="status"
      aria-live="polite"
    >
      <Spin size="large" />
      <Typography.Text type="secondary">{label}</Typography.Text>
    </Flex>
  );
}
