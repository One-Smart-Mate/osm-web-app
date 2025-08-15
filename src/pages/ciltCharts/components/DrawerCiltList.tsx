import React from "react";
import { Drawer, Typography, List, Card, Tag, Divider } from "antd";
import { ClockCircleOutlined, UserOutlined, CalendarOutlined } from "@ant-design/icons";
import Strings from "../../../utils/localizations/Strings";
import { CiltMstr } from "../../../data/cilt/ciltMstr/ciltMstr";

interface DrawerCiltListProps {
  open: boolean;
  onClose: () => void;
  cilts: CiltMstr[];
  isLoading: boolean;
  title: string;
  date: string;
  chartType: string;
}

const DrawerCiltList: React.FC<DrawerCiltListProps> = ({
  open,
  onClose,
  cilts,
  isLoading,
  title,
  date,
  chartType,
}) => {
  const formatTime = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <Drawer
      closable
      destroyOnHidden
             title={
         <div className="text-sm font-medium text-black">
           <Typography.Title level={5}>{title}</Typography.Title>
           <div className="flex flex-wrap">
             <Typography.Text>
               {Strings.date}
               {Strings.colon} <span className="font-normal">{date}</span>
             </Typography.Text>
           </div>
           <div className="flex flex-wrap">
             <Typography.Text>
               {Strings.type} {Strings.colon}
               <span className="font-normal">{chartType}</span>
             </Typography.Text>
           </div>
         </div>
       }
      placement="right"
      open={open}
      onClose={onClose}
      loading={isLoading}
      width={600}
    >
      <List
        dataSource={cilts}
        renderItem={(cilt) => (
          <List.Item className="border-none p-0 mb-4">
            <Card 
              className="w-full shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              size="small"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Typography.Title level={5} className="mb-1 text-blue-600">
                      {cilt.ciltName || "Sin nombre"}
                    </Typography.Title>
                    <Tag color={cilt.status === 'A' ? 'green' : 'red'}>
                      {cilt.status === 'A' ? 'Activo' : 'Inactivo'}
                    </Tag>
                  </div>
                  <div className="text-right">
                    <Typography.Text className="text-gray-500 text-xs">
                      ID: {cilt.id}
                    </Typography.Text>
                  </div>
                </div>

                {/* Description */}
                {cilt.ciltDescription && (
                  <div>
                    <Typography.Text className="text-gray-700 text-sm">
                      {cilt.ciltDescription}
                    </Typography.Text>
                  </div>
                )}

                <Divider className="my-2" />

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {/* Standard Time */}
                  <div className="flex items-center gap-2">
                    <ClockCircleOutlined className="text-blue-500" />
                    <Typography.Text>
                      <span className="font-medium">{Strings.standardTime}:</span>{" "}
                      {formatTime(cilt.standardTime)}
                    </Typography.Text>
                  </div>

                  {/* Creator */}
                  <div className="flex items-center gap-2">
                    <UserOutlined className="text-green-500" />
                    <Typography.Text>
                      <span className="font-medium">{Strings.creator}:</span>{" "}
                      {cilt.creatorName || "N/A"}
                    </Typography.Text>
                  </div>

                  {/* Reviewer */}
                  {cilt.reviewerName && (
                    <div className="flex items-center gap-2">
                      <UserOutlined className="text-orange-500" />
                      <Typography.Text>
                        <span className="font-medium">{Strings.reviewer}:</span>{" "}
                        {cilt.reviewerName}
                      </Typography.Text>
                    </div>
                  )}

                  {/* Due Date */}
                  {cilt.ciltDueDate && (
                    <div className="flex items-center gap-2">
                      <CalendarOutlined className="text-red-500" />
                      <Typography.Text>
                        <span className="font-medium">{Strings.dueDate}:</span>{" "}
                        {formatDate(cilt.ciltDueDate)}
                      </Typography.Text>
                    </div>
                  )}

                  {/* Last Used */}
                  {cilt.dateOfLastUsed && (
                    <div className="flex items-center gap-2">
                      <CalendarOutlined className="text-gray-500" />
                      <Typography.Text>
                        <span className="font-medium">{Strings.lastUsed}:</span>{" "}
                        {formatDate(cilt.dateOfLastUsed)}
                      </Typography.Text>
                    </div>
                  )}

                  {/* Order */}
                  <div className="flex items-center gap-2">
                    <Typography.Text>
                      <span className="font-medium">{Strings.order}:</span>{" "}
                      {cilt.order || "N/A"}
                    </Typography.Text>
                  </div>
                </div>
              </div>
            </Card>
          </List.Item>
        )}
        locale={{
          emptyText: Strings.noCiltstOShow
        }}
      />
    </Drawer>
  );
};

export default DrawerCiltList;
