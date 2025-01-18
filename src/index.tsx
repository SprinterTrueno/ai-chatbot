import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { ConfigProvider } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import Fallback from "./components/Fallback";
import Routes from "./Routes";
import "dayjs/locale/zh-cn";
import "normalize.css";

const root = createRoot(document.getElementById("root"));

root.render(
  <ConfigProvider locale={zhCN}>
    <ErrorBoundary FallbackComponent={Fallback}>
      <BrowserRouter basename={DEVELOPMENT_ENV ? "" : `/${PROJECT_NAME}`}>
        <Routes />
      </BrowserRouter>
    </ErrorBoundary>
  </ConfigProvider>,
);
