const roles = [
    { id: 'fending', name: '坦克 (Fending)', color: '#2563eb' },
    { id: 'healing', name: '治療 (Healing)', color: '#16a34a' },
    { id: 'striking', name: '武僧/武士 (Striking)', color: '#dc2626' },
    { id: 'maiming', name: '龍騎/釤鐮 (Maiming)', color: '#dc2626' },
    { id: 'scouting', name: '忍者/毒蛇 (Scouting)', color: '#dc2626' },
    { id: 'aiming', name: '遠程物理 (Aiming)', color: '#dc2626' },
    { id: 'casting', name: '遠程魔法 (Casting)', color: '#dc2626' },
];

const slots = [
    { id: 'weapon', name: '武器 (Weapon)' },
    { id: 'head', name: '頭部 (Head)' },
    { id: 'body', name: '身體 (Body)' },
    { id: 'hands', name: '手部 (Hands)' },
    { id: 'legs', name: '腿部 (Legs)' },
    { id: 'feet', name: '腳部 (Feet)' },
    { id: 'earrings', name: '耳飾 (Earrings)' },
    { id: 'necklace', name: '項鍊 (Necklace)' },
    { id: 'bracelets', name: '手環 (Bracelets)' },
    { id: 'rings', name: '戒指 (Rings)' },
];

const sources = [
    { id: 'savage730', name: '黑馬冠軍 (Savage)', baseIlvl: 730, prefix: '黑馬冠軍', hasWeapon: true },
    { id: 'augtome730', name: '改良型綠咬鵑 (Aug. Tome)', baseIlvl: 730, prefix: '改良型綠咬鵑', hasWeapon: true },
    { id: 'tome720', name: '綠咬鵑 (Tomestone)', baseIlvl: 720, prefix: '綠咬鵑', hasWeapon: true },
    { id: 'extreme715', name: '極限戰 (Extreme)', baseIlvl: 715, prefix: '極限', hasWeapon: true, weaponOnly: true },
    { id: 'normal710', name: '阿卡狄亞 (Normal)', baseIlvl: 710, prefix: '阿卡狄亞', hasWeapon: false },
    { id: 'crafted710', name: '古代王國 (Crafted)', baseIlvl: 710, prefix: '古代王國', hasWeapon: true },
    { id: 'dungeon710', name: '先鋒營 (Dungeon)', baseIlvl: 710, prefix: '先鋒營', hasWeapon: true }
];

const gearData = [];

sources.forEach(source => {
    roles.forEach(role => {
        slots.forEach(slot => {
            
            // 例外處理：極限戰只有武器，普通難度通常沒有直掉武器
            if (source.weaponOnly && slot.id !== 'weapon') return;
            if (!source.hasWeapon && slot.id === 'weapon') return;

            let name = `${source.prefix}`;
            
            if (slot.id === 'weapon') {
                name += role.id === 'fending' ? '大劍' : 
                        role.id === 'healing' ? '牧杖' : 
                        role.id === 'casting' ? '魔導書' : '武器';
            } else {
                const roleNameMap = {
                    'fending': '防禦者',
                    'healing': '治癒者',
                    'striking': '強攻者',
                    'maiming': '制敵者',
                    'scouting': '游擊者',
                    'aiming': '精準者',
                    'casting': '詠咒'
                };
                const slotNameMap = {
                    'head': '兜帽',
                    'body': '長衣',
                    'hands': '手套',
                    'legs': '騎兵褲',
                    'feet': '皮靴',
                    'earrings': '耳墜',
                    'necklace': '項鏈',
                    'bracelets': '手鐲',
                    'rings': '指環'
                };
                name += `${roleNameMap[role.id]}${slotNameMap[slot.id]}`;
            }

            // 零式武器 ILVL + 5
            let currentIlvl = source.baseIlvl;
            if (source.id === 'savage730' && slot.id === 'weapon') {
                currentIlvl = 735;
            }

            // 根據 ILVL 增加基礎屬性 (為模擬真實屬性，做些許公式計算)
            const statMultiplier = (currentIlvl - 700) * 12;
            
            const stats = {
                '智力/力量/靈巧/精神': (slot.id === 'body' || slot.id === 'legs' || slot.id === 'weapon') ? 500 + statMultiplier : 300 + statMultiplier,
                '耐力': (slot.id === 'body' || slot.id === 'legs' || slot.id === 'weapon') ? 550 + statMultiplier : 350 + statMultiplier,
            };
            
            // 隨機選兩個副屬性
            const subStats = ['暴擊', '信念', '直擊', '技速', '詠速'];
            
            // 法系與補師排除技速，近戰排除詠速
            let availableSubStats = subStats.filter(s => {
                if ((role.id === 'casting' || role.id === 'healing') && s === '技速') return false;
                if (['fending', 'striking', 'maiming', 'scouting', 'aiming'].includes(role.id) && s === '詠速') return false;
                if (role.id === 'healing' && s === '直擊') return false; // 治療通常無原生直擊
                return true;
            });

            const randomSub1 = availableSubStats[Math.floor(Math.random() * availableSubStats.length)];
            let randomSub2 = availableSubStats[Math.floor(Math.random() * availableSubStats.length)];
            while (randomSub2 === randomSub1) {
                randomSub2 = availableSubStats[Math.floor(Math.random() * availableSubStats.length)];
            }
            
            // 大部位副屬性較高
            const isMajorSlot = slot.id === 'body' || slot.id === 'legs' || slot.id === 'weapon';
            stats[randomSub1] = isMajorSlot ? 350 + Math.floor(Math.random() * 50) : 220 + Math.floor(Math.random() * 30);
            stats[randomSub2] = isMajorSlot ? 240 + Math.floor(Math.random() * 50) : 150 + Math.floor(Math.random() * 30);

            // 使用真實且經過驗證的 FF14 遊戲圖示 (透過 XIVAPI)
            const ffxivIcons = {
                'weapon_melee': 'https://xivapi.com/i/030000/030446.png', // 柯塔納 (劍)
                'weapon_ranged': 'https://xivapi.com/i/032000/032663.png', // 涅槃 (杖)
                'head': 'https://xivapi.com/i/040000/040617.png', // 戰女神頭冠
                'body': 'https://xivapi.com/i/043000/043091.png', // 戰女神戰甲
                'hands': 'https://xivapi.com/i/048000/048340.png', // 戰女神手套
                'legs': 'https://xivapi.com/i/045000/045192.png', // 戰女神馬褲
                'feet': 'https://xivapi.com/i/046000/046845.png', // 戰女神戰靴
                'earrings': 'https://xivapi.com/i/055000/055289.png', // 泰坦耳墜
                'necklace': 'https://xivapi.com/i/054000/054510.png', // 流星生還者戒指 (作為通用飾品)
                'bracelets': 'https://xivapi.com/i/054000/054510.png', 
                'rings': 'https://xivapi.com/i/054000/054510.png'
            };

            let imagePath = '';
            if (slot.id === 'weapon') {
                const isRanged = role.id === 'healing' || role.id === 'casting' || role.id === 'aiming';
                imagePath = isRanged ? ffxivIcons['weapon_ranged'] : ffxivIcons['weapon_melee'];
            } else {
                imagePath = ffxivIcons[slot.id];
            }

            gearData.push({
                id: `${source.id}-${role.id}-${slot.id}`,
                name: name,
                sourceId: source.id,
                sourceName: source.name,
                role: role.id,
                roleName: role.name,
                roleColor: role.color,
                slot: slot.id,
                slotName: slot.name,
                ilvl: currentIlvl,
                stats: stats,
                imagePlaceholder: imagePath
            });
        });
    });
});
