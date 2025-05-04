import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Select, InputNumber, Switch, ColorPicker, Spin, notification, Tree } from 'antd';
import { useCreateCiltSequenceMutation } from '../../../services/cilt/ciltSequencesService';
import { useGetCiltTypesBySiteMutation } from '../../../services/cilt/ciltTypesService';
import { useGetlevelsMutation } from '../../../services/levelService';
import { CiltMstr } from '../../../data/cilt/ciltMstr/ciltMstr';
import { CiltType } from '../../../data/cilt/ciltTypes/ciltTypes';
import { CreateCiltSequenceDTO } from '../../../data/cilt/ciltSequences/ciltSequences';
import Strings from '../../../utils/localizations/Strings';
import { DownOutlined } from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';

const { TextArea } = Input;
const { Option } = Select;

interface CreateCiltSequenceModalProps {
  visible: boolean;
  cilt: CiltMstr | null;
  onCancel: () => void;
  onSuccess: () => void;
}

// Extendemos la interfaz CiltMstr para incluir las propiedades adicionales que necesitamos
interface ExtendedCiltMstr extends CiltMstr {
  siteName?: string;
  areaId?: number;
  areaName?: string;
  positionName?: string;
}

const CreateCiltSequenceModal: React.FC<CreateCiltSequenceModalProps> = ({
  visible,
  cilt,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [createCiltSequence] = useCreateCiltSequenceMutation();
  const [getCiltTypesBySite] = useGetCiltTypesBySiteMutation();
  const [getLevelsBySite] = useGetlevelsMutation();
  
  const [ciltTypes, setCiltTypes] = useState<CiltType[]>([]);
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<{id: number, name: string} | null>(null);
  const [color, setColor] = useState<string>('#1677FF');

  useEffect(() => {
    if (visible && cilt?.siteId) {
      fetchCiltTypes();
      fetchLevels();
    }
  }, [visible, cilt]);

  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setSelectedLevel(null);
      setColor('#1677FF');
    }
  }, [visible, form]);

  const fetchCiltTypes = async () => {
    if (!cilt?.siteId) return;
    
    setLoading(true);
    try {
      const response = await getCiltTypesBySite(String(cilt.siteId)).unwrap();
      setCiltTypes(response || []);
    } catch (error) {
      notification.error({
        message: Strings.error,
        description: 'Error al cargar los tipos de CILT',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLevels = async () => {
    if (!cilt?.siteId) return;
    
    setLoading(true);
    try {
      const response = await getLevelsBySite(String(cilt.siteId)).unwrap();
      
      // Transform the levels data into a tree structure
      const transformedData = transformToTreeData(response);
      setTreeData(transformedData);
    } catch (error) {
      notification.error({
        message: Strings.error,
        description: 'Error al cargar los niveles',
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to transform level data into tree structure
  const transformToTreeData = (levels: any[]): DataNode[] => {
    // Map to store nodes by their ID for quick lookup
    const nodesMap = new Map();
    
    // First pass: create all nodes
    levels.forEach(level => {
      nodesMap.set(level.id, {
        key: level.id,
        title: level.name,
        children: [],
        data: level // Store the original level data
      });
    });
    
    // Second pass: build the tree structure
    const rootNodes: DataNode[] = [];
    
    levels.forEach(level => {
      const node = nodesMap.get(level.id);
      
      if (level.parentId && nodesMap.has(level.parentId)) {
        // This node has a parent, add it to the parent's children
        const parentNode = nodesMap.get(level.parentId);
        parentNode.children.push(node);
      } else {
        // This is a root node
        rootNodes.push(node);
      }
    });
    
    return rootNodes;
  };

  const handleLevelSelect = (selectedKeys: React.Key[], info: any) => {
    if (selectedKeys.length > 0) {
      const levelId = selectedKeys[0];
      const levelName = info.node.title;
      setSelectedLevel({ id: Number(levelId), name: String(levelName) });
      
      form.setFieldsValue({ levelId: Number(levelId) });
    } else {
      setSelectedLevel(null);
      form.setFieldsValue({ levelId: null });
    }
  };

  const handleColorChange = (colorValue: any) => {
    // Extract the hex color without the '#' prefix
    const hexColor = colorValue.toHex().replace('#', '');
    setColor('#' + hexColor);
    form.setFieldsValue({ secuenceColor: hexColor });
  };

  const handleSubmit = async (values: any) => {
    if (!cilt) return;
    
    setLoading(true);
    try {
      // Find the selected CILT type
      const selectedCiltType = ciltTypes.find(type => type.id === values.ciltTypeId);
      
      // Tratar el cilt como ExtendedCiltMstr para acceder a las propiedades adicionales
      const extendedCilt = cilt as unknown as ExtendedCiltMstr;
      
      // Crear valores predeterminados para las propiedades que pueden faltar
      const siteName = extendedCilt.siteName || "Site";
      const areaId = extendedCilt.areaId || 0;
      const areaName = extendedCilt.areaName || "Area";
      const positionName = extendedCilt.positionName || "Position";
      
      // Create the payload
      const payload: CreateCiltSequenceDTO = {
        siteId: cilt.siteId || 0,
        siteName: siteName,
        areaId: areaId,
        areaName: areaName,
        positionId: cilt.positionId || 0,
        positionName: positionName,
        ciltMstrId: cilt.id,
        ciltMstrName: cilt.ciltName || "",
        levelId: values.levelId,
        levelName: selectedLevel?.name || '',
        order: values.order || 1,
        secuenceList: values.secuenceList,
        secuenceColor: values.secuenceColor,
        ciltTypeId: values.ciltTypeId,
        ciltTypeName: selectedCiltType?.name || '',
        referenceOplSop: undefined,
        standardTime: values.standardTime,
        standardOk: values.standardOk,
        remediationOplSop: undefined,
        toolsRequired: values.toolsRequired,
        stoppageReason: values.stoppageReason ? 1 : 0,
        quantityPicturesCreate: values.quantityPicturesCreate,
        quantityPicturesClose: values.quantityPicturesClose,
        createdAt: new Date().toISOString(),
      };
      
      // Imprimir el payload para depuración
      console.log('Payload enviado al backend:', payload);
      
      // Call the API
      const response = await createCiltSequence(payload).unwrap();
      
      // Imprimir la respuesta para depuración
      console.log('Respuesta del backend:', response);
      
      notification.success({
        message: 'Éxito',
        description: 'Secuencia CILT creada correctamente',
      });
      
      // Reset and close
      form.resetFields();
      onSuccess();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Error al crear la secuencia CILT',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Crear Secuencia CILT"
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={null}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            order: 1,
            secuenceColor: color.replace('#', ''),
            quantityPicturesCreate: 1,
            quantityPicturesClose: 1,
            stoppageReason: false,
          }}
        >
          {/* Hidden field for levelId */}
          <Form.Item name="levelId" hidden>
            <Input />
          </Form.Item>
          
          <Form.Item
            label="Seleccionar Nivel"
            required
            help="Seleccione un nivel del árbol para asociar la secuencia"
          >
            <div style={{ maxHeight: '300px', overflow: 'auto', border: '1px solid #d9d9d9', padding: '8px', borderRadius: '2px' }}>
              <Tree
                showLine
                switcherIcon={<DownOutlined />}
                onSelect={handleLevelSelect}
                treeData={treeData}
              />
            </div>
            {selectedLevel && (
              <div style={{ marginTop: '8px' }}>
                Nivel seleccionado: <strong>{selectedLevel.name}</strong>
              </div>
            )}
          </Form.Item>
          
          <Form.Item
            name="order"
            label="Orden"
            rules={[{ required: true, message: 'Por favor ingrese el orden' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="secuenceList"
            label="Lista de Secuencia"
            rules={[{ required: true, message: 'Por favor ingrese la lista de secuencia' }]}
          >
            <TextArea rows={4} placeholder="Ingrese los pasos de la secuencia" />
          </Form.Item>
          
          <Form.Item
            name="secuenceColor"
            label="Color de Secuencia"
            rules={[{ required: true, message: 'Por favor seleccione un color' }]}
          >
            <div>
              <ColorPicker
                value={color}
                onChange={handleColorChange}
                showText
              />
            </div>
          </Form.Item>
          
          <Form.Item
            name="ciltTypeId"
            label="Tipo de CILT"
            rules={[{ required: true, message: 'Por favor seleccione un tipo de CILT' }]}
          >
            <Select placeholder="Seleccione un tipo de CILT">
              {ciltTypes.map(type => (
                <Option key={type.id} value={type.id}>{type.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="standardTime"
            label="Tiempo Estándar (segundos)"
            rules={[{ required: true, message: 'Por favor ingrese el tiempo estándar' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="standardOk"
            label="Estándar OK"
            rules={[{ required: true, message: 'Por favor ingrese el estándar OK' }]}
          >
            <Input placeholder="Ingrese el estándar esperado" />
          </Form.Item>
          
          <Form.Item
            name="toolsRequired"
            label="Herramientas Requeridas"
          >
            <TextArea rows={3} placeholder="Ingrese las herramientas necesarias" />
          </Form.Item>
          
          <Form.Item
            name="stoppageReason"
            label="¿Es motivo de paro?"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name="quantityPicturesCreate"
            label="Cantidad de Imágenes al Inicio"
            rules={[{ required: true, message: 'Por favor ingrese la cantidad de imágenes' }]}
          >
            <InputNumber min={0} max={10} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="quantityPicturesClose"
            label="Cantidad de Imágenes al Cierre"
            rules={[{ required: true, message: 'Por favor ingrese la cantidad de imágenes' }]}
          >
            <InputNumber min={0} max={10} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Crear Secuencia
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default CreateCiltSequenceModal;
