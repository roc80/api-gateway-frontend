import { useRequest } from '@umijs/max';
import { Button, Card, Descriptions, Form, Input, message, Space, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { getById } from '@/services/api-gateway/interfaceController';
import { searchInterfaceVersion } from '@/services/api-gateway/interfaceVersionController';

const { TextArea } = Input;

interface ApiDebugProps {
  // 从 URL 参数获取 interfaceId
  interfaceId?: string;
}

const ApiDebug: React.FC<ApiDebugProps> = () => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  // 从 URL 获取 interfaceId
  const searchParams = new URLSearchParams(location.search);
  const interfaceId = searchParams.get('interfaceId');

  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [duration, setDuration] = useState<number>(0);

  // 获取接口信息
  const { data: interfaceData, loading: interfaceLoading } = useRequest(
    () => getById({ id: Number(interfaceId) }),
    {
      ready: !!interfaceId,
      onError: () => {
        messageApi.error('获取接口信息失败');
      },
    },
  );

  // 获取接口版本（当前版本）
  const { data: versionData, loading: versionLoading } = useRequest(
    () =>
      searchInterfaceVersion({
        page: 1,
        size: 100,
        request: {
          apiId: Number(interfaceId),
          current: true,
        },
      }),
    {
      ready: !!interfaceId,
      onError: () => {
        messageApi.error('获取接口版本失败');
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

  const requestParams = currentVersion?.requestParams
    ? parseJson(currentVersion.requestParams)
    : {};
  const requestBody = currentVersion?.requestBody
    ? parseJson(currentVersion.requestBody)
    : {};

  // 发送请求
  const handleSend = async () => {
    if (!currentVersion?.allowInvoke) {
      messageApi.error('该接口不允许调用');
      return;
    }

    const values = await form.validateFields();
    setLoading(true);
    const startTime = Date.now();

    try {
      // TODO: 这里需要调用实际的接口
      // 暂时模拟请求
      await new Promise((resolve) => setTimeout(resolve, 500));

      setResponseStatus(200);
      setResponseData({
        code: 0,
        message: 'success',
        data: {
          result: '模拟响应数据',
          params: values,
        },
      });
      setDuration(Date.now() - startTime);
      messageApi.success('请求成功');
    } catch (error: any) {
      messageApi.error(error.message || '请求失败');
      setResponseStatus(500);
      setResponseData({ error: error.message });
    } finally {
      setLoading(false);
    }
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

  if (!interfaceId) {
    return (
      <Card>
        <p>缺少接口ID参数</p>
      </Card>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 接口基本信息 */}
        <Card title="接口信息" loading={interfaceLoading}>
          <Descriptions column={2} bordered>
            <Descriptions.Item label="接口名称">{interfaceData?.name}</Descriptions.Item>
            <Descriptions.Item label="接口标识">{interfaceData?.code}</Descriptions.Item>
            <Descriptions.Item label="请求方法">
              <Tag color={getMethodColor(currentVersion?.httpMethod)}>
                {currentVersion?.httpMethod}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="接口路径">{currentVersion?.path}</Descriptions.Item>
            <Descriptions.Item label="接口描述" span={2}>
              {interfaceData?.description || '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 在线调试 */}
        <Card title="在线调试" loading={versionLoading}>
          <Form form={form} layout="vertical">
            {/* URL */}
            <Form.Item label="请求 URL">
              <Input
                value={`${currentVersion?.httpMethod} ${currentVersion?.path}`}
                disabled
                style={{ marginBottom: 16 }}
              />
            </Form.Item>

            {/* Query/Path 参数 */}
            {Object.keys(requestParams).length > 0 && (
              <Card
                type="inner"
                title="请求参数"
                size="small"
                style={{ marginBottom: 16 }}
              >
                {Object.entries(requestParams).map(([key, config]: [string, any]) => (
                  <Form.Item
                    key={key}
                    name={['params', key]}
                    label={`${key} ${config.required ? '(必填)' : ''}`}
                  >
                    <Input placeholder={config.description || `请输入${key}`} />
                  </Form.Item>
                ))}
              </Card>
            )}

            {/* Request Body */}
            {Object.keys(requestBody).length > 0 && (
              <Card type="inner" title="请求体" size="small" style={{ marginBottom: 16 }}>
                <Form.Item name="body" label="Body (JSON)">
                  <TextArea
                    rows={10}
                    placeholder={JSON.stringify(requestBody, null, 2)}
                  />
                </Form.Item>
              </Card>
            )}

            {/* 操作按钮 */}
            <Space>
              <Button type="primary" onClick={handleSend} loading={loading}>
                发送请求
              </Button>
              <Button onClick={() => form.resetFields()}>清空</Button>
            </Space>
          </Form>
        </Card>

        {/* 响应结果 */}
        {responseData && (
          <Card
            title={
              <span>
                响应结果{' '}
                <Tag color={responseStatus === 200 ? 'success' : 'error'}>
                  {responseStatus}
                </Tag>
                <Tag>{duration}ms</Tag>
              </span>
            }
          >
            <pre
              style={{
                background: '#f5f5f5',
                padding: 16,
                borderRadius: 4,
                overflow: 'auto',
                maxHeight: 400,
              }}
            >
              {JSON.stringify(responseData, null, 2)}
            </pre>
          </Card>
        )}
      </Space>
    </div>
  );
};

export default ApiDebug;
