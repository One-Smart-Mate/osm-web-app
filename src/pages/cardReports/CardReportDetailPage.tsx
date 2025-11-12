import React, { useState, useEffect } from "react";
import { Card, Table, Button, Tag, Descriptions, Space, Typography, Drawer, List, Spin, Empty } from "antd";
import { useLocation } from "react-router-dom";
import { useGetCardReportDetailsMutation, useGetCardsByMachineMutation, useGetCardsByComponentsMutation } from "../../services/cardService";
import { navigateWithState } from "../../routes/RoutesExtensions";
import Constants from "../../utils/Constants";
import Strings from "../../utils/localizations/Strings";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { BsImages, BsCameraVideo, BsMusicPlayer } from "react-icons/bs";
import { hasImages, hasVideos, hasAudios } from "../../utils/Extensions";
import type { Evidences } from "../../data/card/card";

const { Title: AntTitle, Text } = Typography;

interface CardDetail {
  id: string | number;
  site_card_id?: number | string;
  level_machine_id?: string;
  siteCode?: string;
  siteCardId?: number | string;
  cardUUID?: string;
  cardCreationDate?: string;
  card_creation_date?: string;
  status?: string;
  cardTypeName?: string;
  preclassifierCode?: string;
  preclassifierDescription?: string;
  preclassifier_code?: string;
  preclassifier_description?: string;
  comments_at_card_creation?: string;
  comments_at_card_provisional_solution?: string;
  comments_at_card_definitive_solution?: string;
  component?: string;
  componente?: string;
  machine?: string;
  maquina?: string;
  evidences?: Evidences[];
}

interface MachineRow {
  machine_id: number;
  maquina: string;
  items: {
    [key: string]: {
      n: number;
      ids: number[];
      preclassifiers?: string; // Format: "code1|desc1;code2|desc2"
    };
  };
  subtotal: number;
}

const CardReportDetailPage: React.FC = () => {
  const location = useLocation();
  const navigate = navigateWithState();

  const { rootId, targetLevel, dateStart, dateEnd, siteId, levelName } = location.state || {};

  const [getCardReportDetails, { isLoading: isLoadingDetails }] = useGetCardReportDetailsMutation();
  const [getCardsByMachine, { isLoading: isLoadingMachine }] = useGetCardsByMachineMutation();
  const [getCardsByComponents, { isLoading: isLoadingComponents }] = useGetCardsByComponentsMutation();

  const [rows, setRows] = useState<MachineRow[]>([]);
  const [granTotal, setGranTotal] = useState(0);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");
  const [cardsList, setCardsList] = useState<CardDetail[]>([]);

  useEffect(() => {
    if (rootId && targetLevel && dateStart && dateEnd && siteId) {
      loadReportDetails();
    }
  }, [rootId, targetLevel, dateStart, dateEnd, siteId]);

  const loadReportDetails = async () => {
    try {
      const params = {
        siteId,
        rootId,
        targetLevel,
        dateStart,
        dateEnd,
      };

      const result = await getCardReportDetails(params).unwrap();

      // Group data by machine
      const grouped: { [key: number]: MachineRow } = {};
      let total = 0;

      result.forEach((r: any) => {
        const machineId = r.machine_id;
        const label = r.comp_name;
        const count = r.n_cards;

        if (!grouped[machineId]) {
          grouped[machineId] = {
            machine_id: machineId,
            maquina: r.maquina,
            items: {},
            subtotal: 0,
          };
        }

        if (!grouped[machineId].items[label]) {
          grouped[machineId].items[label] = {
            n: 0,
            ids: [],
            preclassifiers: r.preclassifiers
          };
        }

        grouped[machineId].items[label].n += count;
        grouped[machineId].items[label].ids.push(r.comp_id);
        grouped[machineId].subtotal += count;
        total += count;
      });

      // Convert to array and sort
      const sortedRows = Object.values(grouped).sort((a, b) => {
        const cmp = b.subtotal - a.subtotal;
        return cmp !== 0 ? cmp : a.maquina.localeCompare(b.maquina);
      });

      setRows(sortedRows);
      setGranTotal(total);
    } catch (error) {
      console.error("Error loading report details:", error);
    }
  };

  const loadCardsByMachine = async (machineId: number, machineName: string) => {
    try {
      setDrawerTitle(`${Strings.machine}: ${machineName}`);
      setDrawerVisible(true);
      setCardsList([]);

      const params = {
        siteId,
        machineId,
        targetLevel,
        dateStart,
        dateEnd,
      };

      const result = await getCardsByMachine(params).unwrap();
      setCardsList(result || []);
    } catch (error) {
      console.error("Error loading cards by machine:", error);
    }
  };

  const loadCardsByComponents = async (componentIds: number[], label: string, machineName: string) => {
    try {
      setDrawerTitle(`${Strings.components}: ${machineName} › ${label}`);
      setDrawerVisible(true);
      setCardsList([]);

      const params = {
        siteId,
        componentIds,
        dateStart,
        dateEnd,
      };

      const result = await getCardsByComponents(params).unwrap();
      setCardsList(result || []);
    } catch (error) {
      console.error("Error loading cards by components:", error);
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: any = {
      A: { text: Strings.statusOpen, color: "blue" },
      R: { text: Strings.statusResolved, color: "green" },
      C: { text: Strings.statusCancelled, color: "red" },
      P: { text: Strings.statusProvisional, color: "orange" },
      D: { text: Strings.statusDiscarded, color: "gray" },
      V: { text: Strings.statusExpired, color: "volcano" },
      M: { text: Strings.statusClosedByManager, color: "purple" },
    };
    const mapped = statusMap[status] || { text: status, color: "default" };
    return <Tag color={mapped.color}>{mapped.text}</Tag>;
  };

  const renderEvidenceIndicators = (evidences: Evidences[] = []) => {
    const indicators: React.ReactElement[] = [];

    if (hasImages(evidences)) {
      indicators.push(
        <Tag key="images" icon={<BsImages />} color="blue">
          Imágenes
        </Tag>
      );
    }
    if (hasVideos(evidences)) {
      indicators.push(
        <Tag key="videos" icon={<BsCameraVideo />} color="purple">
          Videos
        </Tag>
      );
    }
    if (hasAudios(evidences)) {
      indicators.push(
        <Tag key="audios" icon={<BsMusicPlayer />} color="green">
          Audios
        </Tag>
      );
    }

    return indicators.length > 0 ? (
      <Space wrap size={4}>
        {indicators}
      </Space>
    ) : null;
  };

  const expandedRowRender = (record: MachineRow) => {
    const items = Object.entries(record.items)
      .map(([label, data]) => ({
        label,
        n: data.n,
        ids: data.ids,
        preclassifiers: data.preclassifiers
      }))
      .sort((a, b) => {
        const cmp = b.n - a.n;
        return cmp !== 0 ? cmp : a.label.localeCompare(b.label);
      });

    const columns = [
      {
        title: Strings.components,
        dataIndex: "label",
        key: "label",
        width: '30%'
      },
      {
        title: "Preclasificador",
        dataIndex: "preclassifiers",
        key: "preclassifiers",
        width: '35%',
        render: (preclassifiers: string) => {
          if (!preclassifiers) return <Text type="secondary">-</Text>;

          // Parse preclassifiers: "code1|desc1;code2|desc2"
          const preclassifierList = preclassifiers.split(';').map(p => {
            const [code, desc] = p.split('|');
            return { code: code.trim(), desc: desc.trim() };
          }).filter(p => p.code || p.desc);

          if (preclassifierList.length === 0) {
            return <Text type="secondary">-</Text>;
          }

          return (
            <Space direction="vertical" size={2}>
              {preclassifierList.map((p, idx) => (
                <Tag key={idx} color="blue" style={{ margin: 0 }}>
                  {p.code && p.desc ? `${p.code} ${p.desc}` : p.code || p.desc}
                </Tag>
              ))}
            </Space>
          );
        }
      },
      {
        title: Strings.cards,
        dataIndex: "n",
        key: "n",
        width: '15%',
        render: (value: number) => <Tag>{value}</Tag>,
      },
      {
        title: Strings.cardList,
        key: "action",
        width: '20%',
        render: (_: any, item: any) => (
          <Button size="small" onClick={() => loadCardsByComponents(item.ids, item.label, record.maquina)}>
            {Strings.viewCards}
          </Button>
        ),
      },
    ];

    return <Table columns={columns} dataSource={items} pagination={false} size="small" rowKey="label" />;
  };

  const mainColumns = [
    {
      title: Strings.machine,
      dataIndex: "maquina",
      key: "maquina",
      render: (text: string, record: MachineRow) => (
        <Button type="link" onClick={() => loadCardsByMachine(record.machine_id, text)}>
          {text}
        </Button>
      ),
    },
    {
      title: Strings.subtotal,
      dataIndex: "subtotal",
      key: "subtotal",
      render: (value: number) => {
        const percentage = granTotal > 0 ? ((value / granTotal) * 100).toFixed(1) : "0.0";
        return (
          <>
            <strong>{value.toLocaleString()}</strong> <Text type="secondary">({percentage}%)</Text>
          </>
        );
      },
    },
  ];

  const cardCounts = cardsList.reduce(
    (acc, card) => {
      if (card.status) acc[card.status] = (acc[card.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(`/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.cardReports}`)}
            >
              {Strings.backToReport}
            </Button>
          </div>

          <AntTitle level={3}>{Strings.cardReportDetailTitle}</AntTitle>

          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label={Strings.root}>{levelName || rootId}</Descriptions.Item>
            <Descriptions.Item label={Strings.dataLevel}>{targetLevel}</Descriptions.Item>
            <Descriptions.Item label={Strings.site}>{siteId}</Descriptions.Item>
            <Descriptions.Item label={Strings.range}>
              {dateStart} → {dateEnd}
            </Descriptions.Item>
            <Descriptions.Item label={Strings.totalCards} span={2}>
              <strong style={{ fontSize: 18, color: "#0d6efd" }}>{granTotal.toLocaleString()}</strong>
            </Descriptions.Item>
          </Descriptions>

          <Card title={Strings.summary} size="small" loading={isLoadingDetails}>
            {rows.length === 0 ? (
              <Empty description={Strings.noCardsFound} />
            ) : (
              <>
                <Table
                  columns={mainColumns}
                  dataSource={rows}
                  expandable={{ expandedRowRender }}
                  pagination={false}
                  rowKey="machine_id"
                  size="middle"
                  scroll={{ x: true }}
                />
              </>
            )}
          </Card>
        </Space>
      </Card>

      <Drawer
        title={drawerTitle}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={720}
        footer={
          <Space>
            <Text strong>{Strings.total}: {cardsList.length}</Text>
            <Text>{Strings.statusOpen}: {cardCounts.A || 0}</Text>
            <Text>{Strings.statusResolved}: {cardCounts.R || 0}</Text>
            <Text>{Strings.statusCancelled}: {cardCounts.C || 0}</Text>
            <Text>{Strings.statusProvisional}: {cardCounts.P || 0}</Text>
          </Space>
        }
      >
        {isLoadingMachine || isLoadingComponents ? (
          <div style={{ textAlign: "center", padding: 50 }}>
            <Spin size="large" />
          </div>
        ) : cardsList.length === 0 ? (
          <Empty description={Strings.noCards} />
        ) : (
          <List
            dataSource={cardsList}
            renderItem={(card) => {
              // Primary label - matching PHP demo format (line 464)
              const code = `ID ${card.id}`;

              // Secondary line with three identifiers (matching PHP line 467)
              const ident = `ID ${card.id} · site_card_id ${card.site_card_id ?? (card.siteCardId || '')} · level_machine_id ${card.level_machine_id ?? ''}`;

              // Preclassifier info
              const preclassifierCode = card.preclassifier_code || card.preclassifierCode || '';
              const preclassifierDesc = card.preclassifier_description || card.preclassifierDescription || '';
              const preclassifier = preclassifierCode || preclassifierDesc
                ? `${preclassifierCode} ${preclassifierDesc}`.trim()
                : "";

              // Creation date
              const creationDate = card.card_creation_date || card.cardCreationDate;

              // Comments
              const commentCreation = card.comments_at_card_creation;
              const commentProvisional = card.comments_at_card_provisional_solution;
              const commentDefinitive = card.comments_at_card_definitive_solution;

              return (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <strong>{code}</strong>
                        {card.status && getStatusLabel(card.status)}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {ident}
                        </Text>
                        <Text type="secondary">
                          {card.cardTypeName || ""}
                        </Text>
                        {preclassifier && (
                          <div style={{ padding: '4px 8px', background: '#f0f5ff', borderRadius: '4px' }}>
                            <Text strong style={{ fontSize: 12, color: '#1890ff' }}>
                              Preclasificador:
                            </Text>
                            <Text style={{ fontSize: 12, marginLeft: 6 }}>
                              {preclassifier}
                            </Text>
                          </div>
                        )}
                        {card.evidences && card.evidences.length > 0 && (
                          <div style={{ padding: '4px 8px', background: '#f9f0ff', borderRadius: '4px' }}>
                            <Text strong style={{ fontSize: 12, color: '#722ed1', display: 'block', marginBottom: 4 }}>
                              Evidencias:
                            </Text>
                            {renderEvidenceIndicators(card.evidences)}
                          </div>
                        )}
                        {commentCreation && (
                          <div style={{ padding: '4px 8px', background: '#fff7e6', borderRadius: '4px' }}>
                            <Text strong style={{ fontSize: 12, color: '#fa8c16' }}>
                              Comentario creación:
                            </Text>
                            <Text style={{ fontSize: 12, display: 'block', marginTop: 2 }}>
                              {commentCreation}
                            </Text>
                          </div>
                        )}
                        {commentProvisional && (
                          <div style={{ padding: '4px 8px', background: '#fcffe6', borderRadius: '4px' }}>
                            <Text strong style={{ fontSize: 12, color: '#52c41a' }}>
                              Comentario solución provisional:
                            </Text>
                            <Text style={{ fontSize: 12, display: 'block', marginTop: 2 }}>
                              {commentProvisional}
                            </Text>
                          </div>
                        )}
                        {commentDefinitive && (
                          <div style={{ padding: '4px 8px', background: '#f6ffed', borderRadius: '4px' }}>
                            <Text strong style={{ fontSize: 12, color: '#237804' }}>
                              Comentario solución definitiva:
                            </Text>
                            <Text style={{ fontSize: 12, display: 'block', marginTop: 2 }}>
                              {commentDefinitive}
                            </Text>
                          </div>
                        )}
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {creationDate
                            ? new Date(creationDate.replace(' ', 'T')).toLocaleString()
                            : ""}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </Drawer>
    </div>
  );
};

export default CardReportDetailPage;
