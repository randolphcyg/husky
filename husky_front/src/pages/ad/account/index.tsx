import { AdAccountInfoItemProps, AdAccountParamsType, addAdAccount, ModalFormProps } from "@/services/ad";
import ProCard from '@ant-design/pro-card';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import { ProColumnType } from '@ant-design/pro-table/es/Table'; // 最先进的antd pro protable 泛型
import { Button, Divider, message, Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { request } from 'umi';

const AdAccountPage: React.FC<ModalFormProps> = () => {
  const [proForm] = ProForm.useForm();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visibleOption, setVisibleOption] = useState(false);

  const columns: Array<ProColumnType<AdAccountInfoItemProps>> = [
    {
      title: '账号',
      dataIndex: 'sam',
      hideInForm: true,
      fixed: 'left',      // 固定左侧
      width: '10%',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      width: '8%',
      copyable: true,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      copyable: true,
      hideInForm: true,
      hideInSearch: true,
      width: '20%',
    },
    {
      title: '手机号',
      dataIndex: 'telphone',
      copyable: true,
      hideInForm: true,
      hideInSearch: true,
      width: '10%',
    },
    {
      title: '职位',
      dataIndex: 'title',
      hideInForm: true,
      hideInSearch: true,
      width: '10%',
    },
    {
      title: '部门',
      dataIndex: 'department',
      copyable: true,           // 可复制
      ellipsis: true,           // 省略过长文本
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
      render: () => <Button danger onClick={resetPwd} disabled>重设密码</Button>,
    },
  ]

  //函数组件
  useEffect(() => {
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
  const onCreate = (values: AdAccountParamsType) => {
    handleSubmit(values);
    setVisible(false);
  };
  // 批量创建账号
  function batchAddAdAccount() {
    console.log('批量创建账号会提供一个表格模板，填写后上传校验并批量创建账号')
  }

  // 重设密码
  function resetPwd() {
    setVisibleOption(true)
    console.log('重设密码')
  }

  return (
    <PageHeaderWrapper>
      <ProTable
        headerTitle="AD域用户列表"
        rowKey="sam"
        columns={columns}             // 列名
        loading={loading}             // 加载中
        onLoad={() => setLoading(false)}  // 数据加载完操作
        scroll={{ x: 1300 }}          // 滑动轴
        pagination={{                 // 分页
          showQuickJumper: true,
        }}
        // 表格请求数据
        request={async (params = {}) =>
          request<{
            data: AdAccountInfoItemProps[];
          }>('/api/fetchAdAccountList', {
            params,
          })
        }
        // 表格搜索
        search={{
          defaultCollapsed: false,
          defaultColsNumber: 1,
          span: 6,
          optionRender: ({ searchText, resetText }, { form }) => {
            return [
              <a
                key="searchText"
                onClick={() => {
                  form?.submit();
                }}
              >
                {searchText}
              </a>,
              <a
                key="resetText"
                onClick={() => {
                  form?.resetFields();
                }}
              >
                {resetText}
              </a>,
              // <a key="out">导出</a>,
            ];
          },
        }}
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
      <Modal
        title="操作提醒"
        visible={visibleOption}
        onOk={() => setVisibleOption(false)}
        onCancel={() => setVisibleOption(false)}
        okText="确认"
        cancelText="取消"
      >
        <p>原密码忘记</p>
        <p>管理员重改随机密码[做]</p>
        <p>并发送邮件</p>
        <p>或者用户自己修改指定密码[不做]</p>
      </Modal>
    </PageHeaderWrapper>
  );
};

export default AdAccountPage;