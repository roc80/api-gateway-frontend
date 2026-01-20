import type { ActionType, ProColumns } from '@ant-design/pro-components';
import type { ReactNode } from 'react';

/**
 * CRUD 表格的通用配置类型
 */
export interface CrudTableConfig<
  T = any,
  _QueryParams = any,
  _UpsertDto = any,
> {
  /** 表格列配置 */
  columns: ProColumns<T>[];
  /** 表格标题 */
  headerTitle?: string;
  /** 行的主键字段名，默认 'id' */
  rowKey?: keyof T | string;
  /** 搜索表单的 label 宽度，默认 120 */
  labelWidth?: number;
  /** 是否显示详情 Drawer，默认 true */
  showDetail?: boolean;
  /** 详情 Drawer 宽度，默认 600 */
  drawerWidth?: number;
  /** 是否显示批量操作栏 */
  showBatchActions?: boolean;
  /** 批量操作按钮配置 */
  batchActions?: BatchAction<T>[];
  /** 自定义表格操作列的渲染 */
  renderActions?: (
    record: T,
    actionRef: React.RefObject<ActionType | null>,
  ) => ReactNode;
}

/**
 * 批量操作按钮配置
 */
export interface BatchAction<T = any> {
  /** 按钮文本 */
  text: string;
  /** 按钮类型 */
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  /** 危险操作（红色） */
  danger?: boolean;
  /** 点击事件 */
  onClick: (selectedRows: T[]) => void | Promise<void>;
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 自定义按钮渲染 - 返回 React 组件构造函数 */
  render?: (selectedRows: T[], onClick: () => void) => React.FC<any>;
}

/**
 * CRUD 请求配置
 */
export interface CrudRequestConfig<T = any, QueryParams = any> {
  /** 列表查询函数 */
  listFn: (params: QueryParams) => Promise<{
    data?: T[];
    total?: number;
  }>;
  /** 将 ProTable 的 params 转换为 API 参数 */
  paramsTransformer?: (params: {
    current?: number;
    pageSize?: number;
    [key: string]: any;
  }) => QueryParams;
}

/**
 * CRUD 表单配置
 */
export interface CrudFormConfig<T = any, UpsertDto = any> {
  /** 表单标题（支持函数，根据是否有 id 判断） */
  title: string | ((values: Partial<T>) => string);
  /** 提交函数，支持可变参数 */
  submitFn: (...args: any[]) => Promise<void>;
  /** 将表单数据转换为 API 参数，返回数组时会作为参数展开传递给 submitFn */
  dataTransformer?: (formData: any, values: Partial<T>) => UpsertDto | any[];
  /** 表单初始值转换（将 values 转换为表单初始值） */
  initialValuesTransformer?: (values: Partial<T>) => Record<string, any>;
  /** 提交成功消息 */
  successMessage?: string;
  /** 提交失败消息 */
  errorMessage?: string;
}

/**
 * CRUD 页面的完整配置
 */
export interface CrudPageConfig<T = any, QueryParams = any, UpsertDto = any>
  extends CrudTableConfig<T>,
    CrudRequestConfig<T, QueryParams> {
  /** 编辑表单配置，不配置则不显示编辑按钮 */
  formConfig?: CrudFormConfig<T, UpsertDto>;
  /** 新建表单配置，不配置则不显示新建按钮 */
  createConfig?: CrudFormConfig<T, UpsertDto> & {
    /** 新建按钮文本 */
    buttonText?: string;
    /** 新建按钮位置，默认 'table' */
    position?: 'table' | 'header';
  };
}
