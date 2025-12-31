// 显示成绩趋势图
function displayScoreChart(scores) {
    const chartContainer = document.getElementById('chartContainer');

    if (!scores || scores.length === 0) {
        chartContainer.style.display = 'none';
        return;
    }

    // 清空容器内容
    chartContainer.innerHTML = '';

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

    // 设置容器为列表样式
    chartContainer.className = 'list-group';

    // 为每个科目创建单独的图表
    for (const subject in subjectGroups) {
        createSubjectChart(subject, subjectGroups[subject], chartContainer);
    }

    // 显示图表容器
    chartContainer.style.display = 'block';
}

// 为单个科目创建图表
function createSubjectChart(subject, subjectScores, container) {
    // 创建图表列表项
    const chartItem = document.createElement('div');
    chartItem.className = 'list-group-item';

    // 创建标题
    const title = document.createElement('h5');
    title.className = 'mb-3';
    title.textContent = `${subject}成绩趋势`;
    chartItem.appendChild(title);

    // 创建图表元素
    const chartElement = document.createElement('div');
    chartElement.className = 'subject-chart';
    chartElement.style.width = '100%';
    chartElement.style.height = '300px';

    // 组装列表项
    chartItem.appendChild(chartElement);
    container.appendChild(chartItem);

    // 按时间排序
    subjectScores.sort((a, b) => new Date(a.exam_time) - new Date(b.exam_time));

    // 准备数据点，格式为 [时间戳, 成绩]
    const subjectData = subjectScores.map(score => {
        const dateObj = new Date(score.exam_time);
        return [dateObj.getTime(), parseFloat(score.score)];
    });

    // 初始化图表
    const chartInstance = echarts.init(chartElement);

    // 配置图表选项
    const option = {
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                if (!params || params.length === 0) return '';

                const date = new Date(params[0].axisValue);
                return `<div><strong>${date.toLocaleDateString('zh-CN')}</strong><br/>
                        ${subject}: ${params[0].value[1]}</div>`;
            }
        },
        grid: {
            left: '5%',
            right: '5%',
            bottom: '15%',
            top: '10%',
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
            }
        },
        yAxis: {
            type: 'value',
            name: '分数',
            min: function(value) {
                return Math.floor(value.min / 10) * 10 - 10; // 向下取整到最近的10，再减10
            },
            max: function(value) {
                return Math.ceil(value.max / 10) * 10 + 10; // 向上取整到最近的10，再加10
            }
        },
        series: [{
            name: subject,
            type: 'line',
            data: subjectData,
            smooth: true,
            lineStyle: {
                width: 3
            },
            itemStyle: {
                color: '#1890ff',
                borderWidth: 2
            },
            markPoint: {
                data: [
                    {type: 'max', name: '最高分'},
                    {type: 'min', name: '最低分'}
                ]
            },
            markLine: {
                data: [{type: 'average', name: '平均分'}]
            },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {offset: 0, color: 'rgba(24, 144, 255, 0.5)'},
                    {offset: 1, color: 'rgba(24, 144, 255, 0.1)'}
                ])
            }
        }]
    };

    // 设置图表配置项
    chartInstance.setOption(option);

    // 响应式调整
    window.addEventListener('resize', function() {
        chartInstance.resize();
    });

    // 初始调整大小
    setTimeout(() => {
        chartInstance.resize();
    }, 100);
}
