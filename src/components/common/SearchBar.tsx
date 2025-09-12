import React from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Strings from '../../utils/localizations/Strings';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (_value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = Strings.searchBarDefaultPlaceholder, onSearch }) => {
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  return (
    <Input
      placeholder={placeholder}
      onChange={handleSearch}
      prefix={<SearchOutlined />}
      allowClear
    />
  );
};

export default SearchBar;
