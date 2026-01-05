import type {
  ActionType,
  ProColumns,
  ProDescriptionsItemProps,
} from '@ant-design/pro-components';
import {
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { Button, Drawer, message } from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import {
  deleteUser,
  queryUsers,
} from '@/services/api-gateway/userRolePermissionController';
import UpdateForm from './components/UpdateForm';

const TableList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<API.UserRolePermissionDto>();
  const [selectedRowsState, setSelectedRows] = useState<
    API.UserRolePermissionDto[]
  >([]);

  const [messageApi, contextHolder] = message.useMessage();
  const { run: delRun, loading } = useRequest(deleteUser, {
    manual: true,
    onSuccess: () => {
      setSelectedRows([]);
      actionRef.current?.reloadAndRest?.();
      messageApi.success('Deleted successfully and will refresh soon');
    },
    onError: () => {
      messageApi.error('Delete failed, please try again');
    },
  });
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
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
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
      hideInSearch: true, // 暂时隐藏筛选，后端 UserQueryDto 不支持
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
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      hideInSearch: true,
      hideInForm: true,
      sorter: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <UpdateForm
          trigger={<a>编辑</a>}
          key="edit"
          onOk={() => actionRef.current?.reload()}
          values={record}
        />,
      ],
    },
  ];

  const handleRemove = useCallback(
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
  return (
    <PageContainer>
      {contextHolder}
      <ProTable<API.UserRolePermissionDto, any>
        headerTitle={'查询表格'}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        request={async (params) => {
          const response = await queryUsers({
            pageRequestDto: {
              page: params.current,
              size: params.pageSize,
            },
            userQueryDto: {
              username: params.username,
            },
          });
          return {
            data: response.data || [],
            success: true,
            total: response.total || 0,
          };
        }}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择{' '}
              <a
                style={{
                  fontWeight: 600,
                }}
              >
                {selectedRowsState.length}
              </a>{' '}
              项 &nbsp;&nbsp;
            </div>
          }
        >
          <Button
            loading={loading}
            onClick={() => {
              handleRemove(selectedRowsState);
            }}
          >
            批量删除
          </Button>
          <Button type="primary">批量审批</Button>
        </FooterToolbar>
      )}

      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.username && (
          <ProDescriptions<API.UserRolePermissionDto>
            column={2}
            title={currentRow?.username}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.username,
            }}
            columns={
              columns as ProDescriptionsItemProps<API.UserRolePermissionDto>[]
            }
          />
        )}
      </Drawer>
    </PageContainer>
  );
};
export default TableList;
