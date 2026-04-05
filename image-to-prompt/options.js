// API 服务商配置（与 background.js 保持一致）
const API_PROVIDERS = {
  'zhipu': {
    name: '智谱 AI',
    models: [
      { id: 'glm-4v-flash', name: 'glm-4v-flash (推荐)' },
      { id: 'glm-4v', name: 'glm-4v' },
      { id: 'glm-4v-plus', name: 'glm-4v-plus' }
    ],
    helpUrl: 'https://open.bigmodel.cn/',
    helpText: '在智谱 AI 开放平台获取 API Key'
  },
  'moonshot': {
    name: '月之暗面',
    models: [
      { id: 'moonshot-v1-8k-vision', name: 'moonshot-v1-8k-vision' }
    ],
    helpUrl: 'https://platform.moonshot.cn/',
    helpText: '在月之暗面平台获取 API Key'
  },
  'baidu': {
    name: '百度智能云',
    models: [
      { id: 'eb-4', name: 'eb-4' }
    ],
    helpUrl: 'https://console.bce.baidu.com/',
    helpText: '在百度智能云获取 API Key'
  },
  'alibaba': {
    name: '阿里云',
    models: [
      { id: 'qwen-vl-max', name: 'qwen-vl-max' },
      { id: 'qwen-vl-plus', name: 'qwen-vl-plus' }
    ],
    helpUrl: 'https://dashscope.console.aliyun.com/',
    helpText: '在阿里云百宝箱获取 API Key'
  },
  'tencent': {
    name: '腾讯云',
    models: [
      { id: 'hunyuan-vision', name: 'hunyuan-vision' }
    ],
    helpUrl: 'https://console.cloud.tencent.com/',
    helpText: '在腾讯云获取 API Key'
  },
  'baichuan': {
    name: '百川智能',
    models: [
      { id: 'Baichuan-4-Vision', name: 'Baichuan-4-Vision' }
    ],
    helpUrl: 'https://www.baichuan-ai.com/',
    helpText: '在百川智能获取 API Key'
  },
  'minimax': {
    name: 'MiniMax',
    models: [
      { id: 'MiniMax-Text-01', name: 'MiniMax-Text-01' }
    ],
    helpUrl: 'https://platform.minimax.chat/',
    helpText: '在 MiniMax 平台获取 API Key'
  },
  'stepfun': {
    name: '阶跃星辰',
    models: [
      { id: 'step-1v', name: 'step-1v' },
      { id: 'step-1o', name: 'step-1o' }
    ],
    helpUrl: 'https://platform.stepfun.com/',
    helpText: '在阶跃星辰平台获取 API Key'
  },
  'siliconflow': {
    name: 'SiliconFlow',
    models: [
      { id: 'Qwen/Qwen2-VL-72B-Instruct', name: 'Qwen2-VL-72B (推荐)' },
      { id: 'deepseek-ai/deepseek-vl2', name: 'DeepSeek-VL2' },
      { id: 'ZhipuAI/GLM-4.5V', name: 'GLM-4.5V' },
      { id: 'ZhipuAI/GLM-4.6V', name: 'GLM-4.6V' },
      { id: 'Qwen/Qwen2.5-VL-7B-Instruct', name: 'Qwen2.5-VL-7B' }
    ],
    helpUrl: 'https://siliconflow.cn/',
    helpText: '在 SiliconFlow 获取 API Key'
  },
  'deepseek': {
    name: 'DeepSeek',
    models: [
      { id: 'deepseek-chat', name: 'deepseek-chat' }
    ],
    helpUrl: 'https://platform.deepseek.com/',
    helpText: '在 DeepSeek 平台获取 API Key'
  },
  'ollama': {
    name: 'Ollama (本地)',
    models: [
      { id: 'llava', name: 'llava' },
      { id: 'llava:7b', name: 'llava:7b' },
      { id: 'llava:13b', name: 'llava:13b' }
    ],
    helpUrl: 'https://ollama.com/',
    helpText: '本地部署 Ollama 并下载 llava 模型，无需 API Key'
  }
};

// 获取 DOM 元素
const providerSelect = document.getElementById('provider');
const modelSelect = document.getElementById('model');
const apiKeyInput = document.getElementById('apiKey');
const apiKeyGroup = document.getElementById('apiKeyGroup');
const apiKeyHelp = document.getElementById('apiKeyHelp');
const saveBtn = document.getElementById('saveBtn');
const saveStatus = document.getElementById('saveStatus');

// 初始化服务商下拉框
function initProviderSelect() {
  providerSelect.innerHTML = '';
  
  for (const [id, provider] of Object.entries(API_PROVIDERS)) {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = provider.name;
    providerSelect.appendChild(option);
  }
}

// 更新模型下拉框
function updateModelSelect(providerId) {
  const provider = API_PROVIDERS[providerId];
  if (!provider) return;
  
  modelSelect.innerHTML = '';
  
  if (provider.models) {
    provider.models.forEach(model => {
      const option = document.createElement('option');
      option.value = model.id;
      option.textContent = model.name;
      modelSelect.appendChild(option);
    });
  }
  
  // 更新 API Key 帮助信息
  apiKeyHelp.innerHTML = `<a href="${provider.helpUrl}" target="_blank">${provider.helpText}</a>`;
  
  // Ollama 不需要 API Key
  if (providerId === 'ollama') {
    apiKeyGroup.style.display = 'none';
  } else {
    apiKeyGroup.style.display = 'block';
  }
}

// 页面加载时读取设置
async function loadSettings() {
  initProviderSelect();
  
  const settings = await chrome.storage.local.get(['provider', 'apiKey', 'model']);
  
  if (settings.provider) {
    providerSelect.value = settings.provider;
    updateModelSelect(settings.provider);
  } else {
    updateModelSelect('zhipu');
  }
  
  if (settings.apiKey) {
    apiKeyInput.value = settings.apiKey;
  }
  
  if (settings.model) {
    modelSelect.value = settings.model;
  }
}

// 保存设置
async function saveSettings() {
  const provider = providerSelect.value;
  const model = modelSelect.value;
  const apiKey = apiKeyInput.value.trim();
  
  const providerConfig = API_PROVIDERS[provider];
  
  // Ollama 不需要 API Key
  if (providerConfig && providerConfig.needsKey !== false && !apiKey) {
    showStatus('请输入 API Key', 'error');
    return;
  }
  
  try {
    await chrome.storage.local.set({ provider, model, apiKey });
    showStatus('保存成功!', 'success');
  } catch (error) {
    showStatus('保存失败: ' + error.message, 'error');
  }
}

// 显示状态消息
function showStatus(message, type) {
  saveStatus.textContent = message;
  saveStatus.className = 'save-status ' + type;
  
  if (type === 'success') {
    setTimeout(() => {
      saveStatus.textContent = '';
      saveStatus.className = 'save-status';
    }, 2000);
  }
}

// 事件监听
providerSelect.addEventListener('change', () => {
  updateModelSelect(providerSelect.value);
});

saveBtn.addEventListener('click', saveSettings);

// 页面加载时读取设置
loadSettings();
