import type { ProColumns } from '@ant-design/pro-components';
import dayjs from 'dayjs';

/**
 * 类型守卫：检查值是否为有效日期类型
 */
const isDateString = (val: unknown): val is string | number | Date => {
  return (
    typeof val === 'string' || typeof val === 'number' || val instanceof Date
  );
};

/**
 * 通用时间列配置 - 支持任意字段名
 *
 * @example
 * ```tsx
 * // 基础用法
 * dateTimeColumn<User>('createdAt')
 *
 * // 自定义标题
 * dateTimeColumn<User>('createdAt', { title: '创建时间' })
 *
 * // 自定义格式
 * dateTimeColumn<User>('expiredAt', { title: '过期时间', format: 'YYYY-MM-DD' })
 *
 * // 完整配置
 * dateTimeColumn<User>('responseTime', {
 *   title: '响应时间',
 *   format: 'HH:mm:ss.SSS',
 *   width: 120,
 *   sorter: false,
 * })
 * ```
 */
export const dateTimeColumn = <T = any>(
  dataIndex: keyof T | string,
  options?: {
    /** 列标题，默认使用字段名 */
    title?: string;
    /** 日期格式，默认 'YYYY-MM-DD HH:mm:ss' */
    format?: string;
    /** 是否可排序，默认 true */
    sorter?: boolean;
    /** 列宽，默认 180 */
    width?: number;
  },
): ProColumns<T> => {
  const {
    title = `${String(dataIndex)}`,
    format = 'YYYY-MM-DD HH:mm:ss',
    sorter = true,
    width = 180,
  } = options || {};

  return {
    title,
    dataIndex: dataIndex as string,
    width,
    valueType: 'dateTime',
    hideInSearch: true,
    hideInForm: true,
    sorter,
    render: (_, record) => {
      const value = record[dataIndex as keyof T];
      if (!isDateString(value)) return '-';
      return dayjs(value).format(format);
    },
  } as ProColumns<T>;
};

/**
 * 创建时间列快捷方式
 *
 * @example
 * ```tsx
 * createTimeColumn<User>()
 * createTimeColumn<User>({ title: '创建时间', format: 'MM-DD HH:mm' })
 * ```
 */
export const createTimeColumn = <T = any>(
  options?: Omit<Parameters<typeof dateTimeColumn<T>>[1], 'dataIndex'>,
) => dateTimeColumn<T>('createTime', options);

/**
 * 更新时间列快捷方式
 *
 * @example
 * ```tsx
 * updateTimeColumn<User>()
 * updateTimeColumn<User>({ title: '更新时间' })
 * ```
 */
export const updateTimeColumn = <T = any>(
  options?: Omit<Parameters<typeof dateTimeColumn<T>>[1], 'dataIndex'>,
) => dateTimeColumn<T>('updateTime', options);
