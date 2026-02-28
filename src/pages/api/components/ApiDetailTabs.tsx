import { Card, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { useState, useCallback, useMemo } from 'react';
import ApiDebugTab from './ApiDebugTab';
import ApiVersionTab from './ApiVersionTab';
import ApiCallLogTab from './ApiCallLogTab';

interface ApiDetailTabsProps {
  interfaceId: number;
  versionId: number | null;
  onSelectVersion: (versionId: number) => void;
}

/**
 * 右侧详情 Tabs 容器
 * 包含：在线调试、版本管理、调用日志
 */
const ApiDetailTabs: React.FC<ApiDetailTabsProps> = ({
  interfaceId,
  versionId,
  onSelectVersion,
}) => {
  const [activeTab, setActiveTab] = useState<string>('debug');
  const [versionRefreshKey, setVersionRefreshKey] = useState<number>(0);
  const [tabRefreshKeys, setTabRefreshKeys] = useState<Record<string, number>>({
    debug: 0,
    version: 0,
    log: 0,
  });

  // 版本数据变化时的回调
  const handleVersionChange = useCallback(() => {
    setVersionRefreshKey(prev => prev + 1);
  }, []);

  // Tab 切换时触发该 Tab 的刷新
  const handleTabChange: TabsProps['onChange'] = (key) => {
    setActiveTab(key);
    setTabRefreshKeys(prev => ({
      ...prev,
      [key]: (prev[key] || 0) + 1,
    }));
  };

  const items: TabsProps['items'] = useMemo(() => [
    {
      key: 'debug',
      label: (
        <span>
          <span style={{ marginRight: 4 }}>🔧</span>
          在线调试
        </span>
      ),
      children: (
        <ApiDebugTab
          key={`${versionRefreshKey}-${tabRefreshKeys.debug}`}
          interfaceId={interfaceId}
          versionId={versionId}
          onVersionChange={handleVersionChange}
        />
      ),
    },
    {
      key: 'version',
      label: (
        <span>
          <span style={{ marginRight: 4 }}>📝</span>
          版本管理
        </span>
      ),
      children: (
        <ApiVersionTab
          key={tabRefreshKeys.version}
          interfaceId={interfaceId}
          versionId={versionId}
          onSelectVersion={onSelectVersion}
          onSwitchToDebug={() => setActiveTab('debug')}
          onVersionChange={handleVersionChange}
        />
      ),
    },
    {
      key: 'log',
      label: (
        <span>
          <span style={{ marginRight: 4 }}>📊</span>
          调用日志
        </span>
      ),
      children: <ApiCallLogTab key={tabRefreshKeys.log} interfaceId={interfaceId} />,
    },
  ], [interfaceId, versionId, versionRefreshKey, tabRefreshKeys, onSelectVersion, handleVersionChange]);

  return (
    <Card
      style={{ height: '100%' }}
      styles={{ body: { height: 'calc(100% - 57px)', overflowY: 'auto' } }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={items}
        size="large"
      />
    </Card>
  );
};

export default ApiDetailTabs;
