import React, { useState } from "react";
import Strings from "../../utils/localizations/Strings";
import { BsChevronDown, BsChevronRight } from "react-icons/bs";

interface AnatomySingleCollapsableProps {
  title?: string;
  children: React.ReactNode;
}

const AnatomySingleCollapsable: React.FC<AnatomySingleCollapsableProps> = ({ title, children }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleCollapse = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
   <>
    <div className="bg-gray-50 p-2 rounded-sm flex items-center flex-wrap"  onClick={toggleCollapse}>
      <div className="mr-2">{isExpanded ? <BsChevronDown /> : <BsChevronRight />}</div>
      <span className="text-gray-600 mr-2">{title ?? Strings.informationDetail}</span>
    </div>
    <div>
      {isExpanded && children}
    </div></>
  );
};

export default AnatomySingleCollapsable;