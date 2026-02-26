import { Card, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { useState } from 'react';
import ApiOverviewTab from './ApiOverviewTab';
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
 * 包含：概览、在线调试、版本管理、调用日志
 */
const ApiDetailTabs: React.FC<ApiDetailTabsProps> = ({
  interfaceId,
  versionId,
  onSelectVersion,
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  const items: TabsProps['items'] = [
    {
      key: 'overview',
      label: (
        <span>
          <span style={{ marginRight: 4 }}>📋</span>
          概览
        </span>
      ),
      children: (
        <ApiOverviewTab
          interfaceId={interfaceId}
          onSwitchToDebug={() => setActiveTab('debug')}
        />
      ),
    },
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
          interfaceId={interfaceId}
          versionId={versionId}
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
          interfaceId={interfaceId}
          versionId={versionId}
          onSelectVersion={onSelectVersion}
          onSwitchToDebug={() => setActiveTab('debug')}
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
      children: <ApiCallLogTab interfaceId={interfaceId} />,
    },
  ];

  return (
    <Card
      style={{ height: '100%' }}
      styles={{ body: { height: 'calc(100% - 57px)', overflowY: 'auto' } }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        size="large"
      />
    </Card>
  );
};

export default ApiDetailTabs;
