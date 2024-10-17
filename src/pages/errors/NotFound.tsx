import React from "react";
import { Button, Result } from "antd";
import Strings from "../../utils/localizations/Strings";
import { useGoBack } from "../../utils/hooks/useGoBack";

const NotFound: React.FC = () => {
  const goBack = useGoBack();
  return (
    <Result
      status="404"
      title={Strings.notFoundPageTitle}
      subTitle={Strings.notFoundPageSubTitle}
      extra={
        <Button onClick={() => goBack({})} type="primary">
          {Strings.goBack}
        </Button>
      }
    />
  );
};

export default NotFound;
