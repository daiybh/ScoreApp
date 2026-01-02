// 显示成绩趋势图
function displayScoreChart(scores) {
    const chartContainer = document.getElementById('chartContainer');
    const scoreChartElement = document.getElementById('scoreChart');

    if (!scores || scores.length === 0) {
        chartContainer.style.display = 'none';
        return;
    }

    // 按时间排序
    const sortedScores = [...scores].sort((a, b) => new Date(a.exam_time) - new Date(b.exam_time));

    // 按科目分组
    const subjectGroups = {};
    sortedScores.forEach(score => {
        const subject = score.subject;
        if (!subjectGroups[subject]) {
            subjectGroups[subject] = [];
        }
        subjectGroups[subject].push(score);
    });

    // 为每个科目创建一个系列
    const series = [];
    const colors = ['#1890ff', '#2fc25b', '#facc14', '#223273', '#8543e0', '#13c2c2', '#fa8c16', '#f5222d'];
    let colorIndex = 0;

    // 收集所有日期用于X轴
    const allDates = new Set();

    for (const subject in subjectGroups) {
        const subjectScores = subjectGroups[subject];
        // 按时间排序
        subjectScores.sort((a, b) => new Date(a.exam_time) - new Date(b.exam_time));

        // 准备该科目的数据点，格式为 [时间戳, 成绩]
        const subjectData = subjectScores.map(score => {
            const dateObj = new Date(score.exam_time);
            allDates.add(dateObj.getTime()); // 收集所有日期的时间戳
            return [dateObj.getTime(), parseFloat(score.score)];
        });

        series.push({
            name: subject,
            type: 'line',
            data: subjectData,
            lineStyle: {
                width: 2
            },
            itemStyle: {
                color: colors[colorIndex % colors.length]
            },
            markPoint: {
                data: [
                    {type: 'max', name: '最高分'},
                    {type: 'min', name: '最低分'}
                ]
            }
        });
break;
        colorIndex++;
    }

    // 初始化图表，设置尺寸
    const chartInstance = echarts.init(scoreChartElement, null, {
        width: 'auto',
        height: 400
    });

    // 配置图表选项
    const option = {
        title: {
            text: '成绩趋势',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                if (!params || params.length === 0) return '';

                const date = new Date(params[0].axisValue);
                let result = `<div><strong>${date.toLocaleDateString('zh-CN')}</strong></div>`;

                params.forEach(param => {
                    if (param.value && param.value[1] !== null) {
                        result += `<div>${param.marker}${param.seriesName}: ${param.value[1]}</div>`;
                    }
                });
                return result;
            }
        },
        legend: {
            data: Object.keys(subjectGroups),
            top: 30
        },
        grid: {
            left: '5%',
            right: '5%',
            bottom: '20%',
            top: '15%',
            containLabel: true
        },
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'time',
            boundaryGap: false,
            axisLabel: {
                formatter: function(value) {
                    const date = new Date(value);
                    return date.toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                },
                rotate: 45
            },
            min: function(value) {
                return value.min - 86400000; // 减去一天，确保第一个点可见
            },
            max: function(value) {
                return value.max + 86400000; // 加上一天，确保最后一个点可见
            }
        },
        yAxis: {
            type: 'value',
            name: '分数'
        },
        series: series
    };

    // 设置图表配置项
    chartInstance.setOption(option);

    // 显示图表容器
    chartContainer.style.display = 'block';

    // 确保图表容器有足够的宽度
    scoreChartElement.style.width = '100%';

    // 响应式调整
    window.addEventListener('resize', function() {
        chartInstance.resize();
    });

    // 初始调整大小
    setTimeout(() => {
        chartInstance.resize();
    }, 100);
}
