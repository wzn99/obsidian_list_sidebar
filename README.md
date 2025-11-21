# Obsidian List Sidebar Plugin

一个Obsidian插件，在侧边栏显示可折叠的列表，支持笔记链接和纯文本条目，方便快速访问常用内容。

## 功能特性

- 📋 多个列表支持，每个列表可独立折叠/展开
- 🔗 支持笔记链接（`[[note]]`格式），点击即可跳转
- 📝 支持纯文本条目
- ➕ 直接在侧边栏进行增、删、查操作
- 💾 数据保存为Markdown格式，可自定义文件路径
- ⚙️ 设置面板配置数据文件保存位置

## 安装方法

### 从GitHub安装（推荐）

1. 打开Obsidian设置
2. 进入"第三方插件" → "浏览"
3. 搜索"List Sidebar"或使用以下方式：
   - 点击"从GitHub安装"
   - 输入仓库地址：`你的GitHub用户名/obsidian_list_sidebar`
   - 点击安装

### 手动安装

1. 下载最新版本的 `main.js`、`manifest.json` 和 `styles.css`
2. 将文件放入你的Obsidian库的 `.obsidian/plugins/obsidian-list-sidebar/` 目录
3. 重新加载Obsidian或重启应用

## 使用方法

1. 安装插件后，在Obsidian左侧Ribbon栏会显示列表图标
2. 点击图标打开列表侧边栏
3. 使用"+"按钮添加新列表
4. 在列表中使用"+"按钮添加条目
5. 支持输入笔记链接格式：`[[笔记名称]]`
6. 点击列表名称旁的箭头可以折叠/展开列表
7. 点击🗑️图标删除列表或条目

## 设置

在Obsidian设置 → 第三方插件 → List Sidebar中，可以配置：
- **数据文件路径**：设置保存列表数据的Markdown文件路径（相对于库根目录）

## 数据格式

列表数据保存在Markdown文件中，格式如下：

```markdown
## 列表名称 <!-- expanded:true -->

- [[笔记1]]
- 纯文本条目
- [[笔记2]]
```

## 开发

如果你想参与开发或修改插件：

```bash
# 安装依赖
npm install

# 开发模式（自动监听文件变化）
npm run dev

# 构建生产版本
npm run build
```

## 许可证

MIT

