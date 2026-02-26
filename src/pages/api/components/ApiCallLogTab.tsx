import { useRequest } from '@umijs/max';
import { Table, Tag, Space, Card, Select, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { searchInterfaceCallLog } from '@/services/api-gateway/interfaceCallLogController';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface ApiCallLogTabProps {
  interfaceId: number;
}

/**
 * 调用日志 Tab - 显示历史调用记录
 */
const ApiCallLogTab: React.FC<ApiCallLogTabProps> = ({ interfaceId }) => {
  const [versionFilter, setVersionFilter] = useState<number | undefined>();
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>();

  const { data, loading } = useRequest(
    () =>
      searchInterfaceCallLog({
        page: 1,
        size: 50,
        request: {
          apiId: interfaceId,
          versionId: versionFilter,
          success: statusFilter,
        },
      }),
    {
      onError: () => {
        // 静默处理
      },
    },
  );

  const logs = data?.data || [];

  const columns: ColumnsType<any> = [
    {
      title: '时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
    {
      title: '版本',
      dataIndex: 'versionId',
      key: 'versionId',
      render: (text) => <Tag>v{text}</Tag>,
    },
    {
      title: '调用者',
      dataIndex: 'caller',
      key: 'caller',
    },
    {
      title: '状态码',
      dataIndex: 'statusCode',
      key: 'statusCode',
      render: (text) => {
        const color = text >= 200 && text < 300 ? 'success' : 'error';
        return <Tag color={color}>{text || '-'}</Tag>;
      },
    },
    {
      title: '成功',
      dataIndex: 'success',
      key: 'success',
      render: (text) => (
        <Tag color={text ? 'success' : 'error'}>
          {text ? '成功' : '失败'}
        </Tag>
      ),
    },
    {
      title: '耗时',
      dataIndex: 'durationMs',
      key: 'durationMs',
      render: (text) => (
        <Tag color={text > 1000 ? 'warning' : 'default'}>{text}ms</Tag>
      ),
    },
    {
      title: '请求数据',
      dataIndex: 'requestData',
      key: 'requestData',
      render: (text) => {
        const data = typeof text === 'string' ? JSON.parse(text) : text;
        return (
          <details>
            <summary style={{ cursor: 'pointer' }}>查看</summary>
            <pre
              style={{
                background: '#f5f5f5',
                padding: 8,
                borderRadius: 4,
                marginTop: 8,
                maxHeight: 150,
                overflow: 'auto',
              }}
            >
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        );
      },
    },
    {
      title: '响应数据',
      dataIndex: 'responseData',
      key: 'responseData',
      render: (text) => {
        const data = typeof text === 'string' ? JSON.parse(text) : text;
        return (
          <details>
            <summary style={{ cursor: 'pointer' }}>查看</summary>
            <pre
              style={{
                background: '#f5f5f5',
                padding: 8,
                borderRadius: 4,
                marginTop: 8,
                maxHeight: 150,
                overflow: 'auto',
              }}
            >
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        );
      },
    },
  ];

  return (
    <Card
      title="调用日志"
      extra={
        <Space>
          <Select
            style={{ width: 120 }}
            placeholder="筛选版本"
            allowClear
            onChange={setVersionFilter}
          >
            {/* TODO: 从接口版本列表获取选项 */}
            <Option value={1}>v1.0</Option>
            <Option value={2}>v1.1</Option>
          </Select>
          <Select
            style={{ width: 100 }}
            placeholder="筛选状态"
            allowClear
            onChange={setStatusFilter}
          >
            <Option value={true}>成功</Option>
            <Option value={false}>失败</Option>
          </Select>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={logs}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        size="small"
        scroll={{ x: 1200 }}
      />
    </Card>
  );
};

export default ApiCallLogTab;
