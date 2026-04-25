// 初始化 Lucide 圖示
lucide.createIcons();

// 狀態管理
let currentSourceFilter = 'all';
let currentRoleFilter = 'all';
let currentSlotFilter = 'all';

// 配裝模擬器狀態 (支援雙戒指)
const equippedGear = {
    weapon: null,
    head: null,
    body: null,
    hands: null,
    legs: null,
    feet: null,
    earrings: null,
    necklace: null,
    bracelets: null,
    ring1: null,
    ring2: null
};

// 配裝槽位定義 (特別區分左右戒指)
const plannerSlots = [
    { id: 'weapon', name: '武器 (Weapon)' },
    { id: 'head', name: '頭部 (Head)' },
    { id: 'body', name: '身體 (Body)' },
    { id: 'hands', name: '手部 (Hands)' },
    { id: 'legs', name: '腿部 (Legs)' },
    { id: 'feet', name: '腳部 (Feet)' },
    { id: 'earrings', name: '耳飾 (Earrings)' },
    { id: 'necklace', name: '項鍊 (Necklace)' },
    { id: 'bracelets', name: '手環 (Bracelets)' },
    { id: 'ring1', name: '左戒指 (Left Ring)' },
    { id: 'ring2', name: '右戒指 (Right Ring)' },
];

// DOM 元素
const sourceFiltersContainer = document.getElementById('source-filters');
const roleFiltersContainer = document.getElementById('role-filters');
const slotFiltersContainer = document.getElementById('slot-filters');
const gearGrid = document.getElementById('gear-grid');
const resultCount = document.getElementById('result-count');
const equippedSlotsContainer = document.getElementById('equipped-slots');
const totalStatsContainer = document.getElementById('total-stats-container');
const clearPlannerBtn = document.getElementById('clear-planner');
const toggleAutoEquipBtn = document.getElementById('toggle-auto-equip');
const autoEquipPanel = document.getElementById('auto-equip-panel');
const autoRoleSelect = document.getElementById('auto-role-select');
const runAutoEquipBtn = document.getElementById('run-auto-equip');

// 初始化篩選與自動配裝選單
function initFilters() {
    // 產生來源篩選按鈕
    sources.forEach(source => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.dataset.source = source.id;
        btn.textContent = `${source.name} (IL ${source.baseIlvl})`;
        btn.addEventListener('click', () => {
            document.querySelectorAll('#source-filters .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSourceFilter = source.id;
            renderGear();
        });
        sourceFiltersContainer.appendChild(btn);
    });

    document.querySelector('#source-filters .filter-btn[data-source="all"]').addEventListener('click', (e) => {
        document.querySelectorAll('#source-filters .filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentSourceFilter = 'all';
        renderGear();
    });

    // 產生職業篩選按鈕
    roles.forEach(role => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.dataset.role = role.id;
        const colorDot = `<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:${role.color};"></span>`;
        btn.innerHTML = `${colorDot} ${role.name}`;
        btn.addEventListener('click', () => {
            document.querySelectorAll('#role-filters .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentRoleFilter = role.id;
            renderGear();
        });
        roleFiltersContainer.appendChild(btn);

        // 同時填入自動配裝的職業選單
        const option = document.createElement('option');
        option.value = role.id;
        option.textContent = role.name;
        autoRoleSelect.appendChild(option);
    });

    document.querySelector('#role-filters .filter-btn[data-role="all"]').addEventListener('click', (e) => {
        document.querySelectorAll('#role-filters .filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentRoleFilter = 'all';
        renderGear();
    });

    // 產生部位篩選按鈕
    slots.forEach(slot => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.dataset.slot = slot.id;
        btn.textContent = slot.name;
        btn.addEventListener('click', () => {
            document.querySelectorAll('#slot-filters .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSlotFilter = slot.id;
            renderGear();
        });
        slotFiltersContainer.appendChild(btn);
    });

    document.querySelector('#slot-filters .filter-btn[data-slot="all"]').addEventListener('click', (e) => {
        document.querySelectorAll('#slot-filters .filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentSlotFilter = 'all';
        renderGear();
    });
}

// 渲染裝備卡片
function renderGear() {
    gearGrid.innerHTML = ''; 
    
    const filteredData = gearData.filter(item => {
        const sourceMatch = currentSourceFilter === 'all' || item.sourceId === currentSourceFilter;
        const roleMatch = currentRoleFilter === 'all' || item.role === currentRoleFilter;
        const slotMatch = currentSlotFilter === 'all' || item.slot === currentSlotFilter;
        return sourceMatch && roleMatch && slotMatch;
    });

    resultCount.textContent = filteredData.length;

    filteredData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'gear-card';
        card.style.cursor = 'pointer';
        
        card.addEventListener('click', () => {
            equipItem(item);
        });
        
        let statsHtml = '';
        for (const [key, value] of Object.entries(item.stats)) {
            statsHtml += `
                <div class="stat-row">
                    <span class="stat-label">${key}</span>
                    <span class="stat-value">+${value}</span>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="card-header">
                <div class="card-icon" style="border-color: ${item.roleColor}">
                    <img src="${item.imagePlaceholder}" alt="${item.name}">
                </div>
                <div class="card-title-area">
                    <div class="card-name">${item.name}</div>
                    <div class="card-tags">
                        <span class="tag ilvl">IL ${item.ilvl}</span>
                        <span class="tag">${item.roleName.split(' ')[0]}</span>
                        <span class="tag">${item.slotName.split(' ')[0]}</span>
                    </div>
                </div>
            </div>
            <div class="card-body">
                ${statsHtml}
            </div>
            <div style="padding: 0 1.5rem 1rem; text-align: center;">
                <button class="action-btn" style="width: 100%;">點擊穿上</button>
            </div>
        `;
        
        gearGrid.appendChild(card);
    });
}

// 手動穿上裝備
function equipItem(item) {
    if (item.slot === 'rings') {
        if (!equippedGear.ring1) {
            equippedGear.ring1 = item;
        } else if (!equippedGear.ring2) {
            equippedGear.ring2 = item;
        } else {
            equippedGear.ring1 = item; // 預設蓋掉第一顆
        }
    } else {
        equippedGear[item.slot] = item;
    }
    renderPlanner();
}

// 卸下裝備
function unequipItem(slotId) {
    equippedGear[slotId] = null;
    renderPlanner();
}

// 渲染配裝模擬器
function renderPlanner() {
    equippedSlotsContainer.innerHTML = '';
    
    plannerSlots.forEach(slot => {
        const item = equippedGear[slot.id];
        const slotDiv = document.createElement('div');
        
        if (item) {
            slotDiv.className = 'equip-slot filled';
            slotDiv.innerHTML = `
                <div class="equip-slot-icon">
                    <img src="${item.imagePlaceholder}" alt="${item.name}">
                </div>
                <div class="equip-slot-info">
                    <span class="equip-slot-name">${item.name}</span>
                    <span class="equip-slot-type">IL ${item.ilvl} | ${item.roleName.split(' ')[0]}</span>
                </div>
            `;
            slotDiv.addEventListener('click', () => unequipItem(slot.id));
        } else {
            slotDiv.className = 'equip-slot';
            slotDiv.innerHTML = `
                <div class="equip-slot-icon"></div>
                <div class="equip-slot-info">
                    <span class="equip-slot-name">空槽位</span>
                    <span class="equip-slot-type">${slot.name}</span>
                </div>
            `;
        }
        
        equippedSlotsContainer.appendChild(slotDiv);
    });

    calculateStats();
}

// 計算總屬性
function calculateStats() {
    const totalStats = {};
    let equippedCount = 0;
    let totalIlvl = 0;

    Object.values(equippedGear).forEach(item => {
        if (item) {
            equippedCount++;
            totalIlvl += item.ilvl;
            for (const [stat, value] of Object.entries(item.stats)) {
                if (!totalStats[stat]) {
                    totalStats[stat] = 0;
                }
                totalStats[stat] += value;
            }
        }
    });

    if (equippedCount === 0) {
        totalStatsContainer.innerHTML = '<div class="stat-placeholder">尚未穿戴裝備</div>';
        return;
    }

    let html = '';
    
    // 計算平均裝等 (FF14 右側戒指算一件，但通常戒指算兩個槽)
    // 嚴格來說，主武器等同兩件防禦力，但為簡化計算這裡直接除以件數或固定除以 11 (一般配裝如果是騎士會帶盾，但目前合併為武器計算)
    // 這裡我們直接用已穿戴的平均裝等做展示
    const avgIlvl = Math.floor(totalIlvl / equippedCount);
    html += `
        <div class="stat-total-row" style="margin-bottom: 1rem; border-bottom: 2px solid rgba(212,175,55,0.3);">
            <span class="stat-total-label" style="color:var(--accent-gold);">平均裝備等級</span>
            <span class="stat-total-value">${avgIlvl}</span>
        </div>
    `;

    for (const [stat, value] of Object.entries(totalStats)) {
        html += `
            <div class="stat-total-row">
                <span class="stat-total-label">${stat}</span>
                <span class="stat-total-value">${value}</span>
            </div>
        `;
    }

    totalStatsContainer.innerHTML = html;
}

// 清空配裝
clearPlannerBtn.addEventListener('click', () => {
    Object.keys(equippedGear).forEach(key => equippedGear[key] = null);
    renderPlanner();
});

// 自動配裝面板開關
toggleAutoEquipBtn.addEventListener('click', () => {
    if (autoEquipPanel.style.display === 'none') {
        autoEquipPanel.style.display = 'block';
    } else {
        autoEquipPanel.style.display = 'none';
    }
});

// 執行自動配裝演算
runAutoEquipBtn.addEventListener('click', () => {
    const role = document.getElementById('auto-role-select').value;
    const stat1 = document.getElementById('auto-stat1-select').value;
    const stat2 = document.getElementById('auto-stat2-select').value;
    const maxIlvl = parseInt(document.getElementById('auto-il-limit').value, 10) || 999;
    
    // 清空當前裝備
    Object.keys(equippedGear).forEach(key => equippedGear[key] = null);
    
    // 篩選出該職業且符合裝備等級上限的裝備
    const roleGear = gearData.filter(g => g.role === role && g.ilvl <= maxIlvl);
    
    // 計分函數: 裝備等級 (ILVL) 是最重要的，權重極高
    // 若裝等相同，則優先看 stat1，再來是 stat2
    const scoreItem = (item) => {
        let score = item.ilvl * 10000; 
        score += (item.stats[stat1] || 0) * 100;
        score += (item.stats[stat2] || 0);
        return score;
    };
    
    const baseSlots = ['weapon', 'head', 'body', 'hands', 'legs', 'feet', 'earrings', 'necklace', 'bracelets'];
    
    baseSlots.forEach(slot => {
        const slotItems = roleGear.filter(g => g.slot === slot);
        if (slotItems.length > 0) {
            slotItems.sort((a, b) => scoreItem(b) - scoreItem(a));
            equippedGear[slot] = slotItems[0];
        }
    });
    
    // 戒指特殊處理 (挑選前兩名不同的裝備)
    const ringItems = roleGear.filter(g => g.slot === 'rings');
    if (ringItems.length > 0) {
        ringItems.sort((a, b) => scoreItem(b) - scoreItem(a));
        equippedGear.ring1 = ringItems[0]; // 最強的一顆放左手
        if (ringItems.length > 1) {
            equippedGear.ring2 = ringItems[1]; // 次強的一顆放右手 (防呆，避免同一件裝備穿兩次)
        } else {
            equippedGear.ring2 = ringItems[0];
        }
    }
    
    renderPlanner();
    
    // 自動切換篩選器到該職業以便檢視
    document.querySelectorAll('#role-filters .filter-btn').forEach(b => b.classList.remove('active'));
    const roleBtn = document.querySelector(`#role-filters .filter-btn[data-role="${role}"]`);
    if(roleBtn) {
        roleBtn.classList.add('active');
        currentRoleFilter = role;
        renderGear();
    }
    
    // 自動收合面板
    autoEquipPanel.style.display = 'none';
});

// 初始化應用程式
document.addEventListener('DOMContentLoaded', () => {
    initFilters();
    renderGear();
    renderPlanner();
});
