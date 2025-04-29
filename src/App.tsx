import { ConfigProvider, App as AntdApp } from "antd";
import BaseLayout from "./pages/layouts/BaseLayout";
import { Route, Routes } from "react-router-dom";
import {
  adminRoutes,
  localAdminRoutes,
  sysAdminRoutes,
} from "./pages/routes/Routes";
import LoginPage from "./pages/auth/LoginV2";
import PrivateRoutes from "./components/PrivateRoutes";
import ResetPassword from "./pages/auth/ResetPassword";
import { ResetPasswordRoute, UnauthorizedRoute } from "./utils/Routes";
import Unauthorized from "./pages/errors/Unauthorized";
import NotFound from "./pages/errors/NotFound";
import PublicCardDetails from "./pages/carddetails/PublicCardDetails";
import {
  commonRoutes,
  ihSisAdminRoutesV2,
  localAdminRoutesV2,
  sisAdminRoutesV2,
} from "./pagesRedesign/routes/RoutesV2";
import Constants from "./utils/Constants";
import { isRedesign } from "./utils/Extensions";
import { listenForBackgroundMessages } from "./config/firebaseMessaging";
import React, { useEffect } from "react";
import ProtectedRoutes from "./components/ProtectedRoutes";
const BaseLayoutRedesign = React.lazy(() => import("./pagesRedesign/layout/BaseLayoutRedesign"));
function App() {
  useEffect(() => {
    listenForBackgroundMessages();
  });

  const getTheme = () => {
    let theme: any;
    if (isRedesign()) {
      theme = {
        token: {
          colorPrimary: "#1890ff",
          colorLinkHover: "#1890ff",
          colorLinkActive: "#e6f7ff",
          linkHoverDecoration: "underline",
          colorBgLayout: "#e2e8f0",
          colorPrimaryBgHover: "#e6f7ff",
          colorPrimaryHover: "#1890ff",
        },
        components: {
          Card: {
            colorBgContainer: "white",
            colorPrimary: "white",
            colorTextHeading: "#e6f7ff",
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
      };
    } else {
      theme = {
        token: {
          colorPrimary: "#061178",
          colorLinkHover: "#061178",
          colorLinkActive: "#061178",
          linkHoverDecoration: "underline",
          colorBgLayout: "#e2e8f0",
        },
        components: {
          Card: {
            colorBgContainer: "white",
            colorPrimary: "white",
            colorTextHeading: "#061178",
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
      };
    }
    return theme;
  };

  return (
    <ConfigProvider theme={getTheme()}>
      <AntdApp>
        <Routes>
          <Route
            path="/external/card/:cardId/details"
            element={<PublicCardDetails />}
          />

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

          <Route element={<ProtectedRoutes />}>
            <Route
              path={Constants.ROUTES_PATH.dashboard}
              element={<BaseLayoutRedesign />}
            >
              {commonRoutes.map((value, index) => (
                <Route key={index} path={value.path} element={value.element} />
              ))}
              {localAdminRoutesV2.map((value, index) => (
                <Route key={index} path={value.path} element={value.element} />
              ))}
              {sisAdminRoutesV2.map((value, index) => (
                <Route key={index} path={value.path} element={value.element} />
              ))}

              {ihSisAdminRoutesV2.map((value, index) => (
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
