import React, { Component } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Card } from 'antd';


class Index extends Component {
    render() {
        return (
            <PageHeaderWrapper>
                <Card>
                    这是一个示例
                </Card>
            </PageHeaderWrapper>
        )
    }
}

export default Index;