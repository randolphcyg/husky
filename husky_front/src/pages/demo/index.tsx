import React, { Component } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Card, Alert, Typography } from 'antd';
import { HeartTwoTone, SmileTwoTone } from '@ant-design/icons';


class Index extends Component {
    render() {
        return (
            <PageHeaderWrapper>
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
                    这是一个示例

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
            </PageHeaderWrapper>
        )
    }
}

export default Index;
