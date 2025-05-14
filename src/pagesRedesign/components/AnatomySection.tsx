import React from "react";
import useDarkMode from "../../utils/hooks/useDarkMode";


interface AnatomySectionProps {
  title: string | number | React.ReactNode;
  label: string | number | React.ReactNode;
  icon?: React.ReactNode;
  justify?: boolean;
}


const AnatomySection = ({title, label, icon, justify}: AnatomySectionProps): React.ReactElement => {

  const isDarkMode = useDarkMode();

  return (
    <div className={
      `${isDarkMode ? '' : 'bg-gray-50'} p-2 rounded-sm flex items-center flex-wrap${justify ? ' justify-between' : ''}`
    }>
      {icon && <div className="mr-2">{icon}</div>}
      <span className={`mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{title}:</span>
      <span className="font-semibold">{label}</span>
    </div>
  );
};

export default AnatomySection;
