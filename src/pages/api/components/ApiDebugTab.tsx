import { useRequest, history } from '@umijs/max';
import { Form, Input, Button, Card, Tag, Alert, Space, Empty, Spin, Select, message } from 'antd';
import { useState, useEffect } from 'react';
import { getById } from '@/services/api-gateway/interfaceController';
import { searchInterfaceVersion } from '@/services/api-gateway/interfaceVersionController';

// TODO: 后端需要提供在线调用接口
// POST /interfaces/{id}/invoke
// Request: { versionId: Long, requestParams: Map, requestBody: Map }
// Response: ApiResponse

const { TextArea } = Input;
const { Option } = Select;

interface ApiDebugTabProps {
  interfaceId: number;
  versionId: number | null;
}

/**
 * 在线调试 Tab - 类似 Swagger 的调试界面
 */
const ApiDebugTab: React.FC<ApiDebugTabProps> = ({
  interfaceId,
  versionId: propVersionId,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(
    propVersionId,
  );

  // 获取接口基本信息
  const { data: interfaceData, loading: interfaceLoading } = useRequest(
    () => getById({ id: interfaceId }),
    {
      onError: () => {
        // 静默处理
      },
    },
  );

  // 获取所有版本
  const { data: versionsData, loading: versionsLoading } = useRequest(
    () =>
      searchInterfaceVersion({
        page: 1,
        size: 100,
        request: {
          apiId: interfaceId,
        },
      }),
    {
      onError: () => {
        // 静默处理
      },
    },
  );

  const versions = versionsData?.data || [];

  // 当前选中的版本
  const currentVersion = versions.find((v: any) => v.id === selectedVersionId) ||
    versions.find((v: any) => v.current) ||
    versions[0];

  // 当 propVersionId 变化时更新选中版本
  useEffect(() => {
    if (propVersionId) {
      setSelectedVersionId(propVersionId);
    }
  }, [propVersionId]);

  // 初始化时设置当前版本
  useEffect(() => {
    if (!selectedVersionId && currentVersion?.id) {
      setSelectedVersionId(currentVersion.id);
    }
  }, [currentVersion, selectedVersionId]);

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

  const requestParams = currentVersion?.requestParams
    ? parseJson(currentVersion.requestParams)
    : {};
  const requestBodySchema = currentVersion?.requestBody
    ? parseJson(currentVersion.requestBody)
    : {};

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

  // 发送请求
  const handleSend = async () => {
    if (!currentVersion?.allowInvoke) {
      message.error('该接口不允许调用');
      return;
    }

    try {
      const values = await form.validateFields();
      setLoading(true);
      const startTime = Date.now();

      // TODO: 调用后端在线调试接口
      // const response = await invokeInterface({
      //   id: interfaceId,
      //   versionId: selectedVersionId,
      //   requestParams: values.params || {},
      //   requestBody: values.body ? JSON.parse(values.body) : undefined,
      // });

      // 临时模拟请求
      await new Promise((resolve) => setTimeout(resolve, 800));

      setResponseStatus(200);
      setResponseData({
        code: 0,
        message: 'success',
        data: {
          result: 'TODO: 接入后端在线调用接口',
          timestamp: new Date().toISOString(),
          params: values.params || {},
          body: values.body ? JSON.parse(values.body) : undefined,
        },
      });
      setDuration(Date.now() - startTime);
      message.success('请求成功');
    } catch (error: any) {
      message.error(error.message || '请求失败');
      setResponseStatus(500);
      setResponseData({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (interfaceLoading || versionsLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <Spin />
      </div>
    );
  }

  if (!interfaceData || !currentVersion) {
    return <Empty description="接口或版本信息不存在" />;
  }

  return (
    <div>
      {/* 版本选择 */}
      {versions.length > 1 && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Space>
            <span>选择版本:</span>
            <Select
              style={{ width: 200 }}
              value={selectedVersionId}
              onChange={setSelectedVersionId}
            >
              {versions.map((v: any) => (
                <Option key={v.id} value={v.id}>
                  {v.version}
                  {v.current && ' (当前)'}
                </Option>
              ))}
            </Select>
          </Space>
        </Card>
      )}

      {/* 请求信息 */}
      <Card title="请求信息" size="small" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <Tag color={getMethodColor(currentVersion.httpMethod)}>
              {currentVersion.httpMethod}
            </Tag>
            <code>{currentVersion.path}</code>
          </Space>
          {!currentVersion.allowInvoke && (
            <Alert message="该接口当前不允许调用" type="warning" showIcon />
          )}
        </Space>
      </Card>

      {/* 请求参数表单 */}
      <Form form={form} layout="vertical">
        {Object.keys(requestParams).length > 0 && (
          <Card title="请求参数" size="small" style={{ marginBottom: 16 }}>
            {Object.entries(requestParams).map(([key, config]: [string, any]) => (
              <Form.Item
                key={key}
                name={['params', key]}
                label={`${key} ${config.required ? '(必填)' : ''}`}
                tooltip={config.description}
              >
                <Input
                  placeholder={config.description || `请输入${key}`}
                  disabled={!currentVersion.allowInvoke}
                />
              </Form.Item>
            ))}
          </Card>
        )}

        {/* 请求体 */}
        {Object.keys(requestBodySchema).length > 0 && (
          <Card title="请求体 (JSON)" size="small" style={{ marginBottom: 16 }}>
            <Form.Item
              name="body"
              label="Body"
              rules={[
                {
                  validator: async (_, value) => {
                    if (!value) return;
                    try {
                      JSON.parse(value);
                    } catch {
                      throw new Error('请输入有效的 JSON');
                    }
                  },
                },
              ]}
            >
              <TextArea
                rows={10}
                placeholder={JSON.stringify(requestBodySchema, null, 2)}
                disabled={!currentVersion.allowInvoke}
              />
            </Form.Item>
          </Card>
        )}

        {/* 操作按钮 */}
        <Space>
          <Button
            type="primary"
            onClick={handleSend}
            loading={loading}
            disabled={!currentVersion.allowInvoke}
          >
            发送请求
          </Button>
          <Button onClick={() => form.resetFields()}>
            清空
          </Button>
        </Space>
      </Form>

      {/* 响应结果 */}
      {responseData && (
        <Card
          title={
            <Space>
              <span>响应结果</span>
              <Tag color={responseStatus === 200 ? 'success' : 'error'}>
                {responseStatus}
              </Tag>
              <Tag>{duration}ms</Tag>
            </Space>
          }
          size="small"
          style={{ marginTop: 16 }}
        >
          <pre
            style={{
              background: '#f5f5f5',
              padding: 16,
              borderRadius: 4,
              overflow: 'auto',
              maxHeight: 400,
              margin: 0,
            }}
          >
            {JSON.stringify(responseData, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
};

export default ApiDebugTab;
