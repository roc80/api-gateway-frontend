import type { ProColumns } from '@ant-design/pro-components';
import {
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
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
    async (
      selectedRows: API.InterfaceVersionDto[],
      actionRef: React.RefObject<any>,
    ) => {
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
        actionRef.current?.reload();
      } catch (error) {
        console.error('删除失败:', error);
      }
    },
    [delRun, messageApi],
  );

  const columns: ProColumns<API.InterfaceVersionDto>[] = [
    {
      title: '接口ID',
      dataIndex: 'apiId',
    },
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
      title: '请求头',
      dataIndex: 'requestHeaders',
      render: (_, record) => {
        return record.requestHeaders
          ? JSON.stringify(record.requestHeaders)
          : '-';
      },
    },
    {
      title: '请求参数',
      dataIndex: 'requestParams',
      render: (_, record) => {
        return record.requestParams
          ? JSON.stringify(record.requestParams)
          : '-';
      },
    },
    {
      title: '请求体',
      dataIndex: 'requestBody',
      render: (_, record) => {
        return record.requestBody ? JSON.stringify(record.requestBody) : '-';
      },
    },
    {
      title: '响应体',
      dataIndex: 'responseBody',
      render: (_, record) => {
        return record.responseBody ? JSON.stringify(record.responseBody) : '-';
      },
    },
    {
      title: '响应示例',
      dataIndex: 'responseExample',
      render: (_, record) => {
        return record.responseExample
          ? JSON.stringify(record.responseExample)
          : '-';
      },
    },
    {
      title: '示例curl',
      dataIndex: 'exampleCurl',
      render: (_, record) => {
        return record.exampleCurl || '-';
      },
    },
    {
      title: '示例代码',
      dataIndex: 'exampleCode',
      render: (_, record) => {
        return record.exampleCode ? JSON.stringify(record.exampleCode) : '-';
      },
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
        headerTitle="API版本"
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
            // apiId: params.apiId,
            // version: params.version,
            // current: false,
            // httpMethod: params.httpMethod,
            // path: params.path,
            // requestHeaders: {},
            // authType: params.authType,
            // allowInvoke: params.allowInvoke,
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
                current: formData.current ?? values.current,
                httpMethod: formData.httpMethod || values.httpMethod,
                path: formData.path || values.path,
                authType: formData.authType || values.authType,
                allowInvoke: formData.allowInvoke ?? values.allowInvoke,
                requestHeaders:
                  formData.requestHeaders ?? values.requestHeaders,
                requestParams: formData.requestParams ?? values.requestParams,
                requestBody: formData.requestBody ?? values.requestBody,
                responseBody: formData.responseBody ?? values.responseBody,
                responseExample:
                  formData.responseExample ?? values.responseExample,
                exampleCurl: formData.exampleCurl || values.exampleCurl,
                exampleCode: formData.exampleCode ?? values.exampleCode,
              },
            ]}
            initialValuesTransformer={(values) => ({
              current: values.current,
              httpMethod: values.httpMethod,
              path: values.path,
              authType: values.authType,
              allowInvoke: values.allowInvoke,
              requestHeaders: values.requestHeaders,
              requestParams: values.requestParams,
              requestBody: values.requestBody,
              responseBody: values.responseBody,
              responseExample: values.responseExample,
              exampleCurl: values.exampleCurl,
              exampleCode: values.exampleCode,
            })}
          >
            <ProFormSwitch name="current" label="是否当前版本" />
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
            <ProFormSwitch name="allowInvoke" label="是否允许调用" />
            <ProFormTextArea
              name="requestHeaders"
              label="请求头（JSON）"
              width="xl"
              fieldProps={{ rows: 3 }}
            />
            <ProFormTextArea
              name="requestParams"
              label="请求参数（JSON）"
              width="xl"
              fieldProps={{ rows: 3 }}
            />
            <ProFormTextArea
              name="requestBody"
              label="请求体（JSON）"
              width="xl"
              fieldProps={{ rows: 3 }}
            />
            <ProFormTextArea
              name="responseBody"
              label="响应体（JSON）"
              width="xl"
              fieldProps={{ rows: 3 }}
            />
            <ProFormTextArea
              name="responseExample"
              label="响应示例（JSON）"
              width="xl"
              fieldProps={{ rows: 3 }}
            />
            <ProFormTextArea
              name="exampleCurl"
              label="示例curl"
              width="xl"
              fieldProps={{ rows: 2 }}
            />
            <ProFormTextArea
              name="exampleCode"
              label="示例代码（JSON）"
              width="xl"
              fieldProps={{ rows: 3 }}
            />
          </CrudForm>
        )}
        toolbarActionsRender={(actionRef) => (
          <CrudForm
            trigger={<a type={'primary'}>新建</a>}
            onOk={() => actionRef.current?.reload()}
            values={{}}
            title="新建"
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
              requestHeaders: formData.requestHeaders
                ? JSON.parse(formData.requestHeaders as string)
                : undefined,
              requestParams: formData.requestParams
                ? JSON.parse(formData.requestParams as string)
                : undefined,
              requestBody: formData.requestBody
                ? JSON.parse(formData.requestBody as string)
                : undefined,
              responseBody: formData.responseBody
                ? JSON.parse(formData.responseBody as string)
                : undefined,
              responseExample: formData.responseExample
                ? JSON.parse(formData.responseExample as string)
                : undefined,
              exampleCurl: formData.exampleCurl,
              exampleCode: formData.exampleCode
                ? JSON.parse(formData.exampleCode as string)
                : undefined,
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
            <ProFormSwitch name="current" label={'是否当前版本'} />
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
            <ProFormTextArea
              name="requestHeaders"
              label={'请求头（JSON）'}
              width="xl"
              fieldProps={{ rows: 3 }}
              placeholder='{"Content-Type": "application/json"}'
            />
            <ProFormTextArea
              name="requestParams"
              label={'请求参数（JSON）'}
              width="xl"
              fieldProps={{ rows: 3 }}
              placeholder='{"param1": "value1"}'
            />
            <ProFormTextArea
              name="requestBody"
              label={'请求体（JSON）'}
              width="xl"
              fieldProps={{ rows: 3 }}
              placeholder='{"key": "value"}'
            />
            <ProFormTextArea
              name="responseBody"
              label={'响应体（JSON）'}
              width="xl"
              fieldProps={{ rows: 3 }}
              placeholder='{"result": "success"}'
            />
            <ProFormTextArea
              name="responseExample"
              label={'响应示例（JSON）'}
              width="xl"
              fieldProps={{ rows: 3 }}
            />
            <ProFormTextArea
              name="exampleCurl"
              label={'示例curl'}
              width="xl"
              fieldProps={{ rows: 2 }}
              placeholder="curl -X POST http://example.com/api"
            />
            <ProFormTextArea
              name="exampleCode"
              label={'示例代码（JSON）'}
              width="xl"
              fieldProps={{ rows: 3 }}
            />
          </CrudForm>
        )}
      />
    </>
  );
};

export default ApiVersionList;
