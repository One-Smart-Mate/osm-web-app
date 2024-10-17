import React from "react";
import { Button, Result } from "antd";
import Strings from "../../utils/localizations/Strings";
import { useGoBack } from "../../utils/hooks/useGoBack";

const Unauthorized: React.FC = () => {
  const goBack = useGoBack(403);
  return (
    <Result
      status="403"
      title={Strings.unauthorizedPageTitle}
      subTitle={Strings.unauthorizedPageSubTitle}
      extra={
        <Button onClick={() => goBack({})} type="primary">
          {Strings.goBack}
        </Button>
      }
    />
  );
};

export default Unauthorized;
