import { useRequest, useModel } from '@umijs/max';
import { Tree, Card, Input, Empty, Spin, Button, Modal, Form, message, Space } from 'antd';
import type { DataNode, TreeProps } from 'antd';
import { useState, useMemo, useCallback } from 'react';
import { searchInterfaces, create } from '@/services/api-gateway/interfaceController';
import {
  FolderOutlined,
  FolderOpenOutlined,
  ApiOutlined,
  PlusOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;

interface ApiTreeProps {
  onSelectInterface: (interfaceId: number) => void;
  selectedInterfaceId: number | null;
}

/**
 * 左侧接口树组件
 * 按 category 分组显示接口列表
 */
const ApiTree: React.FC<ApiTreeProps> = ({
  onSelectInterface,
  selectedInterfaceId,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { initialState } = useModel('@@initialState');
  const currentUsername = initialState?.currentUser?.username;
  const [messageApi, contextHolder] = message.useMessage();

  // 获取所有接口（不分页，获取全部）
  const { data, loading, run: refetch } = useRequest(
    async () => {
      const response = await searchInterfaces({
        page: 1,
        size: 1000,
        request: {},
      });
      console.log('searchInterfaces response:', response);
      return response;
    },
    {
      onError: () => {
        // 静默处理错误
      },
    },
  );

  // 按分类分组接口
  const groupedData = useMemo(() => {
    // 响应直接是数组，不是 { data: [], total: n } 格式
    const interfaces = Array.isArray(data) ? data : data?.data || [];
    const groups: Record<string, any[]> = {};

    interfaces.forEach((item: any) => {
      const category = item.category || '未分类';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    });

    return groups;
  }, [data]);

  // 过滤并转换为 Tree 数据
  const treeData = useMemo(() => {
    const searchLower = searchValue.toLowerCase();

    return Object.entries(groupedData)
      .filter(([category]) =>
        category.toLowerCase().includes(searchLower),
      )
      .map(([category, items]) => {
        // 过滤接口名称匹配的项
        const filteredItems = items.filter((item: any) =>
          item.name?.toLowerCase().includes(searchLower) ||
          item.code?.toLowerCase().includes(searchLower),
        );

        return {
          title: `${category} (${filteredItems.length})`,
          key: `category-${category}`,
          selectable: false,
          icon: <FolderOutlined />,
          children: filteredItems.map((item: any) => ({
            title: item.name,
            key: `interface-${item.id}`,
            selectable: true,
            icon: <ApiOutlined />,
            isLeaf: true,
            data: item,
          })),
        };
      })
      .filter((node) => node.children && node.children.length > 0);
    // 调试：打印树数据
    console.log('ApiTree - treeData:', treeData);
    console.log('ApiTree - groupedData:', groupedData);
    return treeData;
  }, [groupedData, searchValue]);

  // 展开所有包含选中项的父节点
  const handleExpand: TreeProps['onExpand'] = (expandedKeysValue) => {
    setExpandedKeys(expandedKeysValue);
  };

  // 选中接口
  const handleSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
    if (info.node.isLeaf) {
      const interfaceId = info.node.data?.id;
      if (interfaceId) {
        onSelectInterface(interfaceId);
      }
    }
  };

  // 自动展开所有分类
  const expandAll = useCallback(() => {
    const allKeys = treeData.map((node) => node.key);
    setExpandedKeys(allKeys);
  }, [treeData]);

  // 打开新建弹窗
  const openCreateModal = useCallback(() => {
    form.resetFields();
    setIsCreateModalVisible(true);
  }, [form]);

  // 创建接口
  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await create({
        name: values.name,
        description: values.description || '',
        category: values.category || '',
        owner: currentUsername || '',
      });
      messageApi.success('创建成功');
      setIsCreateModalVisible(false);
      form.resetFields();
      refetch();
    } catch (error: any) {
      messageApi.error(error.message || '创建失败');
    }
  };

  return (
    <>
      {contextHolder}
      <Card
        title="接口列表"
        size="small"
        style={{ height: '100%' }}
        styles={{ body: { padding: 8, height: 'calc(100% - 57px)', overflowY: 'auto' } }}
        extra={
          <Space size="small">
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
            >
              新建
            </Button>
            <a onClick={expandAll} style={{ fontSize: 12 }}>
              展开
            </a>
          </Space>
        }
      >
        {/* 搜索框 */}
        <Input.Search
          placeholder="搜索接口名称或标识"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          style={{ marginBottom: 8 }}
          allowClear
        />

        {/* 接口树 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <Spin />
          </div>
        ) : treeData.length === 0 ? (
          <Empty
            description={searchValue ? '未找到匹配的接口' : '暂无接口数据'}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Tree
            showIcon
            expandedKeys={expandedKeys}
            selectedKeys={
              selectedInterfaceId
                ? [`interface-${selectedInterfaceId}`]
                : []
            }
            onExpand={handleExpand}
            onSelect={handleSelect}
            treeData={treeData}
            switcherIcons={[
              <FolderOpenOutlined key="open" />,
              <FolderOutlined key="close" />,
            ]}
            blockNode
          />
        )}
      </Card>

      {/* 新建接口弹窗 */}
      <Modal
        title="新建接口"
        open={isCreateModalVisible}
        onOk={handleCreate}
        onCancel={() => {
          setIsCreateModalVisible(false);
          form.resetFields();
        }}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="接口名称"
            rules={[{ required: true, message: '请输入接口名称' }]}
          >
            <Input placeholder="例如: 获取用户信息" />
          </Form.Item>
          <Form.Item name="description" label="接口描述">
            <TextArea rows={3} placeholder="接口功能描述" />
          </Form.Item>
          <Form.Item name="category" label="接口分类">
            <Input placeholder="例如: 用户类、订单类" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ApiTree;
