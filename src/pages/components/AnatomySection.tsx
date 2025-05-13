import React from "react";


interface AnatomySectionProps {
  title: string | number | React.ReactNode;
  label: string | number | React.ReactNode;
  icon?: React.ReactNode;
  justify?: boolean;
}


const AnatomySection = ({title, label, icon, justify}: AnatomySectionProps): React.ReactElement => {
  return (
    <div className={justify ? "bg-gray-50 p-2 rounded-sm flex items-center flex-wrap justify-between" : "bg-gray-50 p-2 rounded-sm flex items-center flex-wrap"}>
      {icon && <div className="mr-2">{icon}</div>}
      <span className="text-gray-600 mr-2">{title}:</span>
      <span className="font-semibold">{label}</span>
    </div>
  );
};

export default AnatomySection;
