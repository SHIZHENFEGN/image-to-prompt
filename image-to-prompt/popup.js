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
  'siliconflow': {
    name: 'SiliconFlow',
    models: [
      { id: 'Qwen/Qwen2-VL-72B-Instruct', name: 'Qwen2-VL-72B (推荐)' },
      { id: 'deepseek-ai/deepseek-vl2', name: 'DeepSeek-VL2' },
      { id: 'ZhipuAI/GLM-4.5V', name: 'GLM-4.5V' }
    ],
    helpUrl: 'https://cloud.siliconflow.com/',
    helpText: '在 SiliconFlow 获取'
  },
  'moonshot': {
    name: '月之暗面',
    models: [
      { id: 'moonshot-v1-8k-vision', name: 'moonshot-v1-8k-vision' }
    ],
    helpUrl: 'https://platform.moonshot.cn/',
    helpText: '在月之暗面平台获取'
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
      { id: 'llava', name: 'llava' },
      { id: 'llava:7b', name: 'llava:7b' }
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
  
  apiKeyHelp.innerHTML = '<a href="' + provider.helpUrl + '" target="_blank">' + provider.helpText + '</a>';
  
  if (providerId === 'ollama') {
    apiKeyGroup.style.display = 'none';
  } else {
    apiKeyGroup.style.display = 'block';
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

// 初始化
loadSettings();
updateModelSelect('zhipu');
