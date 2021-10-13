import React from 'react';
import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-layout';

export default () => (
  <DefaultFooter
    copyright="2020 XX公司出品"
    links={[
      {
        key: 'XX公司',
        title: 'XX公司',
        href: '',
        blankTarget: true,
      },
      {
        key: 'husky',
        title: <GithubOutlined />,
        href: 'https://github.com/RandolphCYG/husky',
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
