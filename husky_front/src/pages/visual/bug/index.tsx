import React, { Component } from 'react';
import ProTable from '@ant-design/pro-table';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Button, Divider, Alert, Modal, message, Spin } from 'antd';
import { connect } from 'umi';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/bar';       //柱状图
import 'echarts/lib/chart/pie';       //饼图
import 'echarts/lib/chart/line';      //折线图
import 'echarts/extension/dataTool';   //工具栏

class VisualPage extends Component {
  state = {
    modalVisible: false,
  }

  componentDidMount() {
    this.loadData();
  }

  //获取列表
  loadData() {
    console.log('页面方法 loadData');
    //使用connect后，dispatch通过props传给了组件
    const { dispatch } = this.props;
    dispatch({ type: 'visual/fetchBugList', payload: null });
  }

  // 模态框控制
  handleModalVisible(visible: boolean) {
    this.setState({ modalVisible: visible });
  }

  // 柱状图
  generateHistogram() {
    console.log('柱状图 generateHistogram');
    var dom = document.getElementById("container");
    var myChart = echarts.init(dom);
    let option = {
      color: ['#3398DB'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
          type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          axisTick: {
            alignWithLabel: true
          }
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: [
        {
          name: '直接访问',
          type: 'bar',
          barWidth: '60%',
          data: [10, 52, 200, 334, 390, 330, 220]
        }
      ]
    };
    // 作图
    if (option && typeof option === "object") {
      myChart.setOption(option, true);
    }
  }
  // 饼图
  // generatePieChart() {
  //   console.log('饼图 generatePieChart');
  // }
  generatePieChart = async () => {
    console.log('饼图 generatePieChart');
    var dom = document.getElementById("container");
    var myChart = echarts.init(dom);
    var innerCircleData = [];
    // Generate mock data
    var obj = {
      '高': {
        '测试中': {
          '敖田': 1,
          '颜茹霞': 1,
          '刘毅': 1,
          '赵乐': 1
        },
        '处理中': {
          '杜瑞': 1
        },
        '待处理': {
          '林锦': 1,
          '祝忠海': 1
        },
      },
      '紧急': {
        '测试中': {
          '敖田': 2,
          '林锦': 1,
          '李云霓': 1,
          '王娟': 1
        },
        '处理中': {},
        '待处理': {
          '祝忠海': 1,
          '罗俊杰': 1
        },
      },
      '中': {
        '测试中': {
          '王腊腊': 1,
          '文深': 1
        },
        '处理中': {},
        '待处理': {
          '林锦': 1
        },
      },
      '低': {
        '测试中': {},
        '处理中': {
          '马煜华': 1,
          '丁稀智': 1
        },
        '待处理': {},
      },
    };
    // 遍历json数据，将内圈需要的数据计算出来          
    echarts.util.each(obj, function (item, index) {
      var sum = 0;
      for (var outIndex in obj[index]) {
        for (let innerIndex in obj[index][outIndex]) {
          sum += obj[index][outIndex][innerIndex];
        }
      }
      if (index === '紧急') { // 突出 紧急 状态
        innerCircleData.push({
          value: sum,
          name: index,
          selected: true,
        });
      } else {
        innerCircleData.push({
          value: sum,
          name: index
        });
      }
      // console.log(innerCircleData);
      return innerCircleData
    });
    // 外圈所需数据
    let outerCircleData = [];
    var count = 0; // 计数器
    echarts.util.each(obj, function (item, index) {
      for (var outIndex in obj[index]) {
        var sum = 0;
        var lastValue = 0;
        for (var innerIndex in obj[index][outIndex]) {
          sum += obj[index][outIndex][innerIndex]
        }

        console.log(index + '-' + outIndex, sum, (sum / 19) * 2 * Math.PI)
        if (count === 0) { // 第一个
          outerCircleData.push({
            value: sum,
            name: index + '-' + outIndex,
            "_startArc": 0,
            "_endArc": (sum / 19) * 2 * Math.PI,
          });
        } else if (count === obj[index].length - 1) { // 最后一个
          outerCircleData.push({
            value: sum,
            name: index + '-' + outIndex,
            "_startArc": (sum / 19) * 2 * Math.PI,
            "_endArc": 2 * Math.PI,
          });
        } else if (sum !== 0) { // 中间的角度
          outerCircleData.push({
            value: sum,
            name: index + '-' + outIndex,
            "_startArc": outerCircleData[outerCircleData.length - 1]._endArc,
            "_endArc": (sum / 19) * 2 * Math.PI + outerCircleData[outerCircleData.length - 1]._endArc,
          });
        }
        count++;
      }
    });

    let option = {
      // 背景颜色
      backgroundColor: "rgb(22, 1, 43)",
      color: ["rgb(190, 100, 0)", "rgb(190, 0, 0)", "rgb(191, 191, 0)", "rgb(95, 191, 0)",
        "rgb(188, 140, 80)", "rgb(188, 120, 80)", "rgb(190, 100, 0)", "rgb(191, 80, 80)", "rgb(191, 26, 26)", "rgb(186, 186, 80)", "rgb(186, 186, 30)", "rgb(105, 186, 24)"],
      animationEasing: "ExponentialOut",
      animation: true,
      // 标题组件
      title: {
        text: '不满足SLA的问题-可视化图例',
        subtext: '优化ing...',
        top: 15,
        left: 'center',
        textStyle: {
          fontSize: 20,
          color: 'rgb(238, 197, 102)'
        },
        // 副标题样式
        subtextStyle: {
          fontSize: 16,
          fontStyle: "oblique"
        }
      },
      // 提示框组件
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      // 图例组件
      legend: {
        orient: 'vertical',
        left: 30,
        x: "left",
        y: "center",
        data: ['高', '紧急', '中', '低', '高-测试中', '高-处理中', '高-待处理',
          '紧急-测试中', '紧急-待处理', '中-测试中', '中-待处理', '低-处理中'
        ],
        textStyle: {
          color: 'rgb(238, 197, 102)'
        },
      },
      // 工具栏
      toolbox: {
        show: true,
        feature: {
          dataZoom: {
            yAxisIndex: "none"
          },
          dataView: {
            readOnly: false
          },
          restore: {},
          saveAsImage: {}
        }
      },
      dataset: {
        // json数据
        source: {
          '高': {
            '测试中': {
              '敖田': 1,
              '颜茹霞': 1,
              '刘毅': 1,
              '赵乐': 1
            },
            '处理中': {
              '杜瑞': 1
            },
            '待处理': {
              '林锦': 1,
              '祝忠海': 1
            },
          },
          '紧急': {
            '测试中': {
              '敖田': 2,
              '林锦': 1,
              '李云霓': 1,
              '王娟': 1
            },
            '处理中': {},
            '待处理': {
              '祝忠海': 1,
              '罗俊杰': 1
            },
          },
          '中': {
            '测试中': {
              '王腊腊': 1,
              '文深': 1
            },
            '处理中': {},
            '待处理': {
              '林锦': 1
            },
          },
          '低': {
            '测试中': {},
            '处理中': {
              '马煜华': 1,
              '丁稀智': 1
            },
            '待处理': {},
          },
        }
      },
      // 系列数据
      series: [{
        name: '状态',
        type: 'pie',
        selectedMode: 'single',
        radius: [0, '30%'],
        label: {
          position: 'inner'
        },
        labelLine: {
          show: false
        },
        data: innerCircleData,
      }, {
        name: '状态详情',
        type: 'pie',
        radius: ['40%', '55%'],
        label: {
          formatter: function formatterFunc(params) {
            const values = params.data; // 内容
            const formatter = [`{rect|}{name|${values.name}} ${values.value}%`,
            `${values.value}% {name|${values.name}}{rect|}`
            ];
            const midAngle = (values._startArc + values._endArc) / 2;
            if (midAngle <= Math.PI) {
              return formatter[0];
            } else {
              return formatter[1];
            }
          },
          rich: {
            name: {
              "color": '#fff',
              "borderColor": '#264884',
              "borderWidth": 1,
              "padding": [10, 15],
            },
            rect: {
              "height": 10,
              "width": 6,
              "backgroundColor": "#264884"
            }
          },
        },
        data: outerCircleData
      }]
    };
    if (option && typeof option === "object") {
      myChart.setOption(option, true);
    }
    // 注册内圈点击事件函数
    myChart.on("click", innerCircleEvent);
    // 添加内圈点击事件函数
    function innerCircleEvent(param) {
      if (param.seriesIndex == 0) {
        for (var i = 0; i < option.series[0].data.length; i++) {
          option.series[0].data[i].selected = false;
        }
        var selected = param.data;
        selected.selected = true;
        console.log(selected);
        // 显示详细信息
        // console.log(option.series[0].data[param.dataIndex]);
        // option.series[0].data[param.dataIndex] = selected;
        // option.series[1].data=dataA;
        // option.series[1].data = param.data[param.dataIndex];
        // console.log(option);
        // myChart.clear();
        // myChart.setOption(option);
      }
    }
  }
  // 折线图
  generateLineChart() {
    console.log('折线图 generateLineChart');
    var dom = document.getElementById("container");
    var myChart = echarts.init(dom);
    var base = +new Date(1968, 9, 3);
    var oneDay = 24 * 3600 * 1000;
    var date = [];
    var data = [Math.random() * 300];
    for (var i = 1; i < 20000; i++) {
      var now = new Date(base += oneDay);
      date.push([now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'));
      data.push(Math.round((Math.random() - 0.5) * 20 + data[i - 1]));
    }
    let option = {
      tooltip: {
        trigger: 'axis',
        position: function (pt) {
          return [pt[0], '10%'];
        }
      },
      title: {
        left: 'center',
        text: '大数据量面积图',
      },
      toolbox: {
        feature: {
          dataZoom: {
            yAxisIndex: 'none'
          },
          restore: {},
          saveAsImage: {}
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: date
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '100%']
      },
      dataZoom: [{
        type: 'inside',
        start: 0,
        end: 10
      }, {
        start: 0,
        end: 10,
        handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        handleSize: '80%',
        handleStyle: {
          color: '#fff',
          shadowBlur: 3,
          shadowColor: 'rgba(0, 0, 0, 0.6)',
          shadowOffsetX: 2,
          shadowOffsetY: 2
        }
      }],
      series: [
        {
          name: '模拟数据',
          type: 'line',
          smooth: true,
          symbol: 'none',
          sampling: 'average',
          itemStyle: {
            color: 'rgb(255, 70, 131)'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgb(255, 158, 68)'
            }, {
              offset: 1,
              color: 'rgb(255, 70, 131)'
            }])
          },
          data: data
        }
      ]
    };
    // 作图
    if (option && typeof option === "object") {
      myChart.setOption(option, true);
    }
  }

  render() {
    const { visual } = this.props;
    const { bugList } = visual;
    const { modalVisible } = this.state;
    const columns = [
      {
        title: '编号',
        dataIndex: 'num',
        hideInForm: true,
      },
      {
        title: '标题',
        dataIndex: 'title',
        rules: [
          {
            required: true,
            message: '待办事项标题不能为空',
          },
        ]
      },
      {
        title: '编号',
        dataIndex: 'num',
        hideInForm: true,
      },
      {
        title: '优先级',
        dataIndex: 'level',
        hideInForm: true,
      },
      {
        title: '状态',
        dataIndex: 'status',
        hideInForm: true,
      },
      {
        title: '经办人',
        dataIndex: 'manager',
        hideInForm: true,
      },
      {
        title: '经办人流转',
        dataIndex: 'managers',
        hideInForm: true,
      },
      {
        title: '经办人停留时间',
        dataIndex: 'managers_delay',
        hideInForm: true,
      },
    ]
    return (
      <PageHeaderWrapper>
        <ProTable
          headerTitle="数据列表"
          rowKey="id"
          toolBarRender={() => [
            <Button type="primary" key='btn-modal' onClick={() => this.handleModalVisible(true)}>可视化图表</Button>,
          ]}
          search={true}
          dataSource={bugList}
          columns={columns}
          rowSelection={false}
          expandable={false}
          {...this.state}
          pagination={false}
        />
        <Modal
          destroyOnClose
          title="一级可视化图表"
          visible={modalVisible}
          onCancel={() => this.handleModalVisible(false)}
          footer={null}
          width={1300}
        >
          {/* 模态框 container 留空 */}
          <div id="container" style={{ width: '100%', height: 420 }}>
            <Spin tip="Loading...">
              <Alert
                message="暂无图例"
                description="点击【生成图表】按钮生成图表"
                type="info"
              />
            </Spin>
          </div>
          <Button type="primary" key='btn-generateHistogram' onClick={() => this.generateHistogram()}>柱状图</Button>,
          <Button type="ghost" key='btn-generatePieChart' onClick={() => this.generatePieChart()}>扇形图</Button>,
          <Button type="default" key='btn-generateLineChart' onClick={() => this.generateLineChart()}>折线图</Button>,
        </Modal>
      </PageHeaderWrapper>);
  }
}
//使用umi的connect方法把命名空间为 visual 的 model 的数据通过 props 传给页面
export default connect(({ visual }) => ({ visual }))(VisualPage);