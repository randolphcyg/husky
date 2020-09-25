import React, { Component } from 'react';
import { Card, Alert, Typography } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { HeartTwoTone, SmileTwoTone } from '@ant-design/icons';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/bar';    // 柱状图
import 'echarts/lib/chart/line';    //折线图

var dataSet = [10, 15, 30, 20];
class Index extends Component {

    componentDidMount() {
        // 图表显示容器
        let el = document.getElementById("main");
        console.log(el)
        // 图表初始化
        let myChart = echarts.init(el);

        setInterval(() => {

            var dataSet1 = dataSet.map(function (ele) {
                return Math.random(20) * ele;
            })

            // 图表配置项
            let option = {
                title: {
                    text: '柱状图',
                    subtext: '销量统计'
                },
                xAxis: {
                    data: ["河北", "河北", "山西", "广州"]
                },
                yAxis: {
                    gridIndex: 0,
                    min: 0,
                    max: 30,
                    interval: 5
                },
                series: [{
                    name: '销量',
                    type: 'bar',
                    data: dataSet1
                }],
                legend: {
                    show: true,
                    data: [{
                        name: '销量',
                        icon: 'circle'
                    }]
                }
            }

            // 进行图表配置
            myChart.setOption(option);

        }, 1000);
    }


    render() {
        return (
            <PageHeaderWrapper>
                <Card>
                    <Alert
                        message="更多功能正在开发中，未来都会集成到此平台来！"
                        type="success"
                        showIcon
                        banner
                        style={{
                            margin: -12,
                            marginBottom: 48,
                        }}
                    />
                    这是一个示例
                           <Typography.Title level={2} style={{ textAlign: 'center' }}>
                        <SmileTwoTone /> Randolph <HeartTwoTone twoToneColor="#eb2f96" /> You
       </Typography.Title>
                    <div id="main" style={{ width: '80%', height: 400 }}>echarts案例</div>
                </Card>
                <p style={{ textAlign: 'center', marginTop: 24 }}>
                    想添加更多页面? 请参考{' '}
                    <a href="https://pro.ant.design/docs/block-cn" target="_blank" rel="noopener noreferrer">
                        使用 块
       </a>
       。
     </p>
            </PageHeaderWrapper>
        )
    }
}

export default Index;
