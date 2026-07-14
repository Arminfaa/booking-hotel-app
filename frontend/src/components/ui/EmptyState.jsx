import { Link } from "react-router-dom";
import { Button, Empty, Result } from "antd";

export default function EmptyState({
  title,
  message,
  actionLabel,
  actionTo,
}) {
  return (
    <div className="animate-[rise_0.65s_cubic-bezier(0.22,1,0.36,1)_both] py-8 text-center">
      <Result
        icon={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />}
        title={title}
        subTitle={message}
        extra={
          actionLabel && actionTo ? (
            <Link to={actionTo}>
              <Button type="primary" size="large">
                {actionLabel}
              </Button>
            </Link>
          ) : null
        }
      />
    </div>
  );
}
