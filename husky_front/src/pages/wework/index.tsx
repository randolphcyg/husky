import { weworkContact } from "@/services/wework";
import { ClockCircleOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import { ProColumnType } from '@ant-design/pro-table/es/Table';
import { Button } from 'antd';
import React from 'react';
import { request } from 'umi';

async function testWeworkApi() {
    const msg = await weworkContact();
    console.log(msg);
}

const columns: Array<ProColumnType> = [
    {
        title: '姓名',
        dataIndex: 'name',
        hideInForm: true,
        fixed: 'left',
        width: '10%',
    },
    {
        title: '职务',
        dataIndex: 'position',
        width: '8%',
        copyable: true,
    },
    {
        title: '部门',
        dataIndex: 'department',
        hideInForm: true,
        width: '5%',
    },
    {
        title: '手机',
        dataIndex: 'mobile',
        copyable: true,
        hideInForm: true,
        width: '10%',
    },
    {
        title: '邮箱',
        dataIndex: 'email',
        copyable: true,
        hideInForm: true,
        width: '20%',
    },
    {
        title: '账号',
        dataIndex: 'userid',
        copyable: true,
        ellipsis: true,
        hideInForm: true,
        width: '22%',
    },
    {
        title: '操作',
        dataIndex: 'options',
        hideInForm: true,
        hideInSearch: true,
        fixed: 'right',
        width: '20%',
        render: () => <Button type="primary">查看</Button>,
    },
]

export default () => {
    return (
        <PageContainer title='wework接口移植测试'>
            <ProCard>
                <Button type="primary" key='btn-testWeWork' onClick={testWeworkApi} icon={<ClockCircleOutlined />}>企业微信API连通测试</Button>
                <ProTable
                    headerTitle="可编辑表格测试"
                    rowKey="userid"
                    columns={columns}             // 列名
                    scroll={{ x: 1300 }}          // 滑动轴
                    pagination={{                 // 分页
                        showQuickJumper: true,
                    }}
                    // 表格请求数据
                    request={async (params = {}) =>
                        request<{
                            data: [];
                        }>('/api/featchWeworkUserList', {
                            params,
                        })
                    }
                />
            </ProCard>
        </PageContainer>
    );
};
