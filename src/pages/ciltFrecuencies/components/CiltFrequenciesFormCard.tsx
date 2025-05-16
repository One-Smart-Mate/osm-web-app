import { Form, FormInstance, Input, Select } from "antd";
import Strings from "../../../utils/localizations/Strings";
import AnatomyTooltip from "../../components/AnatomyTooltip";
import { useEffect } from "react";
import { CiltFrequency } from "../../../data/cilt/ciltFrequencies/ciltFrequencies";

interface CiltFrequenciesFormCardProps {
    form: FormInstance;
    initialValues?: CiltFrequency;
    onSubmit: (values: any) => void;
    enableStatus: boolean;
}

const CiltFrequenciesFormCard = ({
    form,
    initialValues,
    onSubmit,
    enableStatus,
}: CiltFrequenciesFormCardProps): React.ReactElement => {


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
        <Form form={form} onFinish={onSubmit} layout="vertical">
            <div className="flex flex-col">
                <div className="flex flex-row flex-wrap">

                    <Form.Item name="id" hidden>
                        <Input />
                    </Form.Item>


                    <Form.Item
                        name="frecuencyCode"
                        validateFirst
                        label={Strings.frequencyCode}
                        className="flex-1"
                        rules={[
                            { required: true, message: Strings.obligatoryCode },
                            { max: 3, message: 'El código no puede exceder 3 caracteres' },
                        ]}
                    >
                        <Input
                            maxLength={3}
                            placeholder={Strings.frequencyCode}
                        />

                    </Form.Item>
                    <AnatomyTooltip title={Strings.frequencyCodeToolTip} />

                    <Form.Item
                        name="description"
                        validateFirst
                        label={Strings.description}
                        className="flex-1"
                        rules={[{ required: true, message: Strings.obligatoryDescription }]}
                    >
                        <Input
                            placeholder={Strings.description}
                        />
                    </Form.Item>
                    <AnatomyTooltip title={Strings.descriptionToolTip} />
                </div>

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

            </div>
        </Form>
    );
};
export default CiltFrequenciesFormCard;
