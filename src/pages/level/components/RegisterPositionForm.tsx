import { Form, FormInstance, Input, Select } from "antd";
import Strings from "../../../utils/localizations/Strings";
import { LuTextCursor } from "react-icons/lu";
import { BsCardText } from "react-icons/bs";
import { CiBarcode } from "react-icons/ci";
import { FaIndustry } from "react-icons/fa";

interface FormProps {
  form: FormInstance;
}

const RegisterPositionForm = ({ form }: FormProps) => {
  // Opcional: se pueden cargar opciones desde el store o de un hook si fuera necesario.
  const siteTypes = [
    { value: "Headquarters", label: "Headquarters" },
    { value: "Branch", label: "Branch" },
  ];

  return (
    <Form form={form} layout="vertical" className="flex flex-col gap-1 w-full">
      <Form.Item
        name="name"
        rules={[{ required: true, message: Strings.name }]}
      >
        <Input
          size="large"
          maxLength={45}
          addonBefore={<LuTextCursor />}
          placeholder="Name"
        />
      </Form.Item>

      <Form.Item
        name="description"
        rules={[{ required: false }]}
      >
        <Input
          size="large"
          maxLength={100}
          addonBefore={<BsCardText />}
          placeholder="Description"
        />
      </Form.Item>

      <Form.Item
        name="siteName"
        rules={[{ required: false }]}
      >
        <Input
          size="large"
          maxLength={100}
          addonBefore={<FaIndustry />}
          placeholder="Site Name"
        />
      </Form.Item>

      <Form.Item
        name="siteType"
        rules={[{ required: false }]}
      >
        <Select
          size="large"
          placeholder="Site Type"
          options={siteTypes}
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
        />
      </Form.Item>

      <Form.Item
        name="areaName"
        rules={[{ required: false }]}
      >
        <Input
          size="large"
          maxLength={100}
          placeholder="Area Name"
        />
      </Form.Item>

      <Form.Item
        name="route"
        rules={[{ required: false }]}
      >
        <Input
          size="large"
          maxLength={250}
          addonBefore={<CiBarcode />}
          placeholder="Route"
        />
      </Form.Item>

      {/* Campo opcional para Level Name */}
      <Form.Item name="levelName" rules={[{ required: false }]}>
        <Input
          size="large"
          maxLength={45}
          placeholder="Level Name"
        />
      </Form.Item>

      {/* Campo opcional para Status */}
      <Form.Item name="status" rules={[{ required: false }]}>
        <Select
          size="large"
          placeholder="Status"
          options={[
            { value: "A", label: "Active" },
            { value: "I", label: "Inactive" },
          ]}
        />
      </Form.Item>
    </Form>
  );
};

export default RegisterPositionForm;
