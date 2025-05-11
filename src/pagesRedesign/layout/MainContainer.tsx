import React from "react";
import { isRedesign } from "../../utils/Extensions";
import PageTitleTag from "../../components/PageTitleTag";
import PageTitle from "../../components/PageTitle";
import { Button, Input, Space } from "antd";
import { IoIosSearch } from "react-icons/io";
import Strings from "../../utils/localizations/Strings";
import CustomButton from "../../components/CustomButtons";
import Loading from "../components/Loading";
import BackButton from "../components/BackButton";

interface MainContainerProps {
  title: string;
  description?: string;
  content: React.ReactNode;
  enableSearch?: boolean;
  enableCreateButton?: boolean;
  isLoading?: boolean;
  enableBackButton?: boolean;
  createButtonComponent?: React.ReactElement,
  onCreateButtonClick?: () => void;
  onSearchChange?: (value: string) => void;
}

const MainContainer: React.FC<MainContainerProps> = ({ title, description, content, enableSearch, enableCreateButton, enableBackButton ,onCreateButtonClick, onSearchChange, isLoading, createButtonComponent }) => {
    return (
    <div>
        {enableBackButton && <BackButton />}
        <div className="h-full flex flex-col">
        
        {/* Header Section */}
        <div className="flex flex-col gap-2 items-center m-3">
          {isRedesign() ? (
            <PageTitleTag mainText={title} subText={description} />
          ) : (
            <PageTitle mainText={title} subText={description} />
          )}
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
            {enableCreateButton && <div className="flex mb-1 md:mb-0 md:justify-end w-full md:w-auto">
              {isRedesign() ? (
                createButtonComponent ?? <Button
                onClick={onCreateButtonClick}
                className="w-full md:w-auto"
                type="primary"
              >
                {Strings.create}
              </Button>
              ) : (
                <CustomButton
                  type="success"
                  onClick={onCreateButtonClick}
                  className="w-full md:w-auto"
                >
                  {Strings.create}
                </CustomButton>
              )}
            </div>}
          </div>
        </div>
  
        {/* Content Section */}
        <Loading isLoading={isLoading ?? false} />
        {!isLoading && <div className="flex-1">{content}</div>}
      </div>
    </div>
  );
};

export default MainContainer;
