import React, { Component } from 'react';
import { Card, Typography, Button, Divider, Alert, Modal, message, Spin, Pagination } from 'antd';
import ProTable from '@ant-design/pro-table';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect } from 'umi';

class ADUserPage extends Component {

  componentDidMount() {
    this.loadData();
  }

  //获取AD域用户列表
  loadData() {
    console.log('页面方法 loadData');
    //使用connect后，dispatch通过props传给了组件
    const { dispatch } = this.props;
    dispatch({ type: 'ad/fetchADUserList', payload: null });
  }

  // 增加用户
  addADUser() {
    console.log('这里调增加用户的后端接口')
  }

  // 批量增加用户
  batchAddADUser() {
    console.log('这里调批量增加用户的后端接口')
  }

  render() {

    const { ad } = this.props;
    const { ADUserList } = ad;
    const columns = [
      {
        title: '账号',
        dataIndex: 'sam',
        hideInForm: true,
        fixed: 'left',
        width: '10%',
      },
      {
        title: '姓名',
        dataIndex: 'name',
        width: '10%',
      },
      {
        title: '部门',
        dataIndex: 'department',
        copyable: true,    //多出来一个蓝色的复制icon，点击就直接进行复制
        ellipsis: true,   //用...代替没有显示的文本，并且在鼠标移到相应的文本上会显示全部的相应文本
        hideInForm: true,
        width: '20%',
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        copyable: true,
        hideInForm: true,
        width: '15%',
      },
      {
        title: '手机号',
        dataIndex: 'telphone',
        copyable: true,
        hideInForm: true,
        width: '15%',
      },
      {
        title: '职位',
        dataIndex: 'title',
        copyable: true,
        hideInForm: true,
        width: '10%',
      },
      {
        title: '操作',
        dataIndex: 'options',
        hideInForm: true,
        hideInSearch: true,
        fixed: 'right',
        width: '20%',
        render: () => <a>重设密码</a>,
      },
    ];

    return (
      <PageHeaderWrapper>
        <ProTable
          headerTitle="AD域用户列表"
          rowKey="sam"
          columns={columns}     // 列名
          dataSource={ADUserList}  // 数据源
          search={true}         // 搜索
          scroll={{ x: 1300 }}  // 滑动轴
          pagination={true}     // 分页
          toolBarRender={() => [
            <Button type="primary" key='btn-addADUser' onClick={() => this.addADUser()}>增加用户</Button>,
            <Divider key='divider-addADUser' type="vertical" />,
            <Button type="default" key='btn-batchAddADUser' onClick={() => this.batchAddADUser()}>批量增加用户</Button>,
          ]}
        />
      </PageHeaderWrapper>
    );
  }
}
//使用umi的connect方法把命名空间为 visual 的 model 的数据通过 props 传给页面
export default connect(({ ad }) => ({ ad }))(ADUserPage);