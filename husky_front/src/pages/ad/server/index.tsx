import React from 'react';
import { HeartTwoTone, SmileTwoTone } from '@ant-design/icons';
import { Card, Typography, Alert } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';

export default (): React.ReactNode => (
  <PageContainer content="服务器页面简介：用来配置本地或者远程待管理的AD服务器">
    <Card>
      <Alert
        message="更多功能正在开发中，未来都会集成到此平台来！"
        type="success"
        showIcon
        banner
        style={{
          margin: -12,
          marginBottom: 48,
        }}
      />
      <Typography.Title level={2} style={{ textAlign: 'center' }}>
        <SmileTwoTone /> Randolph <HeartTwoTone twoToneColor="#eb2f96" /> You
      </Typography.Title>
    </Card>
    <p style={{ textAlign: 'center', marginTop: 24 }}>
      想添加更多页面? 请参考{' '}
      <a href="https://pro.ant.design/docs/block-cn" target="_blank" rel="noopener noreferrer">
        使用 块
      </a>
      。
    </p>
  </PageContainer>
);
