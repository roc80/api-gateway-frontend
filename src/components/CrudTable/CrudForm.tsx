import { ModalForm } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { message } from 'antd';
import React, { cloneElement, useCallback, useState } from 'react';
import type { CrudFormConfig } from './types';

export interface CrudFormProps<T = any, UpsertDto = any>
  extends CrudFormConfig<T, UpsertDto> {
  trigger?: React.ReactElement<any>;
  onOk?: () => void;
  values?: Partial<T>;
  /** 触发方式，默认 'click' */
  triggerMode?: 'click' | 'manual';
  /** 手动控制开关（triggerMode='manual' 时使用） */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function CrudForm<T extends Record<string, any>, UpsertDto = any>(
  props: CrudFormProps<T, UpsertDto>,
) {
  const {
    trigger,
    onOk,
    values = {},
    triggerMode = 'click',
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
    title,
    submitFn,
    dataTransformer,
    initialValuesTransformer,
    successMessage = '操作成功',
    errorMessage = '操作失败，请重试',
    children,
  } = props;

  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;

  const [messageApi, contextHolder] = message.useMessage();
  const { run, loading } = useRequest(submitFn, {
    manual: true,
    onSuccess: () => {
      messageApi.success(successMessage);
      onOk?.();
      setOpen(false);
    },
    onError: (error: any) => {
      const detail = error?.response?.data?.detail;
      messageApi.error(detail || errorMessage);
    },
  });

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const onFinish = useCallback(
    async (formData: any) => {
      const submitData = dataTransformer
        ? dataTransformer(formData, values)
        : (formData as UpsertDto);
      // 如果 dataTransformer 返回数组，则展开参数传递给 submitFn
      if (Array.isArray(submitData)) {
        await run(...submitData);
      } else {
        await run(submitData);
      }
    },
    [run, dataTransformer, values],
  );

  const titleText = typeof title === 'function' ? title(values) : title;

  const initialValues = initialValuesTransformer
    ? initialValuesTransformer(values)
    : values;

  const renderTrigger = () => {
    if (triggerMode === 'manual') return undefined;
    return trigger ? (
      cloneElement(trigger, { onClick: handleOpen })
    ) : (
      <a onClick={handleOpen}>{titleText}</a>
    );
  };

  return (
    <>
      {contextHolder}
      <ModalForm
        title={titleText}
        open={open}
        onOpenChange={setOpen}
        trigger={renderTrigger()}
        onFinish={onFinish}
        initialValues={initialValues}
        modalProps={{
          destroyOnClose: true,
        }}
        submitter={{
          submitButtonProps: {
            loading,
          },
        }}
      >
        {children}
      </ModalForm>
    </>
  );
}

export default CrudForm;
