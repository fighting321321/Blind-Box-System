// 删除展示
export function deleteShowcase(id: number): boolean {
    const dataPath = getDataPath();
    if (!fs.existsSync(dataPath)) return false;
    const raw = fs.readFileSync(dataPath, 'utf-8');
    const json: PlayerShowcaseData = JSON.parse(raw);
    const before = json.showcases.length;
    json.showcases = json.showcases.filter(item => item.id !== id);
    const after = json.showcases.length;
    if (after === before) return false; // 没有删除
    fs.writeFileSync(dataPath, JSON.stringify({ ...json, lastUpdated: new Date().toISOString() }, null, 2), 'utf-8');
    return true;
}
// 玩家秀服务：基于 JSON 文件的简单读写（TypeScript 版）

import * as fs from 'fs';
import * as path from 'path';

export interface PlayerShowcase {
    id: number;
    userId: string;
    prizeId: number;
    title: string;
    description: string;
    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
}

interface PlayerShowcaseData {
    showcases: PlayerShowcase[];
    nextId: number;
    lastUpdated: string;
}

const DATA_PATH = path.join(__dirname, '../../database/player_showcase_data.json');
// 兼容开发和生产环境，若路径不存在则尝试 src/database
if (!fs.existsSync(DATA_PATH)) {
    const altPath = path.join(process.cwd(), 'src/database/player_showcase_data.json');
    if (fs.existsSync(altPath)) {
        (global as any).PLAYER_SHOWCASE_DATA_PATH = altPath;
    } else {
        // 若都不存在则用默认
        (global as any).PLAYER_SHOWCASE_DATA_PATH = DATA_PATH;
    }
} else {
    (global as any).PLAYER_SHOWCASE_DATA_PATH = DATA_PATH;
}

function getDataPath() {
    return (global as any).PLAYER_SHOWCASE_DATA_PATH;
}


function readShowcaseData(): PlayerShowcaseData {
    const pathToUse = getDataPath();
    console.log('[PlayerShowcase] 实际读取数据文件:', pathToUse);
    if (!fs.existsSync(pathToUse)) {
        console.log('[PlayerShowcase] 文件不存在，返回默认对象');
        return { showcases: [], nextId: 1, lastUpdated: new Date().toISOString() };
    }
    const raw = fs.readFileSync(pathToUse, 'utf-8');
    try {
        const obj = JSON.parse(raw);
        return {
            showcases: Array.isArray(obj.showcases) ? obj.showcases : [],
            nextId: typeof obj.nextId === 'number' ? obj.nextId : 1,
            lastUpdated: typeof obj.lastUpdated === 'string' ? obj.lastUpdated : new Date().toISOString()
        };
    } catch (e) {
        console.error('[PlayerShowcase] 解析JSON失败:', e);
        return { showcases: [], nextId: 1, lastUpdated: new Date().toISOString() };
    }
}


function writeShowcaseData(data: PlayerShowcaseData): void {
    const pathToUse = getDataPath();
    const dir = path.dirname(pathToUse);
    if (!fs.existsSync(dir)) {
        console.log('[PlayerShowcase] 目录不存在，自动创建:', dir);
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(pathToUse, JSON.stringify(data, null, 2), 'utf-8');
    console.log('[PlayerShowcase] 已写入数据文件:', pathToUse);
}

export function addShowcase({ userId, prizeId, title, description, imageUrl }: Omit<PlayerShowcase, 'id' | 'createdAt' | 'updatedAt'>): PlayerShowcase {
    console.log('[PlayerShowcase] addShowcase 入参:', { userId, prizeId, title, description, imageUrl });
    const data = readShowcaseData();
    const now = new Date().toISOString();
    const showcase: PlayerShowcase = {
        id: data.nextId,
        userId,
        prizeId: typeof prizeId === 'number' ? prizeId : Number(prizeId),
        title: title && title.trim() ? title : '该用户没有填写标题',
        description: description && description.trim() ? description : '该用户没有填写描述',
        imageUrl,
        createdAt: now,
        updatedAt: now
    };
    data.showcases.push(showcase);
    data.nextId += 1;
    data.lastUpdated = now;
    writeShowcaseData(data);
    console.log('[PlayerShowcase] 新增展示:', showcase);
    return showcase;
}

export function getShowcases(): PlayerShowcase[] {
    return readShowcaseData().showcases;
}
