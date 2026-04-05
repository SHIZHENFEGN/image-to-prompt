# OpenCode 配置

## 语言设置
- 回复语言: 中文

---

## 项目：图生提示词 (Image to Prompt)

Chrome 扩展，将网页图片转化为 AI 生图提示词

### 仓库
https://github.com/SHIZHENFEGN/image-to-prompt

### 版本
v1.0.0

### 功能
- 鼠标悬停图片显示悬浮按钮
- 点击生成 AI 提示词
- 支持多个 API 服务商
- 右键菜单禁用图片/站点

### 文件结构
```
image-to-prompt/
├── manifest.json      # Chrome 扩展配置 (MV3)
├── background.js      # 后台 API 处理
├── content.js         # 悬浮按钮逻辑
├── content.css       # 悬浮按钮/窗口样式
├── popup.html        # 设置页面
├── popup.js          # 设置逻辑
├── popup.css         # 设置页面样式
└── assets/           # 图标文件
```

### API 服务商 (11个)
- 智谱 AI (glm-4v-flash)
- 月之暗面 (moonshot-v1-8k-vision)
- 百度智能云
- 阿里云 (qwen-vl-max)
- 腾讯云 (hunyuan-vision)
- 百川智能
- MiniMax
- 阶跃星辰
- SiliconFlow
- DeepSeek
- Ollama (本地)

### Git 操作
```bash
# 提交更改
git add .
git commit -m "描述"
git push

# 查看历史
git log --oneline -10
```

### 本地开发
1. 打开 Chrome → chrome://extensions
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 image-to-prompt 文件夹
