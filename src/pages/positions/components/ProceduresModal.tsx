import React, { useEffect, useState, useCallback } from "react";
import { Modal, Button, Spin, notification, Input, Space } from "antd";
import { IoIosSearch } from "react-icons/io";
import { useGetCiltMstrPositionLevelsByPositionIdQuery } from "../../../services/cilt/assignaments/ciltMstrPositionsLevelsService";
import { ciltMstrService } from "../../../services/cilt/ciltMstrService";

import { CiltMstr } from "../../../data/cilt/ciltMstr/ciltMstr";
import Constants from "../../../utils/Constants";
import Strings from "../../../utils/localizations/Strings";

interface ProceduresModalProps {
  isOpen: boolean;
  onClose: () => void;
  positionId?: string | null;
  positionName?: string | null;
}

const ProceduresModal: React.FC<ProceduresModalProps> = ({
  isOpen,
  onClose,
  positionId,
  positionName,
}) => {
  const [procedures, setProcedures] = useState<CiltMstr[]>([]);
  const [filteredProcedures, setFilteredProcedures] = useState<CiltMstr[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchText(value);
  };

  const { data: ciltAssignments, isLoading: isLoadingAssignments } =
    useGetCiltMstrPositionLevelsByPositionIdQuery(
      positionId ? Number(positionId) : 0,
      {
        skip: !positionId || !isOpen,
        refetchOnMountOrArgChange: true,
      }
    );

  const isLoading = loading || isLoadingAssignments;

  const [getCiltMstrById] = ciltMstrService.useGetCiltMstrByIdMutation();
  const loadData = useCallback(async () => {
    if (!isOpen || !positionId) return;

    try {
      setLoading(true);

      if (ciltAssignments && ciltAssignments.length > 0) {
        const uniqueCiltIds = new Set<number>();
        ciltAssignments.forEach((assignment) => {
          if (assignment.ciltMstrId) {
            uniqueCiltIds.add(assignment.ciltMstrId);
          }
        });

        if (uniqueCiltIds.size === 0) {
          setProcedures([]);
          return;
        }

        const ciltPromises = Array.from(uniqueCiltIds).map(async (ciltId) => {
          try {
            const result = await getCiltMstrById(ciltId.toString()).unwrap();
            return result;
          } catch (_error) {
            return null;
          }
        });

        const ciltDetails = (await Promise.all(ciltPromises)).filter(
          Boolean
        ) as CiltMstr[];

        setProcedures(ciltDetails || []);
      } else {
        setProcedures([]);
      }
    } catch (_error) {
      notification.error({
        message: Strings.error,
        description: Strings.errorOccurred,
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  }, [isOpen, positionId, ciltAssignments, getCiltMstrById]);

  useEffect(() => {
    if (!isOpen) {
      setProcedures([]);
      setFilteredProcedures([]);
      setSearchText("");
      return;
    }

    if (positionId) {
      loadData();
    }
  }, [isOpen, positionId, loadData]);

  useEffect(() => {
    if (!procedures.length) {
      setFilteredProcedures([]);
      return;
    }

    if (!searchText) {
      setFilteredProcedures(procedures);
      return;
    }

    const searchLower = searchText.toLowerCase();
    const filtered = procedures.filter(
      (proc) =>
        proc.ciltName?.toLowerCase().includes(searchLower) ||
        proc.ciltDescription?.toLowerCase().includes(searchLower) ||
        proc.creatorName?.toLowerCase().includes(searchLower)
    );

    setFilteredProcedures(filtered);
  }, [procedures, searchText]);

  const getStatusText = (status: string | null) => {
    if (!status) return Strings.empty;

    if (status === Constants.STATUS_ACTIVE) {
      return Strings.active;
    } else if (status === Constants.STATUS_INACTIVE) {
      return Strings.inactive;
    } else {
      return status;
    }
  };

  return (
    <Modal
      title={
        positionName
          ? `${Strings.ciltProceduresSB}: ${positionName}`
          : Strings.ciltProceduresSB
      }
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          {Strings.close}
        </Button>,
      ]}
      destroyOnHidden={true}
      maskClosable={false}
      centered={true}
      width={600}
    >
      {!isLoading && procedures.length > 0 && (
        <div className="flex flex-col md:flex-row flex-wrap items-center md:justify-between w-full mb-4">
          <div className="flex flex-col md:flex-row items-center flex-1 mb-1 md:mb-0">
            <Space className="w-full md:w-auto mb-1 md:mb-0">
              <Input
                className="w-full"
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={Strings.search}
                addonAfter={<IoIosSearch />}
              />
            </Space>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <Spin size="large" />
          <p className="mt-4 text-gray-500">{Strings.loading}</p>
        </div>
      ) : procedures.length > 0 ? (
        <div className="px-2">
          {filteredProcedures.length === 0 && searchText && (
            <div className="flex flex-col items-center justify-center py-6">
              <p className="text-gray-500">{Strings.notSpecified}</p>
            </div>
          )}

          <div className="max-h-[400px] overflow-auto">
            {filteredProcedures.map((procedure) => (
              <div
                key={procedure.id}
                className="mb-4 p-4 border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <h3 className="text-lg font-semibold text-primary mb-2">
                  {procedure.ciltName}
                </h3>

                <div className="grid grid-cols-1 gap-2">
                  <p className="text-sm">
                    <span className="font-bold">{Strings.description}: </span>
                    {procedure.ciltDescription || Strings.notSpecified}
                  </p>

                  <p className="text-sm">
                    <span className="font-bold">{Strings.status}: </span>
                    <span
                      className={`${
                        procedure.status === Constants.STATUS_ACTIVE
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {getStatusText(procedure.status)}
                    </span>
                  </p>

                  <p className="text-sm">
                    <span className="font-bold">{Strings.createdBy}: </span>
                    {procedure.creatorName || Strings.notSpecified}
                  </p>

                  {procedure.standardTime && (
                    <p className="text-sm">
                      <span className="font-bold">
                        {Strings.standardTime}:{" "}
                      </span>
                      {procedure.standardTime} {Strings.seconds}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="text-gray-400 text-5xl mb-4">
            <i className="fas fa-clipboard-list"></i>
          </div>
          <p className="text-gray-500 text-lg">{Strings.noProceduresFound}</p>
        </div>
      )}
    </Modal>
  );
};

export default ProceduresModal;
