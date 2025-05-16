import React, { useEffect, useState } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  BlobProvider,
} from "@react-pdf/renderer";
import moment from "moment";
import {
  formatSecondsToHHMMSS,
} from "../../../utils/Extensions";
import { Button, App as AntApp } from "antd";
import { BsFilePdf } from "react-icons/bs";
import { useGetCiltDetailsMutation } from "../../../services/cilt/ciltMstrService";
import AnatomyNotification from "../../components/AnatomyNotification";
import { CiltDetails } from "../../../data/cilt/ciltMstr/cilt.master.detail";
import Strings from "../../../utils/localizations/Strings";


interface CiltPDFDocumentProps {
  data: CiltDetails;
}

const CiltPDFDocument = ({
  data,
}: CiltPDFDocumentProps): React.ReactElement => {
  const { ciltInfo, sequences } = data;
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.sectionLineContainer}>
          <Text style={styles.sectionTitle}>{Strings.name}:</Text>
          <View
            style={{
              flex: 1,
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Text style={styles.sectionTitle}>{ciltInfo.ciltName}</Text>
            <View style={styles.lineInput} />
          </View>
        </View>

        <View style={styles.sectionLineContainer}>
          <Text style={styles.sectionTitle}>{Strings.description}:</Text>
          <View
            style={{
              flex: 1,
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Text style={styles.sectionTitle}>{ciltInfo.ciltDescription}</Text>
            <View style={styles.lineInput} />
          </View>
        </View>

        <View style={{ flex: 1, flexDirection: "column" }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 24,
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1 }}>
              <View style={styles.sectionLineContainer}>
                <Text style={styles.sectionTitle}>Creación:</Text>
                <View
                  style={{
                    flex: 1,
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.sectionTitle}>
                    {ciltInfo.creatorName}
                  </Text>
                  <View style={styles.lineInput} />
                </View>
              </View>
              <View style={styles.sectionLineContainer}>
                <Text style={styles.sectionTitle}>Revisión:</Text>
                <View
                  style={{
                    flex: 1,
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.sectionTitle}>
                    {ciltInfo.reviewerName}
                  </Text>
                  <View style={styles.lineInput} />
                </View>
              </View>
              <View style={styles.sectionLineContainer}>
                <Text style={styles.sectionTitle}>Último uso:</Text>
                <View style={styles.lineInput} />
              </View>
              <View style={styles.sectionLineContainer}>
                <Text style={styles.sectionTitle}>Caducidad:</Text>
                <View style={styles.lineInput} />
              </View>
              <Text
                style={{
                  ...styles.sectionTitle,
                  marginTop: 18,
                  marginLeft: "50%",
                }}
              >
                (Caducado)
              </Text>
              <View style={{ marginVertical: 12 }} />
              <View style={styles.sectionLineContainer}>
                <Text style={styles.sectionTitle}>Creó:</Text>
                <View style={styles.lineInput} />
              </View>
              <View style={styles.sectionLineContainer}>
                <Text style={styles.sectionTitle}>Revisó:</Text>
                <View style={styles.lineInput} />
              </View>
              <View style={styles.sectionLineContainer}>
                <Text style={styles.sectionTitle}>Autorizó:</Text>
                <View style={styles.lineInput} />
              </View>
              <View style={styles.sectionLineContainer}>
                <Text style={styles.sectionTitle}>Tiempo estandar:</Text>
                <View
                  style={{
                    flex: 1,
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.sectionTitle}>
                    {formatSecondsToHHMMSS(ciltInfo.standardTime)}
                  </Text>
                  <View style={styles.lineInput} />
                </View>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Image
                src={ciltInfo.urlImgLayout}
                style={{ width: "100%", height: 200 }}
              />
            </View>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>Secuencias</Text>
            <View style={styles.line} />
          </View>

          {sequences.map((value, index) => (
            <View key={index}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    flexDirection: "column",
                    flexWrap: "wrap",
                    textAlign: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.sectionTitle}>Punto</Text>
                  <Text style={styles.sectionValue}>{value.order}</Text>
                </View>
                <View
                  style={{
                    flexDirection: "column",
                    flexWrap: "wrap",
                    flex: 1,
                    textAlign: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.sectionTitle}>Tipo</Text>
                  <Text style={styles.sectionValue}>{value.ciltTypeName}</Text>
                </View>
                <View
                  style={{
                    flexDirection: "column",
                    flexWrap: "wrap",
                    flex: 1,
                    textAlign: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.sectionTitle}>Color</Text>
                  <View
                    style={{
                      width: 25,
                      height: 15,
                      backgroundColor: `#${value.secuenceColor}`,
                    }}
                  />
                </View>

                <View
                  style={{
                    flexDirection: "column",
                    flexWrap: "wrap",
                    flex: 1,
                    textAlign: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.sectionTitle}>Tiempo</Text>
                  <Text style={styles.sectionValue}>
                    {formatSecondsToHHMMSS(value.standardTime ?? 0)}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "column",
                    flexWrap: "wrap",
                    flex: 1,
                    textAlign: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.sectionTitle}>Razón de paro</Text>
                  <Text style={styles.sectionValue}>
                    {value.stoppageReason == 1 ? "SI" : "NO"}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "column",
                    flexWrap: "wrap",
                    flex: 1,
                    textAlign: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.sectionTitle}>Maquiza detenida</Text>
                  <Text style={styles.sectionValue}>
                    {value.machineStopped == 1 ? "SI" : "NO"}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "column",
                    flexWrap: "wrap",
                    flex: 1,
                    textAlign: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.sectionTitle}>OPL de referencia</Text>
                  <Text style={styles.sectionValue}>LINK</Text>
                </View>
                <View
                  style={{
                    flexDirection: "column",
                    flexWrap: "wrap",
                    flex: 1,
                    textAlign: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.sectionTitle}>OPL Remediacion</Text>
                  <Text style={styles.sectionValue}>LINK</Text>
                </View>
                <View
                  style={{
                    flexDirection: "column",
                    flexWrap: "wrap",
                    flex: 1,
                    textAlign: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.sectionTitle}>Img creación</Text>
                  <Text style={styles.sectionValue}>
                    {value.quantityPicturesCreate}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "column",
                    flexWrap: "wrap",
                    flex: 1,
                    textAlign: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.sectionTitle}>Img cierre</Text>
                  <Text style={styles.sectionValue}>
                    {value.quantityPicturesClose}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "column",
                    flexWrap: "wrap",
                    flex: 1,
                    textAlign: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.sectionTitle}>Frecuencia</Text>
                  <View
                    style={{ width: 25, height: 15, backgroundColor: "yellow" }}
                  >
                    <Text style={styles.sectionValue}></Text>
                  </View>
                </View>
              </View>

              <View style={{ flexDirection: "column" }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.sectionTitle}>Herramientas: </Text>
                  <Text style={styles.sectionValue}>{value.toolsRequired}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.sectionTitle}>Parametro OK: </Text>
                  <Text style={styles.sectionValue}>{value.standardOk}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.sectionTitle}>Instrucciones: </Text>
                  <Text style={styles.sectionValue}>{value.secuenceList}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionValue}>
          {moment().format("dddd, MMMM Do YYYY, h:mm:ss a")}
        </Text>
      </Page>
    </Document>
  );
};

const styles = StyleSheet.create({
  dividerText: {
    marginHorizontal: 8,
    fontSize: 12,
    fontWeight: "semibold",
  },
  dividerContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#8c8c8c",
  },
  sectionTitle: {
    fontWeight: "semibold",
    marginRight: 4,
    fontSize: 10,
    color: "#000",
  },
  sectionLineContainer: {
    flex: "flex",
    flexDirection: "row",
    marginTop: 18,
  },
  page: {
    backgroundColor: "#ffffff",
    padding: 16,
  },
  lineInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#8c8c8c",
    width: "100%",
    marginLeft: 8,
    marginRight: 8,
    marginTop: 10,
  },
  lineInputSmall: {
    borderBottomWidth: 1,
    borderBottomColor: "#8c8c8c",
    width: "30%",
    marginLeft: 8,
    marginRight: 8,
    marginTop: 10,
  },
  sectionValue: {
    fontSize: 10,
    color: "#595959",
    marginTop: 2,
  },
});


interface CiltPDFButtonProps {
  id: string;
}
const CiltPDFButton = ({id}: CiltPDFButtonProps) => {
  const [getCiltDetails] = useGetCiltDetailsMutation();
  const [isLoading, setLoading] = useState(false);
  const { notification } = AntApp.useApp();
  const [data, setData] = useState<CiltDetails | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const handleGetCiltDetails = async () => {
    try {
      setLoading(true);
      const response = await getCiltDetails(id).unwrap();
      setData(response);
    } catch (error) {
      AnatomyNotification.error(notification, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (blobUrl && data) {
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "CILT.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setBlobUrl(null);
      setData(null);
    }
  }, [blobUrl]);

  return (
    <>
      <Button
        type="primary"
        size="small"
        loading={isLoading}
        onClick={handleGetCiltDetails}
        icon={<BsFilePdf />}
      >
        {Strings.downloadData}
      </Button>
      {data && (
        <BlobProvider document={<CiltPDFDocument data={data} />}>
          {({ url, loading }) => {
            if (!loading && url) {
              setTimeout(() => setBlobUrl(url), 0);
            }
            return null;
          }}
        </BlobProvider>
      )}
    </>
  );
};

export default CiltPDFButton;
