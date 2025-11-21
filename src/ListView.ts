import { ItemView, WorkspaceLeaf, Modal, App } from "obsidian";
import { List, ListItem, PluginData } from "./types";
import ListSidebarPlugin from "../main";

export const VIEW_TYPE_LIST_SIDEBAR = "list-sidebar-view";

export class ListView extends ItemView {
	plugin: ListSidebarPlugin;
	private lists: List[] = [];

	constructor(leaf: WorkspaceLeaf, plugin: ListSidebarPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() {
		return VIEW_TYPE_LIST_SIDEBAR;
	}

	getDisplayText() {
		return "列表侧边栏";
	}

	getIcon() {
		return "list";
	}

	async onOpen() {
		await this.loadData();
		this.render();
	}

	async onClose() {
		// 清理工作
	}

	async loadData() {
		this.lists = await this.plugin.loadLists();
	}

	async saveData() {
		await this.plugin.saveLists(this.lists);
	}

	render() {
		const container = this.containerEl.children[1] as HTMLElement;
		if (!container) {
			return;
		}
		container.empty();
		container.addClass("list-sidebar-container");

		// 添加设置按钮
		const headerEl = container.createDiv("list-sidebar-header");
		const settingsBtn = headerEl.createEl("button", {
			text: "⚙️",
			cls: "list-sidebar-settings-btn",
			attr: { "aria-label": "设置" }
		});
		settingsBtn.onclick = () => {
			this.plugin.openSettings();
		};

		// 添加列表容器
		const listsContainer = container.createDiv("list-sidebar-lists");

		// 渲染所有列表
		this.lists.forEach((list, listIndex) => {
			this.renderList(listsContainer, list, listIndex);
		});

		// 添加新列表按钮
		const addListBtn = container.createEl("button", {
			text: "+ 添加列表",
			cls: "list-sidebar-add-list-btn"
		});
		addListBtn.onclick = async () => {
			const name = await this.promptForInput("输入列表名称：");
			if (name && name.trim()) {
				const newList: List = {
					name: name.trim(),
					expanded: true,
					items: []
				};
				this.lists.push(newList);
				await this.saveData();
				this.render();
			}
		};
	}

	renderList(container: HTMLElement, list: List, listIndex: number) {
		const listEl = container.createDiv("list-sidebar-list");
		
		// 列表头部
		const headerEl = listEl.createDiv("list-sidebar-list-header");
		
		// 折叠/展开按钮
		const toggleBtn = headerEl.createEl("button", {
			text: list.expanded ? "▼" : "▶",
			cls: "list-sidebar-toggle-btn",
			attr: { "aria-label": list.expanded ? "折叠" : "展开" }
		});
		toggleBtn.onclick = async () => {
			list.expanded = !list.expanded;
			await this.saveData();
			this.render();
		};

		// 列表名称
		const nameEl = headerEl.createEl("span", {
			text: list.name,
			cls: "list-sidebar-list-name"
		});

		// 删除列表按钮
		const deleteListBtn = headerEl.createEl("button", {
			text: "🗑️",
			cls: "list-sidebar-delete-btn",
			attr: { "aria-label": "删除列表" }
		});
		deleteListBtn.onclick = async () => {
			const confirmed = await this.showConfirmDialog(`确定要删除列表"${list.name}"吗？`);
			if (confirmed) {
				this.lists.splice(listIndex, 1);
				await this.saveData();
				this.render();
			}
		};

		// 列表项容器
		if (list.expanded) {
			const itemsContainer = listEl.createDiv("list-sidebar-items");
			
			list.items.forEach((item, itemIndex) => {
				this.renderItem(itemsContainer, item, listIndex, itemIndex);
			});

			// 添加条目按钮
			const addItemBtn = itemsContainer.createEl("button", {
				text: "+ 添加条目",
				cls: "list-sidebar-add-item-btn"
			});
			addItemBtn.onclick = async () => {
				const content = await this.promptForInput("输入条目内容（支持笔记链接[[note]]或纯文本）：");
				if (content && content.trim()) {
					const newItem: ListItem = {
						content: content.trim()
					};
					list.items.push(newItem);
					await this.saveData();
					this.render();
				}
			};
		}
	}

	renderItem(container: HTMLElement, item: ListItem, listIndex: number, itemIndex: number) {
		const itemEl = container.createDiv("list-sidebar-item");
		
		// 条目内容
		const contentEl = itemEl.createDiv("list-sidebar-item-content");
		
		// 检查是否是笔记链接
		const linkMatch = item.content.match(/\[\[([^\]]+)\]\]/);
		if (linkMatch) {
			// 笔记链接
			const linkText = linkMatch[1];
			const linkEl = contentEl.createEl("a", {
				text: linkText,
				cls: "internal-link"
			});
			linkEl.onclick = async (e) => {
				e.preventDefault();
				const file = this.app.metadataCache.getFirstLinkpathDest(linkText, "");
				if (file) {
					await this.app.workspace.openLinkText(linkText, "", true);
				}
			};
		} else {
			// 纯文本
			contentEl.createEl("span", {
				text: item.content
			});
		}

		// 删除条目按钮
		const deleteItemBtn = itemEl.createEl("button", {
			text: "×",
			cls: "list-sidebar-delete-item-btn",
			attr: { "aria-label": "删除条目" }
		});
		deleteItemBtn.onclick = async () => {
			this.lists[listIndex].items.splice(itemIndex, 1);
			await this.saveData();
			this.render();
		};
	}

	async promptForInput(prompt: string): Promise<string | null> {
		return new Promise((resolve) => {
			const modal = new InputModal(this.app, prompt, (value) => {
				resolve(value);
			});
			modal.open();
		});
	}

	async refresh() {
		await this.loadData();
		this.render();
	}

	async showConfirmDialog(message: string): Promise<boolean> {
		return new Promise((resolve) => {
			const modal = new ConfirmModal(this.app, message, (confirmed) => {
				resolve(confirmed);
			});
			modal.open();
		});
	}
}

class InputModal extends Modal {
	private inputEl!: HTMLInputElement;
	private onSubmit: (value: string | null) => void;

	constructor(app: App, private prompt: string, onSubmit: (value: string | null) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("h2", { text: this.prompt });

		this.inputEl = contentEl.createEl("input", {
			type: "text",
			placeholder: "输入内容..."
		});

		this.inputEl.focus();
		this.inputEl.select();

		const buttonContainer = contentEl.createDiv("modal-button-container");
		const submitBtn = buttonContainer.createEl("button", {
			text: "确定",
			cls: "mod-cta"
		});
		const cancelBtn = buttonContainer.createEl("button", {
			text: "取消"
		});

		submitBtn.onclick = () => {
			this.onSubmit(this.inputEl.value);
			this.close();
		};

		cancelBtn.onclick = () => {
			this.onSubmit(null);
			this.close();
		};

		this.inputEl.onkeydown = (e) => {
			if (e.key === "Enter") {
				e.preventDefault();
				submitBtn.click();
			} else if (e.key === "Escape") {
				e.preventDefault();
				cancelBtn.click();
			}
		};
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class ConfirmModal extends Modal {
	private onSubmit: (confirmed: boolean) => void;

	constructor(app: App, private message: string, onSubmit: (confirmed: boolean) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("p", { text: this.message });

		const buttonContainer = contentEl.createDiv("modal-button-container");
		const confirmBtn = buttonContainer.createEl("button", {
			text: "确定",
			cls: "mod-cta"
		});
		const cancelBtn = buttonContainer.createEl("button", {
			text: "取消"
		});

		confirmBtn.onclick = () => {
			this.onSubmit(true);
			this.close();
		};

		cancelBtn.onclick = () => {
			this.onSubmit(false);
			this.close();
		};

		confirmBtn.focus();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

