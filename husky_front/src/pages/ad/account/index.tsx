import React, { useState, useEffect } from 'react';
import { Button, Divider, Modal, message } from 'antd';
import { connect } from 'umi';
import ProCard from '@ant-design/pro-card';
import ProTable from '@ant-design/pro-table';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { ProColumnType } from '@ant-design/pro-table/es/Table'   // 最先进的antd pro protable 泛型
// import { CommonFormProps } from '@ant-design/pro-form/es/BaseForm'; // 最先进的antd pro form 泛型
import { AdAccountParamsType, addAdAccount } from "@/services/ad";
// 模态框表单数据项接口
interface ModalFormItemProps {
  eid: string;
  name: string;
  department: string;
  email: string;
  tel: string;
}
// 模态框表单接口
interface ModalFormProps {
  visible: boolean;
  onCreate: (values: ModalFormItemProps) => void;
  onCancel: () => void;
}
// AD域账户信息数据项接口
interface AdAccountInfoItemProps {
  sam: string;
  name: string;
  department: string;
  email: number;
  telphone: string;
  title: string;
  options: any;
}

const AdAccountPage: React.FC<ModalFormProps> = (props) => {
  const [visible, setVisible] = useState(false);
  const [proForm] = ProForm.useForm();
  const { ad } = props;
  const { adAccountList, loading } = ad;

  const columns: Array<ProColumnType<AdAccountInfoItemProps>> = [
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
  ]

  //获取AD域账户列表
  function loadData() {
    //使用connect后，dispatch通过props传给了组件
    const { dispatch } = props;
    dispatch({ type: 'ad/fetchAdAccountList', payload: [] });
  }
//函数组件
  useEffect(() => {
    loadData();
  }, [])

  async function handleSubmit(values: AdAccountParamsType) {
    try {
      // 提交创建申请 到service方法
      const msg = await addAdAccount({ ...values });
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

  // 创建账号
  const onCreate = values => {
    handleSubmit(values);
    setVisible(false);
  };
  // 批量创建账号
  function batchAddAdAccount() {
    console.log('批量创建账号会提供一个表格模板，填写后上传校验并批量创建账号')
  }

  return (
    <PageHeaderWrapper>
      <ProTable
        headerTitle="AD域用户列表"
        rowKey="sam"
        columns={columns}         // 列名
        dataSource={adAccountList}   // 数据源
        loading={loading}         // 加载中
        scroll={{ x: 1300 }}      // 滑动轴
        search={true}             // 搜索
        pagination={true}         // 分页
        toolBarRender={() => [
          <Button type="primary" key='btn-addAdAccount' onClick={() => setVisible(true)}>创建账号</Button>,
          <Divider key='divider-addAdAccount' type="vertical" />,
          <Button type="default" key='btn-batchAddAdAccount' disabled onClick={() => batchAddAdAccount()}>批量创建账号</Button>,
        ]}
      />
      <Modal
        destroyOnClose
        visible={visible}
        title="创建账户"
        okText="提交创建"
        cancelText="取消操作"
        onCancel={() => {
          setVisible(false);
        }}
        onOk={() => {
          proForm
            .validateFields()
            .then(values => {
              proForm.resetFields();
              onCreate(values);
            })
            .catch(info => {
              console.log('验证模态框表单失败:', info);
            });
        }}
      >
        <ProCard>
          <ProForm
            form={proForm}          // 表单数据
            layout={'horizontal'}   // 垂直布局
            hideRequiredMark={true} // 隐藏必选标记
            scrollToFirstError={true}
            submitter={false}   // 去除表单自带提交按钮
          >
            <ProForm.Group title="基础信息">
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
              <ProFormText width="xs" name="title" label="岗位" initialValue="技术顾问" rules={[{ required: true, message: '请填写岗位!' }]} />
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
            </ProForm.Group>
            <ProForm.Group title="联系信息">
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
            </ProForm.Group>
          </ProForm>
        </ProCard>
      </Modal>
    </PageHeaderWrapper>
  );
};

export default connect(({ ad }) => ({ ad }))(AdAccountPage);