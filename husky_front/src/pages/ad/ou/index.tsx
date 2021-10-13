import ProCard from '@ant-design/pro-card';
import { PageContainer } from '@ant-design/pro-layout';
import { Input, Tree } from 'antd';
import React from 'react';
const { Search } = Input;

const treeData = [
  {
    title: 'XX公司',
    key: '0',
    children: [
      {
        title: '上海总部',
        key: '1',
        // disabled: true,
        children: [
          {
            title: '交付中心',
            key: '3',
            // disableCheckbox: true,
          },
          {
            title: '产品部',
            key: '4',
          },
        ],
      },
      {
        title: '合作伙伴',
        key: '2',
        children: [
          {
            title: (
              <span
                style={{
                  color: '#5890ff',
                }}
              >
                产研中心
              </span>
            ),
            key: '5',
          },
        ],
      },
    ],
  },
];

const onSelect = (selectedKeys, info) => {
  console.log('selected', selectedKeys, info);
};

const onCheck = (checkedKeys, info) => {
  console.log('onCheck', checkedKeys, info);
};

const getParentKey = (key, tree) => {
  let parentKey;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some(item => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey;
};

export default () => {
  return (
    <PageContainer title='服务器时间轴'>
      <ProCard>
        <Tree
          checkable
          defaultExpandedKeys={['0', '1', '2']}
          // defaultSelectedKeys={['0', '1']}
          // defaultCheckedKeys={['0', '1']}
          onSelect={onSelect}
          onCheck={onCheck}
          treeData={treeData}
        />
      </ProCard>
    </PageContainer>
  );
};
