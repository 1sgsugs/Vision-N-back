class VisualNBack {
    constructor() {
        // 初始化DOM元素
        this.startButton = document.getElementById('start-button');
        this.stopButton = document.getElementById('stop-button');
        this.sameButton = document.getElementById('same-button');
        this.differentButton = document.getElementById('different-button');
        this.stimulusElement = document.getElementById('stimulus');
        this.statusElement = document.getElementById('status');
        this.nValueSelect = document.getElementById('n-value');
        this.nValueDisplay1 = document.getElementById('n-value-display-1');
        this.nValueDisplay2 = document.getElementById('n-value-display-2');
        this.nValueDisplay3 = document.getElementById('n-value-display-3');
        this.exportButton = document.getElementById('export-button');
        this.exportButton.addEventListener('click', () => this.exportData());
        this.exportButton.disabled = true;

        // 任务参数
        this.nValue = 1;
        this.stimulusDuration = 1000; // 刺激呈现时间(ms) - 字母显示1秒
        this.intervalDuration = 2000; // 刺激间隔时间(ms) - 字母切换间隔2秒
        // 将刺激类型改为大写字母
        this.stimulusTypes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];


        // 状态变量
        this.isRunning = false;
        this.currentTrial = 0;
        this.stimulusHistory = [];
        this.timerId = null;
        this.trialData = [];
        this.responseTimes = [];

        // 绑定事件监听器 - 同时支持点击和触摸事件
        const bindEvents = (element, handler) => {
            // 仅保留click事件以防止滑动误触
            element.addEventListener('click', handler);
        };

        bindEvents(this.startButton, () => this.startTask());
        bindEvents(this.stopButton, () => this.stopTask());
        bindEvents(this.sameButton, () => this.response(true));
        bindEvents(this.differentButton, () => this.response(false));
        this.nValueSelect.addEventListener('change', () => this.updateNValue());
        // 初始化N值显示
        this.updateNValue();


    }

    updateNValue() {
        this.nValue = parseInt(this.nValueSelect.value);
        // 同时更新所有n值显示元素
        this.nValueDisplay1.textContent = this.nValue;
        this.nValueDisplay2.textContent = this.nValue;
        this.nValueDisplay3.textContent = this.nValue;
    }

    startTask() {
        this.updateNValue();

        // 新任务 - 确保清除之前的数据
        this.currentTrial = 0;
        this.stimulusHistory = [];
        this.trialData = [];  // 清空之前的任务数据
        this.responseTimes = [];  // 清空之前的反应时间数据
        this.isRunning = true;

        // 更新界面状态
        this.statusElement.textContent = '任务即将开始，请集中注意力...';
        this.startButton.disabled = true;
        this.stopButton.disabled = false;
        this.sameButton.disabled = true;
        this.differentButton.disabled = true;
        this.exportButton.disabled = true;

        // 延迟2秒后开始呈现刺激
        setTimeout(() => this.presentStimulus(), 2000);
    }

    generateStimulus() {
        // 生成刺激，如果是第n个及以后的刺激，有50%概率与n-back位置的刺激相同
        if (this.stimulusHistory.length >= this.nValue && Math.random() < 0.5) {
            return this.stimulusHistory[this.stimulusHistory.length - this.nValue];
        } else {
            return this.stimulusTypes[Math.floor(Math.random() * this.stimulusTypes.length)];
        }
    }

    presentStimulus() {
        if (!this.isRunning) return;

        this.currentTrial++;

        // 生成并呈现刺激
        const stimulus = this.generateStimulus();
        this.stimulusHistory.push(stimulus);
        
        // 改进刺激显示方式，确保在移动设备上清晰可见
        this.stimulusElement.textContent = stimulus; // 显示字母刺激
        this.stimulusElement.style.color = '#333333'; // 设置深灰色文字确保可读性
        this.stimulusElement.style.fontSize = '120px'; // 确保在移动设备上足够大
        this.stimulusElement.style.textShadow = '2px 2px 4px rgba(0,0,0,0.3)'; // 增加文字阴影提高可读性

        // 添加动画效果增强视觉反馈
        this.stimulusElement.style.transition = 'all 0.3s ease';
        this.stimulusElement.style.transform = 'scale(0.9)';
        setTimeout(() => {
            this.stimulusElement.style.transform = 'scale(1)';
        }, 50);
        
        // 记录试次数据
        this.trialData.push({
            trial: this.currentTrial,
            stimulus: stimulus,
            presentationTime: Date.now()
        });

        // 更新状态显示
        let targetStatus = '';
        if (this.stimulusHistory.length > this.nValue) {
            targetStatus = (stimulus === this.stimulusHistory[this.stimulusHistory.length - 1 - this.nValue]) ? '(目标刺激!)' : '';
            this.sameButton.disabled = false;
            this.differentButton.disabled = false;
        } else {
            targetStatus = `(前${this.nValue}个刺激不计分)`;
            this.sameButton.disabled = true;
            this.differentButton.disabled = true;
        }

        this.statusElement.textContent = `任务进行中 (试次: ${this.currentTrial})\n当前刺激: ${stimulus} ${targetStatus}`;
        
        // 设置定时器1秒后清除当前刺激
        this.timerId = setTimeout(() => {
            this.stimulusElement.textContent = '';
            // 再等待2秒后呈现下一个刺激
            this.timerId = setTimeout(() => this.presentNextStimulus(), this.intervalDuration);
        }, this.stimulusDuration);

    }

    presentNextStimulus() {
        if (!this.isRunning) return;

        // 清除当前刺激
        this.stimulusElement.textContent = '';
        
        // 禁用响应按钮，等待下一个刺激呈现
        this.sameButton.disabled = true;
        this.differentButton.disabled = true;
        
        // 立即呈现下一个刺激
        this.presentStimulus();
    }

    response(isMatch) {
        if (!this.isRunning || this.stimulusHistory.length <= this.nValue) {
            return;
        }

        // 检查是否已经为当前试次记录了响应
        const currentTrialData = this.trialData[this.trialData.length - 1];
        if (currentTrialData.response !== undefined) {
            return; // 已经记录了响应，不再处理
        }

        const responseTime = Date.now() - currentTrialData.presentationTime;
        this.responseTimes.push(responseTime);

        const actualMatch = (this.stimulusHistory[this.stimulusHistory.length - 1] === 
                             this.stimulusHistory[this.stimulusHistory.length - 1 - this.nValue]);

        const isCorrect = (isMatch === actualMatch);

        // 记录响应结果到trialData
        currentTrialData.response = isMatch ? '相同' : '不同';
        currentTrialData.actualMatch = actualMatch;
        currentTrialData.isCorrect = isCorrect;

        // 显示简单反馈
        const feedback = isCorrect ? '正确!' : '错误!';
        this.statusElement.textContent = `${feedback} (试次: ${this.currentTrial})`;
    }

    stopTask() {
        if (!this.isRunning) return;

        this.isRunning = false;
        clearTimeout(this.timerId);

        this.statusElement.textContent = `任务已终止 (完成试次: ${this.currentTrial})` +
                                        '\n点击"导出数据"按钮保存绩效数据，或点击"开始"按钮重新开始任务。';
        this.stimulusElement.textContent = '';
        this.startButton.disabled = false;
        this.stopButton.disabled = true;
        this.sameButton.disabled = true;
        this.differentButton.disabled = true;
        this.exportButton.disabled = false;
    }

    exportData() {
        if (this.trialData.length === 0) {
            alert('没有可导出的数据，请先完成至少一次任务。');
            return;
        }

        // 准备导出数据
        const validResponses = this.trialData.filter(trial => trial.isCorrect !== undefined);
        const correctResponses = validResponses.filter(trial => trial.isCorrect).length;
        const accuracy = validResponses.length > 0 ? (correctResponses / validResponses.length * 100).toFixed(2) : '0.00';
        const avgResponseTime = this.responseTimes.length > 0 ? 
            (this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length).toFixed(1) : '0.0';

        // 试次级数据
        const trialLevelData = this.trialData.map((trial, index) => {
            const responseTime = this.responseTimes[index] || null;
            return {
                试次: trial.trial,
                刺激: trial.stimulus,
                n_back刺激: trial.trial > this.nValue ? this.stimulusHistory[trial.trial - 1 - this.nValue] : '无',
                呈现时间: new Date(trial.presentationTime).toISOString(),
                实际是否匹配: trial.actualMatch !== undefined ? (trial.actualMatch ? '是' : '否') : '无',
                用户响应: trial.response || '未响应',
                是否正确: trial.isCorrect !== undefined ? (trial.isCorrect ? '正确' : '错误') : '无',
                反应时间: responseTime ? `${responseTime}ms` : '未响应'
            };
        });

        // 汇总数据
        const summaryData = [{
            任务ID: `task_${new Date().getTime()}`,
            开始时间: this.trialData.length > 0 ? new Date(this.trialData[0].presentationTime).toISOString() : '无',
            结束时间: this.trialData.length > 0 ? new Date(this.trialData[this.trialData.length - 1].presentationTime).toISOString() : '无',
            总试次数: this.trialData.length,
            有效响应数: validResponses.length,
            正确响应数: correctResponses,
            准确率: `${accuracy}%`,
            平均反应时间: `${avgResponseTime}ms`,
            n值: this.nValue
        }];

        // 合并汇总数据和试次数据
        const performanceData = [...summaryData, ...trialLevelData];

        // 转换为CSV
        const headers = Object.keys(performanceData[0]).join(',');
        const rows = performanceData.map(row => Object.values(row).join(',')).join('\n');
        const csvContent = `${headers}\n${rows}`;

        // 创建下载链接
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `performance_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// 当页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    const nbackApp = new VisualNBack();
});