import type { ProColumns } from '@ant-design/pro-components';
import { ProFormText } from '@ant-design/pro-components';
import { useModel, useRequest } from '@umijs/max';
import { message, Popconfirm, theme } from 'antd';
import React, { useCallback } from 'react';
import { CrudForm, CrudTable, updateTimeColumn } from '@/components/CrudTable';
import {
  batchDeleteInterfaces,
  create,
  patchEnabled,
  searchInterfaces,
  update,
} from '@/services/api-gateway/interfaceController';

const ApiList: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const currentUsername = initialState?.currentUser?.username;
  const { token } = theme.useToken();

  const [messageApi, contextHolder] = message.useMessage();

  const { run: delRun, loading: deleteLoading } = useRequest(
    batchDeleteInterfaces,
    {
      manual: true,
      onSuccess: () => {
        messageApi.success('删除成功');
      },
      onError: () => {
        messageApi.error('删除失败，请重试');
      },
    },
  );

  const handleBatchDelete = useCallback(
    async (
      selectedRows: API.InterfaceDto[],
      actionRef: React.RefObject<any>,
    ) => {
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
        actionRef.current?.reload();
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
      title: '接口描述',
      dataIndex: 'description',
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      valueType: 'select',
      valueEnum: {
        true: { text: '启用' },
        false: { text: '禁用' },
      },
      render: (_, record) => {
        return (
          <span
            style={{
              color: record.enabled ? token.colorSuccess : token.colorError,
            }}
          >
            {record.enabled ? '启用' : '禁用'}
          </span>
        );
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
    updateTimeColumn<API.InterfaceDto>({
      title: '更新时间',
    }),
  ];

  return (
    <>
      {contextHolder}
      <CrudTable
        headerTitle="API列表"
        columns={columns}
        rowKey="id"
        listFn={async (params) => {
          const response = await searchInterfaces(params);
          return {
            data: response.data || [],
            total: response.total || 0,
          };
        }}
        paramsTransformer={(params) => ({
          page: params.current,
          size: params.pageSize,
          request: {
            name: params.name,
            code: params.code,
            description: params.description,
            enabled:
              params.enabled === 'true'
                ? true
                : params.enabled === 'false'
                  ? false
                  : undefined,
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
            onClick: (selectedRows, actionRef) =>
              handleBatchDelete(selectedRows, actionRef),
            loading: deleteLoading,
          },
        ]}
        renderActions={(record, actionRef) => (
          <>
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
            <Popconfirm
              title={`确定要${record.enabled ? '禁用' : '启用'}此接口吗？`}
              onConfirm={async () => {
                await patchEnabled({
                  id: record.id || 0,
                  enabled: !record.enabled,
                });
                actionRef.current?.reload();
              }}
              okText="确定"
              cancelText="取消"
            >
              <a style={{ marginLeft: 8 }}>
                {record.enabled ? '禁用' : '启用'}
              </a>
            </Popconfirm>
          </>
        )}
        toolbarActionsRender={(actionRef) => (
          <CrudForm
            trigger={<a type={'primary'}>新建</a>}
            onOk={() => actionRef.current?.reload()}
            values={{}}
            title="新建"
            submitFn={async (data: API.InterfaceCreateDto) => {
              await create(data);
            }}
            dataTransformer={(formData, values) => ({
              name: formData.name,
              description: formData.description || values.description || '',
              category: formData.category || values.category || '',
              owner: currentUsername || '',
            })}
          >
            <ProFormText
              name="name"
              label={'接口名称'}
              width="md"
              rules={[{ required: true, message: '请输入接口名称！' }]}
            />
            <ProFormText name="description" label={'接口描述'} width="md" />
            <ProFormText name="category" label={'接口分类'} width="md" />
          </CrudForm>
        )}
      />
    </>
  );
};

export default ApiList;
