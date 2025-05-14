import { ConfigProvider, App as AntdApp, theme } from "antd";
import { Route, Routes } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import ResetPassword from "./pages/auth/ResetPassword";
import { ResetPasswordRoute, UnauthorizedRoute } from "./utils/Routes";
import Unauthorized from "./pages/errors/Unauthorized";
import NotFound from "./pages/errors/NotFound";
import PublicTagDetails from "./pages/tagdetails/PublicTagDetails";
import Constants from "./utils/Constants";
import { listenForBackgroundMessages } from "./config/firebaseMessaging";
import React, { useEffect } from "react";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import { routes } from "./routes/Routes";
const BaseLayout = React.lazy(() => import("./pages/layouts/BaseLayout"));

function App() {

  const [isDarkMode] = React.useState<boolean>(() => {
    const storedMode = localStorage.getItem(Constants.SESSION_KEYS.darkMode);
    return storedMode ? JSON.parse(storedMode) : false;
  });

  useEffect(() => {
    listenForBackgroundMessages();
  });

  const getTheme = (isDarkMode: boolean) => {
    return {
     token: {
        colorPrimary: "#1890ff",
        colorLinkHover: isDarkMode ? '#177DDC': "#e6f7ff",
        colorLinkActive: isDarkMode ? '#177DDC':"#e6f7ff",
        linkHoverDecoration: "underline",
        colorBgLayout: "#e2e8f0",
        colorPrimaryBgHover: "#e6f7ff",
        colorPrimaryHover: "#1890ff",
      },
      components: {
        Table: {
          headerBg: "#1890ff",
          headerColor: "white",
          headerSortHoverBg: "#1890ff",
          headerSortActiveBg: "#1890ff",
        },
      },
      algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm
    };
  };


  return (
    <ConfigProvider theme={getTheme(isDarkMode)}>
      <AntdApp>
        <Routes>
          <Route
            path="/external/card/:cardId/details"
            element={<PublicTagDetails />}
          />
          <Route index path="/" element={<LoginPage />} />
          <Route path={ResetPasswordRoute} element={<ResetPassword />} />
          <Route element={<ProtectedRoutes />}>
            <Route
              path={Constants.ROUTES_PATH.dashboard}
              element={<BaseLayout />}
            >
              {routes.map((value, index) => (
                <Route key={index} path={value.path} element={value.element} />
              ))}
            </Route>
          </Route>

          <Route path={UnauthorizedRoute} element={<Unauthorized />} />
          <Route path={"*"} element={<NotFound />} />
          <Route />
        </Routes>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
