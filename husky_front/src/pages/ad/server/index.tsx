import React from 'react';

import { Timeline } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';

export default () => {
    return (
        <PageContainer title='服务器时间轴'>
            <ProCard>
                <Timeline>
                    <Timeline.Item>Create a services site 2015-09-01</Timeline.Item>
                    <Timeline.Item>Solve initial network problems 2015-09-01</Timeline.Item>
                    <Timeline.Item dot={<ClockCircleOutlined className="timeline-clock-icon" />} color="red">
                        Technical testing 2015-09-01
            </Timeline.Item>
                    <Timeline.Item>Network problems being solved 2015-09-01</Timeline.Item>
                </Timeline>
            </ProCard>
        </PageContainer>
    );
};
