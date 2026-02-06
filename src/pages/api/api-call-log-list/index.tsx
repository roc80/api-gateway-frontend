import type { ProColumns } from '@ant-design/pro-components';
import React from 'react';
import { CrudTable, createTimeColumn } from '@/components/CrudTable';
import { searchInterfaceCallLog } from '@/services/api-gateway/interfaceCallLogController';

const ApiCallLogList: React.FC = () => {
  const columns: ProColumns<API.InterfaceCallLogDto>[] = [
    {
      title: '接口ID',
      dataIndex: 'apiId',
    },
    {
      title: '接口版本ID',
      dataIndex: 'versionId',
    },
    {
      title: '调用者',
      dataIndex: 'caller',
    },
    {
      title: '响应状态码',
      dataIndex: 'statusCode',
    },
    {
      title: '是否成功',
      dataIndex: 'success',
      hideInSearch: true,
      render: (_, record) => (record.success ? '成功' : '失败'),
    },
    {
      title: '接口响应时间',
      dataIndex: 'durationMs',
      render: (_, record) => {
        return record.durationMs ? `${record.durationMs}ms` : '-';
      },
    },
    createTimeColumn<API.InterfaceCallLogDto>({
      title: '调用时间',
    }),
  ];

  return (
    <>
      <CrudTable
        headerTitle="API调用日志"
        columns={columns}
        rowKey="id"
        showDetail={false}
        listFn={async (params) => {
          const response = await searchInterfaceCallLog(params);
          return {
            data: response.data || [],
            total: response.total || 0,
          };
        }}
      />
    </>
  );
};

export default ApiCallLogList;
