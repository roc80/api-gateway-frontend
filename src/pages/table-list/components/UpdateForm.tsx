import {
  ModalForm,
  ProFormRadio,
  ProFormText,
} from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { message } from 'antd';
import React, { cloneElement, useCallback, useState } from 'react';
import { upsertUser } from '@/services/api-gateway/userRolePermissionController';

export type UpdateFormProps = {
  trigger?: React.ReactElement<any>;
  onOk?: () => void;
  values: Partial<API.UserRolePermissionDto>;
};
const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const { onOk, values, trigger } = props;
  const [open, setOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { run } = useRequest(upsertUser, {
    manual: true,
    onSuccess: () => {
      messageApi.success('Configuration is successful');
      onOk?.();
      setOpen(false);
    },
    onError: () => {
      messageApi.error('Configuration failed, please try again!');
    },
  });
  const onCancel = useCallback(() => {
    setOpen(false);
  }, []);
  const onOpen = useCallback(() => {
    setOpen(true);
  }, []);
  const onFinish = useCallback(
    async (formData: any) => {
      const updateData: API.UserUpsertDto = {
        id: values.id || 0,
        username: formData.username || values.username || '',
        password: formData.password || '',
        enable: formData.enable ?? true,
      };
      await run(updateData);
    },
    [run, values],
  );
  return (
    <>
      {contextHolder}
      <ModalForm
        title={'编辑用户'}
        open={open}
        onOpenChange={setOpen}
        trigger={
          trigger ? cloneElement(trigger, { onClick: onOpen }) : undefined
        }
        onFinish={onFinish}
        initialValues={{
          username: values.username,
          enable: values.enable ?? true,
        }}
        modalProps={{
          destroyOnClose: true,
          onCancel,
        }}
      >
        <ProFormText
          name="username"
          label={'用户名'}
          width="md"
          rules={[
            {
              required: true,
              message: '请输入用户名！',
            },
          ]}
        />
        <ProFormText.Password
          name="password"
          width="md"
          label={'密码'}
          placeholder={'不修改请留空'}
        />
        <ProFormRadio.Group
          name="enable"
          label={'状态'}
          rules={[
            {
              required: true,
            },
          ]}
          options={[
            {
              value: true,
              label: '启用',
            },
            {
              value: false,
              label: '禁用',
            },
          ]}
        />
      </ModalForm>
    </>
  );
};
export default UpdateForm;
