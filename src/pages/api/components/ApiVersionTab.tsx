import { useRequest } from '@umijs/max';
import { Table, Button, Tag, Space, Popconfirm, message, Card, Modal, Form, Input, Select, Switch } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import dayjs from 'dayjs';
import { searchInterfaceVersion, updateInterfaceVersion, createInterfaceVersion, deleteInterfaceVersion } from '@/services/api-gateway/interfaceVersionController';

// TODO: 后端需要提供切换当前版本接口
// PATCH /interfaces/versions/{id}/set-current

const { Option } = Select;

interface ApiVersionTabProps {
  interfaceId: number;
  versionId: number | null;
  onSelectVersion: (versionId: number) => void;
  onSwitchToDebug?: () => void;
}

/**
 * 版本管理 Tab - 显示、切换、新建版本
 */
const ApiVersionTab: React.FC<ApiVersionTabProps> = ({
  interfaceId,
  versionId,
  onSelectVersion,
  onSwitchToDebug,
}) => {
  const [messageApi, messageContextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingVersion, setEditingVersion] = useState<any>(null);
  const [form] = Form.useForm();

  const { data, loading, refresh } = useRequest(
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

  const versions = Array.isArray(data) ? data : (data?.data || []);

  // 切换当前版本
  const handleSetCurrent = async (record: any) => {
    if (record.current) return;

    // TODO: 调用后端切换版本接口
    // await setCurrentVersion({ id: record.id });

    // 临时逻辑：先将其他版本设为非当前，再设置当前版本
    try {
      // 将所有版本设为非当前
      for (const v of versions) {
        if (v.current) {
          await updateInterfaceVersion(
            { id: v.id },
            { current: false, httpMethod: v.httpMethod, path: v.path, allowInvoke: v.allowInvoke },
          );
        }
      }
      // 设置目标版本为当前
      await updateInterfaceVersion(
        { id: record.id },
        { current: true, httpMethod: record.httpMethod, path: record.path, allowInvoke: record.allowInvoke },
      );

      messageApi.success('切换成功');
      refresh();
    } catch (error) {
      messageApi.error('切换失败');
    }
  };

  // 删除版本
  const handleDelete = async (id: number) => {
    try {
      await deleteInterfaceVersion({ id });
      messageApi.success('删除成功');
      refresh();
    } catch (error) {
      messageApi.error('删除失败');
    }
  };

  // 新建/编辑版本
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // 如果设为当前版本，先将其他版本设为非当前
      if (values.current) {
        for (const v of versions) {
          if (v.current && v.id !== editingVersion?.id) {
            await updateInterfaceVersion(
              { id: v.id },
              { current: false, httpMethod: v.httpMethod, path: v.path, allowInvoke: v.allowInvoke },
            );
          }
        }
      }

      if (editingVersion) {
        // 编辑
        await updateInterfaceVersion(
          { id: editingVersion.id },
          {
            ...values,
            requestHeaders: values.requestHeaders || '{}',
            requestParams: values.requestParams || '{}',
            requestBody: values.requestBody || '{}',
            responseBody: values.responseBody || '{}',
            responseExample: values.responseExample || '{}',
            exampleCode: values.exampleCode || '{}',
          },
        );
        messageApi.success('更新成功');
      } else {
        // 新建
        await createInterfaceVersion({
          apiId: interfaceId,
          ...values,
          requestHeaders: values.requestHeaders || '{}',
          requestParams: values.requestParams || '{}',
          requestBody: values.requestBody || '{}',
          responseBody: values.responseBody || '{}',
          responseExample: values.responseExample || '{}',
          exampleCode: values.exampleCode || '{}',
        });
        messageApi.success('创建成功');
      }

      setIsModalVisible(false);
      setEditingVersion(null);
      form.resetFields();
      refresh();
    } catch (error: any) {
      messageApi.error(error.message || '操作失败');
    }
  };

  // 打开新建/编辑弹窗
  const openModal = (record?: any) => {
    if (record) {
      setEditingVersion(record);
      // 处理 requestHeaders 和 requestParams - 如果是对象则转字符串，否则直接使用
      const requestHeadersValue = typeof record.requestHeaders === 'object'
        ? JSON.stringify(record.requestHeaders, null, 2)
        : (record.requestHeaders || '{}');
      const requestParamsValue = typeof record.requestParams === 'object'
        ? JSON.stringify(record.requestParams, null, 2)
        : (record.requestParams || '{}');

      form.setFieldsValue({
        ...record,
        requestHeaders: requestHeadersValue,
        requestParams: requestParamsValue,
        requestBody: record.requestBody ? JSON.stringify(record.requestBody, null, 2) : '{}',
        responseBody: record.responseBody ? JSON.stringify(record.responseBody, null, 2) : '{}',
        responseExample: record.responseExample ? JSON.stringify(record.responseExample, null, 2) : '{}',
        exampleCode: record.exampleCode ? JSON.stringify(record.exampleCode, null, 2) : '{}',
      });
    } else {
      setEditingVersion(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const columns: ColumnsType<any> = [
    {
      title: '版本号',
      dataIndex: 'version',
      key: 'version',
      width: 100,
      render: (text, record) => (
        <Space>
          {text}
          {record.current && <Tag color="blue">当前</Tag>}
        </Space>
      ),
    },
    {
      title: '请求方法',
      dataIndex: 'httpMethod',
      key: 'httpMethod',
      width: 100,
      render: (text) => {
        const colors: Record<string, string> = {
          GET: 'green',
          POST: 'blue',
          PUT: 'orange',
          DELETE: 'red',
          PATCH: 'purple',
        };
        return <Tag color={colors[text]}>{text}</Tag>;
      },
    },
    {
      title: '路径',
      dataIndex: 'path',
      key: 'path',
      width: 200,
      ellipsis: true,
      render: (text) => <code>{text}</code>,
    },
    {
      title: '认证类型',
      dataIndex: 'authType',
      key: 'authType',
      width: 100,
      render: (text) => text || 'NONE',
    },
    {
      title: '允许调用',
      dataIndex: 'allowInvoke',
      key: 'allowInvoke',
      width: 100,
      render: (text) => (
        <Tag color={text ? 'success' : 'warning'}>{text ? '是' : '否'}</Tag>
      ),
    },
    {
      title: '请求头',
      dataIndex: 'requestHeaders',
      key: 'requestHeaders',
      width: 150,
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: '请求参数',
      dataIndex: 'requestParams',
      key: 'requestParams',
      width: 150,
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: '请求体',
      dataIndex: 'requestBody',
      key: 'requestBody',
      width: 150,
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 180,
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {!record.current && (
            <Popconfirm
              title="确定设为当前版本吗？"
              onConfirm={() => handleSetCurrent(record)}
              okText="确定"
              cancelText="取消"
            >
              <a>设为当前</a>
            </Popconfirm>
          )}
          <a onClick={() => openModal(record)}>编辑</a>
          {!record.current && (
            <Popconfirm
              title="确定删除此版本吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <a style={{ color: 'red' }}>删除</a>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {messageContextHolder}
      <Card
        title="版本列表"
        extra={
          <Button type="primary" onClick={() => openModal()}>
            新建版本
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={versions}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="small"
          scroll={{ x: 1500 }}
        />
      </Card>

      {/* 新建/编辑弹窗 */}
      <Modal
        title={editingVersion ? '编辑版本' : '新建版本'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingVersion(null);
          form.resetFields();
        }}
        width={800}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="version"
            label="版本号"
            rules={[{ required: true, message: '请输入版本号' }]}
          >
            <Input placeholder="例如: v1.0" />
          </Form.Item>

          <Form.Item
            name="httpMethod"
            label="请求方法"
            rules={[{ required: true, message: '请选择请求方法' }]}
          >
            <Select>
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
              <Option value="PATCH">PATCH</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="path"
            label="接口路径"
            rules={[{ required: true, message: '请输入接口路径' }]}
          >
            <Input placeholder="例如: /api/user/{id}" />
          </Form.Item>

          <Form.Item name="current" label="设为当前版本" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="allowInvoke" label="允许调用" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>

          <Form.Item name="authType" label="认证类型">
            <Select placeholder="默认为 NONE">
              <Option value="NONE">NONE</Option>
              <Option value="API_KEY">API_KEY</Option>
              <Option value="OAUTH2">OAUTH2</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="requestHeaders"
            label="请求头 (JSON)"
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
            <Input.TextArea rows={3} placeholder='{"Content-Type": "application/json"}' />
          </Form.Item>

          <Form.Item
            name="requestParams"
            label="请求参数 (JSON)"
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
            <Input.TextArea rows={3} placeholder='{"param1": {"type": "string", "required": true}}' />
          </Form.Item>

          <Form.Item name="requestBody" label="请求体结构 (JSON)">
            <Input.TextArea rows={3} placeholder='{"name": "string", "age": "number"}' />
          </Form.Item>

          <Form.Item name="responseBody" label="响应体结构 (JSON)">
            <Input.TextArea rows={3} placeholder='{"code": 0, "data": {}}' />
          </Form.Item>

          <Form.Item name="responseExample" label="响应示例 (JSON)">
            <Input.TextArea rows={3} placeholder='{"code": 0, "data": {}, "message": "success"}' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ApiVersionTab;
