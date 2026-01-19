import type {
  ActionType,
  ProDescriptionsItemProps,
} from '@ant-design/pro-components';
import {
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Drawer } from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import type { CrudRequestConfig, CrudTableConfig } from './types';

export interface CrudTableProps<T = any, QueryParams = any>
  extends CrudTableConfig<T>,
    CrudRequestConfig<T, QueryParams> {
  /** 额外的工具栏按钮（表格右上角） */
  toolbarActions?: React.ReactNode;
}

export function CrudTable<T extends Record<string, any>, QueryParams = any>(
  props: CrudTableProps<T, QueryParams>,
) {
  const {
    columns,
    headerTitle = '查询表格',
    rowKey = 'id',
    labelWidth = 120,
    showDetail = true,
    drawerWidth = 600,
    showBatchActions = true,
    batchActions = [],
    renderActions,
    listFn,
    paramsTransformer,
    toolbarActions,
  } = props;

  const actionRef = useRef<ActionType | null>(null);
  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<T>();
  const [selectedRowsState, setSelectedRows] = useState<T[]>([]);

  // 合并默认操作列
  const finalColumns: typeof columns = React.useMemo(() => {
    if (renderActions) {
      return [
        ...columns,
        {
          title: '操作',
          dataIndex: 'option',
          valueType: 'option',
          render: (_: any, record: T) => renderActions(record, actionRef),
        },
      ];
    }
    return columns;
  }, [columns, renderActions]);

  const handleRequest = useCallback(
    async (params: any) => {
      const transformedParams = paramsTransformer
        ? paramsTransformer(params)
        : (params as QueryParams);
      const response = await listFn(transformedParams);
      return {
        data: response.data || [],
        success: true,
        total: response.total || 0,
      };
    },
    [listFn, paramsTransformer],
  );

  return (
    <PageContainer>
      <ProTable<T>
        headerTitle={headerTitle}
        actionRef={actionRef}
        rowKey={rowKey as string}
        search={{
          labelWidth,
        }}
        toolBarRender={toolbarActions ? () => [toolbarActions] : undefined}
        request={handleRequest}
        columns={finalColumns}
        rowSelection={
          showBatchActions
            ? {
                onChange: (_, selectedRows) => {
                  setSelectedRows(selectedRows);
                },
              }
            : undefined
        }
      />
      {showBatchActions &&
        batchActions.length > 0 &&
        selectedRowsState?.length > 0 && (
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
            {batchActions.map((action) => {
              const handleClick = async () => {
                await action.onClick(selectedRowsState);
                setSelectedRows([]);
              };
              if (action.render) {
                const RenderComponent = action.render(
                  selectedRowsState,
                  handleClick,
                );
                return <RenderComponent key={action.text} />;
              }
              return (
                <Button
                  key={action.text}
                  type={action.type}
                  danger={action.danger}
                  loading={action.loading}
                  onClick={handleClick}
                >
                  {action.text}
                </Button>
              );
            })}
          </FooterToolbar>
        )}

      {showDetail && (
        <Drawer
          width={drawerWidth}
          open={detailVisible}
          onClose={() => {
            setCurrentRow(undefined);
            setDetailVisible(false);
          }}
          closable={false}
        >
          {currentRow && (
            <ProDescriptions<T>
              column={2}
              request={async () => ({
                data: currentRow || {},
              })}
              params={currentRow}
              columns={columns as ProDescriptionsItemProps<T>[]}
            />
          )}
        </Drawer>
      )}
    </PageContainer>
  );
}
