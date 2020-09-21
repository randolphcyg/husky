import React, { Component } from 'react';
import { DownloadOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Button, Divider, Alert, Modal, message, Radio, Spin } from 'antd';
import { connect } from 'umi';
import { addItem, updateItem } from '@/services/visual';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/pie';    //饼图


var dataSet = [10, 15, 30, 20];

class VisualPage extends Component {
  state = {
    modalVisible: false,
  }

  componentDidMount() {
    this.loadData();
  }

  generateCharts = async () => {
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

  //获取列表
  loadData() {
    console.log('页面方法 loadData');
    //使用connect后，dispatch通过props传给了组件
    const { dispatch } = this.props;
    dispatch({ type: 'visual/fetchTodoList', payload: null });
    console.log('dispatch结束');
  }

  handleModalVisible(visible: boolean) {
    this.setState({ modalVisible: visible });
  }

  render() {
    const { visual } = this.props;
    console.log(visual)
    const { todoList } = visual;
    const { modalVisible } = this.state;
    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
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
        title: '操作',
        hideInForm: true,
        render: (_, record) => {
          const operations = [];
          operations.push(<Button type='primary' key='btn-generate' onClick={() => this.handleModalVisible(true)} >可视化</Button>);
          operations.push(<Divider key='divider-generate' type="vertical" />);
          operations.push(<Button key='btn-second' onClick={() => this.generateCharts(record)}>次按钮</Button>);
          operations.push(<Divider key='divider-second' type="vertical" />);
          operations.push(<Button key='btn-dashed' type="dashed">虚拟按钮</Button>);
          return (
            <>
              {operations}
            </>
          )

        },
      },
    ]
    return (
      <PageHeaderWrapper>
        <ProTable
          headerTitle="数据列表"
          rowKey="id"
          toolBarRender={() => [
            <Button type="primary" onClick={() => this.loadData()}>查询</Button>
          ]}
          search={false}
          dataSource={todoList}
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
          <Button type='primary' key='btn-generate' onClick={() => this.generateCharts()} >生成图表</Button>
        </Modal>
      </PageHeaderWrapper>);
  }
}
//使用umi的connect方法把命名空间为 visual 的 model 的数据通过 props 传给页面
export default connect(({ visual }) => ({ visual }))(VisualPage);