import { useState } from "react";
import { useLazyDownloadReportQuery } from "../../../services/exportService";
import { handleErrorNotification } from "../../../utils/Notifications";
import CustomButton from "../../../components/CustomButtons";
import { MdOutlineFileDownload } from "react-icons/md";
import Strings from "../../../utils/localizations/Strings";
import { notification } from "antd";

interface Props {
  siteId: string;
}

const DownloadCarDataExceButton = ({ siteId }: Props) => {
  const [downloadReport, { isFetching }] = useLazyDownloadReportQuery();
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const { data } = await downloadReport(siteId);
      if (data) {
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "Tablero.xlsx");
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
      }
    } catch (error) {
      handleErrorNotification(error, Strings.failedToDownload);
      notification.error({
        message: "Download Error",
        description: "Error when trying to download the file",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomButton
      type="action"
      onClick={handleDownload}
      loading={loading || isFetching}
    >
      <MdOutlineFileDownload />
      {Strings.downloadData}
    </CustomButton>
  );
};

export default DownloadCarDataExceButton;
