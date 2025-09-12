import {Form, FormInstance, Input, Select } from "antd";
import Strings from "../../../utils/localizations/Strings";
import AnatomyTooltip from "../../components/AnatomyTooltip";
import { useEffect } from "react";
import { CiltType } from "../../../data/cilt/ciltTypes/ciltTypes";

interface CiltTypesFormCardProps {
    form: FormInstance;
    enableStatus: boolean;
    initialValues?: CiltType;
    onSubmit: (_values: any) => void;
   
}

const CiltTypesFormCard = ({
    form,
    enableStatus,
    initialValues,
    onSubmit,
}: CiltTypesFormCardProps): React.ReactElement => {

    useEffect(() => {
        console.log(initialValues);
    }, []);


    const statusOptions = [
        { value: Strings.activeStatus, label: Strings.active, key: 1 },
        { value: Strings.inactiveValue, label: Strings.inactive, key: 2 },
    ];

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue(initialValues);
        }
    }, [initialValues]);


    return (

        <Form form={form}         onFinish={(values) => {
            if (values.color && values.color.startsWith('#')) {
              values.color = values.color.substring(1);
            }
            onSubmit(values);
          }} layout="vertical">
            <div className="flex flex-col">
                <div className="flex flex-row flex-wrap">

                    <Form.Item name="id" hidden>
                        <Input />
                    </Form.Item>


                    <Form.Item
                        name="name"
                        validateFirst
                        label={Strings.name}
                        className="flex-1"
                        rules={[{ required: true, message: Strings.obligatoryName }]}
                    >
                        <Input
                            placeholder={Strings.name}
                        />

                    </Form.Item>

                    <AnatomyTooltip title={Strings.nameCiltTypeToolTip} />

                    
                {enableStatus && (
                    <Form.Item
                        name="status"
                        label={Strings.status}
                        validateFirst
                        rules={[{ required: true, message: Strings.requiredStatus }]}
                        className="w-60"
                    >
                        <Select
                            placeholder={Strings.statusPlaceholder}
                            options={statusOptions}
                        />
                    </Form.Item>
                )}


                    <Form.Item
                        name="color"
                        validateFirst
                        label={Strings.color}
                        className="flex-1"
                        rules={[{ required: true, message: Strings.requiredColor}]}
                    >

                        <Input type="color"
                            placeholder={Strings.color}
                        />
                    </Form.Item>
                    <AnatomyTooltip title={Strings.ciltTypeColorTooltip} />
                </div>


            </div>
        </Form>
    );
};
export default CiltTypesFormCard;
