import React from "react";


interface AnatomySectionProps {
  title: string | number | React.ReactNode;
  label: string | number | React.ReactNode;
}


const AnatomySection = ({title, label}: AnatomySectionProps): React.ReactElement => {
  return (
    <div className="bg-gray-50 p-2 rounded flex items-center flex-wrap">
      <span className="text-gray-600 mr-2">{title}:</span>
      <span className="font-semibold">{label}</span>
    </div>
  );
};

export default AnatomySection;
