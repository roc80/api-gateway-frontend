import type { ProColumns } from '@ant-design/pro-components';
import { ProFormText } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { message } from 'antd';
import React, { useCallback } from 'react';
import { CrudForm, CrudTable } from '@/components/CrudTable';
import {
  batchDelete1,
  create,
  search1,
  update,
} from '@/services/api-gateway/interfaceController';

const ApiList: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const { run: delRun, loading: deleteLoading } = useRequest(batchDelete1, {
    manual: true,
    onSuccess: () => {
      messageApi.success('删除成功');
    },
    onError: () => {
      messageApi.error('删除失败，请重试');
    },
  });

  const handleBatchDelete = useCallback(
    async (selectedRows: API.InterfaceDto[]) => {
      if (!selectedRows?.length) {
        messageApi.warning('请选择删除项');
        return;
      }
      try {
        const batchDeleteDto: API.InterfaceBatchDeleteDto = {
          ids: [],
        };
        for (const row of selectedRows) {
          if (row.id) {
            batchDeleteDto.ids.push(row.id);
          }
        }
        await delRun(batchDeleteDto);
      } catch (error) {
        console.error('删除失败:', error);
      }
    },
    [delRun, messageApi],
  );

  const columns: ProColumns<API.InterfaceDto>[] = [
    {
      title: '接口名称',
      dataIndex: 'name',
    },
    {
      title: '接口code',
      dataIndex: 'code',
      hideInForm: true,
    },
    {
      title: '接口描述',
      dataIndex: 'description',
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      render: (_, record) => {
        return record.enabled ? '启用' : '停用';
      },
    },
    {
      title: '接口分类',
      dataIndex: 'category',
    },
    {
      title: '接口所有者',
      dataIndex: 'owner',
      hideInForm: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      hideInForm: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      hideInForm: true,
    },
  ];

  return (
    <>
      {contextHolder}
      <CrudTable
        headerTitle="接口列表"
        columns={columns}
        rowKey="id"
        listFn={async (params) => {
          const response = await search1(params);
          return {
            data: response.data || [],
            total: response.total || 0,
          };
        }}
        paramsTransformer={(params) => ({
          pageRequestDto: {
            page: params.current,
            size: params.pageSize,
          },
          interfaceQueryDto: {
            name: params.name,
            code: params.code,
            description: params.description,
            enabled: params.enabled,
            category: params.category,
            owner: params.owner,
          },
        })}
        showDetail={false}
        showBatchActions
        batchActions={[
          {
            text: '批量删除',
            type: 'default',
            danger: true,
            onClick: handleBatchDelete,
            loading: deleteLoading,
          },
        ]}
        renderActions={(record, actionRef) => (
          <CrudForm
            trigger={<a>编辑</a>}
            onOk={() => actionRef.current?.reload()}
            values={record}
            title="编辑"
            submitFn={async (params, updateDto) => {
              await update(params, updateDto);
            }}
            dataTransformer={(formData, values) => [
              { id: values.id || 0 },
              {
                name: formData.name || values.name || '',
                description: formData.description || values.description || '',
                category: formData.category || values.category || '',
              },
            ]}
            initialValuesTransformer={(values) => ({
              name: values.name,
              description: values.description,
              category: values.category,
            })}
          >
            <ProFormText
              name="name"
              label="接口名称"
              width="md"
              rules={[{ required: true, message: '请输入接口名称！' }]}
            />
            <ProFormText name="description" label="接口描述" width="md" />
            <ProFormText name="category" label="接口分类" width="md" />
          </CrudForm>
        )}
      />
    </>
  );
};

export default ApiList;
