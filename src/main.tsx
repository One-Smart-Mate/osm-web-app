import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./core/store";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./config/i18n";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <I18nextProvider i18n={i18n}>
  <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </Provider>
  </I18nextProvider>
);
