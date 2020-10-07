import { AccountFormItemProps, saveAccountConfig } from "@/services/user";
import { ExclamationCircleOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import Field, { ProFieldFCMode } from '@ant-design/pro-field';
import ProForm from '@ant-design/pro-form';
import { Button, Descriptions, Divider, message, Popconfirm } from 'antd';
import React, { useEffect, useState } from 'react';
import { connect } from 'umi';



const AccountView: React.FC<AccountFormItemProps> = (props) => {
    const [proForm] = ProForm.useForm();
    const [initialFormValues, setValues] = useState({});    // 表单数据初始化
    const [loading, setLoading] = useState(false);    // 表单loading
    const [state, setState] = useState<ProFieldFCMode>('read');  // 可编辑状态

    useEffect(() => {
        initForm();
    }, []);

    // 初始化表单数据
    async function initForm() {
        setLoading(true);
        try {
            console.log('初始化表单数据')
            // const msg = await loadAccountConfigFormData();
            // if (msg.code === 0) {
            //     setValues(msg.body);
            // } else {
            //     message.error(msg.message);
            // }
        }
        // 如果操作失败
        catch (error) {
            message.error('获取AD配置失败，请重试!');
        }
        setLoading(false);
    }

    // 刷新信息重新查询
    const onUpdate = (values: AccountFormItemProps) => {
        setState('edit')
        console.log(values)
        console.log('更新信息')
    };
    // 取消
    const onCancel = () => {
        setState('read')
    };

    // 提交修改
    const onSubmitUpdate = (values: AccountFormItemProps) => {
        console.log('提交修改')
        handleSubmit(values);   // 调用保存判断
    };

    async function handleSubmit(values: AccountFormItemProps) {
        try {
            // 提交创建申请 到service方法
            const msg = await saveAccountConfig({ ...values });
            if (msg.code === 0) {
                message.success(msg.message);
            } else {
                message.error(msg.message);
            }
            return;
        }
        // 如果提交失败
        catch (error) {
            message.error('保存失败，请重试!');
        }
    };

    return (
        <ProCard bordered={true} loading={loading}>
            <ProForm
                form={proForm}          // 表单数据
                hideRequiredMark={true} // 隐藏必选标记
                scrollToFirstError={true}
                submitter={false}   // 去除表单自带提交按钮
                // 表单初始值从redis读取
                initialValues={initialFormValues}
            >
                <Descriptions column={2}>
                    <Descriptions.Item label="用户名">
                        <Field text="Z25576" valueType="text" mode={'read'} plain={true} />
                    </Descriptions.Item>
                    <Descriptions.Item label="真实姓名">
                        <Field text="蔡迎港" valueType="text" mode={'read'} plain={true} />
                    </Descriptions.Item>
                    <Descriptions.Item label="头像">
                        <Field
                            text="https://avatars2.githubusercontent.com/u/8186664?s=60&v=4"
                            mode="read"
                            valueType="avatar"
                        />
                    </Descriptions.Item>
                    <Descriptions.Item label="职位">
                        <Field text="技术顾问" valueType="text" mode={state} plain={true} initialValue="技术顾问" />
                    </Descriptions.Item>
                    <Descriptions.Item label="邮箱">
                        <Field text="yinggang.cal@hand-china.com" valueType="text" mode={state} plain={true} initialValue="yinggang.cal@hand-china.com" />
                    </Descriptions.Item>
                    <Descriptions.Item label="电话">
                        <Field text="13341648819" valueType="text" mode={state} plain={true} initialValue="13341648819" />
                    </Descriptions.Item>
                </Descriptions>

                <Popconfirm title="确定修改？" okText="是" cancelText="否" icon={ <ExclamationCircleOutlined />}
                    onConfirm={() => {
                        proForm.validateFields()
                            .then(values => {
                                onUpdate(values);
                            })
                            .catch(info => {
                                console.log('验证模态框表单失败:', info);
                            });
                    }}
                    onCancel={onCancel}
                >
                    <Button type="default">更新信息</Button>
                </Popconfirm>
                <Divider key='divider-onUpdate' dashed={true} type="vertical" />
                <Button type='primary' onClick={() => {
                    proForm.validateFields()
                        .then(values => {
                            onSubmitUpdate(values);
                        })
                        .catch(info => {
                            console.log('验证模态框表单失败:', info);
                        });
                }}
                >保存修改</Button>
            </ProForm>
        </ProCard>
    );
}

export default connect(({ }) => ({}))(AccountView);