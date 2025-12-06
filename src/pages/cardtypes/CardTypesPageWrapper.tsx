import { useEffect, useState } from "react";
import { Spin, Result, Button } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import CardTypesPageOptimized from "./CardTypesPageOptimized";
import { UnauthorizedRoute } from "../../utils/Routes";

const CardTypesPageWrapper = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);

  const siteId = location.state?.siteId;

  useEffect(() => {
    if (!location.state || !siteId) {
      navigate(UnauthorizedRoute);
      return;
    }

    // Short delay to allow for smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [location.state, siteId, navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Result
        status="error"
        title="Error Loading Card Types"
        subTitle={error}
        extra={[
          <Button key="retry" type="primary" onClick={() => window.location.reload()}>
            Retry
          </Button>,
          <Button key="back" onClick={() => navigate(-1)}>
            Go Back
          </Button>,
        ]}
      />
    );
  }

  // Always use optimized version
  return <CardTypesPageOptimized />;
};

export default CardTypesPageWrapper;
