export interface ListItem {
	content: string; // 可以是笔记链接 [[note]] 或纯文本
}

export interface List {
	name: string;
	expanded: boolean;
	items: ListItem[];
}

export interface PluginData {
	lists: List[];
	filePath: string; // 数据文件保存路径
}

