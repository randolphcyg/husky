import React, { Component } from 'react';
import { Button, Divider, Modal, message, Card } from 'antd';
import { connect } from 'umi';
import ProCard from '@ant-design/pro-card';
import ProTable from '@ant-design/pro-table';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProForm, { ProFormText } from '@ant-design/pro-form';



interface MailServerFormItemProps {
  mailServerSmtp: string;
  mailServerAdmin: string;
  mailServerAdminPwd: string;
  mailServerSender: string;
}

class MailServerView extends Component {
  render() {
    // const [proForm] = ProForm.useForm();
    const onCheckMailServerConnect = async () => {
      console.log('onCheckMailServerConnect');
      // try {
      //   const values = await proForm.validateFields();
      //   console.log('成功:', values);
      // } catch (errorInfo) {
      //   console.log('失败:', errorInfo);
      // }
    };
    return (
      <Card>
        <ProForm
          // form={proForm}
          layout={'horizontal'}   // 垂直布局
          hideRequiredMark={true} // 隐藏必选标记
          scrollToFirstError={true}
          submitter={false}   // 去除表单自带提交按钮
        >
          <ProForm.Group title="连接配置">
            <ProFormText width="m" name="mailServerSmtp" label="邮件服务器" placeholder="smtp.exmail.qq.com"
              rules={[
                // 这里需要正则格式化判断
                {
                  required: true,
                  message: '请填写邮件服务器!'
                },
              ]} />
            <ProFormText width="m" name="mailServerAdmin" label="用户名" placeholder="devops@sys.xxx.com"
              rules={[
                {
                  required: true,
                  message: '请填写邮件服务器管理员用户名!'
                },
                {
                  pattern: /^[^\s]*$/,
                  message: '禁止输入空格!'
                }]} />
            <ProFormText width="m" name="mailServerAdminPwd" label="管理员口令" placeholder="xxxxxxxxxx"
              rules={[
                {
                  required: true,
                  message: '请填写邮件服务器管理员口令!'
                }]} />
            <ProFormText width="m" name="mailServerSender" label="发件人" placeholder="devops@sys.xxx.com"
              rules={[
                {
                  required: true,
                  message: '请填写发件人!'
                }]} />
            {/* // 需要加邮件发送测试按钮 */}
          </ProForm.Group>
          <ProForm.Group title="消息通知个性化配置">
            <ProFormText width="l" name="adAccountHelpFile" label="AD域账号使用说明文档地址" placeholder="https://xxxx" />
            <ProFormText width="l" name="blank" label="留空字段" placeholder="" />
          </ProForm.Group>
          <Button type="primary" onClick={onCheckMailServerConnect}>测试连接</Button>
        </ProForm>
      </Card>
    );
  }
}

export default MailServerView;
