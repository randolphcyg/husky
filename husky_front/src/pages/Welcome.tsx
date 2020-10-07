import React from 'react';

import { PageContainer } from '@ant-design/pro-layout';
import { Space, Descriptions, Tag, Statistic, Typography, Spin } from 'antd';
import ProCard from '@ant-design/pro-card';
import Field, { ProFieldFCMode } from '@ant-design/pro-field';
import { UserOutlined, LoadingOutlined, ReloadOutlined, AimOutlined, SettingOutlined, SyncOutlined } from '@ant-design/icons';


const { Title, Paragraph, Text } = Typography;
const antIcon0 = <LoadingOutlined style={{ fontSize: 24 }} spin />;
const antIcon1 = <ReloadOutlined style={{ fontSize: 24 }} spin />;
const antIcon2 = <AimOutlined style={{ fontSize: 24 }} spin />;
const antIcon3 = <SettingOutlined style={{ fontSize: 24 }} spin />;
const antIcon4 = <SyncOutlined style={{ fontSize: 24 }} spin />;

const Welcome: React.FC<{}> = () => {
  return (
    <PageContainer title='欢迎页面'>
      <ProCard gutter={[16, 16]}>
        <ProCard colSpan="300px" title="About Husky" headerBordered bordered>
          <Space direction="vertical">
            <Statistic title="AD Users" value={366} valueStyle={{ color: '#3f8600' }} prefix={<UserOutlined />} />
            <Descriptions>
              <Descriptions.Item label="开发进度">
                <Field text="41" valueType="progress" mode='read' plain={true} />
              </Descriptions.Item>
            </Descriptions>
            <Space size={1}>
              <Tag color="blue">AD域管理</Tag>
              <Tag color="red">迭代可视化</Tag>
            </Space>
          </Space>
        </ProCard>
        <ProCard bordered>
          <Typography>
            <Title level={3}>平台简介</Title>
            <Paragraph>
              Husky意为<Text mark>哈士奇</Text>，此平台皮实耐用，架构先进、拓展性高，代码风格极力做到易读规范，适合接入各种想完成的工作，提高效率。
            </Paragraph>
            <Title level={4}>技术架构</Title>
            <Paragraph>
              经过调研，系统采用<Text code>AntD pro v5</Text>、<Text code>React</Text>、<Text code>TypeScript</Text>、<Text code>Django 2</Text>、<Text code>Echarts</Text>等前后端技术来辅助开发人员快速写出高质量的产品。
            </Paragraph>
            <Title level={4}>主要功能</Title>
            <Paragraph>
              <ul>
                <li>
                  <a href="/config">配置中心</a>  配置AD服务器与邮件服务器后才能开始管理AD域  <Tag color="green">开发完成</Tag>
                </li>
                <li>
                  <a href="/ad/account">AD账号管理</a>  可以对用户账号管理、密码重置、策略设计  <Tag color="blue">开发中</Tag>
                </li>
                <li>
                  <a href="/visual/bug">迭代可视化</a>  对公司的技术迭代进行记录和分析，以此跟进开发情况  <Tag color="blue">待开发</Tag>
                </li>
              </ul>
            </Paragraph>
          </Typography>
        </ProCard>
      </ProCard>
      <ProCard gutter={[{ xs: 8, sm: 8, md: 16, lg: 24, xl: 32 }, 16]} style={{ marginTop: 16 }}>
        <ProCard bordered>
          <Spin />
        </ProCard>
        <ProCard bordered>
          <Spin indicator={antIcon0} />
        </ProCard>
        <ProCard bordered>
          <Spin indicator={antIcon1} />
        </ProCard>
      </ProCard>
      <ProCard gutter={16} style={{ marginTop: 16 }}>
        <ProCard bordered>
          <Spin indicator={antIcon2} />
        </ProCard>
        <ProCard bordered>
          <Spin indicator={antIcon3} />
        </ProCard>
        <ProCard bordered>
          <Spin indicator={antIcon4} />
        </ProCard>
      </ProCard>
    </PageContainer>
  );
};

export default Welcome;