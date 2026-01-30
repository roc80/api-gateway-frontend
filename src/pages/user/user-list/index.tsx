import type { ProColumns } from '@ant-design/pro-components';
import { ProFormRadio, ProFormText } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { message } from 'antd';
import React, { useCallback } from 'react';
import { CrudForm, CrudTable, createTimeColumn } from '@/components/CrudTable';
import {
  deleteUser,
  queryUsers,
  upsertUser,
} from '@/services/api-gateway/userRolePermissionController';

const UserList: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const { run: delRun, loading: deleteLoading } = useRequest(deleteUser, {
    manual: true,
    onSuccess: () => {
      messageApi.success('删除成功');
    },
    onError: () => {
      messageApi.error('删除失败，请重试');
    },
  });

  const handleBatchDelete = useCallback(
    async (selectedRows: API.UserRolePermissionDto[]) => {
      if (!selectedRows?.length) {
        messageApi.warning('请选择删除项');
        return;
      }
      const ids = selectedRows.map((row) => row.id);

      try {
        for (const id of ids) {
          await delRun({ userId: id });
        }
      } catch (error) {
        console.error('删除失败:', error);
      }
    },
    [delRun, messageApi],
  );

  const columns: ProColumns<API.UserRolePermissionDto>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      hideInSearch: true,
      hideInForm: true,
    },
    {
      title: '用户名',
      dataIndex: 'username',
    },
    {
      title: '角色',
      dataIndex: 'roles',
      hideInSearch: true,
      render: (_, record) => {
        return record.roles?.map((role) => role.name).join(', ') || '-';
      },
    },
    {
      title: '启用状态',
      dataIndex: 'enable',
      valueType: 'select',
      hideInSearch: true,
      valueEnum: {
        true: {
          text: '启用',
          status: 'Success',
        },
        false: {
          text: '禁用',
          status: 'Default',
        },
      },
      render: (_, record) => (
        <span style={{ color: record.enable ? '#52c41a' : '#d9d9d9' }}>
          {record.enable ? '启用' : '禁用'}
        </span>
      ),
    },
    createTimeColumn<API.UserRolePermissionDto>({
      title: '创建时间',
    }),
  ];

  return (
    <>
      {contextHolder}
      <CrudTable
        headerTitle="用户管理"
        columns={columns}
        rowKey="id"
        listFn={async (params) => {
          const response = await queryUsers(params);
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
          userQueryDto: {
            username: params.username,
          },
        })}
        showDetail
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
            title="编辑用户"
            submitFn={async (data: API.UserUpsertDto) => {
              await upsertUser(data);
            }}
            dataTransformer={(formData, values) => ({
              id: values.id || 0,
              username: formData.username || values.username || '',
              password: formData.password || '',
              enable: formData.enable ?? true,
            })}
            initialValuesTransformer={(values) => ({
              username: values.username,
              enable: values.enable ?? true,
            })}
          >
            <ProFormText
              name="username"
              label="用户名"
              width="md"
              rules={[{ required: true, message: '请输入用户名！' }]}
            />
            <ProFormText.Password
              name="password"
              width="md"
              label="密码"
              placeholder="不修改请留空"
            />
            <ProFormRadio.Group
              name="enable"
              label="状态"
              rules={[{ required: true }]}
              options={[
                { value: true, label: '启用' },
                { value: false, label: '禁用' },
              ]}
            />
          </CrudForm>
        )}
      />
    </>
  );
};

export default UserList;
