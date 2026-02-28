import { useRequest } from '@umijs/max';
import {
  Alert,
  Button,
  Card,
  Empty,
  Form,
  Input,
  Modal,
  message,
  Select,
  Space,
  Spin,
  Tag,
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import { getById, invoke } from '@/services/api-gateway/interfaceController';
import {
  createInterfaceVersion,
  searchInterfaceVersion,
  updateInterfaceVersion,
} from '@/services/api-gateway/interfaceVersionController';

// TODO: 后端需要提供在线调用接口
// POST /interfaces/{id}/invoke
// Request: { versionId: Long, requestParams: Map, requestBody: Map }
// Response: ApiResponse

interface ApiDebugTabProps {
  interfaceId: number;
  versionId: number | null;
  onVersionChange?: () => void;
}

/**
 * 在线调试 Tab - 显示当前版本信息，支持在线调试和保存为新版本
 */
const ApiDebugTab: React.FC<ApiDebugTabProps> = ({
  interfaceId,
  versionId: propVersionId,
  onVersionChange,
}) => {
  const [form] = Form.useForm();
  const [saveForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(
    propVersionId,
  );
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const initialVersionRef = useRef<any>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // 获取接口基本信息
  const { data: interfaceData, loading: interfaceLoading } = useRequest(
    () => getById({ id: interfaceId }),
    {
      ready: !!interfaceId,
      refreshDeps: [interfaceId],
    },
  );

  // 获取所有版本
  const {
    data: versionsData,
    loading: versionsLoading,
    refresh: refreshVersions,
  } = useRequest(
    () =>
      searchInterfaceVersion({
        page: 1,
        size: 100,
        request: {
          apiId: interfaceId,
        },
      }),
    {
      ready: !!interfaceId,
      refreshDeps: [interfaceId],
    },
  ) as { data: any; loading: boolean; refresh: () => void };

  const versions = Array.isArray(versionsData)
    ? versionsData
    : versionsData?.data || [];

  // 当前选中的版本 - 优先选择 current:true 的版本
  const currentVersion =
    versions.find((v: any) => v.current) ||
    versions.find((v: any) => v.id === selectedVersionId) ||
    versions[0];

  // 当 interfaceId 变化时重置选中版本和表单状态
  useEffect(() => {
    setSelectedVersionId(null);
    setHasChanges(false);
    initialVersionRef.current = null;
  }, [interfaceId]);

  // 调试日志
  console.log('ApiDebugTab - interfaceId:', interfaceId);
  console.log('ApiDebugTab - versionsLoading:', versionsLoading);
  console.log('ApiDebugTab - versions:', versions);
  console.log('ApiDebugTab - selectedVersionId:', selectedVersionId);
  console.log('ApiDebugTab - currentVersion:', currentVersion);

  // 当 propVersionId 变化时更新选中版本
  useEffect(() => {
    if (propVersionId) {
      setSelectedVersionId(propVersionId);
    }
  }, [propVersionId]);

  // 初始化时设置当前版本（只在数据加载完成后执行）
  useEffect(() => {
    if (!versionsLoading && !selectedVersionId && currentVersion?.id) {
      setSelectedVersionId(currentVersion.id);
    }
  }, [versionsLoading, currentVersion, selectedVersionId]);

  // 当版本切换时，更新表单值（只在数据加载完成后执行）
  useEffect(() => {
    if (!versionsLoading && currentVersion) {
      const formValues = {
        httpMethod: currentVersion.httpMethod || 'GET',
        path: currentVersion.path || '',
        requestHeaders: currentVersion.requestHeaders || '{}',
        requestParams: currentVersion.requestParams || '{}',
        requestBody: currentVersion.requestBody || '{}',
      };
      form.setFieldsValue(formValues);
      initialVersionRef.current = formValues;
      setHasChanges(false);
    }
  }, [currentVersion, versionsLoading]);

  // 监听表单变化
  const handleFormChange = () => {
    if (initialVersionRef.current) {
      const currentValues = form.getFieldsValue();
      const changed = Object.keys(initialVersionRef.current).some(
        (key) =>
          JSON.stringify(initialVersionRef.current[key]) !==
          JSON.stringify(currentValues[key]),
      );
      setHasChanges(changed);
    }
  };

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

      // 调用后端在线调试接口
      const requestData = {
        httpMethod: values.httpMethod,
        path: values.path,
        requestHeaders: parseJson(values.requestHeaders),
        requestParams: parseJson(values.requestParams),
        requestBody: parseJson(values.requestBody),
        timestamp: new Date().toISOString(),
      };

      const response = await invoke(requestData.requestBody);

      setResponseStatus(200);
      setResponseData(response);
      setDuration(Date.now() - startTime);
      message.success('请求成功');
    } catch (error: any) {
      // 提取错误信息，优先显示 detail 字段
      let errorMsg = '请求失败';
      if (error?.data?.detail) {
        errorMsg = error.data.detail;
      } else if (error?.response?.data?.detail) {
        errorMsg = error.response.data.detail;
      } else if (error?.detail) {
        errorMsg = error.detail;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      message.error(errorMsg);
      setResponseStatus(500);
      setResponseData({ error: errorMsg, timestamp: new Date().toISOString() });
    } finally {
      setLoading(false);
    }
  };

  // 打开保存弹窗
  const openSaveModal = async () => {
    try {
      await form.validateFields();
      setIsSaveModalVisible(true);
    } catch (error) {
      message.error('请先完善表单信息');
    }
  };

  // 保存为新版本
  const handleSave = async () => {
    try {
      const values = await saveForm.validateFields();
      const formValues = form.getFieldsValue();

      // 创建新版本
      const newVersion = await createInterfaceVersion({
        apiId: interfaceId,
        version: values.version,
        httpMethod: formValues.httpMethod,
        path: formValues.path,
        requestHeaders: formValues.requestHeaders || '{}',
        requestParams: formValues.requestParams || '{}',
        requestBody: formValues.requestBody || '{}',
      } as any);

      // 确保新版本有ID
      if (!newVersion?.id) {
        throw new Error('创建版本失败：未获取到版本ID');
      }

      // 将其他版本设为非当前版本
      for (const v of versions) {
        if (v.current) {
          await updateInterfaceVersion(
            { id: v.id },
            {
              current: false,
              httpMethod: v.httpMethod,
              path: v.path,
              allowInvoke: v.allowInvoke,
            },
          );
        }
      }

      // 将新版本设为当前版本
      await updateInterfaceVersion(
        { id: newVersion.id },
        {
          current: true,
          httpMethod: formValues.httpMethod,
          path: formValues.path,
          allowInvoke: true,
        },
      );

      message.success('保存成功，新版本已创建并设为当前版本');
      setIsSaveModalVisible(false);
      saveForm.resetFields();

      // 刷新版本列表
      await refreshVersions();

      // 选中新创建的版本
      setSelectedVersionId(newVersion.id);

      // 重置表单状态
      setHasChanges(false);
      initialVersionRef.current = {
        httpMethod: formValues.httpMethod,
        path: formValues.path,
        requestHeaders: formValues.requestHeaders || '{}',
        requestParams: formValues.requestParams || '{}',
        requestBody: formValues.requestBody || '{}',
      };

      // 通知父组件版本已变化
      onVersionChange?.();
    } catch (error: any) {
      // 提取错误信息，优先显示 detail 字段
      let errorMsg = '保存失败';
      if (error?.data?.detail) {
        errorMsg = error.data.detail;
      } else if (error?.response?.data?.detail) {
        errorMsg = error.response.data.detail;
      } else if (error?.detail) {
        errorMsg = error.detail;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      message.error(errorMsg);
    }
  };

  if (interfaceLoading || versionsLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <Spin />
      </div>
    );
  }

  if (!currentVersion) {
    return <Empty description="版本信息不存在，请先创建接口版本" />;
  }

  return (
    <div>
      {/* 版本选择 */}
      {versions.length > 1 && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Space>
            <span>当前版本:</span>
            <Tag color="blue">{currentVersion.version || '未命名'}</Tag>
            <Tag color={currentVersion.current ? 'success' : 'default'}>
              {currentVersion.current ? '当前版本' : '历史版本'}
            </Tag>
            <Select
              style={{ width: 200 }}
              value={selectedVersionId}
              onChange={setSelectedVersionId}
              options={versions.map((v: any) => ({
                key: v.id,
                value: v.id,
                label: `${v.version}${v.current ? ' (当前)' : ''}`,
              }))}
            />
          </Space>
        </Card>
      )}

      {/* 允许调用状态提示 */}
      {!currentVersion.allowInvoke && (
        <Alert
          message="当前版本不允许调用，只能查看和编辑配置，无法发送请求"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* 编辑表单 */}
      <Form form={form} layout="vertical" onValuesChange={handleFormChange}>
        {/* 请求方法和路径 + 按钮 - Knife4j 风格 */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Space.Compact
            style={{ width: '100%', display: 'flex', alignItems: 'flex-start' }}
          >
            <Form.Item
              name="httpMethod"
              style={{ marginBottom: 0 }}
              rules={[{ required: true, message: '请选择请求方法' }]}
            >
              <Select style={{ width: 100 }}>
                <Select.Option value="GET">
                  <Tag color="green">GET</Tag>
                </Select.Option>
                <Select.Option value="POST">
                  <Tag color="blue">POST</Tag>
                </Select.Option>
                <Select.Option value="PUT">
                  <Tag color="orange">PUT</Tag>
                </Select.Option>
                <Select.Option value="DELETE">
                  <Tag color="red">DELETE</Tag>
                </Select.Option>
                <Select.Option value="PATCH">
                  <Tag color="purple">PATCH</Tag>
                </Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="path"
              style={{ marginBottom: 0, flex: 1, marginRight: 8 }}
              rules={[{ required: true, message: '请输入请求路径' }]}
            >
              <Input placeholder="/api/path" />
            </Form.Item>

            <Button
              type="primary"
              onClick={handleSend}
              loading={loading}
              disabled={!currentVersion.allowInvoke}
            >
              发送请求
            </Button>
            <Button onClick={() => form.resetFields()}>重置</Button>
          </Space.Compact>
          {hasChanges && (
            <div style={{ marginTop: 12 }}>
              <Space>
                <Button type="default" onClick={openSaveModal}>
                  保存为新版本
                </Button>
                <Tag color="orange">有未保存的更改</Tag>
              </Space>
            </div>
          )}
        </Card>

        {/* 请求头 */}
        <Card title="请求头 (JSON)" size="small" style={{ marginBottom: 16 }}>
          <Form.Item
            name="requestHeaders"
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
            <Input.TextArea
              rows={4}
              placeholder='{"Content-Type": "application/json"}'
            />
          </Form.Item>
        </Card>

        {/* 请求参数 */}
        <Card title="请求参数 (JSON)" size="small" style={{ marginBottom: 16 }}>
          <Form.Item
            name="requestParams"
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
            <Input.TextArea
              rows={4}
              placeholder='{"param1": {"type": "string", "required": true, "description": "参数1"}}'
            />
          </Form.Item>
        </Card>

        {/* 请求体 */}
        <Card
          title="请求体结构 (JSON)"
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Form.Item
            name="requestBody"
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
            <Input.TextArea
              rows={6}
              placeholder='{"name": "string", "age": "number"}'
            />
          </Form.Item>
        </Card>
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

      {/* 保存为新版本弹窗 */}
      <Modal
        title="保存为新版本"
        open={isSaveModalVisible}
        onOk={handleSave}
        onCancel={() => {
          setIsSaveModalVisible(false);
          saveForm.resetFields();
        }}
        okText="保存"
        cancelText="取消"
      >
        <Form form={saveForm} layout="vertical">
          <Form.Item
            name="version"
            label="版本号"
            rules={[{ required: true, message: '请输入版本号' }]}
          >
            <Input placeholder="例如: v1.0, v2.1" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ApiDebugTab;
