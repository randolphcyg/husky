import React from 'react';
import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-layout';

export default () => (
  <DefaultFooter
    copyright="2020 甄云科技平台管理部出品"
    links={[
      {
        key: '甄云科技',
        title: '甄云科技',
        href: 'https://www.going-link.com/',
        blankTarget: true,
      },
      {
        key: 'husky',
        title: <GithubOutlined />,
        href: 'https://gitee.com/RandolphCYG/husky',
        blankTarget: true,
      },
      {
        key: 'Randolph',
        title: 'Randolph',
        href: 'https://blog.csdn.net/qq_33997198',
        blankTarget: true,
      },
    ]}
  />
);
