// API 配置
var API_PROVIDERS = {
  'zhipu': {
    name: '智谱 AI',
    models: [
      { id: 'glm-4v-flash', name: 'glm-4v-flash (推荐)' },
      { id: 'glm-4v', name: 'glm-4v' },
      { id: 'glm-4v-plus', name: 'glm-4v-plus' }
    ],
    helpUrl: 'https://open.bigmodel.cn/',
    helpText: '在智谱 AI 开放平台获取'
  },
  'moonshot': {
    name: '月之暗面',
    models: [
      { id: 'moonshot-v1-8k-vision', name: 'moonshot-v1-8k-vision' }
    ],
    helpUrl: 'https://platform.moonshot.cn/',
    helpText: '在月之暗面平台获取'
  },
  'baidu': {
    name: '百度智能云',
    models: [
      { id: 'eb-4', name: 'eb-4' }
    ],
    helpUrl: 'https://qianfan.baidubce.com/',
    helpText: '在百度智能云获取'
  },
  'alibaba': {
    name: '阿里云',
    models: [
      { id: 'qwen-vl-max', name: 'qwen-vl-max (推荐)' },
      { id: 'qwen-vl-plus', name: 'qwen-vl-plus' }
    ],
    helpUrl: 'https://dashscope.aliyuncs.com/',
    helpText: '在阿里云百炼平台获取'
  },
  'tencent': {
    name: '腾讯云',
    models: [
      { id: 'hunyuan-vision', name: 'hunyuan-vision' }
    ],
    helpUrl: 'https://console.cloud.tencent.com/hunyuan',
    helpText: '在腾讯云获取'
  },
  'baichuan': {
    name: '百川智能',
    models: [
      { id: 'Baichuan-4-Vision', name: 'Baichuan-4-Vision' }
    ],
    helpUrl: 'https://www.baichuan-ai.com/',
    helpText: '在百川智能平台获取'
  },
  'minimax': {
    name: 'MiniMax',
    models: [
      { id: 'MiniMax-Text-01', name: 'MiniMax-Text-01' }
    ],
    helpUrl: 'https://platform.minimax.chat/',
    helpText: '在 MiniMax 平台获取'
  },
  'stepfun': {
    name: '阶跃星辰',
    models: [
      { id: 'step-1v', name: 'step-1v (推荐)' },
      { id: 'step-1o', name: 'step-1o' }
    ],
    helpUrl: 'https://platform.stepfun.cn/',
    helpText: '在阶跃星辰平台获取'
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
    helpUrl: 'https://cloud.siliconflow.com/',
    helpText: '在 SiliconFlow 获取'
  },
  'deepseek': {
    name: 'DeepSeek',
    models: [
      { id: 'deepseek-chat', name: 'deepseek-chat' }
    ],
    helpUrl: 'https://platform.deepseek.com/',
    helpText: '在 DeepSeek 平台获取'
  },
  'ollama': {
    name: 'Ollama (本地)',
    models: [
      { id: 'llava', name: 'llava (推荐)' },
      { id: 'llava:7b', name: 'llava:7b' },
      { id: 'llava:13b', name: 'llava:13b' }
    ],
    helpUrl: 'https://ollama.com/',
    helpText: '本地部署，无需 API Key'
  }
};

var providerSelect = document.getElementById('provider');
var modelSelect = document.getElementById('model');
var apiKeyInput = document.getElementById('apiKey');
var apiKeyGroup = document.getElementById('apiKeyGroup');
var apiKeyHelp = document.getElementById('apiKeyHelp');
var localModelTip = document.getElementById('localModelTip');
var saveBtn = document.getElementById('saveBtn');
var status = document.getElementById('status');

function updateModelSelect(providerId) {
  var provider = API_PROVIDERS[providerId];
  if (!provider) return;
  
  modelSelect.innerHTML = '';
  provider.models.forEach(function(m) {
    var option = document.createElement('option');
    option.value = m.id;
    option.textContent = m.name;
    modelSelect.appendChild(option);
  });
  
  if (providerId === 'ollama') {
    apiKeyGroup.style.display = 'none';
    localModelTip.style.display = 'block';
  } else {
    apiKeyGroup.style.display = 'block';
    localModelTip.style.display = 'none';
    apiKeyHelp.innerHTML = '<a href="' + provider.helpUrl + '" target="_blank">' + provider.helpText + '</a>';
  }
}

function loadSettings() {
  chrome.storage.local.get(['provider', 'apiKey', 'model'], function(settings) {
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
  });
}

function saveSettings() {
  var provider = providerSelect.value;
  var model = modelSelect.value;
  var apiKey = apiKeyInput.value.trim();
  
  var providerConfig = API_PROVIDERS[provider];
  
  if (providerConfig && providerConfig.helpText.indexOf('无需') === -1 && !apiKey) {
    showStatus('请输入 API Key', 'error');
    return;
  }
  
  chrome.storage.local.set({ provider: provider, model: model, apiKey: apiKey }, function() {
    showStatus('保存成功!', 'success');
  });
}

function showStatus(msg, type) {
  status.textContent = msg;
  status.className = 'status ' + type;
  if (type === 'success') {
    setTimeout(function() {
      status.textContent = '';
      status.className = 'status';
    }, 2000);
  }
}

// 事件监听
providerSelect.addEventListener('change', function() {
  updateModelSelect(providerSelect.value);
});

saveBtn.addEventListener('click', saveSettings);

// 帮助按钮 - 打开帮助页面
document.getElementById('helpBtn').addEventListener('click', function() {
  window.open(chrome.runtime.getURL('help.html'), '_blank');
});

// 初始化
loadSettings();
updateModelSelect('zhipu');
