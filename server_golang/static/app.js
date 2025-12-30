// API基础URL
const API_BASE_URL = '/api';

// 显示Toast通知
function showToast(message, type = 'success') {
    const toastContainer = document.querySelector('.toast-container');
    const toastId = 'toast-' + Date.now();

    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);

    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();

    // 自动移除DOM元素
    toastElement.addEventListener('hidden.bs.toast', function () {
        toastElement.remove();
    });
}

// 初始化加载模态框实例
let loadingModalInstance = null;

// 显示或隐藏加载模态框
function toggleLoading(show = true) {
    return;
    // 只在第一次调用时创建实例
    if (!loadingModalInstance) {
        loadingModalInstance = new bootstrap.Modal(document.getElementById('loadingModal'));
    }
    console.log('Loading:', show, loadingModalInstance);
    if (show) {
        loadingModalInstance.show();
    } else {
        loadingModalInstance.hide();
    }
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// 提交成绩表单
document.getElementById('scoreForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // 获取表单数据
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    try {
        toggleLoading(true);

        const response = await fetch(`${API_BASE_URL}/scores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showToast('成绩添加成功！', 'success');
            this.reset();
        } else {
            showToast('添加失败：' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('网络错误，请稍后重试', 'error');
    } finally {
        console.log('Loading finished.');
        toggleLoading(false);
    }
});

// 查询成绩表单
document.getElementById('queryForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // 获取查询参数
    const name = document.getElementById('queryName').value;
    const subject = document.getElementById('querySubject').value;

    // 构建查询URL
    let url = `${API_BASE_URL}/scores?name=${encodeURIComponent(name)}`;
    if (subject) {
        url += `&subject=${encodeURIComponent(subject)}`;
    }

    try {
        toggleLoading(true);
        console.log('Fetching scores from URL:', url);
        const response = await fetch(url);
        const result = await response.json();

        if (result.success) {
            displayScores(result.data);
            displayScoreChart(result.data);
        } else {
            showToast('查询失败：' + result.message, 'error');
            document.getElementById('scoresContainer').innerHTML = '<div class="col-12"><div class="alert alert-warning">没有找到相关成绩记录</div></div>';
            document.getElementById('chartContainer').style.display = 'none';
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('网络错误，请稍后重试', 'error');
        document.getElementById('scoresContainer').innerHTML = '<div class="col-12"><div class="alert alert-danger">查询出错，请稍后重试</div></div>';
    } finally {
        toggleLoading(false);
    }
});

// 显示成绩卡片
function displayScores(scores) {
    const container = document.getElementById('scoresContainer');

    if (!scores || scores.length === 0) {
        container.innerHTML = '<div class="col-12"><div class="alert alert-warning">没有找到相关成绩记录</div></div>';
        return;
    }

    container.innerHTML = '';
// 需要对scores 排序 按考试时间升序

    scores.sort((a, b) => new Date(a.exam_time) - new Date(b.exam_time));
    scores.forEach(score => {
        // 处理数据，确保score是对象
        const scoreData = typeof score === 'string' ? JSON.parse(score) : score;

        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4 mb-4';

        // 确定成绩等级和对应的颜色
        let scoreLevel = '';
        let scoreColor = '';
        const scoreValue = parseFloat(scoreData.score);
        const maxScore = parseFloat(scoreData.maxScore || 100);
        const percentage = (scoreValue / maxScore) * 100;

        if (percentage >= 90) {
            scoreLevel = '优秀';
            scoreColor = 'success';
        } else if (percentage >= 80) {
            scoreLevel = '良好';
            scoreColor = 'info';
        } else if (percentage >= 70) {
            scoreLevel = '中等';
            scoreColor = 'primary';
        } else if (percentage >= 60) {
            scoreLevel = '及格';
            scoreColor = 'warning';
        } else {
            scoreLevel = '不及格';
            scoreColor = 'danger';
        }

        card.innerHTML = `
            <div class="card score-card h-100">
                <div class="card-header bg-${scoreColor} text-white d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">${scoreData.subject}</h5>
                    <span class="badge bg-light text-dark">${scoreLevel}</span>
                </div>
                <div class="card-body">
                    <h4 class="card-title">${scoreData.score} ${scoreData.maxScore ? '/ ' + scoreData.maxScore : ''}</h4>
                    <p class="card-text">
                        <strong>姓名：</strong>${scoreData.name}<br>
                        <strong>考试日期：</strong>${formatDate(scoreData.exam_time)}<br>
                        ${scoreData.rank ? `<strong>排名：</strong>${scoreData.rank}<br>` : ''}
                        ${scoreData.avgScore ? `<strong>平均分：</strong>${scoreData.avgScore}<br>` : ''}
                        ${scoreData.highScore ? `<strong>最高分：</strong>${scoreData.highScore}<br>` : ''}
                        ${scoreData.examContent ? `<strong>考试内容：</strong>${scoreData.examContent}` : ''}
                    </p>
                </div>
                <div class="card-footer text-muted">
                    <small>成绩记录时间：${new Date().toLocaleString('zh-CN')}</small>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

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
        
        colorIndex++;
    }
    
    // 初始化图表
    const chartInstance = echarts.init(scoreChartElement);
    
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
            left: '3%',
            right: '4%',
            bottom: '15%',
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
    
    // 响应式调整
    window.addEventListener('resize', function() {
        chartInstance.resize();
    });
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    // 设置今天的日期为默认考试日期
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('exam_time').value = today;

    // 添加输入验证
    document.getElementById('score').addEventListener('input', function() {
        // 确保输入的是数字
        this.value = this.value.replace(/[^0-9.]/g, '');
    });

    document.getElementById('maxScore').addEventListener('input', function() {
        // 确保输入的是数字
        this.value = this.value.replace(/[^0-9.]/g, '');
    });

    document.getElementById('avgScore').addEventListener('input', function() {
        // 确保输入的是数字
        this.value = this.value.replace(/[^0-9.]/g, '');
    });

    document.getElementById('highScore').addEventListener('input', function() {
        // 确保输入的是数字
        this.value = this.value.replace(/[^0-9.]/g, '');
    });

    document.getElementById('rank').addEventListener('input', function() {
        // 确保输入的是数字
        this.value = this.value.replace(/[^0-9]/g, '');
    });
});
