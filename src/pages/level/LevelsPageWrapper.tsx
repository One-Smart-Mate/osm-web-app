import { useEffect, useState } from "react";
import { Spin, Result, Button } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetLevelStatsMutation } from "../../services/levelService";
import LevelsPageLazyTree from "./LevelsPageLazyTree";
import { LevelCache } from "../../utils/levelCache";
import { UnauthorizedRoute } from "../../utils/Routes";

const LevelsPageWrapper = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [getLevelStats] = useGetLevelStatsMutation();

  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'standard' | 'optimized' | 'lazy-tree' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const siteId = location.state?.siteId;

  useEffect(() => {
    if (!location.state || !siteId) {
      navigate(UnauthorizedRoute);
      return;
    }

    checkPerformanceMode();
  }, [location.state]);

  const checkPerformanceMode = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check cached stats first
      const cachedStats = await LevelCache.getStats(siteId);

      let statsData = cachedStats;
      if (!cachedStats) {
        // Get fresh stats from server
        const response = await getLevelStats(siteId.toString()).unwrap();
        statsData = response;

        // Cache the stats
        await LevelCache.cacheStats(siteId, statsData);
      }

      // Always use lazy-tree mode by default
      setViewMode('lazy-tree');
      localStorage.setItem(`level_view_mode_${siteId}`, 'lazy-tree');
    } catch (err) {
      console.error("Error checking performance mode:", err);
      setError("Failed to load level statistics");

      // Default to lazy-tree version on error
      setViewMode('lazy-tree');
    } finally {
      setIsLoading(false);
    }
  };

  // Kept for future use if we need to re-enable view switching
  /*
  const showPerformanceDialog = (statsData: any) => {
    Modal.confirm({
      title: "Large Dataset Detected",
      content: (
        <div>
          <p>This site contains <strong>{statsData.totalLevels.toLocaleString()}</strong> levels.</p>
          <p>Choose the view mode that best suits your needs:</p>
          <ul>
            <li><strong>Standard View:</strong> Traditional tree view with all features (slower for large datasets)</li>
            <li><strong>Lazy Tree View:</strong> Optimized tree view with on-demand loading (recommended)</li>
            <li><strong>Optimized View:</strong> Alternative interface with virtual scrolling</li>
          </ul>
          <div style={{ marginTop: 16 }}>
            <Select
              defaultValue="lazy-tree"
              style={{ width: '100%' }}
              onChange={(value) => {
                setViewMode(value as 'standard' | 'optimized' | 'lazy-tree');
                localStorage.setItem(`level_view_mode_${siteId}`, value);
                Modal.destroyAll();
              }}
              options={[
                { value: 'standard', label: 'Standard View' },
                { value: 'lazy-tree', label: 'Lazy Tree View (Recommended)' },
                { value: 'optimized', label: 'Optimized View' },
              ]}
            />
          </div>
        </div>
      ),
      footer: null,
      width: 600,
    });
  };

  const handleSwitchView = (newMode: 'standard' | 'optimized' | 'lazy-tree') => {
    setViewMode(newMode);
    localStorage.setItem(`level_view_mode_${siteId}`, newMode);

    // Clear cache when switching modes
    LevelCache.clearSiteCache(siteId);
  };
  */

  // Loading state
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <Spin size="large" tip="Checking performance requirements..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Result
        status="error"
        title="Error Loading Levels"
        subTitle={error}
        extra={[
          <Button key="retry" type="primary" onClick={checkPerformanceMode}>
            Retry
          </Button>,
          <Button key="back" onClick={() => navigate(-1)}>
            Go Back
          </Button>,
        ]}
      />
    );
  }

  // No decision made yet
  if (viewMode === null) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <Spin size="large" tip="Preparing level view..." />
      </div>
    );
  }

  // Render the appropriate version with a view switcher
  return (
    <div style={{ position: 'relative' }}>
      {/* View Switcher Dropdown - Hidden for now but kept for future use */}
      {/* {stats && stats.totalLevels <= FORCE_OPTIMIZED_THRESHOLD && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000
        }}>
          <Select
            value={viewMode}
            onChange={handleSwitchView}
            style={{ width: 200 }}
            options={[
              { value: 'standard', label: 'Standard View' },
              { value: 'lazy-tree', label: 'Lazy Tree View' },
              { value: 'optimized', label: 'Optimized View' },
            ]}
          />
        </div>
      )} */}

      {/* Render only the lazy-tree version by default */}
      {viewMode === 'lazy-tree' && <LevelsPageLazyTree />}

      {/* Keep other views hidden but not deleted for future use */}
      {/* {viewMode === 'standard' && <LevelsPage />} */}
      {/* {viewMode === 'optimized' && <LevelsPageOptimized />} */}
    </div>
  );
};

export default LevelsPageWrapper;