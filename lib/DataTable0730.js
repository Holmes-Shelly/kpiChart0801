(function(){
'use strict';
	
angular.module('DataTableApp', [])
.controller('DataTableController', DataTableController)
.service('DataTableService', DataTableService)
.directive('chartTop', echartsDirevtive)

function echartsDirevtive(){  
    return {  
        scope: {  
			tag: "=",
			value: "=",
		    color: "=",
			data:"=",
        },  
        restrict: 'E',  
        template: '<div style="width:500px; height:400px;"></div>',  
        replace: true,  
        link: function($scope, element, attrs, controller) {
		
		//放大版油耗表的option
	    var topGaugeOption = {
        title: {
			x: "center",
			bottom: 40,
			
			//引入$scope中的4个数据tag, data, value, color
			text: $scope.tag,
			subtext: $scope.data,
			textStyle: {
				fontWeight: 'normal',
				fontSize: 30,
				color: "#323232"
			},
			subtextStyle: {
				fontWeight: 'normal',
				fontSize: 24,
				color: "red"
			},
		},
		series: [{ 
            type: 'gauge',
           	center: ['50%', '65%'], // 默认全局居中  
			radius: 200,
            splitNumber: 5, //刻度数量
            min: 0,
            max:100,
           	startAngle: 200,
			endAngle: -20,
		 
            axisLine: {
                show: true,
                lineStyle: {
                    width: 2,
                    shadowBlur: 0,
                    color: [
                        [1, '#8f8f8f']
                    ]
                }
            },
            axisTick: {
                show: true,
                lineStyle: {
                    color: '#8f8f8f',
                    width: 1
                },
                length: 8,
                splitNumber: 8
            },
            splitLine: {
                show: true,
                length: 12,
                lineStyle: {
                    color: '#8f8f8f',
                }
            },
            axisLabel: {
                distance: 2,
                textStyle: {
                    color: "#8f8f8f",
                    fontSize: "14",
                    fontWeight:"bold"
                },
                	formatter: function(e) {
					
					//此处使用了非线性坐标
					switch(e + "") {
						case "20":
							return "40";

						case "40":
							return "60";
							
						case "60":
							return "80";
								
						case "80":
							return "90";
								
					    case "100":
							return "100";
							
						default:
							return e;
					}
				},
				textStyle: {
					fontSize: 20,
					fontWeight: ""
				}

            },
            pointer: { //仪表盘指针
                show: 0
            },
            detail: {
                show: false
            },
        },
		{
			type: 'gauge',
			startAngle: 200,
			endAngle: -20,
			radius: 150,
		    center: ['50%', '65%'], // 默认全局居中  
			 
			min: 0,
			max: 100,

			axisLine: {
				show: false,
				lineStyle: {
					width:25,
					shadowBlur: 0,
					color: [
						[0.2, 'red'],
						[0.4, 'orange'],
						[0.6, 'yellow'],
						[0.8, 'green'],
						[1, 'blue']
					]
				}
			},
			axisTick: {
                show: false,
                 
            },
			splitLine: {
				show: false,
				length: 20,

			},

			axisLabel: {
			    show:false
			},
			pointer: {
				show: true,
			},
			detail: {
                show:false,
				offsetCenter: [0, 0],
				textStyle: {
					fontSize: 30
				}
			},
			itemStyle: {
            normal: {
                color: "#323232",
                
            }
        },
			data: [{
				name: "",
				value: $scope.value,
			}]
		},
		{
			startAngle: 200,
			endAngle: -20,
			name: '实际完成',
			type: 'gauge',
		    center: ['50%', '65%'], // 默认全局居中  
			radius:100,
			min: 0,
			max: 100,
			splitNumber: 0,
			axisLine: { // 坐标轴线  
				lineStyle: {
					color: [
						[$scope.color, '#dddddd'],
						[1, 'black']
					], // 属性lineStyle控制线条样式  
					width: 4
				}
			},

			 
			axisLabel: { // 坐标轴小标记  
				textStyle: { // 属性lineStyle控制线条样式  
					fontWeight: 'bolder',
					fontSize: 16,
					color: 'rgba(30,144,255,0)',
				}
			},
			splitLine: { // 分隔线  
				length: 10, // 属性length控制线长  
				lineStyle: { // 属性lineStyle（详见lineStyle）控制线条样式  
					width: 0,
					color: '#444'
				}
			},
			pointer: { // 分隔线 指针  
				color: '#666666',
				width: 0,
				length: 230
			},
			detail: {
				show: false
			},

		}, 
		]
        };
        
		//定位放大版油耗表的位置，此处感觉可以优化为component的写法
        var gaugeChartTop = echarts.init(document.getElementById("GaugeChartTop"));  

		//监测鼠标点击带来的$scope属性变化，刷新油耗表
        var watch = $scope.$watch('tag', 
		function(newValue, oldValue, scope){
			topGaugeOption.title.text = $scope.tag;
			
			//很奇怪此处为何要重新赋值，明明option里面就已经引用了$scope
			topGaugeOption.title.subtext = $scope.data;
            topGaugeOption.series[1].data[0].value = $scope.value;
	        topGaugeOption.series[2].axisLine.lineStyle.color[0][0] = $scope.color;
			
			//重新绘图
			gaugeChartTop.setOption(topGaugeOption, true);
			console.log("New chart is", newValue);
            //console.log("Old chart is", oldValue);
		}
		);	

        }  
    };  
}


DataTableController.$inject = ['DataTableService', '$scope'];
function DataTableController(DataTableService, $scope){
	var dataShow = this;
	
	//var gaugeTag= ['总体计划', '年度计划', '月度计划', '行动项进度']
	//var gaugeDataSrc = [98, 59, 98, 100];
	
	//从service中获取数据标签和原始数据
	dataShow.gaugeTag = DataTableService.getGaugeTag();
	dataShow.gaugeDataSrc = DataTableService.getDataSrc();
	
    //用类似于对数坐标的方式处理原始数据
	
	//为简化代码，先写一个处理函数
	function numConvert(num){
	    if (num <= 40){
	        return num/2
	    }
    	else if (num <= 80){
	        return num-20
    	}
	    else{
	        return num*2-100
	    }
	}
	
	//建立新数组，处理完成后逐个列入
	var gaugeData = [];
	for (num in dataShow.gaugeDataSrc){
		gaugeData.push(numConvert(dataShow.gaugeDataSrc[num]));
    }

	//默认不显示放大版gauge油耗表
	dataShow.showTopChart = false;
	
	//从service中获取指标数据
	dataShow.indicator = DataTableService.getIndicator();
    
    //定义点击后的行为
	dataShow.clickHappened = function(n){
		
		//允许显示放大版油耗表
		dataShow.showTopChart = true;
		
		//从service中获取title细节，带有参数n
		dataShow.topTitle = DataTableService.getTitle(n);
		console.log(dataShow.topTitle);
		
		//将echarts需要的四项数据赋给$scope
		$scope.tag = dataShow.gaugeTag[n];
	    $scope.value = Math.floor(gaugeData[n]);
	    $scope.color = gaugeData[n]/100;
		$scope.data = "进度"+ dataShow.gaugeDataSrc[n] +"%";
		console.log($scope.data);
	};
	
	//二次点击时隐藏放大版油耗表
	dataShow.clickClosed = function(){
		dataShow.showTopChart = false;
	}
};

function DataTableService(){
	var service = this;
	
	//获取标签和数据，感觉此处可以和kpiData包括进一个json，放进一个txt里，然后用异步http获取，分配
	service.gaugeTag = ['总体计划', '年度计划', '月度计划', '行动项进度'];
	service.gaugeDataSrc = [98, 59, 98, 100];
	service.title = ['总体计划分解到本月的工作任务有：<br>1.<br>2.<br>3.<br>4.', '本年度的工作任务共计759项，本月进行中项：<br>1.<br>2.<br>3.<br>4.', '本月的工作任务有80项，重点工作有：<br>1.<br>2.<br>3.<br>4.', '本月产生行动项：<br>1.<br>2.<br>3.<br>4.'];
	
	//kpiData是用excel生成的，哈哈哈，看起来很乱，其实一键搞定
	service.kpiData = 
	[{name:"核安全与辐射防护",indicator:[{name:"威胁燃料安全的事件次数",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"统计周期内，发生的潜在影响导致燃料组件完整性和安全受到损害的事件<br>发生1起扣1分，累加计分"},{name:"辐射防护监查未完成次数",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"统计周期内，辐射防护领域监督、监查工作未按计划实施次数<br>发生1起扣0.2分，累加计分"},{name:"严重违反辐射防护管理规定",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"未取得辐射防护授权开展辐射工作；未办理RWP，开展辐射工作；<br>发生1起扣1分，累加计分"},{name:"放射源违规行为",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"包括无许可证进出厂、越点运输、违规存放和使用、违规转借等<br>发生1起扣1分，累加计分"},{name:"辐射防护违规行为",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"统计周期内发生A、B、C 类辐射防护违规行为次数<br>A、B、C类按照发生1 起扣1、0.5、0.2分，累加计分"},]},{name:"生产准备",indicator:[{name:"里程碑验收按计划完成",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"按照最新版本的《生产准备大纲》和《生产准备总体计划》中生产准备里程碑的计划时间为标准，统计该周期内里程碑完成情况。（在每个生产准备里程碑完成后统计）<br>每推迟一个月，扣0.5分，累积计算，最高扣2分。"},{name:"生产准备年度计划完成率",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"以生产准备年度计划作为考核载体，以部门为单位，统计周期内，该部门实际完成任务数量与计划应完成任务数量比值。<br>90%≤N＜95%，扣0.2分<br>80%≤N＜90%，扣0.3分<br>N＜80%，扣0.5分"},{name:"生产技术文件编写完成率",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"在统计时间点，实际完成的生产技术文件编写数量与计划编写的程序总体数量百分比。<br>85%≤N＜90%，扣0.5分<br>80%≤N＜85%，扣1分<br>N＜80%，扣2分"},{name:"生产技术文件验证生效率",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"统计周期内，技术文件实际生效数量与按计划应生效的数量的比值<br>95%≤N＜100%，扣0.2分<br>90%≤N＜95%，扣0.5分<br>N＜90%，扣1分"},]},{name:"生产管理1",indicator:[{name:"首次临界后非计划停堆次数",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"机组首次临界运行后至商运前，在统计区间内，由于设备故障、人因操作失误或其他无法抗拒的意外因素导致反应堆保护系统逻辑动作而引发的非计划停堆次数。该停堆次数包括非计划自动停堆次数和非计划手动停堆次数之和。<br>发生1起扣2分，累加计分"},{name:"1级以上运行事件数量",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"机组首次装料后至商运前，在统计区间内，发生按照国际核事件分级表（INES）标准界定为1级的运行事件（LOE）的数量。<br>发生1起扣2分，累加计分"},{name:"重要SSC缺陷响应及时率",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"统计周期内，已按优先级响应的重要SSC工作数量与重要SSC工作总数的比值，反映计划工程师对重要SSC工作的响应及时率<br>95%≤I＜98%，扣1分<br>90%≤I＜95%，扣2分<br>I＜90%，扣3分"},{name:"重要设备预防性维修超期数",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"统计周期内，重要设备预防性维修超出1/4维护周期的次数<br>I=1，扣1分<br>1＜I≤3，扣2分<br>I＞3，扣3分"},{name:"工作活动风险识别失效次数",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"统计周期内，工作准备过程中，各专业未能有效识别中、高风险工作的次数<br>I=1，扣0.2分<br>1＜I≤3，扣0.5分<br>I＞3，扣1分"},{name:"工作活动风险控制失效次数",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"统计周期内，工作执行过程中，各专业未严格执行中、高风险管理方案措施的次数<br>I=1，扣0.2分<br>1＜I≤3，扣0.5分<br>I＞3，扣1分"},{name:"FME失效次数",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"统计周期内，因现场工作风险评估以及防范措施不到位导致存在潜在的异物进入不应进入的重要敏感构筑物、系统、设备风险的次数以及屏障失效的次数，反映FME管理控制水平<br>I=1，扣0.2分<br>1＜I≤3，扣0.5分<br>I＞3，扣1分"},{name:"预防性维修计划完成率",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"统计周期内，实际完成的预防性维修数量与计划完成的预防性维修数量的比值<br>90%≤N＜95%，扣0.2分<br>85%≤N＜90%，扣0.5分<br>N＜85%，扣1分"},]},{name:"生产管理2",indicator:[{name:"工作文件包退包率",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"统计周期内，因准备质量问题被退回的工作包数量与提交给生产计划部、运行部的工作文件包总数的比值<br>1%＜N≤3%，扣0.2分<br>3%＜N≤5%，扣0.5分<br>N＞5%，扣1分"},{name:"1级工单隔离响应异常数",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"统计周期内，1级工单隔离超过1个小时未响应的数量<br>I=1，扣0.5分<br>1＜I≤3，扣0.7分<br>I＞3，扣1分"},{name:"1级工单准备响应异常数",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"统计周期内，1级工单准备超过1个小时未响应的数量<br>I=1，扣0.2分<br>1＜I≤3，扣0.5分<br>I＞3，扣1分"},{name:"工单计划开工率",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"统计周期内，发布三天滚动计划项目的计划开工数量与计划项目总数量的比值，反映按计划执行能力，控制电站缺陷能力<br>95%≤N＜98%，扣0.2分<br>85%≤N＜95%，扣0.5分<br>N＜85%，扣1分"},{name:"工单计划完工率",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"统计周期内，发布三天滚动计划项目的计划完工数量与计划项目总数量的比值，反映按计划控制工期能力，控制电站缺陷能力。（因维修内容扩大，或PW-PT 后窗口不具备、QC 现场见证不及时除外<br>95%≤N＜98%，扣0.2分<br>85%≤N＜95%，扣0.5分<br>N＜85%，扣1分"},{name:"重复性维修数",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"统计周期内，在规定时间间隔里(100 天内)，因维修质量导致重复性维修次数。（按工单数）<br>I=1，扣0.5分<br>1＜I≤3，扣1分<br>I＞3，扣2分"},{name:"功能再鉴定一次合格率",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"统计周期内，功能再鉴定一次成功的次数与需进行功能再鉴定的工单总数量的比值，反映设备经过维修后可以执行系统功能的能力<br>95%≤I＜97.5%，扣0.2分<br>I＜95%，扣0.5分"},{name:"工作许可证超期数",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"统计周期内，工作许可证到期未完成延期手续的次数<br>I=1，扣0.2分<br>1＜I≤3，扣0.5分<br>I＞3，扣1分"},]},{name:"系统/设备状态",indicator:[{name:"重大设备损坏事件次数",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"生产准备期间设备TOM后，因人因维护或操作失误，或者设备本身设计、安装、调试等原因直接导致的设备损坏，经济损失在5000万元人民币及以上的事故，或者由于设备损坏造成损失等效满功率大于等于7.3天的设备损坏事故。<br>I=1，扣1分<br>1＜I≤3，扣2分<br>I＞3，扣3分"},{name:"机组电源丧失事件次数",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"机组非正常停电事件发生的次数。因电网方面原因导致的不考核<br>I=1，扣1分<br>1＜I≤3，扣2分<br>I＞3，扣3分"},{name:"机组水源丧失事件次数",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"机组非正常停水（含生活水/工业水/消防水/除盐水）事件发生的次数。<br>I=1，扣1分<br>1＜I≤3，扣2分<br>I＞3，扣3分"},{name:"机组气源丧失事件次数",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"机组非正常停气（厂用/仪用压空）事件发生的次数<br>I=1，扣1分<br>1＜I≤3，扣2分<br>I＞3，扣3分"},{name:"机组暖源丧失事件次数",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"机组非正常停暖（考虑厂用/仪用气体）事件发生的次数<br>I=1，扣0.2分<br>1＜I≤3，扣0.5分<br>I＞3，扣1分"},{name:"TOTO设备可靠性水平红灯",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"根据INPO 设备可靠性指标（ERI）总体颜色定义：ERI得分＜60，为红灯；60≤ERI 得分＜89，为黄灯；ERI 得分≥89，为绿灯。ERI 共17项指标，目前有9 项指标可以开展统计。为保证统计指标准确性和有效性，采用ERI得分率来替代ERI 得分作为指标值。<br>根据导致扣分的分项指标由s生产准备部进行分析以确定具体考核责任部门I＜60，扣0.5 分；60≤I＜89，扣0.2 分<br>"},]},{name:"生产采购",indicator:[{name:"采购不及时工作等备件",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"统计周期内，出现需等备件工单，1 个月内未及时提报采购需求计划的工单数（采购需求计划发送至分管领导）；对于紧急工单，如出现等备件情况，24 小时内未发起《紧急物资采购审批单》报公司领导审批的次数或未申请合同待执行的次数<br>I=1，扣0.2分<br>1＜I≤3，扣0.5分<br>I＞3，扣1分"},{name:"紧急备件采购需求数量",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"商运后，因缺少备件而导致工作无法按计划执行，需要提出紧急备件采购的需求的次数<br>1＜I≤3，扣0.5分<br>I＞3，扣1分"},{name:"紧急备件采购到货延误次数",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"商运后，生产部门提出紧急备件采购流程，按照紧急备件采购到货时间规定，因超出规定到货时间，导致工作延误的次数<br>1＜I≤3，扣0.5分<br>I＞3，扣1分"},]},{name:"HSE",indicator:[{name:"突发环境事件发生次数",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"统计周期内，被定为环境突发事件的次数<br>每发生一次，扣3分"},{name:"被地方环保部门处罚的事件",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"统计周期内，被地方环保部门处罚的环境事件次数<br>每发生一次，扣3分"},{name:"公司三废违规排放次数",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"统计周期内，三废违规排放次数<br>每发生一次，扣1分"},{name:"发生职业病病例次数",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"统计周期内，发生职业病病例次数<br>每次扣1分，累加计分"},{name:"厂内生活污水排放达标率",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"统计周期内污水达标次数与本周期应该监测次数的比值为本月生活污水排放达标率<br>95%≤N＜100%，扣0.2分<br>85%≤N＜95%，扣0.5分<br>N＜85%，扣1分"},]},{name:"调试管理",indicator:[{name:"调试H点到场率",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"调试H点实际到场数/H点选取数<br>N＜100%，扣0.5 分"},{name:"调试W点到场率",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"调试W点实际到场数/W点选取数<br>95%≤N，不扣分；<br>90%≤N＜95%，扣0.2分<br>N＜90%，扣0.5分"},{name:"调试程序审查意见返回率",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"由国核联队编制的调试试验程序送达业主进行审查过程中，需要在规定时间内审查完成并返回意见，该指标为统计周期内，业主方已完成审查并返回意见的数量与计划审查数量的比值<br>95%≤N，不扣分；<br>90%≤N＜95%，扣0.2分<br>N＜90%，扣0.5分"},{name:"调试参与中人因失误次数",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"生产人员在示范工程调试参与过程中发生设备误动、误操作，或者因技能不足导致的设备损坏等人因失误发生的次数<br>发生1起扣1分，累加计分"},]},{name:"移交接产",indicator:[{name:"工程尾项处理及时关闭率",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"TOP、BHO移交后工程尾项的及时关闭率（工程尾项指由于上游设计、设备和建安等原因导致的暂未安装完成的项目，移交调试后需按调试需求实施安装处理）<br>90%≤N，不扣分；<br>85%≤N<90%，扣0.2分；<br>75%≤N<85%，扣0.5分；<br>N<75%，扣1分。"},{name:"TOP按计划移交完成率",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"统计周期内，TOP实际完成签字移交数量与计划签字移交数量的比值<br>80%≤N，不扣分；<br>70%≤N＜80%，扣0.2分<br>60%≤N＜70%，扣0.5分<br>50%≤N＜60%，扣1分<br>N＜50%，扣1.5分"},{name:"TOM按计划移交完成率",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"统计周期内，TOM实际完成签字移交数量与计划签字移交数量的比值<br>60%≤I＜75%，扣0.1分<br>I＜60%，扣0.3分"},{name:"TOTO移交按计划完成率",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"每月完成的TOTO移交数/每月计划完成的TOTO移交数<br>60%≤I＜75%，扣0.1分<br>I＜60%，扣0.3分"},{name:"BHO移交按计划完成率",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"根据每月发布的BHO移交计划，统计计划完成情况<br>60%≤I＜75%，扣0.1分<br>I＜60%，扣0.3分"},{name:"遗留项清除率",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"统计周期内，已关闭的联检意见与按计划应关闭的联检意见的比值<br>60%≤I＜80%，扣0.1分<br>I＜60%，扣0.3分"},{name:"联检意见延期率",quantity:0,title:"指标值:0<br>完成进度：请填写进度描述",description:"统计周期内，申请延期的TOM/TOTO/BHO联检意见占本周期内应完成的联检意见总数的比值<br>10%＜I≤20%，扣0.1分<br>I＞20%，扣0.3分"},]},];
	
    //获取多项数据的途径
	service.getGaugeTag = function(){
		return service.gaugeTag;
	};
	service.getDataSrc = function(){
		return service.gaugeDataSrc;
	};
	service.getTitle = function(n){
		return service.title[n];
	};	
	service.getIndicator = function(){
		return service.kpiData;
	};
	
};
	
})()