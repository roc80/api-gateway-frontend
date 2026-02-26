import { PageContainer } from '@ant-design/pro-components';
import { Card, Col, Row } from 'antd';
import React, { useState } from 'react';
import ApiTree from '../components/ApiTree';
import ApiDetailTabs from '../components/ApiDetailTabs';

/**
 * API 工作区 - 主页面
 *
 * 布局：左侧接口树 + 右侧详情面板
 */
const Workspace: React.FC = () => {
  const [selectedInterfaceId, setSelectedInterfaceId] = useState<number | null>(
    null,
  );
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(
    null,
  );

  const handleSelectInterface = (interfaceId: number) => {
    setSelectedInterfaceId(interfaceId);
    setSelectedVersionId(null); // 切换接口时清空版本选择
  };

  const handleSelectVersion = (versionId: number) => {
    setSelectedVersionId(versionId);
  };

  return (
    <PageContainer title={false}>
      <Row gutter={16} style={{ height: 'calc(100vh - 150px)' }}>
        {/* 左侧接口树 */}
        <Col span={6} style={{ height: '100%' }}>
          <ApiTree
            onSelectInterface={handleSelectInterface}
            selectedInterfaceId={selectedInterfaceId}
          />
        </Col>

        {/* 右侧详情面板 */}
        <Col span={18} style={{ height: '100%', overflowY: 'auto' }}>
          {selectedInterfaceId ? (
            <ApiDetailTabs
              interfaceId={selectedInterfaceId}
              versionId={selectedVersionId}
              onSelectVersion={handleSelectVersion}
            />
          ) : (
            <Card
              style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <p style={{ color: '#999', textAlign: 'center' }}>
                请从左侧选择一个接口
              </p>
            </Card>
          )}
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Workspace;
