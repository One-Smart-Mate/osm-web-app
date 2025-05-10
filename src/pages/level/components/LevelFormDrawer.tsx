import React from "react";
import { Drawer, Form, Button } from "antd";
import Strings from "../../../utils/localizations/Strings";
import RegisterLevelForm from "./RegisterLevelForm";
import UpdateLevelForm from "./UpdateLevelForm";    
import Constants from "../../../utils/Constants";



interface LevelFormDrawerProps {
  drawerVisible: boolean;
  drawerType: "create" | "update" | "position" | null;
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
  
  let title = "";
  if (drawerType === Constants.optionCreate) {
    title = Strings.levelsTreeOptionCreate.concat(
      selectedNodeName ? ` ${Strings.for} "${selectedNodeName}"` : ""
    );
  } else if (drawerType === Constants.optionUpdate) {
    title = Strings.levelsTreeOptionEdit.concat(
      selectedNodeName ? ` "${selectedNodeName}" ${Strings.level}` : ""
    );
  } else if (drawerType === Constants.optionPosition) {
    title = Strings.createPosition;
  }

  return (
    <Drawer
      title={title}
      placement={drawerPlacement}
      height={drawerPlacement === "bottom" ? "50vh" : undefined}
      width={drawerPlacement === "right" ? 400 : undefined}
      onClose={handleDrawerClose}
      open={drawerVisible}
      destroyOnHidden
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
              {Strings.save}
            </Button>
          </div>
        </div>
      </Form.Provider>
    </Drawer>
  );
};

export default LevelFormDrawer;
