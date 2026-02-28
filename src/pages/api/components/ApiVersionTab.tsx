import { useRequest } from '@umijs/max';
import { Button, Tag, Space, Popconfirm, message, Modal, Form, Input, Select, Switch } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useState, useRef, useEffect } from 'react';
import type { ActionType } from '@ant-design/pro-components';
import { createTimeColumn, updateTimeColumn } from '@/components/CrudTable';
import { searchInterfaceVersion, updateInterfaceVersion, createInterfaceVersion, deleteInterfaceVersion } from '@/services/api-gateway/interfaceVersionController';

// JSON 编辑器组件 - 输入对象，显示为格式化的 JSON 字符串
const JsonEditor: React.FC<{
  value?: any;
  onChange?: (value: any) => void;
  placeholder?: string;
  rows?: number;
}> = ({ value, onChange, placeholder = '{}', rows = 3 }) => {
  // 初始化文本值
  const getInitialTextValue = (val: any) => {
    // null 或 undefined 显示为空
    if (val === null || val === undefined) return '';
    // 空对象显示为格式化的 {}
    if (typeof val === 'object' && val !== null && Object.keys(val).length === 0) {
      return '{}';
    }
    // 有内容的对象或字符串
    if (typeof val === 'object' && val !== null) {
      return JSON.stringify(val, null, 2);
    }
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        if (typeof parsed === 'object') {
          return Object.keys(parsed).length > 0 ? JSON.stringify(parsed, null, 2) : '{}';
        }
        return val;
      } catch {
        return val;
      }
    }
    return '';
  };

  const [textValue, setTextValue] = useState('');
  const [error, setError] = useState('');
  const prevValueRef = useRef<any>();

  // 当 value 变化时更新文本显示
  useEffect(() => {
    // 只有当 value 真正变化时才更新（避免用户输入时被覆盖）
    if (JSON.stringify(value) !== JSON.stringify(prevValueRef.current)) {
      prevValueRef.current = value;
      setTextValue(getInitialTextValue(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setTextValue(newValue);

    // 实时校验并更新值
    if (!newValue.trim()) {
      setError('');
      onChange?.(undefined);
      return;
    }

    try {
      const parsed = JSON.parse(newValue);
      setError('');
      onChange?.(parsed);
    } catch (err) {
      setError('JSON 格式错误');
    }
  };

  return (
    <div>
      <Input.TextArea
        value={textValue}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        status={error ? 'error' : undefined}
      />
      {error && <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>{error}</div>}
    </div>
  );
};

// TODO@lp: 后端需要提供切换当前版本接口
// PATCH /interfaces/versions/{id}/set-current

interface ApiVersionTabProps {
  interfaceId: number;
  versionId: number | null;
  onSelectVersion: (versionId: number) => void;
  onSwitchToDebug?: () => void;
  onVersionChange?: () => void;
}

/**
 * 版本管理 Tab - 显示、切换、新建版本
 */
const ApiVersionTab: React.FC<ApiVersionTabProps> = ({
  interfaceId,
  versionId,
  onSelectVersion,
  onSwitchToDebug,
  onVersionChange,
}) => {
  const actionRef = useRef<ActionType>();
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
      refreshDeps: [interfaceId],
      onError: () => {
        // 静默处理
      },
    },
  ) as { data: any; loading: boolean; refresh: () => void };

  const versions = Array.isArray(data) ? data : (data?.data || []);

  // 切换当前版本
  const handleSetCurrent = async (record: any) => {
    if (record.current) return;

    // TODO@lp: 调用后端切换版本接口
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
      onVersionChange?.();
    } catch (error: any) {
      let errorMsg = '切换失败';
      if (error?.data?.detail) {
        errorMsg = error.data.detail;
      } else if (error?.response?.data?.detail) {
        errorMsg = error.response.data.detail;
      } else if (error?.detail) {
        errorMsg = error.detail;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      messageApi.error(errorMsg);
    }
  };

  // 删除版本
  const handleDelete = async (id: number) => {
    try {
      await deleteInterfaceVersion({ id });
      messageApi.success('删除成功');
      refresh();
      onVersionChange?.();
    } catch (error: any) {
      let errorMsg = '删除失败';
      if (error?.data?.detail) {
        errorMsg = error.data.detail;
      } else if (error?.response?.data?.detail) {
        errorMsg = error.response.data.detail;
      } else if (error?.detail) {
        errorMsg = error.detail;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      messageApi.error(errorMsg);
    }
  };

  // 新建/编辑版本
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('handleSave - form values:', values);

      // 将 JSON 对象字段转为字符串
      const jsonify = (obj: any) => {
        if (!obj || typeof obj === 'string') {
          return obj || '{}';
        }
        return JSON.stringify(obj);
      };

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
        const updateData = {
          version: values.version,
          httpMethod: values.httpMethod,
          path: values.path,
          current: values.current || false,
          allowInvoke: values.allowInvoke !== undefined ? values.allowInvoke : true,
          authType: values.authType || 'NONE',
          requestHeaders: jsonify(values.requestHeaders),
          requestParams: jsonify(values.requestParams),
          requestBody: jsonify(values.requestBody),
          responseBody: jsonify(values.responseBody),
          responseExample: jsonify(values.responseExample),
          exampleCode: jsonify(values.exampleCode),
        };
        console.log('handleSave - updateData:', updateData);
        console.log('handleSave - editingVersion:', editingVersion);

        await updateInterfaceVersion(
          { id: editingVersion.id },
          updateData,
        );
        messageApi.success('更新成功');
      } else {
        // 新建
        await createInterfaceVersion({
          apiId: interfaceId,
          version: values.version,
          httpMethod: values.httpMethod,
          path: values.path,
          current: values.current || false,
          authType: values.authType || 'NONE',
          requestHeaders: jsonify(values.requestHeaders),
          requestParams: jsonify(values.requestParams),
          requestBody: jsonify(values.requestBody),
          responseBody: jsonify(values.responseBody),
          responseExample: jsonify(values.responseExample),
          exampleCode: jsonify(values.exampleCode),
        } as any);
        messageApi.success('创建成功');
      }

      setIsModalVisible(false);
      setEditingVersion(null);
      form.resetFields();
      refresh();
      onVersionChange?.();
    } catch (error: any) {
      // 提取错误信息，优先显示 detail 字段
      let errorMsg = '操作失败';
      if (error?.data?.detail) {
        errorMsg = error.data.detail;
      } else if (error?.response?.data?.detail) {
        errorMsg = error.response.data.detail;
      } else if (error?.detail) {
        errorMsg = error.detail;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      messageApi.error(errorMsg);
    }
  };

  // 打开新建/编辑弹窗
  const openModal = (record?: any) => {
    if (record) {
      setEditingVersion(record);
      console.log('openModal - record:', record);

      // 解析 JSON 字段为对象，如果解析失败则使用空对象
      const parseJsonField = (jsonStr: any) => {
        // null 或 undefined 返回 null，让编辑器显示为空
        if (jsonStr === null || jsonStr === undefined) return null;
        // 空字符串返回 null
        if (jsonStr === '') return null;
        // 已经是对象直接返回
        if (typeof jsonStr === 'object') return jsonStr;
        try {
          const parsed = JSON.parse(jsonStr);
          return typeof parsed === 'object' ? parsed : {};
        } catch {
          // 解析失败，返回 null
          return null;
        }
      };

      const formValues = {
        version: record.version || '',
        httpMethod: record.httpMethod || 'GET',
        path: record.path || '',
        current: record.current || false,
        allowInvoke: record.allowInvoke !== undefined ? record.allowInvoke : true,
        authType: record.authType || 'NONE',
        requestHeaders: parseJsonField(record.requestHeaders),
        requestParams: parseJsonField(record.requestParams),
        requestBody: parseJsonField(record.requestBody),
        responseBody: parseJsonField(record.responseBody),
        responseExample: parseJsonField(record.responseExample),
        exampleCode: parseJsonField(record.exampleCode),
      };
      console.log('openModal - formValues:', formValues);

      form.setFieldsValue(formValues);
    } else {
      setEditingVersion(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const columns: ProColumns<any>[] = [
    {
      title: '版本号',
      dataIndex: 'version',
      width: 100,
      render: (_, record) => (
        <Space>
          {record.version}
          {record.current && <Tag color="blue">当前</Tag>}
        </Space>
      ),
    },
    {
      title: '请求方法',
      dataIndex: 'httpMethod',
      width: 100,
      render: (_, record) => {
        const colors: Record<string, string> = {
          GET: 'green',
          POST: 'blue',
          PUT: 'orange',
          DELETE: 'red',
          PATCH: 'purple',
        };
        return <Tag color={colors[record.httpMethod]}>{record.httpMethod}</Tag>;
      },
    },
    {
      title: '路径',
      dataIndex: 'path',
      width: 200,
      ellipsis: true,
      render: (_, record) => <code>{record.path}</code>,
    },
    {
      title: '认证类型',
      dataIndex: 'authType',
      width: 100,
      render: (_, record) => record.authType || 'NONE',
    },
    {
      title: '允许调用',
      dataIndex: 'allowInvoke',
      width: 100,
      render: (_, record) => (
        <Tag color={record.allowInvoke ? 'success' : 'warning'}>
          {record.allowInvoke ? '是' : '否'}
        </Tag>
      ),
    },
    {
      title: '请求头',
      dataIndex: 'requestHeaders',
      width: 150,
      ellipsis: true,
      render: (_, record) => record.requestHeaders || '-',
    },
    {
      title: '请求参数',
      dataIndex: 'requestParams',
      width: 150,
      ellipsis: true,
      render: (_, record) => record.requestParams || '-',
    },
    {
      title: '请求体',
      dataIndex: 'requestBody',
      width: 150,
      ellipsis: true,
      render: (_, record) => record.requestBody || '-',
    },
    createTimeColumn<any>(),
    updateTimeColumn<any>(),
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {!record.current && (
            <a onClick={() => handleSetCurrent(record)}>设为当前</a>
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
      <ProTable<any>
        columns={columns}
        dataSource={versions}
        rowKey="id"
        loading={loading}
        pagination={false}
        search={false}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={() => openModal()}>
            新建版本
          </Button>,
        ]}
        options={{
          density: false,
          fullScreen: false,
          reload: () => refresh(),
          setting: true,
        }}
        actionRef={actionRef}
        scroll={{ x: 1500 }}
      />

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
            tooltip={editingVersion ? "编辑模式下版本号不可修改，如需新版本号请创建新版本" : ""}
          >
            <Input
              placeholder="例如: v1.0"
              disabled={!!editingVersion}
            />
          </Form.Item>

          <Form.Item
            name="httpMethod"
            label="请求方法"
            rules={[{ required: true, message: '请选择请求方法' }]}
          >
            <Select
              options={[
                { value: 'GET', label: 'GET' },
                { value: 'POST', label: 'POST' },
                { value: 'PUT', label: 'PUT' },
                { value: 'DELETE', label: 'DELETE' },
                { value: 'PATCH', label: 'PATCH' },
              ]}
            />
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
            <Select
              placeholder="默认为 NONE"
              options={[
                { value: 'NONE', label: 'NONE' },
                { value: 'API_KEY', label: 'API_KEY' },
                { value: 'OAUTH2', label: 'OAUTH2' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="requestHeaders"
            label="请求头 (JSON)"
            getValueProps={(value) => ({ value })}
          >
            <JsonEditor
              placeholder='{"Content-Type": "application/json"}'
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="requestParams"
            label="请求参数 (JSON)"
            getValueProps={(value) => ({ value })}
          >
            <JsonEditor
              placeholder='{"param1": {"type": "string", "required": true}}'
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="requestBody"
            label="请求体结构 (JSON)"
            getValueProps={(value) => ({ value })}
          >
            <JsonEditor
              placeholder='{"name": "string", "age": "number"}'
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="responseBody"
            label="响应体结构 (JSON)"
            getValueProps={(value) => ({ value })}
          >
            <JsonEditor
              placeholder='{"code": 0, "data": {}}'
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="responseExample"
            label="响应示例 (JSON)"
            getValueProps={(value) => ({ value })}
          >
            <JsonEditor
              placeholder='{"code": 0, "data": {}, "message": "success"}'
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ApiVersionTab;
