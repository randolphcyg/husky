import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Alert, Typography } from 'antd';
import styles from './Welcome.less';

const CodePreview: React.FC<{}> = ({ children }) => (
  <pre className={styles.pre}>
    <code>
      <Typography.Text copyable>{children}</Typography.Text>
    </code>
  </pre>
);

export default (): React.ReactNode => (
  <PageContainer>
    <Card>
      <Alert
        message="甄云更高效率的管理工具，即将发布！"
        type="success"
        showIcon
        banner
        style={{
          margin: -12,
          marginBottom: 24,
        }}
      />
      <Typography.Text strong>
        甄云账号中心{' '}
        <a href="https://blog.csdn.net/qq_33997198/article/details/106056311" rel="noopener noreferrer" target="__blank">
          AD域
        </a>
      </Typography.Text>
      <p>1.下载项目</p>
      <CodePreview>git clone git@gitee.com:RandolphCYG/husky.git</CodePreview>
      <Typography.Text
        strong
        style={{
          marginBottom: 12,
        }}
      >
        甄云迭代进度可视化{' '}
        <a href="https://blog.csdn.net/qq_33997198/article/details/108515387" rel="noopener noreferrer" target="__blank">
          全栈可伸缩性项目
        </a>
      </Typography.Text>
      <p>2.进入前端项目目录</p>
      <CodePreview>cd husky_front</CodePreview>
      <p>3.前端依赖</p>
      <CodePreview>yarn</CodePreview>
      <p>4.启动前端项目</p>
      <CodePreview>yarn start</CodePreview>
    </Card>
  </PageContainer>
);
