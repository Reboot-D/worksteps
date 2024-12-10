// 示例数据
const progressData = {
    'yuewen-1': '完成',
    'yuewen-2': '进行中',
    'yuewen-3': '待推动',
    'yuewen-4': '',
    'yuewen-5': '',
    'yuewen-6': '',
    'yuewen-7': '',
    'yuewen-8': '',
    'huya-1': '',
    'huya-2': '',
    'huya-3': '',
    'huya-4': '',
    'huya-5': '',
    'huya-6': '',
    'huya-7': '',
    'huya-8': '',
    'tme-1': '',
    'tme-2': '',
    'tme-3': '',
    'tme-4': '',
    'tme-5': '',
    'tme-6': '',
    'tme-7': '',
    'tme-8': '',
    'ecom-1': '',
    'ecom-2': '',
    'ecom-3': '',
    'ecom-4': '',
    'ecom-5': '',
    'ecom-6': '',
    'ecom-7': '',
    'ecom-8': '',
    'game-1': '',
    'game-2': '',
    'game-3': '',
    'game-4': '',
    'game-5': '',
    'game-6': '',
    'game-7': '',
    'game-8': '',
    notes: {
        'game-note': '',
        'ecom-note': '',
        'huya-note': '',
        'tme-note': '',
        'yuewen-note': ''
    }
};

// 更新状态选择器的HTML
function createStatusSelector(id, currentStatus) {
    return `
        <div class="status-selector" data-id="${id}">
            <button class="status-btn ${getStatusClass(currentStatus)}">
                ${currentStatus || '待推动'}
            </button>
            <div class="status-options">
                <div class="status-option status-completed" data-status="完成">完成</div>
                <div class="status-option status-in-progress" data-status="进行中">进行中</div>
                <div class="status-option status-pending" data-status="待推动">待推动</div>
            </div>
        </div>
    `;
}

// 获取状态对应的类名
function getStatusClass(status) {
    switch(status) {
        case '完成':
            return 'status-completed';
        case '进行中':
            return 'status-in-progress';
        default:
            return 'status-pending';
    }
}

// 更新进度函数
function updateProgress() {
    for (const [id, status] of Object.entries(progressData)) {
        const cell = document.getElementById(id);
        if (cell) {
            cell.innerHTML = createStatusSelector(id, status);
        }
    }
}

// 保存进度数据到 localStorage
function saveProgressData() {
    localStorage.setItem('progressData', JSON.stringify(progressData));
    showSaveNotification();
}

// 从 localStorage 加载进度数据
function loadProgressData() {
    const savedData = localStorage.getItem('progressData');
    if (savedData) {
        Object.assign(progressData, JSON.parse(savedData));
        updateProgress();
    }
}

// 显示保存成功提示
function showSaveNotification(type = '进度') {
    const notification = document.createElement('div');
    notification.className = 'save-notification';
    notification.innerHTML = `
        <span>✓</span>
        <span>${type}已保存</span>
    `;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 修改 DOMContentLoaded 事件监听器
document.addEventListener('DOMContentLoaded', function() {
    // 加载保存的进度数据
    loadProgressData();
    
    // 更新进度显示
    updateProgress();

    // 添加保存按钮事件监听
    const saveButton = document.getElementById('saveProgress');
    if (saveButton) {
        saveButton.addEventListener('click', saveProgressData);
    }

    // 委托事件处理
    document.addEventListener('click', function(e) {
        // 处理状态选择器的点击
        if (e.target.classList.contains('status-btn')) {
            const selector = e.target.closest('.status-selector');
            // 关闭其他打开的选择器
            document.querySelectorAll('.status-selector.active').forEach(el => {
                if (el !== selector) el.classList.remove('active');
            });
            selector.classList.toggle('active');
        }
        // 处理选项的点击
        else if (e.target.classList.contains('status-option')) {
            const selector = e.target.closest('.status-selector');
            const btn = selector.querySelector('.status-btn');
            const id = selector.dataset.id;
            const status = e.target.dataset.status;
            
            // 更新按钮状态
            btn.textContent = status;
            btn.className = `status-btn ${getStatusClass(status)}`;
            
            // 更新数据
            progressData[id] = status;
            
            // 关闭选项菜单
            selector.classList.remove('active');
        }
    });

    // 点击外部关闭选择器
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.status-selector')) {
            document.querySelectorAll('.status-selector.active').forEach(el => {
                el.classList.remove('active');
            });
        }
    });

    // 加载备注
    loadNotes();
    
    // 添加备注输入框事件监听
    document.querySelectorAll('.note-input').forEach(textarea => {
        // 自动调整高度
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
        
        // 添加编辑状态样式
        textarea.addEventListener('focus', function() {
            this.classList.add('editing');
        });
        
        textarea.addEventListener('blur', function() {
            this.classList.remove('editing');
            saveNotes(); // 失去焦点时保存备注
        });
        
        // 按下 Ctrl+Enter 保存
        textarea.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'Enter') {
                this.blur();
            }
        });
    });
});

// 添加以下代码
document.addEventListener('DOMContentLoaded', function() {
    // 防止详情框超出视窗
    const milestoneCards = document.querySelectorAll('.milestone-card');
    
    milestoneCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const details = this.querySelector('.milestone-details');
            const rect = details.getBoundingClientRect();
            
            if (rect.right > window.innerWidth) {
                details.style.left = 'auto';
                details.style.right = '0';
            }
            
            if (rect.bottom > window.innerHeight) {
                details.style.maxHeight = `${window.innerHeight - rect.top - 20}px`;
            }
        });
    });
});

// 修改状态更新逻辑，在状态改变时启用保存按钮
function updateStatusAndEnableSave(id, status) {
    progressData[id] = status;
    const saveButton = document.getElementById('saveProgress');
    if (saveButton) {
        saveButton.classList.add('active');
    }
}

// 在状态选择器的点击处理中调用新函数
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('status-option')) {
        const selector = e.target.closest('.status-selector');
        const btn = selector.querySelector('.status-btn');
        const id = selector.dataset.id;
        const status = e.target.dataset.status;
        
        btn.textContent = status;
        btn.className = `status-btn ${getStatusClass(status)}`;
        
        // 使用新的更新函数
        updateStatusAndEnableSave(id, status);
        
        selector.classList.remove('active');
    }
});

// 添加保存备注的函数
function saveNotes() {
    const notes = {};
    document.querySelectorAll('.note-input').forEach(textarea => {
        notes[textarea.id] = textarea.value;
    });
    progressData.notes = notes;
    saveProgressData(); // 调用现有的保存函数
}

// 加载备注数据
function loadNotes() {
    if (progressData.notes) {
        Object.entries(progressData.notes).forEach(([id, value]) => {
            updateNotePreview(id);
        });
    }
}

// 修改保存通知函数，添加保存类型参数
function showSaveNotification(type = '进度') {
    const notification = document.createElement('div');
    notification.className = 'save-notification';
    notification.innerHTML = `
        <span>✓</span>
        <span>${type}已保存</span>
    `;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 修改备注相关的事件处理
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.querySelector('.note-modal');
    const modalTextarea = modal.querySelector('.note-input');
    let currentNoteId = null;

    // 点击预览打开模态框
    document.querySelectorAll('.note-preview').forEach(preview => {
        preview.addEventListener('click', function() {
            currentNoteId = this.dataset.noteId;
            modalTextarea.value = progressData.notes[currentNoteId] || '';
            modal.classList.add('active');
            modalTextarea.focus();
        });
    });

    // 保存按钮
    modal.querySelector('.note-modal-save').addEventListener('click', function() {
        if (currentNoteId) {
            progressData.notes[currentNoteId] = modalTextarea.value;
            updateNotePreview(currentNoteId);
            saveProgressData();
            modal.classList.remove('active');
        }
    });

    // 取消按钮
    modal.querySelector('.note-modal-cancel').addEventListener('click', function() {
        modal.classList.remove('active');
    });

    // 点击模态框外部关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
});

// 更新备注预览
function updateNotePreview(noteId) {
    const preview = document.querySelector(`[data-note-id="${noteId}"]`);
    const content = progressData.notes[noteId];
    if (preview) {
        preview.textContent = content ? '查看备注' : '添加备注';
        preview.style.color = content ? '#007AFF' : '#999';
    }
}

// 更新里程说明的点击交互
document.addEventListener('DOMContentLoaded', function() {
    const milestoneCards = document.querySelectorAll('.milestone-card');
    const detailsContent = document.getElementById('milestone-details-content');
    
    milestoneCards.forEach(card => {
        card.addEventListener('click', function() {
            // 获取当前卡片的详情内容
            const details = this.querySelector('.milestone-details').innerHTML;
            
            // 更新右侧面板的内容
            detailsContent.innerHTML = details;
            
            // 添加选中状态
            document.querySelectorAll('.milestone-card').forEach(c => {
                c.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
});

// 里程卡片点击处理
document.querySelectorAll('.milestone-item').forEach(card => {
    card.addEventListener('click', function() {
        // 移除其他卡片的active状态
        document.querySelectorAll('.milestone-item').forEach(c => {
            c.classList.remove('active');
        });
        
        // 添加当前卡片的active状态
        this.classList.add('active');
        
        // 获取里程详情
        const step = this.getAttribute('data-step');
        const details = getMilestoneDetails(step);
        
        // 显示详情
        const detailContent = document.querySelector('.detail-content');
        detailContent.classList.remove('empty', 'animate');
        
        // 触发重排以确保动画效果
        void detailContent.offsetWidth;
        
        detailContent.innerHTML = details;
        detailContent.classList.add('animate');
        
        // 平滑滚动到详情区域
        detailContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// 获取里程详情内容
function getMilestoneDetails(step) {
    const details = {
        '1': `
            <h3>第一步：制定计划背景与明确目标</h3>
            <p>本阶段主要围绕反洗钱管理体系的整体规划和目标设定展开，为后续工作奠定基础。</p>
            <div class="divider"></div>
            <div class="subtitle">1.1 背景分析</div>
            <ul>
                <li>行业特性：理解各业务板块的运营模式和资金流动特点，如IP授权交易、直播打赏、游戏内购、电子商务交易等。</li>
                <li>洗钱风险：识别各业务领域可能存在的洗钱风险，如虚拟商品交易、跨境支付、虚假交易等。</li>
            </ul>
            <div class="subtitle">1.2 目标设定</div>
            <ul>
                <li>合规经营：确保业务符合国家反洗钱法律法规，避免法律风险。</li>
                <li>风险控制：建立有效的洗钱风险识别和防控体系，降低被利用洗钱的可能性。</li>
                <li>品牌信誉：通过合规运营，提升企业的社会形象和用户信任度。</li>
            </ul>
        `,
        '2': `
            <h3>第二步：了解监管背景及要求</h3>
            <p>本阶段重点关注监管政策和要求的深入理解，确保合规管理的有效性。</p>
            <div class="divider"></div>
            <div class="subtitle">2.1 法规梳理</div>
            <ul>
                <li>国内法规：采集树立反洗钱法律法规、最新司法解释、中国人民银行和相关监管机构的反洗钱规定。</li>
                <li>行业规范：关注行业自律组织发布的合规指南和最佳实践。</li>
            </ul>
            <div class="subtitle">2.2 基础要求</div>
            <ul>
                <li>客户尽职调查（CDD）：建立健全的客户身份识别和验证机制。</li>
                <li>可疑交易报告：制定可疑交易监测和报告流程，及时向管理中心报告。</li>
                <li>数据留存：按照法规要求保存交易和客户数据，便于追溯和审计。</li>
            </ul>
        `,
        '3': `
            <h3>第三步：洗钱风险识别与评估</h3>
            <p>本阶段重点开展各业务板块的风险识别和评估工作，建立风险防控基础。</p>
            <div class="divider"></div>
            <div class="subtitle">3.1 风险场景分析</div>
            <ul>
                <li>阅文IP业务：关注版权交易中的异常资金流动、虚假授权等。</li>
                <li>直播业务：识别虚假打赏、自我打赏、主播与用户串通等风险。</li>
                <li>在线游戏业务：监控游戏内虚拟物品交易、账号交易等可能的洗钱手段。</li>
                <li>在线电商业务：防范虚假订单、退款滥用、礼品卡、贵重金属物品滥用等洗钱方式。</li>
            </ul>
            <div class="subtitle">3.2 风险评估策略</div>
            <ul>
                <li>用户分级：根据风险程度对用户进行分类管理并实施差异化的监控措施。</li>
                <li>持续监控：建立实时监控系统，及时发现和预警异常行为。</li>
            </ul>
        `,
        '4': `
            <h3>第四步：制定风险管理措施与风控措施</h3>
            <p>本阶段重点制定具体的风险管理和控制措施，确保风险可控。</p>
            <div class="divider"></div>
            <div class="subtitle">4.1 内部控制措施</div>
            <ul>
                <li>系统建设：搭建反洗钱监控体系，支持实时预警和风险识别。</li>
                <li>流程优化：完善业务流程中的合规节点，确保每个流程节点都有风险控制措施。</li>
            </ul>
            <div class="subtitle">4.2 外部协同</div>
            <ul>
                <li>合作伙伴管理：协议层面链接支付机构、银行等，确保资金渠道的合规性。</li>
                <li>行业交流：获取行业反洗钱讯息，吸收风险信息和防控经验。</li>
            </ul>
        `,
        '5': `
            <h3>第五步：数据需求与整合</h3>
            <p>本阶段重点关注数据收集和分析体系的建设，为风险管理提供支持。</p>
            <div class="divider"></div>
            <div class="subtitle">5.1 数据收集</div>
            <ul>
                <li>客户信息：获取并验证用户的身份信息、联系方式、交易习惯等。</li>
                <li>交易数据：收集交易金额、频率、对象、方式等详细信息。</li>
                <li>设备与行为数据：记录设备ID、IP地址、登录日志、操作行为等。</li>
            </ul>
            <div class="subtitle">5.2 数据整合与分析</div>
            <ul>
                <li>数据仓库建设：建立统一的数据平台，实现各业务板块的数据共享。</li>
            </ul>
        `,
        '6': `
            <h3>第六步：员工培训与合规意识提升</h3>
            <p>本阶段重点提升全员反洗钱意识，确保各项措施的有效执行。</p>
            <div class="divider"></div>
            <div class="subtitle">6.1 培训计划制定</div>
            <ul>
                <li>全员培训：普及反洗钱知识，提升整体合规意识。</li>
                <li>专项培训：针对风控、客户服务、技术等关键岗位，开展深入的专业培训。</li>
            </ul>
            <div class="subtitle">6.2 培训内容</div>
            <ul>
                <li>法律法规解读：学习相关法律法规和监管要求。</li>
                <li>风险案例分析：通过真实案例，了解洗钱手法和防控措施。</li>
                <li>操作流程培训：熟悉内部合规流程和系统操作。</li>
            </ul>
        `,
        '7': `
            <h3>第七步：建立内部与汇报机制</h3>
            <p>本阶段重点建立健全的内部沟通和外部报告机制，确保信息传递的及时性和准确性。</p>
            <div class="divider"></div>
            <div class="subtitle">7.1 内部沟通</div>
            <ul>
                <li>跨部门协作：建立风控、技术、运营等部门的协同机制。</li>
                <li>信息共享：定期召开会议，分享风险信息和防控经验。</li>
            </ul>
            <div class="subtitle">7.2 外部汇报</div>
            <ul>
                <li>监管报告：按照要求，不定期向监管机构提交反洗钱工作报告。</li>
                <li>应急响应：建立与监管机构的快速沟通渠道。</li>
            </ul>
        `,
        '8': `
            <h3>第八步：持续改进与优化</h3>
            <p>本阶段重点建立长效的优化机制，持续提升反洗钱管理水平。</p>
            <div class="divider"></div>
            <div class="subtitle">8.1 风险评估的动态调整</div>
            <ul>
                <li>定期评估：根据业务变化和风险趋势，定期更新风险评估结果。</li>
                <li>模型优化：持续改进风险识别模型，提高准确性和效率。</li>
            </ul>
            <div class="subtitle">8.2 制度与流程优化</div>
            <ul>
                <li>反馈机制：收集各部门在反洗钱工作中的反馈，优化制度和流程。</li>
                <li>技术升级：引入先进技术，如人工智能、大数据分析，提升风控能力。</li>
            </ul>
        `
    };

    return details[step] || '<div class="empty">暂无详细说明</div>';
}

// 状态选择器处理
document.querySelectorAll('.status-select').forEach(select => {
    // 初始化选择器状态
    updateSelectStatus(select);

    // 监听变化事件
    select.addEventListener('change', function() {
        updateSelectStatus(this);
    });
});

// 更新选择器状态
function updateSelectStatus(select) {
    const value = select.value;
    select.setAttribute('data-status', value);
    
    // 移除所有状态类
    select.classList.remove('completed', 'in-progress', 'pending');
    
    // 添加对应的状态类
    switch(value) {
        case '完成':
            select.classList.add('completed');
            break;
        case '进行中':
            select.classList.add('in-progress');
            break;
        case '待推动':
            select.classList.add('pending');
            break;
    }
}

// 保存按钮点击处理
document.querySelector('.save-btn').addEventListener('click', function() {
    // 收集所有进度状态
    const progressData = {};
    document.querySelectorAll('.status-select').forEach(select => {
        const row = select.closest('tr');
        const business = row.querySelector('td:first-child').textContent;
        const column = select.closest('td').cellIndex;
        const columnName = document.querySelector(`th:nth-child(${column + 1})`).textContent;
        
        if (!progressData[business]) {
            progressData[business] = {};
        }
        progressData[business][columnName] = select.value;
    });
    
    // 这里可以添加保存到后端的逻辑
    console.log('保存的进度数据：', progressData);
    
    // 显示保存成功提示
    showSaveNotification();
});

// 显示保存成功提示
function showSaveNotification() {
    const notification = document.querySelector('.save-notification');
    notification.classList.add('show');
    
    // 3秒后自动隐藏
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// 备注功能相关变量
let currentNoteButton = null;
const noteModal = document.querySelector('.note-modal');
const noteTextarea = document.querySelector('.note-textarea');
const noteCloseBtn = document.querySelector('.note-modal-close');
const noteCancelBtn = document.querySelector('.note-modal-cancel');
const noteSaveBtn = document.querySelector('.note-modal-save');

// 存储备数据
const notes = {};

// 初始化备注按钮事件
document.querySelectorAll('.note-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        currentNoteButton = this;
        const row = this.closest('tr');
        const business = row.querySelector('td:first-child').textContent;
        
        // 显示弹窗并填充已有备注
        noteModal.classList.add('show');
        noteTextarea.value = notes[business] || '';
        noteTextarea.focus();
    });
});

// 关闭弹窗
function closeNoteModal() {
    noteModal.classList.remove('show');
    noteTextarea.value = '';
    currentNoteButton = null;
}

// 保存备注
function saveNote() {
    if (!currentNoteButton) return;
    
    const row = currentNoteButton.closest('tr');
    const business = row.querySelector('td:first-child').textContent;
    const noteContent = noteTextarea.value.trim();
    
    if (noteContent) {
        notes[business] = noteContent;
        currentNoteButton.classList.add('has-note');
    } else {
        delete notes[business];
        currentNoteButton.classList.remove('has-note');
    }
    
    // 这里可以添加保存到后端的逻辑
    console.log('备注数据：', notes);
    
    // 显示保存成功提示
    showSaveNotification();
    closeNoteModal();
}

// 绑定事件
noteCloseBtn.addEventListener('click', closeNoteModal);
noteCancelBtn.addEventListener('click', closeNoteModal);
noteSaveBtn.addEventListener('click', saveNote);

// 点击弹窗外部关闭
noteModal.addEventListener('click', function(e) {
    if (e.target === this) {
        closeNoteModal();
    }
});

// 按ESC键关闭弹窗
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && noteModal.classList.contains('show')) {
        closeNoteModal();
    }
}); 