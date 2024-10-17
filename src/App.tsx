import { ConfigProvider } from "antd";
import BaseLayout from "./pages/layouts/BaseLayout";
import { Route, Routes } from "react-router-dom";
import {
  adminRoutes,
  localAdminRoutes,
  sysAdminRoutes,
} from "./pages/routes/Routes";
import LoginPage from "./pages/auth/Login";
import PrivateRoutes from "./components/PrivateRoutes";
import ResetPassword from "./pages/auth/ResetPassword";
import { ResetPasswordRoute, UnauthorizedRoute } from "./utils/Routes";
import Unauthorized from "./pages/errors/Unauthorized";
import NotFound from "./pages/errors/NotFound";

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#e73773",
          colorLinkHover: "#e73773",
          colorLinkActive: "#e73773",
          linkHoverDecoration: "underline",
          colorBgLayout: "#e2e8f0",
        },
        components: {
          Card: {
            colorBgContainer: "#001529",
            colorPrimary: "white",
            colorTextHeading: "white",
          },
          Table: {
            headerBg: "#001529",
            headerColor: "white",
            headerSortHoverBg: "#011e39",
            headerSortActiveBg: "#011e39",
          },
          Modal: {
            colorIcon: "black",
            colorIconHover: "#e73773",
          },
        },
      }}
    >
      <Routes>
        <Route index path="/" element={<LoginPage />} />
        <Route path={ResetPasswordRoute} element={<ResetPassword />} />
        <Route element={<PrivateRoutes />}>
          <Route element={<BaseLayout />}>
            {adminRoutes.map((value, index) => (
              <Route
                key={index}
                path={value.fullPath}
                element={value.element}
              />
            ))}
            {sysAdminRoutes.map((value, index) => (
              <Route
                key={index}
                path={value.fullPath}
                element={value.element}
              />
            ))}
            {localAdminRoutes.map((value, index) => (
              <Route
                key={index}
                path={value.fullPath}
                element={value.element}
              />
            ))}
          </Route>
        </Route>
        <Route path={UnauthorizedRoute} element={<Unauthorized />} />
        <Route path={"*"} element={<NotFound />} />
      </Routes>
    </ConfigProvider>
  );
}

export default App;

