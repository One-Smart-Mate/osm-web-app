import React from 'react';
import Strings from '../../../utils/localizations/Strings';

interface TreeLegendProps {
  showOpl?: boolean;
}

const TreeLegend: React.FC<TreeLegendProps> = ({ showOpl = false }) => {
  return (
    <div className="absolute top-4 left-4 z-10">
      <div className="bg-white rounded-lg shadow-sm p-2 border">
        <div className="text-xs font-semibold mb-1">{Strings.treeSymbology}</div>
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#145695]"></div>
            <span>{Strings.level}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#52c41a]"></div>
            <span>{Strings.position}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#fa8c16]"></div>
            <span>{Strings.procedure}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#722ed1]"></div>
            <span>{Strings.sequence}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FFFF00]"></div>
            <span>{Strings.lastLevel}</span>
          </div>
          {showOpl && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#eb2f96]"></div>
              <span>OPL</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TreeLegend;