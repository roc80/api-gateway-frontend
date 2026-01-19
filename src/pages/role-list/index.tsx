import type { ProColumns } from '@ant-design/pro-components';
import { ProFormText } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { message } from 'antd';
import React, { useCallback } from 'react';
import { CrudForm, CrudTable } from '@/components/CrudTable';
import {
  deleteRole,
  queryRoles,
  upsertRole,
} from '@/services/api-gateway/userRolePermissionController';

const RoleList: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const { run: delRun, loading: deleteLoading } = useRequest(deleteRole, {
    manual: true,
    onSuccess: () => {
      messageApi.success('删除成功');
    },
    onError: () => {
      messageApi.error('删除失败，请重试');
    },
  });

  const handleBatchDelete = useCallback(
    async (selectedRows: API.RoleDto[]) => {
      if (!selectedRows?.length) {
        messageApi.warning('请选择删除项');
        return;
      }
      try {
        for (const row of selectedRows) {
          if (row.id) {
            await delRun({ roleId: row.id });
          }
        }
      } catch (error) {
        console.error('删除失败:', error);
      }
    },
    [delRun, messageApi],
  );

  const columns: ProColumns<API.RoleDto>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      hideInSearch: true,
      hideInForm: true,
    },
    {
      title: '角色编码',
      dataIndex: 'code',
    },
    {
      title: '角色名称',
      dataIndex: 'name',
    },
    {
      title: '权限数量',
      dataIndex: 'permissions',
      hideInSearch: true,
      render: (_, record) => record.permissions?.length ?? 0,
    },
  ];

  return (
    <>
      {contextHolder}
      <CrudTable
        headerTitle="角色管理"
        columns={columns}
        rowKey="id"
        listFn={async (params) => {
          const response = await queryRoles(params);
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
          roleQueryDto: {
            roleName: params.name,
            roleCode: params.code,
          },
        })}
        showDetail={false}
        showBatchActions
        batchActions={[
          {
            text: '批量删除',
            type: 'default',
            danger: true,
            loading: deleteLoading,
            onClick: handleBatchDelete,
          },
        ]}
        renderActions={(record, actionRef) => (
          <CrudForm
            trigger={<a>编辑</a>}
            onOk={() => actionRef.current?.reload()}
            values={record}
            title={(values) => (values.id ? '编辑角色' : '新建角色')}
            submitFn={async (data: API.RoleUpsertDto) => {
              await upsertRole(data);
            }}
            dataTransformer={(formData, values) => ({
              id: values.id || 0,
              code: formData.code || values.code || '',
              name: formData.name || values.name || '',
            })}
            initialValuesTransformer={(values) => ({
              code: values.code,
              name: values.name,
            })}
          >
            <ProFormText
              name="code"
              label="角色编码"
              width="md"
              rules={[{ required: true, message: '请输入角色编码！' }]}
            />
            <ProFormText
              name="name"
              label="角色名称"
              width="md"
              rules={[{ required: true, message: '请输入角色名称！' }]}
            />
          </CrudForm>
        )}
        toolbarActions={
          <CrudForm
            trigger={<a type="primary">新建角色</a>}
            onOk={() => window.location.reload()}
            values={{}}
            title="新建角色"
            submitFn={async (data: API.RoleUpsertDto) => {
              await upsertRole(data);
            }}
            dataTransformer={(formData) => ({
              id: 0,
              code: formData.code || '',
              name: formData.name || '',
            })}
          >
            <ProFormText
              name="code"
              label="角色编码"
              width="md"
              rules={[{ required: true, message: '请输入角色编码！' }]}
            />
            <ProFormText
              name="name"
              label="角色名称"
              width="md"
              rules={[{ required: true, message: '请输入角色名称！' }]}
            />
          </CrudForm>
        }
      />
    </>
  );
};

export default RoleList;
