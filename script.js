import { doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { db, auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "firebase/auth";

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

// 修改认证检查函数
function checkAuth() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, (user) => {
            if (!user) {
                window.location.href = 'login.html';
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}

// 修改登出函数
async function logout() {
    try {
        await signOut(auth);
        localStorage.removeItem('username');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('登出失败：', error);
    }
}

// 修改 DOMContentLoaded 事件
document.addEventListener('DOMContentLoaded', async function() {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) return;
    
    // 首先加载保存的数据
    loadProgressData();
    
    // 其他初始化代码...
    updateProgress();
    
    // 添加保存按钮事件监听
    const saveButton = document.getElementById('saveProgress');
    if (saveButton) {
        saveButton.addEventListener('click', saveProgressData);
    }
    
    // ... 其他现有的事件监听器 ...
});

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

// 修改保存进度函数，添加用户信息
async function saveProgressData() {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('用户未登录');
        
        // 收集所有状态数据
        const statusData = {};
        document.querySelectorAll('.status-selector').forEach(selector => {
            const id = selector.dataset.id;
            const status = selector.querySelector('.status-btn').textContent;
            statusData[id] = status;
        });

        // 收集所有备注数据
        const notesData = {};
        document.querySelectorAll('.note-input').forEach(textarea => {
            notesData[textarea.id] = textarea.value;
        });

        // 准备要保存的数据
        const saveData = {
            status: statusData,
            notes: notesData,
            lastUpdated: new Date().toISOString(),
            updatedBy: user.email.split('@')[0] // 获取用户名部分
        };

        // 保存到 Firebase
        const docRef = doc(db, 'progress', 'current');
        await setDoc(docRef, saveData);

        showSaveNotification('数据已保存到云端');
    } catch (error) {
        console.error('保存失败：', error);
        showSaveNotification('保存失败，请重试', 'error');
    }
}

// 添加加载数据函数
async function loadProgressData() {
  try {
    const docRef = doc(db, 'progress', 'current');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // 更新状态
      if (data.status) {
        Object.entries(data.status).forEach(([id, status]) => {
          const selector = document.querySelector(`.status-selector[data-id="${id}"]`);
          if (selector) {
            const btn = selector.querySelector('.status-btn');
            btn.textContent = status;
            btn.className = `status-btn ${getStatusClass(status)}`;
          }
        });
      }

      // 更新备注
      if (data.notes) {
        Object.entries(data.notes).forEach(([id, content]) => {
          const textarea = document.getElementById(id);
          if (textarea) {
            textarea.value = content;
            updateNotePreview(id);
          }
        });
      }

      console.log('数据加载成功');
    } else {
      console.log('没有找到保存的数据');
    }
  } catch (error) {
    console.error('加载数据失败：', error);
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
        setTimeout(() => notification.remove(), 3000);
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

// 更新���程说明的点击交互
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
            <p>本段主要围绕反洗钱管理体系的整体规划和目标设定展开，为后续工作奠定基础。</p>
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
                <li>国内规：学习《中华人民共和国反洗钱法》、最新司法解释、中国人民银行和相关监管机构的反洗钱规定。</li>
                <li>行业规范：关注行业自律组织发布的合规指南和最佳实践。</li>
            </ul>
            <div class="subtitle">2.2 监管要求</div>
            <ul>
                <li>客户尽职调查（CDD）：建立健全的客户身份识别和验证机制。</li>
                <li>可疑交易报告：制定可疑交易监测和报告流程，及时向监管机构报告。</li>
                <li>数据留存：按照法规要求保存交易和客户数据，便于追溯和审计。</li>
            </ul>
        `,
        '3': `
            <h3>第三步：洗钱风险识别与评估</h3>
            <p>本阶重点开展各业务板的风险识别和评估工作，建立风险防控基础。</p>
            <div class="divider"></div>
            <div class="subtitle">3.1 风险场景分析</div>
            <ul>
                <li>阅文IP业务：关注版权交易中的异常资金流动、虚假授权等。</li>
                <li>直播业务：识别虚假打赏、自我打赏、主播与用户串通等风险。</li>
                <li>在线游戏业务：监控游戏内虚拟物品交易、账号交易、外挂代练等可能的洗钱手段。</li>
                <li>在线电商业务：防���虚假订单、退款滥用、礼品卡滥用等洗钱方式。</li>
            </ul>
            <div class="subtitle">3.2 风险评估策略</div>
            <ul>
                <li>数据分析：利用大数据技术，对交易行为、资金流动进行分析。</li>
                <li>用户分级：根据风险程度对用户行分类管理实施差异化的监控措施。</li>
                <li>持续监控：建立实时监控系统，及时发现和预警异常行为。</li>
            </ul>
        `,
        '4': `
            <h3>第四步：制定风险管理措施与风控措施</h3>
            <p>本阶段重点制定具体的风险管理和控制措施，确保风险可控。</p>
            <div class="divider"></div>
            <div class="subtitle">4.1 内部控制措施</div>
            <ul>
                <li>系统建设：开发或引入反洗钱监控系统，支持实时预警和风险识别。</li>
                <li>流程优化：完善业务流程中的合规节点，确保每个流程节点都有风险控制措施。</li>
                <li>权限管理：严格控制关键操作权限，防止内部人员参与或协助洗钱行为。</li>
            </ul>
            <div class="subtitle">4.2 外部协同</div>
            <ul>
                <li>合作伙伴管理：对接支���机构、银行等，确保资金渠道的合规性。</li>
                <li>行业交流：参与行业反洗钱联盟，分享风险信息和防控经验。</li>
            </ul>
        `,
        '5': `
            <h3>第五步：数据需求与整合</h3>
            <p>本阶段重点关注数据收集和分析体系的建设，为风险管理提供支。</p>
            <div class="divider"></div>
            <div class="subtitle">5.1 数据收集</div>
            <ul>
                <li>客户信息：获取并验证用户的身份信息、联系方式、交易习惯等。</li>
                <li>交易数据：收集交易金额、频率、对象、方式等详细信息。</li>
                <li>设备与行为据：记录设备ID、IP地址、登录日志、操作行为等。</li>
            </ul>
            <div class="subtitle">5.2 数据整合与分析</div>
            <ul>
                <li>数据仓库建设：建立统一的数据平台，实现各业务板块的数据共享。</li>
                <li>数据分析工具：应用数据挖掘、机器学习等技术，提升风险识别的准确性。</li>
            </ul>
        `,
        '6': `
            <h3>第六步：员工培训与合规意识提升</h3>
            <p>本阶段重点提升全员反洗钱意识，确保各项措施的��效执行。</p>
            <div class="divider"></div>
            <div class="subtitle">6.1 培训计划制定</div>
            <ul>
                <li>全员培训：普及反洗钱知识，提升整体合规意识。</li>
                <li>专项培训：针对风控、客户服务、技术等关键岗，开展深入的专业培训。</li>
            </ul>
            <div class="subtitle">6.2 培训内容</div>
            <ul>
                <li>法律法规解读：学习相关法律法规和监管要求。</li>
                <li>风险案例分析：通过真实案例，了解洗钱手法和防控措施。</li>
                <li>操作流程培训：熟悉内部合规流程和系统操。</li>
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
                <li>监管报告：按照要求，定期向监管机构提交反洗钱工作报告。</li>
                <li>应急响应：建立与监管机构的快速通渠道，及时报告重大风险事件。</li>
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

// 添加登出功能
function logout() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

// 可以在适当的位置添加登出按钮的HTML和事件监听 