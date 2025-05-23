import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  PDFDownloadLink,
  Link
} from "@react-pdf/renderer";
import Strings from "../../utils/localizations/Strings";
import moment from "moment";
import  { CardDetailsInterface } from "../../data/card/card";
import {
  formatDate,
  getCardStatusAndText,
  getDaysBetween,
  getDaysSince,
} from "../../utils/Extensions";
import { SiteUpdateForm } from "../../data/site/site";
import { Button } from "antd";
import { BsFilePdf } from "react-icons/bs";

interface TagPDFDocumentProps {
  data: CardDetailsInterface;
  site?: SiteUpdateForm;
}

const TagPDFDocument = ({
  data,
  site,
}: TagPDFDocumentProps): React.ReactElement => {
  const { card, evidences } = data;
  const cardStatus = getCardStatusAndText(
    card.status,
    card.cardDueDate,
    card.cardDefinitiveSolutionDate,
    card.cardCreationDate
  );

  const imagesAtCreation = evidences.filter((e) => e.evidenceType == Strings.IMCR);
  const videosAtCreation = evidences.filter((e) => e.evidenceType == Strings.VICR);
  const audiosAtCreation = evidences.filter((e) => e.evidenceType == Strings.AUCR);


  const imagesAtProvisionalSolution = evidences.filter((e) => e.evidenceType == Strings.IMPS);
  const videosAtProvisionalSolution = evidences.filter((e) => e.evidenceType == Strings.VIPS);
  const audiosAtProvisionalSolution = evidences.filter((e) => e.evidenceType == Strings.AUPS);

  const imagesAtDefinitiveSolution = evidences.filter((e) => e.evidenceType == Strings.IMCL);
  const videosAtDefinitiveSolution = evidences.filter((e) => e.evidenceType == Strings.VICL);
  const audiosAtDefinitiveSolution = evidences.filter((e) => e.evidenceType == Strings.AUCL);


  const showEvidencesAtCreation = (): boolean => {
    return imagesAtCreation.length> 0 || videosAtCreation.length > 0 || audiosAtCreation.length > 0;
  }

  const showEvidencesAtProvisionalSolution = (): boolean => {
    return imagesAtProvisionalSolution.length> 0 || videosAtProvisionalSolution.length > 0 || audiosAtProvisionalSolution.length > 0;
  }

  const showEvidencesAtDefinitiveSolution = (): boolean => {
    return imagesAtDefinitiveSolution.length> 0 || videosAtDefinitiveSolution.length > 0 || audiosAtDefinitiveSolution.length > 0;
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerContainer}>
          <View>
            <View>
              <Text style={styles.title}>{site?.name}</Text>
            </View>
            {site?.address && site.phone && (
              <View style={styles.companySection}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    {Strings.companyAddress}:
                  </Text>
                  <Text style={styles.sectionValue}>{site?.address}</Text>
                </View>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>{Strings.phone}:</Text>
                  <Text style={styles.sectionValue}>{site?.phone}</Text>
                </View>
              </View>
            )}
          </View>

          {site?.logo && (
            <View>
              <Image style={styles.logo} src={site.logo} />
            </View>
          )}
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.text}>{Strings.tagDetails}</Text>
          <View style={styles.line} />
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 12,
          }}
        >
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{Strings.tagNumber} :</Text>
            <Text style={styles.sectionValue}>
              {card.siteCardId || Strings.NA}
            </Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{Strings.cardType} :</Text>
            <Text
              style={{
                color: `#${card.cardTypeColor}`,
                fontSize: 10,
                fontWeight: "bold",
              }}
            >
              {card.cardTypeName || Strings.NA}
            </Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{Strings.status}:</Text>
            <Text style={styles.sectionValue}>{card.status || Strings.NA}</Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 12,
          }}
        >
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{Strings.creationDate} :</Text>
            <Text style={styles.sectionValue}>
              {formatDate(card.createdAt) || Strings.NA}
            </Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{Strings.createdBy} :</Text>
            <Text style={styles.sectionValue}>
              {card.creatorName || Strings.NA}
            </Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>
              {Strings.daysSinceCreation}:
            </Text>
            <Text style={styles.sectionValue}>
              {getDaysSince(card.createdAt) || Strings.cero}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 12,
          }}
        >
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{Strings.dueDate} :</Text>
            <Text style={styles.sectionValue}>
              {card.cardDueDate || Strings.NA}
            </Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{Strings.priority} :</Text>
            <Text style={styles.sectionValue}>
              {card.priorityCode
                ? `${card.priorityCode} - ${card.priorityDescription}`
                : Strings.NA}
            </Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{Strings.dateStatus}:</Text>
            <Text
              style={{
                fontSize: 10,
                color:
                  cardStatus.dateStatus === Strings.expired
                    ? "#ff4d4f"
                    : "#73d13d",
                fontWeight: "bold",
              }}
            >
              {cardStatus.dateStatus}
            </Text>
          </View>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.text}>{Strings.problemDetails}</Text>
          <View style={styles.line} />
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 12,
          }}
        >
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{Strings.problemType} :</Text>
            <Text style={styles.sectionValue}>
              {card.preclassifierCode
                ? `${card.preclassifierCode} - ${card.preclassifierDescription}`
                : Strings.NA}
            </Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{Strings.location} :</Text>
            <Text style={styles.sectionValue}>
              {" "}
              {card.cardLocation || Strings.NA}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 12,
          }}
        >
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{Strings.mechanic} :</Text>
            <Text style={styles.sectionValue}>
              {card.mechanicName || Strings.NA}
            </Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{Strings.anomalyDetected} :</Text>
            <Text style={styles.sectionValue}>
              {card.commentsAtCardCreation || Strings.NA}
            </Text>
          </View>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.text}>{Strings.provisionalSolution}</Text>
          <View style={styles.line} />
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 12,
          }}
        >
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{Strings.tagDate} :</Text>
            <Text style={styles.sectionValue}>
              {formatDate(card.cardProvisionalSolutionDate) || Strings.NA}
            </Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{Strings.tagDays} :</Text>
            <Text style={styles.sectionValue}>
              {getDaysBetween(
                card.createdAt,
                card.cardProvisionalSolutionDate
              ) || Strings.ceroDays}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 12,
          }}
        >
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>
              {Strings.appProvisionalUser} :
            </Text>
            <Text style={styles.sectionValue}>
              {card.userAppProvisionalSolutionName || Strings.NA}
            </Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{Strings.provisionalUser} :</Text>
            <Text style={styles.sectionValue}>
              {card.userProvisionalSolutionName || Strings.NA}
            </Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>
              {Strings.provisionalSoluitonApplied} :
            </Text>
            <Text style={styles.sectionValue}>
              {card.commentsAtCardProvisionalSolution || Strings.NA}
            </Text>
          </View>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.text}>{Strings.definitiveSolution}</Text>
          <View style={styles.line} />
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 12,
          }}
        >
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{Strings.tagDate} :</Text>
            <Text style={styles.sectionValue}>
              {formatDate(card.cardDefinitiveSolutionDate) || Strings.NA}
            </Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{Strings.tagDays} :</Text>
            <Text style={styles.sectionValue}>
              {getDaysBetween(
                card.createdAt,
                card.cardDefinitiveSolutionDate
              ) || Strings.ceroDays}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 12,
          }}
        >
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>
              {Strings.appDefinitiveUser} :
            </Text>
            <Text style={styles.sectionValue}>
              {card.userAppDefinitiveSolutionName || Strings.NA}
            </Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{Strings.definitiveUser} :</Text>
            <Text style={styles.sectionValue}>
              {card.userDefinitiveSolutionName || Strings.NA}
            </Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>
              {Strings.definitiveSolutionApplied} :
            </Text>
            <Text style={styles.sectionValue}>
              {card.commentsAtCardDefinitiveSolution || Strings.NA}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionValue}>
          {moment().format("dddd, MMMM Do YYYY, h:mm:ss a")}
        </Text>
      </Page>

      {showEvidencesAtCreation() && (
        <Page style={styles.page}>
          <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <Text style={styles.text}>
              {Strings.evidencesAtCreationDivider}
            </Text>
            <View style={styles.line} />
          </View>

          <View style={{ padding: 8 }}>
            {imagesAtCreation.length > 0 && (
              <View>
                <View style={styles.dividerContainer}>
                  <View style={styles.lineSmall} />
                  <Text style={styles.textSmall}>{Strings.images}</Text>
                  <View style={styles.lineSmall} />
                </View>
                <View style={styles.imageGrid}>
                  {imagesAtCreation.map((value, index) => (
                    <View key={index}>
                      <Image style={styles.image} src={value.evidenceName} />
                    </View>
                  ))}
                </View>
              </View>
            )}

            {videosAtCreation.length > 0 && (
              <View>
                <View style={styles.dividerContainer}>
                  <View style={styles.lineSmall} />
                  <Text style={styles.textSmall}>{Strings.videos}</Text>
                  <View style={styles.lineSmall} />
                </View>
                <View style={styles.imageGrid}>
                  {videosAtCreation.map((value, index) => (
                    <View key={index}>
                      <Link src={value.evidenceName}>{`VIDEO_${
                        index + 1
                      }`}</Link>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {audiosAtCreation.length > 0 && (
              <View>
                <View style={styles.dividerContainer}>
                  <View style={styles.lineSmall} />
                  <Text style={styles.textSmall}>{Strings.audios}</Text>
                  <View style={styles.lineSmall} />
                </View>
                <View style={styles.imageGrid}>
                  {audiosAtCreation.map((value, index) => (
                    <View key={index}>
                      <Link src={value.evidenceName}>{`AUDIO_${
                        index + 1
                      }`}</Link>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </Page>
      )}

      {showEvidencesAtProvisionalSolution() && (
        <Page style={styles.page}>
          <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <Text style={styles.text}>
              {Strings.evidencesAtProvisionalDivider}
            </Text>
            <View style={styles.line} />
          </View>

          <View style={{ padding: 8 }}>
            {imagesAtProvisionalSolution.length > 0 && (
              <View>
                <View style={styles.dividerContainer}>
                  <View style={styles.lineSmall} />
                  <Text style={styles.textSmall}>{Strings.images}</Text>
                  <View style={styles.lineSmall} />
                </View>
                <View style={styles.imageGrid}>
                  {imagesAtProvisionalSolution.map((value, index) => (
                    <View key={index}>
                      <Image style={styles.image} src={value.evidenceName} />
                    </View>
                  ))}
                </View>
              </View>
            )}

            {videosAtProvisionalSolution.length > 0 && (
              <View>
                <View style={styles.dividerContainer}>
                  <View style={styles.lineSmall} />
                  <Text style={styles.textSmall}>{Strings.videos}</Text>
                  <View style={styles.lineSmall} />
                </View>
                <View style={styles.imageGrid}>
                  {videosAtProvisionalSolution.map((value, index) => (
                    <View key={index}>
                      <Link src={value.evidenceName}>{`VIDEO_${
                        index + 1
                      }`}</Link>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {audiosAtProvisionalSolution.length > 0 && (
              <View>
                <View style={styles.dividerContainer}>
                  <View style={styles.lineSmall} />
                  <Text style={styles.textSmall}>{Strings.audios}</Text>
                  <View style={styles.lineSmall} />
                </View>
                <View style={styles.imageGrid}>
                  {audiosAtProvisionalSolution.map((value, index) => (
                    <View key={index}>
                      <Link src={value.evidenceName}>{`AUDIO_${
                        index + 1
                      }`}</Link>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </Page>
      )}

      {showEvidencesAtDefinitiveSolution() && (
        <Page style={styles.page}>
          <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <Text style={styles.text}>
              {Strings.evidencesAtDefinitiveDivider}
            </Text>
            <View style={styles.line} />
          </View>

          <View style={{ padding: 8 }}>
            {imagesAtDefinitiveSolution.length > 0 && (
              <View>
                <View style={styles.dividerContainer}>
                  <View style={styles.lineSmall} />
                  <Text style={styles.textSmall}>{Strings.images}</Text>
                  <View style={styles.lineSmall} />
                </View>
                <View style={styles.imageGrid}>
                  {imagesAtDefinitiveSolution.map((value, index) => (
                    <View key={index}>
                      <Image style={styles.image} src={value.evidenceName} />
                    </View>
                  ))}
                </View>
              </View>
            )}

            {videosAtDefinitiveSolution.length > 0 && (
              <View>
                <View style={styles.dividerContainer}>
                  <View style={styles.lineSmall} />
                  <Text style={styles.textSmall}>{Strings.videos}</Text>
                  <View style={styles.lineSmall} />
                </View>
                <View style={styles.imageGrid}>
                  {videosAtDefinitiveSolution.map((value, index) => (
                    <View key={index}>
                      <Link src={value.evidenceName}>{`VIDEO_${
                        index + 1
                      }`}</Link>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {audiosAtDefinitiveSolution.length > 0 && (
              <View>
                <View style={styles.dividerContainer}>
                  <View style={styles.lineSmall} />
                  <Text style={styles.textSmall}>{Strings.audios}</Text>
                  <View style={styles.lineSmall} />
                </View>
                <View style={styles.imageGrid}>
                  {audiosAtDefinitiveSolution.map((value, index) => (
                    <View key={index}>
                      <Link src={value.evidenceName}>{`AUDIO_${
                        index + 1
                      }`}</Link>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </Page>
      )}
    </Document>
  );
};

const styles = StyleSheet.create({
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 16,
  },
  sectionContainer: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "center",
    flex: 1,
    flexWrap: "wrap",
  },
  sectionTitle: {
    fontWeight: "semibold",
    marginRight: 4,
    fontSize: 12,
    color: "#595959",
  },
  sectionValue: {
    fontSize: 10,
    color: "#8c8c8c",
  },
  page: {
    backgroundColor: "#ffffff",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "semibold",
    marginBottom: 16,
  },
  section: {
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  companySection: {
    flexDirection: "column",
    alignItems: "flex-start",
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
  lineSmall: {
    flex: 1,
    height: 0.5,
    backgroundColor: "#8c8c8c",
  },
  text: {
    marginHorizontal: 8,
    fontSize: 16,
    fontWeight: "semibold",
  },
  textSmall: {
    marginHorizontal: 8,
    fontSize: 12,
    fontWeight: "semibold",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignContent: "center",
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  image: {
    width: 100,
    height: 100,
  },
});

const TagPDFButton = ({ site, data }: TagPDFDocumentProps) => (
  <PDFDownloadLink
    document={<TagPDFDocument data={data} site={site} />}
    fileName={`TAG_${data.card.siteCardId}.pdf`}
  >
    <Button type="primary" icon={<BsFilePdf />}>
      {Strings.sharePDF}
    </Button>
  </PDFDownloadLink>
);

export default TagPDFButton;
