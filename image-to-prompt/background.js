// API 服务商配置
const API_PROVIDERS = {
  'zhipu': {
    name: '智谱 AI',
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    models: [
      { id: 'glm-4v-flash', name: 'glm-4v-flash (推荐)' },
      { id: 'glm-4v', name: 'glm-4v' },
      { id: 'glm-4v-plus', name: 'glm-4v-plus' }
    ],
    needsKey: true,
    buildRequest: function(model, imageData) {
      return {
        model: model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: imageData } },
              { type: 'text', text: 'Please analyze this image in extreme detail. Include:\n1. Subject: appearance, expression, clothing, pose, action of people or objects\n2. Scene: environment, background, location, indoor or outdoor\n3. Text: any text, signs, posters, books, screen content - please identify and describe in detail (especially Chinese text)\n4. Lighting: light source direction, intensity, color temperature (warm/cool)\n5. Color: main color, color scheme, saturation\n6. Style: artistic style, art movement, era feel\n7. Composition: angle, depth of field, leading lines, symmetry/asymmetry\n8. Details: accessories, props, textures, materials\n\nOutput detailed English prompt for AI image generation. Only output the prompt. Include all visual details.' }
            ]
          }
        ]
      };
    },
    parseResponse: function(data) {
      return data.choices?.[0]?.message?.content || '';
    }
  },
  'moonshot': {
    name: '月之暗面',
    endpoint: 'https://api.moonshot.cn/v1/chat/completions',
    models: [
      { id: 'moonshot-v1-8k-vision', name: 'moonshot-v1-8k-vision' }
    ],
    needsKey: true,
    buildRequest: function(model, imageData) {
      return {
        model: model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: imageData } },
              { type: 'text', text: 'Please analyze this image in extreme detail. Include:\n1. Subject: appearance, expression, clothing, pose, action of people or objects\n2. Scene: environment, background, location, indoor or outdoor\n3. Text: any text, signs, posters, books, screen content - please identify and describe in detail (especially Chinese text)\n4. Lighting: light source direction, intensity, color temperature (warm/cool)\n5. Color: main color, color scheme, saturation\n6. Style: artistic style, art movement, era feel\n7. Composition: angle, depth of field, leading lines, symmetry/asymmetry\n8. Details: accessories, props, textures, materials\n\nOutput detailed English prompt for AI image generation. Only output the prompt. Include all visual details.' }
            ]
          }
        ]
      };
    },
    parseResponse: function(data) {
      return data.choices?.[0]?.message?.content || '';
    }
  },
  'baidu': {
    name: '百度智能云',
    endpoint: 'https://qianfan.baidubce.com/v3/chat/completions',
    models: [
      { id: 'eb-4', name: 'eb-4' }
    ],
    needsKey: true,
    authType: 'bce',
    buildRequest: function(model, imageData) {
      return {
        model: model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: imageData } },
              { type: 'text', text: 'Please analyze this image in extreme detail. Include:\n1. Subject: appearance, expression, clothing, pose, action of people or objects\n2. Scene: environment, background, location, indoor or outdoor\n3. Text: any text, signs, posters, books, screen content - please identify and describe in detail (especially Chinese text)\n4. Lighting: light source direction, intensity, color temperature (warm/cool)\n5. Color: main color, color scheme, saturation\n6. Style: artistic style, art movement, era feel\n7. Composition: angle, depth of field, leading lines, symmetry/asymmetry\n8. Details: accessories, props, textures, materials\n\nOutput detailed English prompt for AI image generation. Only output the prompt. Include all visual details.' }
            ]
          }
        ]
      };
    },
    parseResponse: function(data) {
      return data.choices?.[0]?.message?.content || '';
    }
  },
  'alibaba': {
    name: '阿里云',
    endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
    models: [
      { id: 'qwen-vl-max', name: 'qwen-vl-max (推荐)' },
      { id: 'qwen-vl-plus', name: 'qwen-vl-plus' }
    ],
    needsKey: true,
    authType: 'api-key',
    buildRequest: function(model, imageData) {
      return {
        model: model,
        input: {
          messages: [
            {
              role: 'user',
              content: [
                { image: imageData },
                { text: 'Please analyze this image in extreme detail. Include:\n1. Subject: appearance, expression, clothing, pose, action of people or objects\n2. Scene: environment, background, location, indoor or outdoor\n3. Text: any text, signs, posters, books, screen content - please identify and describe in detail (especially Chinese text)\n4. Lighting: light source direction, intensity, color temperature (warm/cool)\n5. Color: main color, color scheme, saturation\n6. Style: artistic style, art movement, era feel\n7. Composition: angle, depth of field, leading lines, symmetry/asymmetry\n8. Details: accessories, props, textures, materials\n\nOutput detailed English prompt for AI image generation. Only output the prompt. Include all visual details.' }
              ]
            }
          ]
        }
      };
    },
    parseResponse: function(data) {
      return data.output?.choices?.[0]?.message?.content || data.output?.text || '';
    }
  },
  'tencent': {
    name: '腾讯云',
    endpoint: 'https://hunyuan.tencentcloudapi.com/v2/chat/completions',
    models: [
      { id: 'hunyuan-vision', name: 'hunyuan-vision' }
    ],
    needsKey: true,
    authType: 'tc3',
    buildRequest: function(model, imageData) {
      return {
        model: model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: imageData } },
              { type: 'text', text: 'Please analyze this image in extreme detail. Include:\n1. Subject: appearance, expression, clothing, pose, action of people or objects\n2. Scene: environment, background, location, indoor or outdoor\n3. Text: any text, signs, posters, books, screen content - please identify and describe in detail (especially Chinese text)\n4. Lighting: light source direction, intensity, color temperature (warm/cool)\n5. Color: main color, color scheme, saturation\n6. Style: artistic style, art movement, era feel\n7. Composition: angle, depth of field, leading lines, symmetry/asymmetry\n8. Details: accessories, props, textures, materials\n\nOutput detailed English prompt for AI image generation. Only output the prompt. Include all visual details.' }
            ]
          }
        ]
      };
    },
    parseResponse: function(data) {
      return data.choices?.[0]?.message?.content || '';
    }
  },
  'baichuan': {
    name: '百川智能',
    endpoint: 'https://api.baichuan-ai.com/v3/chat/completions',
    models: [
      { id: 'Baichuan-4-Vision', name: 'Baichuan-4-Vision' }
    ],
    needsKey: true,
    buildRequest: function(model, imageData) {
      return {
        model: model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: imageData } },
              { type: 'text', text: 'Please analyze this image in extreme detail. Include:\n1. Subject: appearance, expression, clothing, pose, action of people or objects\n2. Scene: environment, background, location, indoor or outdoor\n3. Text: any text, signs, posters, books, screen content - please identify and describe in detail (especially Chinese text)\n4. Lighting: light source direction, intensity, color temperature (warm/cool)\n5. Color: main color, color scheme, saturation\n6. Style: artistic style, art movement, era feel\n7. Composition: angle, depth of field, leading lines, symmetry/asymmetry\n8. Details: accessories, props, textures, materials\n\nOutput detailed English prompt for AI image generation. Only output the prompt. Include all visual details.' }
            ]
          }
        ]
      };
    },
    parseResponse: function(data) {
      return data.choices?.[0]?.message?.content || '';
    }
  },
  'minimax': {
    name: 'MiniMax',
    endpoint: 'https://api.minimax.chat/v1/text/chatcompletion_v2',
    models: [
      { id: 'MiniMax-Text-01', name: 'MiniMax-Text-01' }
    ],
    needsKey: true,
    buildRequest: function(model, imageData) {
      return {
        model: model,
        messages: [
          {
            role: 'user',
            contents: [
              { type: 'text', text: 'Please analyze this image in extreme detail. Include:\n1. Subject: appearance, expression, clothing, pose, action of people or objects\n2. Scene: environment, background, location, indoor or outdoor\n3. Text: any text, signs, posters, books, screen content - please identify and describe in detail (especially Chinese text)\n4. Lighting: light source direction, intensity, color temperature (warm/cool)\n5. Color: main color, color scheme, saturation\n6. Style: artistic style, art movement, era feel\n7. Composition: angle, depth of field, leading lines, symmetry/asymmetry\n8. Details: accessories, props, textures, materials\n\nOutput detailed English prompt for AI image generation. Only output the prompt. Include all visual details.' },
              { type: 'image_url', image_url: { url: imageData } }
            ]
          }
        ]
      };
    },
    parseResponse: function(data) {
      return data.choices?.[0]?.message?.content?.[0]?.text || '';
    }
  },
  'stepfun': {
    name: '阶跃星辰',
    endpoint: 'https://api.stepfun.com/v1/chat/completions',
    models: [
      { id: 'step-1v', name: 'step-1v (推荐)' },
      { id: 'step-1o', name: 'step-1o' }
    ],
    needsKey: true,
    buildRequest: function(model, imageData) {
      return {
        model: model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: imageData } },
              { type: 'text', text: 'Please analyze this image in extreme detail. Include:\n1. Subject: appearance, expression, clothing, pose, action of people or objects\n2. Scene: environment, background, location, indoor or outdoor\n3. Text: any text, signs, posters, books, screen content - please identify and describe in detail (especially Chinese text)\n4. Lighting: light source direction, intensity, color temperature (warm/cool)\n5. Color: main color, color scheme, saturation\n6. Style: artistic style, art movement, era feel\n7. Composition: angle, depth of field, leading lines, symmetry/asymmetry\n8. Details: accessories, props, textures, materials\n\nOutput detailed English prompt for AI image generation. Only output the prompt. Include all visual details.' }
            ]
          }
        ]
      };
    },
    parseResponse: function(data) {
      return data.choices?.[0]?.message?.content || '';
    }
  },
  'siliconflow': {
    name: 'SiliconFlow',
    endpoint: 'https://api.siliconflow.cn/v1/chat/completions',
    models: [
      { id: 'Qwen/Qwen2-VL-72B-Instruct', name: 'Qwen2-VL-72B (推荐)' },
      { id: 'deepseek-ai/deepseek-vl2', name: 'DeepSeek-VL2' },
      { id: 'ZhipuAI/GLM-4.5V', name: 'GLM-4.5V' },
      { id: 'ZhipuAI/GLM-4.6V', name: 'GLM-4.6V' },
      { id: 'Qwen/Qwen2.5-VL-7B-Instruct', name: 'Qwen2.5-VL-7B' }
    ],
    needsKey: true,
    buildRequest: function(model, imageData) {
      return {
        model: model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: imageData } },
              { type: 'text', text: 'Please analyze this image in extreme detail. Include:\n1. Subject: appearance, expression, clothing, pose, action of people or objects\n2. Scene: environment, background, location, indoor or outdoor\n3. Text: any text, signs, posters, books, screen content - please identify and describe in detail (especially Chinese text)\n4. Lighting: light source direction, intensity, color temperature (warm/cool)\n5. Color: main color, color scheme, saturation\n6. Style: artistic style, art movement, era feel\n7. Composition: angle, depth of field, leading lines, symmetry/asymmetry\n8. Details: accessories, props, textures, materials\n\nOutput detailed English prompt for AI image generation. Only output the prompt. Include all visual details.' }
            ]
          }
        ]
      };
    },
    parseResponse: function(data) {
      return data.choices?.[0]?.message?.content || '';
    }
  },
  'deepseek': {
    name: 'DeepSeek',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    models: [
      { id: 'deepseek-chat', name: 'deepseek-chat' }
    ],
    needsKey: true,
    buildRequest: function(model, imageData) {
      return {
        model: model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: imageData } },
              { type: 'text', text: 'Please analyze this image in extreme detail. Include:\n1. Subject: appearance, expression, clothing, pose, action of people or objects\n2. Scene: environment, background, location, indoor or outdoor\n3. Text: any text, signs, posters, books, screen content - please identify and describe in detail (especially Chinese text)\n4. Lighting: light source direction, intensity, color temperature (warm/cool)\n5. Color: main color, color scheme, saturation\n6. Style: artistic style, art movement, era feel\n7. Composition: angle, depth of field, leading lines, symmetry/asymmetry\n8. Details: accessories, props, textures, materials\n\nOutput detailed English prompt for AI image generation. Only output the prompt. Include all visual details.' }
            ]
          }
        ]
      };
    },
    parseResponse: function(data) {
      return data.choices?.[0]?.message?.content || '';
    }
  },
  'ollama': {
    name: 'Ollama (本地)',
    endpoint: 'http://localhost:11434/api/chat',
    models: [
      { id: 'llava', name: 'llava (推荐)' },
      { id: 'llava:7b', name: 'llava:7b' },
      { id: 'llava:13b', name: 'llava:13b' }
    ],
    needsKey: false,
    buildRequest: function(model, imageData) {
      return {
        model: model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: imageData } },
              { type: 'text', text: 'Please analyze this image in extreme detail. Include:\n1. Subject: appearance, expression, clothing, pose, action of people or objects\n2. Scene: environment, background, location, indoor or outdoor\n3. Text: any text, signs, posters, books, screen content - please identify and describe in detail (especially Chinese text)\n4. Lighting: light source direction, intensity, color temperature (warm/cool)\n5. Color: main color, color scheme, saturation\n6. Style: artistic style, art movement, era feel\n7. Composition: angle, depth of field, leading lines, symmetry/asymmetry\n8. Details: accessories, props, textures, materials\n\nOutput detailed English prompt for AI image generation. Only output the prompt. Include all visual details.' }
            ]
          }
        ]
      };
    },
    parseResponse: function(data) {
      return data.message?.content || '';
    }
  }
};

// 默认配置
const DEFAULT_PROVIDER = 'zhipu';

console.log('[图生提示词] Background script loaded');

// 监听来自 popup/content 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[图生提示词] 收到消息:', request.type);
  
  if (request.type === 'GENERATE_PROMPT') {
    generatePrompt(request.imageData)
      .then(prompt => {
        console.log('[图生提示词] 生成成功');
        sendResponse({ success: true, prompt });
      })
      .catch(error => {
        console.error('[图生提示词] 生成失败:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
  
  if (request.type === 'GET_PROVIDERS') {
    sendResponse({ providers: API_PROVIDERS });
    return true;
  }
});

// 生成提示词
async function generatePrompt(imageData) {
  const { provider, apiKey, model } = await chrome.storage.local.get(['provider', 'apiKey', 'model']);
  
  if (!apiKey) {
    throw new Error('请先在设置页面配置 API Key');
  }

  const selectedProvider = provider || DEFAULT_PROVIDER;
  const providerConfig = API_PROVIDERS[selectedProvider];
  
  if (!providerConfig) {
    throw new Error('未知的 API 服务商');
  }

  const selectedModel = model || providerConfig.models[0]?.id;
  
  // 构建请求
  const requestBody = providerConfig.buildRequest(selectedModel, imageData);
  const headers = buildHeaders(providerConfig, apiKey);
  
  console.log('[图生提示词] 请求:', { provider: selectedProvider, model: selectedModel, endpoint: providerConfig.endpoint });
  
  const response = await fetch(providerConfig.endpoint, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(requestBody)
  });

  console.log('[图生提示词] 响应状态:', response.status);

  if (!response.ok) {
    let errorText = '';
    try {
      const errorData = await response.json();
      console.error('[图生提示词] API 错误:', JSON.stringify(errorData));
      errorText = errorData.error?.message || errorData.message || errorData.code || JSON.stringify(errorData);
    } catch (e) {
      try {
        errorText = await response.text();
      } catch (e2) {
        errorText = 'HTTP ' + response.status;
      }
    }
    throw new Error(errorText || 'API 请求失败: ' + response.status);
  }

  const data = await response.json();
  return providerConfig.parseResponse(data);
}

// 构建请求头
function buildHeaders(provider, apiKey) {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (provider.authType === 'bce') {
    headers['Authorization'] = apiKey;
  } else if (provider.authType === 'api-key') {
    headers['Authorization'] = 'Bearer ' + apiKey;
  } else {
    headers['Authorization'] = 'Bearer ' + apiKey;
  }
  
  return headers;
}
