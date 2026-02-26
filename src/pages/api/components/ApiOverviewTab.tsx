import { useRequest } from '@umijs/max';
import { Descriptions, Tag, Space, Button, Empty, Spin } from 'antd';
import type { InterfaceWithVersionsDto } from '@/services/api-gateway/typings.d';
import { getById } from '@/services/api-gateway/interfaceController';
import { searchInterfaceVersion } from '@/services/api-gateway/interfaceVersionController';

// TODO: 后端需要提供聚合查询接口
// GET /interfaces/{id}/with-versions
// Response: { interfaceInfo: InterfaceDto, versions: List<InterfaceVersionDto>, currentVersion: InterfaceVersionDto }
// 目前临时使用两个接口分别获取

interface ApiOverviewTabProps {
  interfaceId: number;
  onSwitchToDebug?: () => void;
}

/**
 * 概览 Tab - 显示接口基本信息和当前版本详情
 */
const ApiOverviewTab: React.FC<ApiOverviewTabProps> = ({
  interfaceId,
  onSwitchToDebug,
}) => {
  // 获取接口基本信息
  const { data: interfaceData, loading: interfaceLoading } = useRequest(
    () => getById({ id: interfaceId }),
    {
      onError: () => {
        // 静默处理
      },
    },
  );

  // 获取当前版本（is_current = true）
  const { data: versionData, loading: versionLoading } = useRequest(
    () =>
      searchInterfaceVersion({
        page: 1,
        size: 1,
        request: {
          apiId: interfaceId,
          current: true,
        },
      }),
    {
      onError: () => {
        // 静默处理
      },
    },
  );

  const currentVersion = versionData?.data?.[0];

  // 解析 JSON 字段
  const parseJson = (jsonStr: string | any) => {
    if (!jsonStr) return {};
    if (typeof jsonStr === 'string') {
      try {
        return JSON.parse(jsonStr);
      } catch {
        return {};
      }
    }
    return jsonStr;
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'green',
      POST: 'blue',
      PUT: 'orange',
      DELETE: 'red',
      PATCH: 'purple',
    };
    return colors[method?.toUpperCase()] || 'default';
  };

  if (interfaceLoading || versionLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <Spin />
      </div>
    );
  }

  if (!interfaceData) {
    return <Empty description="接口信息不存在" />;
  }

  return (
    <div>
      <Descriptions title="接口基本信息" bordered column={2}>
        <Descriptions.Item label="接口名称">
          {interfaceData.name}
        </Descriptions.Item>
        <Descriptions.Item label="接口标识">
          <Tag color="blue">{interfaceData.code}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="接口状态">
          <Tag color={interfaceData.enabled ? 'success' : 'error'}>
            {interfaceData.enabled ? '启用' : '禁用'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="接口分类">
          {interfaceData.category || '未分类'}
        </Descriptions.Item>
        <Descriptions.Item label="所有者">
          {interfaceData.owner || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="创建时间">
          {interfaceData.createTime}
        </Descriptions.Item>
        <Descriptions.Item label="描述" span={2}>
          {interfaceData.description || '-'}
        </Descriptions.Item>
      </Descriptions>

      {currentVersion && (
        <>
          <Descriptions
            title="当前版本信息"
            bordered
            column={2}
            style={{ marginTop: 24 }}
          >
            <Descriptions.Item label="版本号">
              <Tag color="purple">{currentVersion.version}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="请求方法">
              <Tag color={getMethodColor(currentVersion.httpMethod)}>
                {currentVersion.httpMethod}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="请求路径" span={2}>
              <code>{currentVersion.path}</code>
            </Descriptions.Item>
            <Descriptions.Item label="认证类型">
              {currentVersion.authType || 'NONE'}
            </Descriptions.Item>
            <Descriptions.Item label="允许调用">
              <Tag color={currentVersion.allowInvoke ? 'success' : 'warning'}>
                {currentVersion.allowInvoke ? '是' : '否'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          {/* 请求参数 */}
          {currentVersion.requestParams && (
            <Descriptions
              title="请求参数"
              bordered
              column={1}
              style={{ marginTop: 24 }}
            >
              <Descriptions.Item label="参数定义">
                <pre
                  style={{
                    background: '#f5f5f5',
                    padding: 12,
                    borderRadius: 4,
                    margin: 0,
                    maxHeight: 200,
                    overflow: 'auto',
                  }}
                >
                  {JSON.stringify(parseJson(currentVersion.requestParams), null, 2)}
                </pre>
              </Descriptions.Item>
            </Descriptions>
          )}

          {/* 请求体 */}
          {currentVersion.requestBody && (
            <Descriptions
              title="请求体"
              bordered
              column={1}
              style={{ marginTop: 24 }}
            >
              <Descriptions.Item label="Body 结构">
                <pre
                  style={{
                    background: '#f5f5f5',
                    padding: 12,
                    borderRadius: 4,
                    margin: 0,
                    maxHeight: 200,
                    overflow: 'auto',
                  }}
                >
                  {JSON.stringify(parseJson(currentVersion.requestBody), null, 2)}
                </pre>
              </Descriptions.Item>
            </Descriptions>
          )}

          {/* 响应示例 */}
          {currentVersion.responseExample && (
            <Descriptions
              title="响应示例"
              bordered
              column={1}
              style={{ marginTop: 24 }}
            >
              <Descriptions.Item label="示例数据">
                <pre
                  style={{
                    background: '#f5f5f5',
                    padding: 12,
                    borderRadius: 4,
                    margin: 0,
                    maxHeight: 200,
                    overflow: 'auto',
                  }}
                >
                  {JSON.stringify(parseJson(currentVersion.responseExample), null, 2)}
                </pre>
              </Descriptions.Item>
            </Descriptions>
          )}

          {/* 调用示例 */}
          {currentVersion.exampleCurl && (
            <Descriptions
              title="调用示例"
              bordered
              column={1}
              style={{ marginTop: 24 }}
            >
              <Descriptions.Item label="cURL 命令">
                <pre
                  style={{
                    background: '#2d2d2d',
                    color: '#f8f8f2',
                    padding: 12,
                    borderRadius: 4,
                    margin: 0,
                  }}
                >
                  {currentVersion.exampleCurl}
                </pre>
              </Descriptions.Item>
            </Descriptions>
          )}

          <div style={{ marginTop: 24 }}>
            <Space>
              {onSwitchToDebug && currentVersion.allowInvoke && (
                <Button type="primary" onClick={onSwitchToDebug}>
                  前往调试
                </Button>
              )}
            </Space>
          </div>
        </>
      )}
    </div>
  );
};

export default ApiOverviewTab;
