import React, { Component } from 'react';
import { Button, Divider, Alert, Modal, message, Pagination } from 'antd';
import ProTable from '@ant-design/pro-table';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect } from 'umi';
import ProForm, { ProFormText, ProFormRate } from '@ant-design/pro-form';
import ProCard from '@ant-design/pro-card';
import { ADUserParamsType, addADUser } from '@/services/ad';


class ADUserPage extends Component {

  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.loadData();  // 加载数据
  }

  state = {
    modalVisible: false,
  }
  // 模态框控制
  handleModalVisible(visible: boolean) {
    this.setState({ modalVisible: visible });
  }

  //获取AD域用户列表
  loadData() {
    console.log('页面方法 loadData');
    //使用connect后，dispatch通过props传给了组件
    const { dispatch } = this.props;
    dispatch({ type: 'ad/fetchADUserList', payload: [] });
  }

  // 创建用户
  addADUser(reqData) {
    console.log('这里调创建用户的后端接口')
    const { dispatch } = this.props;
    dispatch({ type: 'ad/addADUser', payload: [] });
  }

  // 批量创建用户
  batchAddADUser() {
    console.log('这里调批量创建用户的后端接口')
  }

  handleSubmit = async (values: ADUserParamsType) => {
    console.log(values)
    // setSubmitting(true);
    try {
      // 提交创建申请
      const msg = await addADUser({ ...values });
      if (msg.code === 0) {
        message.success(msg.message);
      } else {
        message.error(msg.message);
      }
      return;
    }
    // 如果提交失败
    catch (error) {
      message.error('创建失败，请重试!');
    }
  };

  render() {
    const { ad } = this.props;
    const { ADUserList, loading } = ad;
    const { modalVisible } = this.state;
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
        width: '8%',
      },
      {
        title: '部门',
        dataIndex: 'department',
        copyable: true,    //多出来一个蓝色的复制icon，点击就直接进行复制
        ellipsis: true,   //用...代替没有显示的文本，并且在鼠标移到相应的文本上会显示全部的相应文本
        hideInForm: true,
        width: '22%',
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        copyable: true,
        hideInForm: true,
        width: '20%',
      },
      {
        title: '手机号',
        dataIndex: 'telphone',
        copyable: true,
        hideInForm: true,
        width: '10%',
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
          columns={columns}         // 列名
          dataSource={ADUserList}   // 数据源
          search={true}             // 搜索
          scroll={{ x: 1300 }}      // 滑动轴
          pagination={true}         // 分页
          loading={loading}         // 加载中
          toolBarRender={() => [
            <Button type="primary" key='btn-addADUser' onClick={() => this.handleModalVisible(true)}>创建用户</Button>,
            <Divider key='divider-addADUser' type="vertical" />,
            <Button type="default" key='btn-batchAddADUser' disabled onClick={() => this.batchAddADUser()}>批量创建用户</Button>,
          ]}
        />
        <Modal
          destroyOnClose
          title="创建用户"
          visible={modalVisible}
          onCancel={() => this.handleModalVisible(false)}
          footer={null}
          width={700}
        >
          <ProCard>
            <ProForm onFinish={(values) => this.handleSubmit(values)}
            >
              <ProForm.Group>
                <ProFormText width="xs" name="eid" label="工号" placeholder="25578"
                  rules={[
                    {
                      required: true,
                      message: '请填写工号!'
                    },
                    {
                      pattern: /^[^\s]*$/,
                      message: '禁止输入空格!'
                    }]} />
                <ProFormText width="xs" name="name" label="姓名" placeholder="甄小明"
                  rules={[
                    {
                      required: true,
                      message: '请填写姓名!'
                    },
                    {
                      pattern: /^[^\s]*$/,
                      message: '禁止输入空格!'
                    }]} />
                <ProFormText width="s" name="department" label="部门" placeholder="甄云科技.产品研发中心.产品技术中心.供应商和协议部"
                  rules={[
                    {
                      required: true,
                      message: '请填写部门!'
                    },
                    {
                      pattern: /^[^\s]*$/,
                      message: '禁止输入空格!'
                    }]} />
                <ProFormText width="xs" name="title" label="岗位" initialValue="技术顾问" rules={[{ required: true, message: '请填写岗位!' }]} />
                <ProFormText width="s" name="email" label="邮箱" placeholder="XXX@hand-china.com"
                  rules={[
                    {
                      required: true,
                      message: '请填写邮箱!'
                    },
                    {
                      pattern: /^[^\s]*$/,
                      message: '禁止输入空格!'
                    }]} />
                <ProFormText width="s" name="tel" label="手机" placeholder="手机号"
                  rules={[
                    {
                      required: true,
                      message: '请填写手机号!'
                    },
                    {
                      pattern: /^1[3456789]\d{9}$/,
                      message: '手机格式错误!',
                    }]}
                  getValueFromEvent={(e) => {
                    return e.target.value.replace(/[^0-9]/ig, "");
                  }} />
                <ProFormRate name="rate" label="打分" />
              </ProForm.Group>
            </ProForm>
          </ProCard>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}
//使用umi的connect方法把命名空间为 visual 的 model 的数据通过 props 传给页面
export default connect(({ ad }) => ({ ad }))(ADUserPage);