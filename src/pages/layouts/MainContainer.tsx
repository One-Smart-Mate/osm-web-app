import React from "react";
import PageTitle from "../components/PageTitle";
import { Button, Input, Space, Tooltip } from "antd";
import { IoIosSearch } from "react-icons/io";
import { ReloadOutlined } from "@ant-design/icons";
import Strings from "../../utils/localizations/Strings";
import Loading from "../components/Loading";
import BackButton from "../components/BackButton";

interface MainContainerProps {
  title: string;
  description?: string;
  content: React.ReactNode;
  enableSearch?: boolean;
  enableCreateButton?: boolean;
  enableRefreshButton?: boolean;
  isLoading?: boolean;
  enableBackButton?: boolean;
  createButtonComponent?: React.ReactElement,
  onCreateButtonClick?: () => void;
  onRefresh?: () => void;
  onSearchChange?: (_value: string) => void;
  disableContentScroll?: boolean;
}

const MainContainer: React.FC<MainContainerProps> = ({ title, description, content, enableSearch, enableCreateButton, enableRefreshButton, enableBackButton, onCreateButtonClick, onRefresh, onSearchChange, isLoading, createButtonComponent, disableContentScroll }) => {
    return (
    <div>
        {enableBackButton && <BackButton />}
        <div className="h-full flex flex-col">

        {/* Header Section */}
        <div className="flex flex-col gap-2 items-center m-3">
        <PageTitle mainText={title} subText={description} />
          <div className="flex flex-col md:flex-row flex-wrap items-center md:justify-between w-full">
            <div className="flex flex-col md:flex-row items-center flex-1 mb-1 md:mb-0">
              {enableSearch && (
                <Space className="w-full md:w-auto mb-1 md:mb-0">
                  <Input
                    className="w-full"
                    onChange={(e) => {
                      onSearchChange && onSearchChange(e.target.value);
                    }}
                    placeholder={Strings.search}
                    addonAfter={<IoIosSearch />}
                  />
                </Space>
              )}
            </div>
            <div className="flex gap-2 mb-1 md:mb-0 md:justify-end w-full md:w-auto">
              {enableRefreshButton && (
                <Tooltip title={Strings.refresh}>
                  <Button
                    onClick={onRefresh}
                    icon={<ReloadOutlined spin={isLoading} />}
                    loading={isLoading}
                  />
                </Tooltip>
              )}
              {enableCreateButton && (
                createButtonComponent ?? <Button
                  onClick={onCreateButtonClick}
                  className="w-full md:w-auto"
                  type="primary"
                >
                  {Strings.create}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <Loading isLoading={isLoading ?? false} />
        {!isLoading && <div className={disableContentScroll ? "flex-1" : "flex-1 overflow-auto"}>{content}</div>}
      </div>
    </div>
  );
};

export default MainContainer;
