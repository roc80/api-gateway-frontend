import type {
  ActionType,
  ProDescriptionsItemProps,
  ProFormInstance,
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
  /** 额外的工具栏按钮（函数形式，接收 actionRef） */
  toolbarActionsRender?: (
    actionRef: React.RefObject<ActionType | null>,
  ) => React.ReactNode;
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
    toolbarActionsRender,
  } = props;

  const actionRef = useRef<ActionType | null>(null);
  const formRef = useRef<ProFormInstance>();
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
      // 修复：使用表单的实际值，避免清除搜索框后刷新时携带旧参数
      const formValues = formRef.current?.getFieldsFormatValue?.() || {};

      // 合并：分页参数来自 params，搜索参数来自 form 的实际值
      const mergedParams: Record<string, any> = {
        current: params.current,
        pageSize: params.pageSize,
        ...formValues,
      };

      const transformedParams = paramsTransformer
        ? paramsTransformer(mergedParams)
        : (mergedParams as QueryParams);
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
        className="crud-table-center-header"
        headerTitle={headerTitle}
        actionRef={actionRef}
        formRef={formRef}
        rowKey={rowKey as string}
        search={{
          labelWidth,
        }}
        toolBarRender={
          toolbarActionsRender
            ? () => [toolbarActionsRender(actionRef)]
            : toolbarActions
              ? () => [toolbarActions]
              : undefined
        }
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
