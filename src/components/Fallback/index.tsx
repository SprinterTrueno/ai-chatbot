import { FallbackProps } from "react-error-boundary";
import { Button, Result } from "antd";

const Fallback = (props: FallbackProps) => {
  const { error, resetErrorBoundary } = props;

  return (
    <Result
      status="error"
      title="Something went wrong"
      subTitle={error.message}
      extra={
        <Button type="primary" onClick={resetErrorBoundary}>
          Try again
        </Button>
      }
    />
  );
};

export default Fallback;
