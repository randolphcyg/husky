import React from 'react';

import { connect } from 'umi';
import { Button, Divider, Form, Input } from 'antd';
import ProCard from '@ant-design/pro-card';
import ProForm, { ProFormText } from '@ant-design/pro-form';

// 邮件服务器表单数据项接口
interface MailServerFormItemProps {
  mailServerSmtp: string;
  mailServerAdmin: string;
  mailServerAdminPwd: string;
  mailServerSender: string;
};

// 邮件服务器表单接口
interface MailServerFormProps {
  onCheckMailServerConfigConnect: (values: MailServerFormItemProps) => void;
  onSaveMailServerConfig: (values: MailServerFormItemProps) => void;
};

const MailServerView: React.FC<MailServerFormProps> = (props) => {
  const [proForm] = ProForm.useForm();
  // 测试邮件服务器配置是否连通
  const onCheckMailServerConfigConnect = async () => {
    console.log('onCheckMailServerConfigConnect 暂时只提供仅可配置一台邮件服务器');
    try {
      const values = await proForm.validateFields();
      console.log('成功:', values);
    } catch (errorInfo) {
      console.log('失败:', errorInfo);
    }
  };

  // 保存邮件服务器配置
  const onSaveMailServerConfig = async () => {
    console.log('onSaveMailServerConfig 保存配置');
    try {
      const values = await proForm.validateFields();
      console.log('成功:', values);
    } catch (errorInfo) {
      console.log('失败:', errorInfo);
    }
  };

  return (
    <ProCard bordered={true}>
      <ProForm
        form={proForm}
        hideRequiredMark={true} // 隐藏必选标记
        scrollToFirstError={true}
        submitter={false}   // 去除表单自带提交按钮
      >
        <ProForm.Group title="1.连接配置">
          <ProFormText name="mailServerSmtp" label="邮件服务器" placeholder="smtp.exmail.qq.com"
            rules={[
              // 这里需要正则格式化判断
              {
                required: true,
                message: '请填写邮件服务器!'
              },
            ]} />
          <ProFormText name="mailServerAdmin" label="用户名" placeholder="devops@sys.xxx.com"
            rules={[
              {
                required: true,
                message: '请填写邮件服务器管理员邮箱!'
              },
              {
                pattern: /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/,
                message: '邮箱格式错误!'
              }]} />
          {/* <ProFormText name="mailServerAdminPwd" label="管理员口令" placeholder="xxxxxxxxxx"
            rules={[
              {
                required: true,
                message: '请填写邮件服务器管理员口令!'
              }]} ><Input.Password /></ProFormText> */}
          {/* proform原子组件没有密码组件，源码已经添加了，需要github看下怎么用 */}
          <Form.Item
            label="管理员口令"
            name="mailServerAdminPwd"
            rules={[{
              required: true,
              message: '请填写邮件服务器管理员口令!'
            }]}
          >
            <Input.Password />
          </Form.Item>

          <ProFormText name="mailServerSender" label="发件人" placeholder="devops@sys.xxx.com"
            rules={[
              {
                required: true,
                message: '请填写发件人!'
              },
              {
                pattern: /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/,
                message: '邮箱格式错误!'
              }]} />
        </ProForm.Group>
        <ProForm.Group title="2.通知配置">
          <ProFormText name="adAccountHelpFile" label="AD账号说明文档" placeholder="https://xxxx" />
          <ProFormText name="blank" label="留空字段" placeholder="" />
        </ProForm.Group>
        {/* 保存前若测试不通过则不保存！(二次确认测试失败也可保存) */}
        <Button type="default" onClick={onCheckMailServerConfigConnect}>测试连接</Button>
        <Divider key='divider-onCheckMailServerConfigConnect' dashed={true} type="vertical" />
        <Button type="primary" onClick={onSaveMailServerConfig}>保存配置</Button>
      </ProForm>
    </ProCard>
  );
}

export default connect(({ }) => ({}))(MailServerView);
