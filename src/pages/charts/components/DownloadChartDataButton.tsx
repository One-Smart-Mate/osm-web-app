import { useState } from "react";
import { useLazyDownloadReportQuery } from "../../../services/exportService";
import { handleErrorNotification } from "../../../utils/Notifications";
import Strings from "../../../utils/localizations/Strings";
import { Button, notification } from "antd";

interface DownloadChartDataButtonProps {
  siteId: string;
}

const DownloadChartDataButton = ({ siteId }: DownloadChartDataButtonProps) => {
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
    <Button onClick={handleDownload} loading={loading || isFetching}>
      {Strings.downloadData}
    </Button>
  );
};

export default DownloadChartDataButton;
