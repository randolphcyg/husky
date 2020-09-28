import React, { useState, useEffect } from 'react';

import { connect } from 'umi';
import { Button, Divider, Form, Input, message } from 'antd';
import ProCard from '@ant-design/pro-card';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { MailServerFormItemProps, MailServerFormProps, saveMailServerConfig, loadFormData, testSendMail } from "@/services/mail";

const MailServerView: React.FC<MailServerFormProps> = (props) => {
  const [proForm] = ProForm.useForm();
  const [initialFormValues, setValues] = useState({});    // 表单数据初始化
  const [loading, setLoading] = useState(false);    // 表单loading

  useEffect(() => {
    initForm();
  }, []);

  // 初始化表单数据
  async function initForm() {
    setLoading(true);
    try {
      const msg = await loadFormData();
      if (msg.code === 0) {
        setValues(msg.body);
      } else {
        message.error(msg.message);
      }
    }
    // 如果操作失败
    catch (error) {
      message.error('获取邮箱配置失败，请重试!');
    }
    setLoading(false);
  }

  // 测试邮件服务器配置是否连通
  const onCheckMailServerConfigConnect = async () => {
    try {
      const values = await proForm.validateFields();
      console.log('成功:', values);
      // 测试邮件时必须填写 testMailReceiver 字段
      if ((typeof values['testMailReceiver']) !== 'undefined') {
        const msg = await testSendMail(values);
        if (msg.code === 0) {
          message.success(msg.message);
        } else {
          message.error(msg.message);
        }
      } else {
        message.success('请先填写测试收件人邮箱!');
      }
    } catch (errorInfo) {
      console.log('失败:', errorInfo);
    }
  };

  // 保存邮件服务器配置
  const onSaveMailServerConfig = (values: MailServerFormItemProps) => {
    handleSubmit(values);   // 调用保存判断
  };

  async function handleSubmit(values: MailServerFormItemProps) {
    try {
      // 提交创建申请 到service方法
      const msg = await saveMailServerConfig({ ...values });
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

  return (
    <ProCard bordered={true} loading={loading}>
      <ProForm
        form={proForm}
        hideRequiredMark={true} // 隐藏必选标记
        scrollToFirstError={true}
        submitter={false}   // 去除表单自带提交按钮
        // 表单初始值从redis读取
        initialValues={initialFormValues}
      >
        <ProForm.Group title="1.连接配置">
          <ProFormText name="mailServerSmtpServer" label="邮件服务器" placeholder="smtp.exmail.qq.com"
            rules={[
              // 这里需要正则格式化判断
              {
                required: true,
                message: '请填写邮件服务器!'
              },
            ]} />
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
          <ProFormText name="mailServerAdmin" label="管理员" placeholder="devops@sys.xxx.com"
            rules={[
              {
                required: true,
                message: '请填写邮件服务器管理员邮箱!'
              },
              {
                pattern: /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/,
                message: '邮箱格式错误!'
              }]} />
          {/* proform原子组件没有密码组件，源码已经添加了，需要github看下怎么用 */}
          <ProFormText name="mailServerAdminPwd" label="管理员口令" placeholder="**********"
            rules={[
              {
                required: true,
                message: '请填写邮件服务器管理员口令!'
              }]} ><Input.Password />
          </ProFormText>
        </ProForm.Group>
        <ProForm.Group title="2.通知配置">
          <ProFormText name="adAccountHelpFile" label="AD账号说明文档" placeholder="https://xxxx" />
          <ProFormText name="blank" label="留空字段" placeholder="" />
        </ProForm.Group>
        <ProFormText name="testMailReceiver" label="测试收件人" placeholder="xxx@xxx.com"
          rules={[
            {
              required: false,
              message: '请填写测试收件人邮箱!'
            },
            {
              pattern: /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/,
              message: '邮箱格式错误!'
            }]} />
        <Button type="default" onClick={onCheckMailServerConfigConnect}>测试邮件</Button>
        <Divider key='divider-onCheckMailServerConfigConnect' dashed={true} type="vertical" />
        <Button type="primary" onClick={() => {
          proForm.validateFields()
            .then(values => {
              onSaveMailServerConfig(values);
            })
            .catch(info => {
              console.log('验证模态框表单失败:', info);
            });
        }}>保存配置</Button>
      </ProForm>
    </ProCard>
  );
}

export default connect(({ }) => ({}))(MailServerView);