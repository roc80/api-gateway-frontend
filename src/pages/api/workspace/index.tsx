import { PageContainer } from '@ant-design/pro-components';
import { Card, Col, Row, Button } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
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
  const [isTreeCollapsed, setIsTreeCollapsed] = useState(false);
  const [treeWidth, setTreeWidth] = useState<number>(200); // 默认最小宽度

  const handleSelectInterface = (interfaceId: number) => {
    setSelectedInterfaceId(interfaceId);
    setSelectedVersionId(null); // 切换接口时清空版本选择
  };

  const handleSelectVersion = (versionId: number) => {
    setSelectedVersionId(versionId);
  };

  // 计算折叠按钮位置
  const buttonLeftPosition = isTreeCollapsed ? 16 : treeWidth + 8;

  return (
    <PageContainer title={false}>
      <Row gutter={16} style={{ height: 'calc(100vh - 150px)' }}>
        {/* 左侧接口树 */}
        {!isTreeCollapsed && (
          <Col
            flex={`0 0 ${treeWidth}px`}
            style={{ height: '100%', transition: 'all 0.2s', minWidth: 200, maxWidth: 400 }}
          >
            <ApiTree
              onSelectInterface={handleSelectInterface}
              selectedInterfaceId={selectedInterfaceId}
              onWidthChange={setTreeWidth}
            />
          </Col>
        )}

        {/* 折叠/展开按钮 */}
        <div
          style={{
            position: 'absolute',
            left: buttonLeftPosition,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            transition: 'left 0.2s',
          }}
        >
          <Button
            type="text"
            icon={isTreeCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setIsTreeCollapsed(!isTreeCollapsed)}
            style={{
              border: '1px solid #d9d9d9',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          />
        </div>

        {/* 右侧详情面板 */}
        <Col
          flex={isTreeCollapsed ? '1' : `1 1 calc(100% - ${treeWidth}px - 64px)`}
          style={{ height: '100%', overflowY: 'auto', transition: 'all 0.2s' }}
        >
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
