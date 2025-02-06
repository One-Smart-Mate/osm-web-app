import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import Constants from "../../utils/Constants";

const LanguageDropdown = () => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(
    i18n.language.split("-")[0]
  );

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    i18n.changeLanguage(e.key);
    setCurrentLanguage(e.key);
    window.location.reload();
  };

  const items: MenuProps["items"] = [
    {
      key: "es",
      label: (
        <div className="cursor-pointer flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-200">
          <img
            src="https://flagcdn.com/w40/mx.png"
            alt="México"
            className="w-6 h-4"
          />

          <span>{Constants.esOption}</span>
        </div>
      ),
    },
    {
      key: "en",
      label: (
        <div className="cursor-pointer flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-200">
          <img
            src="https://flagcdn.com/w40/us.png"
            alt="English"
            className="w-6 h-4"
          />
          <span>{Constants.enOption}</span>
        </div>
      ),
    },
  ];

  useEffect(() => {
    setCurrentLanguage(i18n.language.split("-")[0]);
  }, [i18n.language]);

  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  return (
    <Dropdown menu={menuProps}>
      <div
        className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg 
          hover:bg-gray-300 hover:shadow transition duration-300 ease-in-out"
      >
        {currentLanguage === "es" ? (
          <img
            src="https://flagcdn.com/w40/mx.png"
            alt="Español"
            className="w-6 h-4"
          />
        ) : (
          <img
            src="https://flagcdn.com/w40/us.png"
            alt="English"
            className="w-6 h-4"
          />
        )}
        <span>{currentLanguage === "es" ? "Español" : "English"}</span>
      </div>
    </Dropdown>
  );
};

export default LanguageDropdown;
