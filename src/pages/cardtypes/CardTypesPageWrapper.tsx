import { useEffect, useState } from "react";
import { Spin, Result, Button } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import CardTypesPageOptimized from "./CardTypesPageOptimized";
import { UnauthorizedRoute } from "../../utils/Routes";
import useSiteId from "../../utils/hooks/useSiteId";
import useCurrentUser from "../../utils/hooks/useCurrentUser";

const CardTypesPageWrapper = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useCurrentUser();

  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);

  const resolvedSiteId = useSiteId();
  const siteId = resolvedSiteId;

  useEffect(() => {
    if (!siteId) {
      navigate(UnauthorizedRoute);
      return;
    }

    // Backfill navigation state when entered from the menu or on refresh,
    // so the optimized child screen that reads location.state keeps working.
    if (!location.state?.siteId) {
      navigate(location.pathname, {
        replace: true,
        state: {
          siteId: resolvedSiteId,
          siteName: location.state?.siteName || user?.sites?.[0]?.name || "",
        },
      });
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
