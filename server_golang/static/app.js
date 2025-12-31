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

// 显示成绩表格
function displayScores(scores) {
    const container = document.getElementById('scoresContainer');

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

// 详情格式化函数
function detailFormatter(index, row) {
    return [
        `<div class="container">
            <div class="row">
                <div class="col-md-6">
                    <p><strong>姓名：</strong>${row.name}</p>
                    <p><strong>科目：</strong>${row.subject}</p>
                    <p><strong>分数：</strong>${row.score} / ${row.maxScore}</p>
                    <p><strong>等级：</strong>${row.level}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>考试日期：</strong>${row.exam_time}</p>
                    <p><strong>排名：</strong>${row.rank}</p>
                    <p><strong>平均分：</strong>${row.avgScore}</p>
                    <p><strong>最高分：</strong>${row.highScore}</p>
                </div>
            </div>
            ${row.examContent !== '-' ? `<div class="row"><div class="col-12"><p><strong>考试内容：</strong>${row.examContent}</p></div></div>` : ''}
        </div>`
    ].join('');
}

// displayScoreChart 函数已移至 scoreChart.js 文件

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
