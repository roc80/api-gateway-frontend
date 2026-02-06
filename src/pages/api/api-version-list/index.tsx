import type { ProColumns } from '@ant-design/pro-components';
import { ProFormText } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { message } from 'antd';
import React, { useCallback } from 'react';
import { CrudForm, CrudTable, updateTimeColumn } from '@/components/CrudTable';
import {
  batchDeleteInterfaceVersion,
  createInterfaceVersion,
  searchInterfaceVersion,
  updateInterfaceVersion,
} from '@/services/api-gateway/interfaceVersionController';

const ApiVersionList: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const { run: delRun, loading: deleteLoading } = useRequest(
    batchDeleteInterfaceVersion,
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
    async (selectedRows: API.InterfaceVersionDto[]) => {
      if (!selectedRows?.length) {
        messageApi.warning('请选择删除项');
        return;
      }
      try {
        const batchDeleteDto: API.InterfaceVersionBatchDeleteDto = {
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

  const columns: ProColumns<API.InterfaceVersionDto>[] = [
    {
      title: '接口版本',
      dataIndex: 'version',
    },
    {
      title: '是否当前版本',
      dataIndex: 'current',
      render: (_, record) => {
        return record.current ? '是' : '否';
      },
    },
    {
      title: 'HTTP方法',
      dataIndex: 'httpMethod',
    },
    {
      title: '接口路径',
      dataIndex: 'path',
    },
    {
      title: '认证类型',
      dataIndex: 'authType',
    },
    {
      title: '允许调用',
      dataIndex: 'allowInvoke',
      render: (_, record) => {
        return record.allowInvoke ? '是' : '否';
      },
    },
    updateTimeColumn<API.InterfaceVersionDto>({
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
          const response = await searchInterfaceVersion(params);
          return {
            data: response.data || [],
            total: response.total || 0,
          };
        }}
        paramsTransformer={(params) => ({
          page: params.current,
          size: params.pageSize,
          request: {
            version: params.version,
            current: params.current,
            httpMethod: params.httpMethod,
            path: params.path,
            authType: params.authType,
            allowInvoke: params.allowInvoke,
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
              await updateInterfaceVersion(params, updateDto);
            }}
            dataTransformer={(formData, values) => [
              { id: values.id || 0 },
              {
                version: formData.version || values.version || '',
                current: formData.current ?? values.current,
                httpMethod: formData.httpMethod || values.httpMethod || '',
                path: formData.path || values.path || '',
                authType: formData.authType || values.authType || '',
                allowInvoke: formData.allowInvoke ?? values.allowInvoke,
              },
            ]}
            initialValuesTransformer={(values) => ({
              version: values.version,
              current: values.current,
              httpMethod: values.httpMethod,
              path: values.path,
              authType: values.authType,
              allowInvoke: values.allowInvoke,
            })}
          >
            <ProFormText
              name="version"
              label="接口版本"
              width="md"
              rules={[{ required: true, message: '请输入接口版本！' }]}
            />
            <ProFormText
              name="httpMethod"
              label="HTTP方法"
              width="md"
              rules={[{ required: true, message: '请输入HTTP方法！' }]}
            />
            <ProFormText
              name="path"
              label="接口路径"
              width="md"
              rules={[{ required: true, message: '请输入接口路径！' }]}
            />
            <ProFormText name="authType" label="认证类型" width="md" />
          </CrudForm>
        )}
        toolbarActionsRender={(actionRef) => (
          <CrudForm
            trigger={<a type={'primary'}>新建</a>}
            onOk={() => actionRef.current?.reload()}
            values={{}}
            title="新建API"
            submitFn={async (data: API.InterfaceVersionCreateDto) => {
              await createInterfaceVersion(data);
            }}
            dataTransformer={(formData, values) => ({
              apiId: formData.apiId || values.apiId || 0,
              version: formData.version,
              httpMethod: formData.httpMethod,
              path: formData.path,
              current: formData.current,
              authType: formData.authType,
            })}
          >
            <ProFormText
              name="apiId"
              label={'接口ID'}
              width="md"
              rules={[{ required: true, message: '请输入接口ID！' }]}
            />
            <ProFormText
              name="version"
              label={'接口版本'}
              width="md"
              rules={[{ required: true, message: '请输入接口版本！' }]}
            />
            <ProFormText
              name="httpMethod"
              label={'HTTP方法'}
              width="md"
              rules={[{ required: true, message: '请输入HTTP方法！' }]}
            />
            <ProFormText
              name="path"
              label={'接口路径'}
              width="md"
              rules={[{ required: true, message: '请输入接口路径！' }]}
            />
            <ProFormText name="authType" label={'认证类型'} width="md" />
          </CrudForm>
        )}
      />
    </>
  );
};

export default ApiVersionList;
