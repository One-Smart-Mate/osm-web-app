import React from "react";
import { Drawer, Form, Button } from "antd";
import Strings from "../../../utils/localizations/Strings";
import RegisterLevelForm from "./RegisterLevelForm";
import UpdateLevelForm from "./UpdateLevelForm";
import RegisterPositionForm from "./RegisterPositionForm";


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
  if (drawerType === "create") {
    title = Strings.levelsTreeOptionCreate.concat(
      selectedNodeName ? ` ${Strings.for} "${selectedNodeName}"` : ""
    );
  } else if (drawerType === "update") {
    title = Strings.levelsTreeOptionEdit.concat(
      selectedNodeName ? ` "${selectedNodeName}" ${Strings.level}` : ""
    );
  } else if (drawerType === "position") {
    title = "Create position";
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
          {drawerType === "create" ? (
            <RegisterLevelForm form={createForm} />
          ) : drawerType === "update" ? (
            <UpdateLevelForm form={updateForm} initialValues={formData} />
          ) : drawerType === "position" && positionForm ? (
            <RegisterPositionForm form={positionForm} />
          ) : null}
          <div className="mt-4 flex justify-end">
            <Button
              type="primary"
              loading={isLoading}
              onClick={() => {
                if (drawerType === "create") {
                  createForm.submit();
                } else if (drawerType === "update") {
                  updateForm.submit();
                } else if (drawerType === "position" && positionForm) {
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
