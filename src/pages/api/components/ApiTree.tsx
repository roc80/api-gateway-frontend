import { useRequest, useModel } from '@umijs/max';
import { Tree, Card, Input, Empty, Spin, Button, Modal, Form, message, Space, Popconfirm } from 'antd';
import type { TreeProps } from 'antd';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { searchInterfaces, create, deleteUsingDelete } from '@/services/api-gateway/interfaceController';
import {
  FolderOutlined,
  FolderOpenOutlined,
  ApiOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

interface ApiTreeProps {
  onSelectInterface: (interfaceId: number) => void;
  selectedInterfaceId: number | null;
  onWidthChange?: (width: number) => void;
}

// 计算文本宽度的辅助函数
const measureTextWidth = (text: string, fontSize: number = 14): number => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return 0;
  context.font = `${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`;
  return context.measureText(text).width;
};

/**
 * 左侧接口树组件
 * 按 category 分组显示接口列表
 */
const ApiTree: React.FC<ApiTreeProps> = ({
  onSelectInterface,
  selectedInterfaceId,
  onWidthChange,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [isAllExpanded, setIsAllExpanded] = useState(false);
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
  ) as { data: any; loading: boolean; run: () => void };

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

  // 计算树的最大宽度并通知父组件
  useEffect(() => {
    if (!data || (Array.isArray(data) ? data : data?.data || []).length === 0) {
      return;
    }

    const interfaces = Array.isArray(data) ? data : data?.data || [];
    let maxWidth = 0;

    // 计算所有分类名称和接口名称的宽度
    Object.entries(groupedData).forEach(([category, items]: [string, any[]]) => {
      // 分类名称宽度: 图标(24px) + 分类名 + 数量
      const categoryText = `${category} (${items.length})`;
      const categoryWidth = 24 + 8 + measureTextWidth(categoryText, 14);
      maxWidth = Math.max(maxWidth, categoryWidth);

      // 接口名称宽度: 图标(16px) + 间距(8px) + 接口名 + 删除按钮(20px) + 间距
      items.forEach((item) => {
        const nameWidth = 16 + 8 + measureTextWidth(item.name || '', 14) + 20 + 8;
        maxWidth = Math.max(maxWidth, nameWidth);
      });
    });

    // 添加内边距和搜索框等额外空间
    const totalWidth = maxWidth + 48; // 48px 为左右内边距

    // 限制宽度范围: 最小 200px，最大 400px
    const finalWidth = Math.max(200, Math.min(400, totalWidth));

    onWidthChange?.(finalWidth);
  }, [groupedData, onWidthChange]);

  // 过滤并转换为 Tree 数据
  const treeData: any[] = useMemo(() => {
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
          title: (
            <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
              <FolderOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              <span>{category} ({filteredItems.length})</span>
            </div>
          ),
          key: `category-${category}`,
          selectable: true,
          isLeaf: false,
          children: filteredItems.map((item: any) => ({
            title: (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingRight: 8,
                  cursor: 'pointer',
                  flex: 1,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectInterface(item.id);
                }}
              >
                <span>{item.name}</span>
                <Popconfirm
                  title="确认删除"
                  description="确定要删除这个接口吗？"
                  onConfirm={(e) => handleDelete(item.id, e as any)}
                  okText="确定"
                  cancelText="取消"
                >
                  <DeleteOutlined
                    style={{ fontSize: 12, color: '#ff4d4f', padding: '4px', cursor: 'pointer' }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Popconfirm>
              </div>
            ),
            key: `interface-${item.id}`,
            selectable: true,
            icon: <ApiOutlined />,
            isLeaf: true,
            data: item,
          })),
        } as any;
      })
      .filter((node: any) => node.children && node.children.length > 0);
    // 调试：打印树数据
    console.log('ApiTree - treeData:', treeData);
    console.log('ApiTree - groupedData:', groupedData);
    return treeData;
  }, [groupedData, searchValue]);

  // 展开所有包含选中项的父节点
  const handleExpand: TreeProps['onExpand'] = (expandedKeysValue) => {
    setExpandedKeys(expandedKeysValue);
    // 同步更新全部展开状态
    const allKeys = treeData.map((node: any) => node.key);
    setIsAllExpanded(expandedKeysValue.length === allKeys.length && allKeys.length > 0);
  };

  // 选中节点（分类节点展开/折叠，接口节点选中）
  const handleSelect: TreeProps['onSelect'] = (selectedKeys, info: any) => {
    // 分类节点：展开/折叠
    if (!info.node.isLeaf) {
      const key = info.node.key as string;
      const newExpandedKeys = expandedKeys.includes(key)
        ? expandedKeys.filter(k => k !== key)
        : [...expandedKeys, key];
      setExpandedKeys(newExpandedKeys);
      // 同步更新全部展开状态
      const allKeys = treeData.map((node: any) => node.key);
      setIsAllExpanded(newExpandedKeys.length === allKeys.length && allKeys.length > 0);
      // 清除分类节点的选中状态
      info.node.selected = false;
      return;
    }
    // 接口节点：选中
    const interfaceId = info.node.data?.id;
    if (interfaceId) {
      onSelectInterface(interfaceId);
    }
  };

  // 删除接口
  const handleDelete = useCallback(async (interfaceId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteUsingDelete({ id: interfaceId });
      messageApi.success('删除成功');
      // 如果删除的是当前选中的接口，清空选中状态
      if (selectedInterfaceId === interfaceId) {
        onSelectInterface(0 as any); // 触发清空
      }
      refetch();
    } catch (error: any) {
      messageApi.error(error.message || '删除失败');
    }
  }, [selectedInterfaceId, refetch, messageApi, onSelectInterface]);

  // 切换展开/折叠所有分类
  const toggleExpandAll = useCallback(() => {
    const allKeys = treeData.map((node: any) => node.key);
    if (isAllExpanded) {
      // 折叠所有
      setExpandedKeys([]);
    } else {
      // 展开所有
      setExpandedKeys(allKeys);
    }
    setIsAllExpanded(!isAllExpanded);
  }, [treeData, isAllExpanded]);

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
            <a onClick={toggleExpandAll} style={{ fontSize: 12 }}>
              {isAllExpanded ? '折叠' : '展开'}
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
            showIcon={false}
            expandedKeys={expandedKeys}
            selectedKeys={
              selectedInterfaceId
                ? [`interface-${selectedInterfaceId}`]
                : []
            }
            onExpand={handleExpand}
            onSelect={handleSelect}
            treeData={treeData}
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
            <Input.TextArea rows={3} placeholder="接口功能描述" />
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
