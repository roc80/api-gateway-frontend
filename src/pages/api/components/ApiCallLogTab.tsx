import { Tag, Space, Card, Select } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useState, useRef, useEffect } from 'react';
import type { ActionType } from '@ant-design/pro-components';
import { createTimeColumn } from '@/components/CrudTable';
import { searchInterfaceCallLog } from '@/services/api-gateway/interfaceCallLogController';

interface ApiCallLogTabProps {
  interfaceId: number;
}

/**
 * 调用日志 Tab - 显示历史调用记录
 */
const ApiCallLogTab: React.FC<ApiCallLogTabProps> = ({ interfaceId }) => {
  const actionRef = useRef<ActionType>();
  const [versionFilter, setVersionFilter] = useState<number | undefined>();
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>();

  // 当 interfaceId 变化时刷新表格
  useEffect(() => {
    actionRef.current?.reload();
  }, [interfaceId]);

  const columns: ProColumns<any>[] = [
    createTimeColumn<any>({
      title: '时间',
    }),
    {
      title: '版本',
      dataIndex: 'versionId',
      width: 100,
      render: (_, record) => <Tag>v{record.versionId}</Tag>,
    },
    {
      title: '调用者',
      dataIndex: 'caller',
      width: 120,
    },
    {
      title: '状态码',
      dataIndex: 'statusCode',
      width: 100,
      render: (_, record) => {
        const color = record.statusCode >= 200 && record.statusCode < 300 ? 'success' : 'error';
        return <Tag color={color}>{record.statusCode || '-'}</Tag>;
      },
    },
    {
      title: '成功',
      dataIndex: 'success',
      width: 80,
      render: (_, record) => (
        <Tag color={record.success ? 'success' : 'error'}>
          {record.success ? '成功' : '失败'}
        </Tag>
      ),
    },
    {
      title: '耗时',
      dataIndex: 'durationMs',
      width: 100,
      render: (_, record) => (
        <Tag color={record.durationMs > 1000 ? 'warning' : 'default'}>
          {record.durationMs}ms
        </Tag>
      ),
    },
    {
      title: '请求数据',
      dataIndex: 'requestData',
      width: 150,
      hideInSearch: true,
      render: (_, record) => {
        if (!record.requestData) return '-';
        const data = typeof record.requestData === 'string' ? JSON.parse(record.requestData) : record.requestData;
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
      width: 150,
      hideInSearch: true,
      render: (_, record) => {
        if (!record.responseData) return '-';
        const data = typeof record.responseData === 'string' ? JSON.parse(record.responseData) : record.responseData;
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
            options={[
              // TODO: 从接口版本列表获取选项
              { value: 1, label: 'v1.0' },
              { value: 2, label: 'v1.1' },
            ]}
          />
          <Select
            style={{ width: 100 }}
            placeholder="筛选状态"
            allowClear
            onChange={setStatusFilter}
            options={[
              { value: true, label: '成功' },
              { value: false, label: '失败' },
            ]}
          />
        </Space>
      }
    >
      <ProTable<any>
        columns={columns}
        rowKey="id"
        request={async () => {
          const response = await searchInterfaceCallLog({
            page: 1,
            size: 50,
            request: {
              apiId: interfaceId,
              versionId: versionFilter,
              success: statusFilter,
            },
          });
          return {
            data: response.data || [],
            success: true,
            total: response.total || 0,
          };
        }}
        search={false}
        actionRef={actionRef}
        pagination={{
          defaultPageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        options={false}
        size="small"
        scroll={{ x: 1200 }}
      />
    </Card>
  );
};

export default ApiCallLogTab;
