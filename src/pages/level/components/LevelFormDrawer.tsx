import React from "react";
import { Drawer, Form, Button } from "antd";
import Strings from "../../../utils/localizations/Strings";
import { useTranslation } from "react-i18next";
import RegisterLevelForm from "./RegisterLevelForm";
import UpdateLevelForm from "./UpdateLevelForm";    
import Constants from "../../../utils/Constants";



interface LevelFormDrawerProps {
  drawerVisible: boolean;
  drawerType: "create" | "update" | "position" | "clone" | null;
  drawerPlacement: "right" | "bottom";
  createForm: any;
  updateForm: any;
  positionForm?: any;
  formData: any;
  isLoading: boolean;
  handleDrawerClose: () => void;
  handleSubmit: (values: any) => void;
  selectedNodeName?: string;
  positionData?: any;  
}


const LevelFormDrawer: React.FC<LevelFormDrawerProps> = ({
  drawerVisible,
  drawerType,
  drawerPlacement,
  createForm,
  updateForm,
  positionForm,
  formData,
  isLoading,
  handleDrawerClose,
  handleSubmit,
  selectedNodeName = "",
}) => {
  const { t } = useTranslation();
  
  let title = "";
  if (drawerType === Constants.optionCreate) {
    title = t(Strings.levelsTreeOptionCreate).concat(
      selectedNodeName ? ` ${t(Strings.for)} "${selectedNodeName}"` : ""
    );
  } else if (drawerType === Constants.optionUpdate) {
    title = t(Strings.levelsTreeOptionEdit).concat(
      selectedNodeName ? ` "${selectedNodeName}" ${t(Strings.level)}` : ""
    );
  } else if (drawerType === Constants.optionPosition) {
    title = t(Strings.createPosition);
  }

  return (
    <Drawer
      title={title}
      placement={drawerPlacement}
      height={drawerPlacement === "bottom" ? "50vh" : undefined}
      width={drawerPlacement === "right" ? 400 : undefined}
      onClose={handleDrawerClose}
      open={drawerVisible}
      destroyOnClose
      closable={true}
      className="drawer-responsive"
      mask={false}
      maskClosable={false}
    >
      <Form.Provider
        onFormFinish={async (_name, { values }) => {
          await handleSubmit(values);
        }}
      >
        <div className="drawer-content">
          {drawerType === Constants.optionCreate ? (
            <RegisterLevelForm form={createForm} />
          ) : drawerType === Constants.optionUpdate ? (
            <UpdateLevelForm form={updateForm} initialValues={formData} />
          ) : null}
          <div className="mt-4 flex justify-end">
            <Button
              type="primary"
              loading={isLoading}
              onClick={() => {
                if (drawerType === Constants.optionCreate) {
                  createForm.submit();
                } else if (drawerType === Constants.optionUpdate) {
                  updateForm.submit();
                } else if (drawerType === Constants.optionPosition && positionForm) {
                  positionForm.submit();
                }
              }}
            >
              {t(Strings.save)}
            </Button>
          </div>
        </div>
      </Form.Provider>
    </Drawer>
  );
};

export default LevelFormDrawer;
