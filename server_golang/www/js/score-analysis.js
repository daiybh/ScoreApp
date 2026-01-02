// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// 学生成绩分析类
class ScoreAnalysis {
    constructor(chartsContainer, data) {
        this.chartsContainer = chartsContainer;
        this.data = data;
        this.initCharts();
        this.bindEvents();
    }

    createDiv(idName) {
        const div = document.createElement('div');
        div.id = idName;
        div.className = 'chart-box';
        this.chartsContainer.appendChild(div);
        return div;
    }
    // 初始化图表
    initCharts() {
        let scoreTrendChartDiv = this.createDiv('scoreTrendChart');
        let comparisonChartDiv = this.createDiv('comparisonChart');
        let rankChangeChartDiv = this.createDiv('rankChangeChart');


        this.scoreTrendChart = echarts.init(scoreTrendChartDiv);
        this.comparisonChart = echarts.init(comparisonChartDiv);
        this.rankChangeChart = echarts.init(rankChangeChartDiv);
    }

    // 绑定事件
    bindEvents() {
        // 监听窗口大小变化，调整图表大小
        window.addEventListener('resize', () => {
            this.scoreTrendChart.resize();
            this.comparisonChart.resize();
            this.rankChangeChart.resize();
        });
    }

    // 处理成绩趋势数据
    processScoreTrendData() {
        const subjectData = {};

        this.data.forEach(item => {
            if (!subjectData[item.subject]) {
                subjectData[item.subject] = [];
            }

            subjectData[item.subject].push({
                exam_time: item.exam_time,
                score: item.score / item.maxScore * 100, // 标准化到百分制
                highScore: item.highScore,
                avgScore: item.avgScore
            });
        });

        // 按时间排序
        Object.keys(subjectData).forEach(subject => {
            subjectData[subject].sort((a, b) => new Date(a.exam_time) - new Date(b.exam_time));
        });

        return subjectData;
    }

    // 绘制成绩趋势图
    drawScoreTrendChart() {
        const processedData = this.processScoreTrendData();

        const series = [];
        const subjects = Object.keys(processedData);
        let colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272'];
        let index = 0;
        let examDates = [];

        subjects.forEach(subject => {
            const subjectItems = processedData[subject];

            const examDates1 = subjectItems.map(item => item.exam_time);
            examDates = examDates.concat(examDates1);

            series.push({
                name: `${subject}`,
                type: 'line',
                data: subjectItems.map(item => [item.exam_time, item.score]),
                smooth: true,
                symbolSize: 8,
                markPoint: {
                    data: [
                        { type: 'max', name: '最高分' },
                        { type: 'min', name: '最低分' }
                    ]
                },
                markLine: {
                    data: [
                        { type: 'average', name: '平均分' }
                    ]
                },
                lineStyle: {
                    width: 3
                },
                itemStyle: {
                    color: colors[index]
                }
            });
            index++;
        });

        // 去重并排序考试日期
        examDates = Array.from(new Set(examDates)).sort((a, b) => new Date(a) - new Date(b));

        const option = {
            title: {
                text: '成绩趋势',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                formatter: params => {
                    let result = params[0].axisValue + '<br/>';
                    params.forEach(param => {
                        result += param.seriesName + ': ' + param.value[1] + '<br/>';
                    });
                    return result;
                }
            },
            legend: {
                data: series.map(s => s.name),
                top: 30,
                type: 'scroll' // 如果图例过多，启用滚动
            },
            xAxis: {
                type: 'category',
                name: '时间',
                data: examDates,
                axisLabel: {
                    rotate: 45
                }
            },
            yAxis: {
                type: 'value',
                name: '分数',
                min: 0,
                max: 100
            },
            series: series
        };

        this.scoreTrendChart.setOption(option);
    }

    // 绘制对比分析图
    drawComparisonChart() {
        const processedData = this.processScoreTrendData();

        // 准备对比数据（最新成绩）
        const latestScores = {};
        const avgScores = {};

        Object.keys(processedData).forEach(subject => {
            const subjectData = processedData[subject];
            const latest = subjectData[subjectData.length - 1];

            // 找到该科目最新时间的平均分和最高分
            const latestData = this.data.filter(item =>
                item.subject === subject && item.exam_time === latest.exam_time
            )[0];

            latestScores[subject] = latest.score;
            avgScores[subject] = latestData ? latestData.avgScore : 0;
        });

        const subjects = Object.keys(latestScores);
        const myScores = subjects.map(subject => latestScores[subject]);
        const avgScoresArr = subjects.map(subject => avgScores[subject]);

        const option = {
            title: {
                text: '成绩对比分析',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: ['我的成绩', '平均分'],
                top: 30
            },
            xAxis: {
                type: 'category',
                data: subjects,
                name: '科目'
            },
            yAxis: {
                type: 'value',
                name: '分数',
                min: 0,
                max: 100
            },
            series: [
                {
                    name: '我的成绩',
                    type: 'bar',
                    data: myScores,
                    itemStyle: {
                        color: '#5470c6'
                    }
                },
                {
                    name: '平均分',
                    type: 'bar',
                    data: avgScoresArr,
                    itemStyle: {
                        color: '#91cc75'
                    }
                }
            ]
        };

        this.comparisonChart.setOption(option);
    }

    // 处理排名变化数据
    processRankChangeData() {
        const subjectData = {};

        this.data.forEach(item => {
            if (!subjectData[item.subject]) {
                subjectData[item.subject] = [];
            }

            subjectData[item.subject].push({
                exam_time: item.exam_time,
                rank: item.rank
            });
        });

        // 按时间排序
        Object.keys(subjectData).forEach(subject => {
            subjectData[subject].sort((a, b) => new Date(a.exam_time) - new Date(b.exam_time));
        });

        return subjectData;
    }

    // 绘制排名变化图
    drawRankChangeChart() {
        const processedData = this.processRankChangeData();

        const series = [];
        const subjects = Object.keys(processedData);

        subjects.forEach(subject => {
            series.push({
                name: subject,
                type: 'line',
                data: processedData[subject].map(item => [item.exam_time, item.rank]),
                smooth: true,
                symbolSize: 8,
                lineStyle: {
                    width: 3
                },
                // 排名越低越好，所以翻转Y轴方向
                itemStyle: {
                    color: '#ee6666'
                }
            });
        });

        const option = {
            title: {
                text: '排名变化',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                formatter: params => {
                    let result = params[0].axisValue + '<br/>';
                    params.forEach(param => {
                        result += param.seriesName + ': 第' + param.value[1] + '名<br/>';
                    });
                    return result;
                }
            },
            legend: {
                data: subjects,
                top: 30
            },
            xAxis: {
                type: 'time',
                name: '时间'
            },
            yAxis: {
                type: 'value',
                name: '排名',
                inverse: true, // 排名越小越好，所以翻转
                min: 0
            },
            series: series
        };

        this.rankChangeChart.setOption(option);
    }

    // 更新数据
    updateData(newData) {
        this.data = newData;
        this.drawAllCharts();
    }
    drawTable(scores) {
        const container = document.getElementById('scoresTable-container');

        if (!scores || scores.length === 0) {
            container.innerHTML = '<div class="alert alert-warning">没有找到相关成绩记录</div>';
            return;
        }

        // 对scores排序，按考试时间升序
        scores.sort((a, b) => new Date(a.exam_time) - new Date(b.exam_time));
        // 处理数据，确保score是对象
        const processedScores = scores.map(score => {
            const scoreData = typeof score === 'string' ? JSON.parse(score) : score;

            // 确定成绩等级和对应的颜色
            let scoreLevel = '';
            let badgeClass = '';
            const scoreValue = parseFloat(scoreData.score);
            const maxScore = parseFloat(scoreData.maxScore || 100);
            const percentage = (scoreValue / maxScore) * 100;

            if (percentage >= 90) {
                scoreLevel = '优秀';
                badgeClass = 'bg-success';
            } else if (percentage >= 80) {
                scoreLevel = '良好';
                badgeClass = 'bg-info';
            } else if (percentage >= 70) {
                scoreLevel = '中等';
                badgeClass = 'bg-primary';
            } else if (percentage >= 60) {
                scoreLevel = '及格';
                badgeClass = 'bg-warning';
            } else {
                scoreLevel = '不及格';
                badgeClass = 'bg-danger';
            }

            // 返回处理后的数据
            return {
                name: scoreData.name,
                subject: scoreData.subject,
                score: scoreData.score,
                maxScore: scoreData.maxScore || '100',
                level: `<span class="badge ${badgeClass}">${scoreLevel}</span>`,
                exam_time: formatDate(scoreData.exam_time),
                rank: scoreData.rank || '-',
                avgScore: scoreData.avgScore || '-',
                highScore: scoreData.highScore || '-',
                examContent: scoreData.examContent || '-'
            };
        });

        // 创建bootstrap-table表格
        container.innerHTML = `
        <table id="scoreTable" 
               data-toggle="table" 
               data-search="true"
               data-show-refresh="true"
               data-show-toggle="true"
               data-show-fullscreen="true"
               data-show-columns="true"
               data-show-columns-toggle-all="true"
               data-detail-view="true"
               data-detail-formatter="detailFormatter"
               data-pagination="true"
               data-page-size="10"
               data-page-list="[10, 25, 50, 100, all]"
               data-show-extended-pagination="true"
               data-sort-name="exam_time"
               data-sort-order="asc">
            <thead>
                <tr>
                    <th data-field="name" data-sortable="true">姓名</th>
                    <th data-field="subject" data-sortable="true">科目</th>
                    <th data-field="score" data-sortable="true">分数</th>
                    <th data-field="maxScore" data-sortable="true">满分</th>
                    <th data-field="level" data-sortable="false">等级</th>
                    <th data-field="exam_time" data-sortable="true">考试日期</th>
                    <th data-field="rank" data-sortable="true">排名</th>
                    <th data-field="avgScore" data-sortable="true">平均分</th>
                    <th data-field="highScore" data-sortable="true">最高分</th>
                    <th data-field="examContent" data-sortable="false">考试内容</th>
                </tr>
            </thead>
        </table>
        <div class="alert alert-info mt-3">
            <small>成绩记录时间：${new Date().toLocaleString('zh-CN')}</small>
        </div>
    `;

        // 初始化bootstrap-table并加载数据
        $('#scoreTable').bootstrapTable({
            data: processedScores
        });
    }

    // 绘制所有图表
    drawAllCharts() {
        this.drawTable(this.data);
        this.drawScoreTrendChart();
        this.drawComparisonChart();
        this.drawRankChangeChart();
    }

    // 模拟从API获取数据的函数
    async fetchScoreData() {
        // 这里是模拟从API获取数据的过程
        // 在实际应用中，这里应该是真正的API调用
        try {
            // const response = await fetch('/api/scores');
            // const data = await response.json();
            // return data;

            // 暂时返回测试数据
            return this.data;
        } catch (error) {
            console.error('获取数据失败:', error);
            return this.data; // 返回当前数据作为备选
        }
    }

    // 更新图表
    async updateCharts() {
        // 获取最新数据
        const newData = await this.fetchScoreData();

        // 更新内部数据
        this.updateData(newData);
    }
}
