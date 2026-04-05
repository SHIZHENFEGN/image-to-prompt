// 图生提示词扩展 - 内容脚本
console.log('[图生提示词] Content script loaded');

const PREVIEW_MODAL_ID = 'img-prompt-preview-modal';
const EXTENSION_ID = 'img-prompt-extension';

// 本地存储键名
var STORAGE_KEY = 'img-prompt-disabled-images';
var SITE_STORAGE_KEY = 'img-prompt-disabled-sites';

// 初始化本地存储
function initStorage() {
  try {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(SITE_STORAGE_KEY)) {
      localStorage.setItem(SITE_STORAGE_KEY, JSON.stringify([]));
    }
  } catch (e) {
    console.log('[图生提示词] 本地存储不可用');
  }
}

// 获取禁用图片列表
function getDisabledImages() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

// 获取禁用站点列表
function getDisabledSites() {
  try {
    return JSON.parse(localStorage.getItem(SITE_STORAGE_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

// 禁用单个图片
function disableImage(imgSrc) {
  var disabled = getDisabledImages();
  if (disabled.indexOf(imgSrc) === -1) {
    disabled.push(imgSrc);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(disabled));
  }
}

// 禁用当前站点
function disableCurrentSite() {
  var hostname = window.location.hostname;
  var disabled = getDisabledSites();
  if (disabled.indexOf(hostname) === -1) {
    disabled.push(hostname);
    localStorage.setItem(SITE_STORAGE_KEY, JSON.stringify(disabled));
  }
}

// 检查图片是否被禁用
function isImageDisabled(imgSrc) {
  var disabled = getDisabledImages();
  for (var i = 0; i < disabled.length; i++) {
    if (imgSrc.indexOf(disabled[i]) !== -1) {
      return true;
    }
  }
  return false;
}

// 检查站点是否被禁用
function isSiteDisabled() {
  var hostname = window.location.hostname;
  var disabled = getDisabledSites();
  for (var i = 0; i < disabled.length; i++) {
    if (hostname.indexOf(disabled[i]) !== -1) {
      return true;
    }
  }
  return false;
}

// 默认黑名单域名（不显示悬浮按钮）
var SITE_BLACKLIST = [
  'github.com',
  'githubusercontent.com',
  'gitlab.com',
  'bitbucket.org'
];

function isSiteBlacklisted() {
  var hostname = window.location.hostname.toLowerCase();
  var href = window.location.href.toLowerCase();
  
  for (var i = 0; i < SITE_BLACKLIST.length; i++) {
    if (hostname.indexOf(SITE_BLACKLIST[i]) !== -1 || href.indexOf(SITE_BLACKLIST[i]) !== -1) {
      return true;
    }
  }
  return false;
}

function createFloatingButton(imgElement) {
  // 检查站点黑名单
  if (isSiteBlacklisted() || isSiteDisabled()) {
    return;
  }
  
  const imgSrc = imgElement.src;
  
  // 检查图片是否被用户禁用
  if (isImageDisabled(imgSrc)) {
    return;
  }
  
  if (imgElement.dataset.promptSetup === 'true') {
    const existingBtn = document.body.querySelector('.img-prompt-btn[data-img-src="' + CSS.escape(imgSrc) + '"]');
    if (existingBtn) {
      updateButtonPosition(existingBtn, imgElement);
      return existingBtn;
    }
  }
  
  imgElement.dataset.promptSetup = 'true';
  
  const btn = document.createElement('button');
  btn.className = 'img-prompt-btn';
  btn.innerHTML = getBtnIconHTML();
  btn.title = '生成AI提示词 (右键禁用)';
  btn.dataset.imgSrc = imgSrc;
  
  document.body.appendChild(btn);
  
  updateButtonPosition(btn, imgElement);
  
  // 右键菜单 - 禁用图片或站点
  btn.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    showContextMenu(e.clientX, e.clientY, imgSrc, imgElement);
  });
  
  // 点击按钮显示浮动窗口
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('[图生提示词] 按钮点击事件触发');
    
    getImageData(imgElement).then(function(imgData) {
      console.log('[图生提示词] 图片数据获取成功');
      showFloatingWindow(imgData, imgElement);
    }).catch(function(error) {
      console.error('[图生提示词] 获取图片失败:', error);
      alert('获取图片失败: ' + error.message);
    });
  });
  
  // 鼠标悬停显示按钮
  imgElement.addEventListener('mouseenter', function() {
    updateButtonPosition(btn, imgElement);
    btn.classList.add('visible');
  });

  // 鼠标移到按钮上时保持显示
  btn.addEventListener('mouseenter', function() {
    btn.classList.add('visible');
  });

  btn.addEventListener('mouseleave', function() {
    setTimeout(function() {
      if (!btn.matches(':hover')) {
        btn.classList.remove('visible');
      }
    }, 200);
  });
  
  // 鼠标移出图片时延迟隐藏
  imgElement.addEventListener('mouseleave', function() {
    setTimeout(function() {
      if (!btn.matches(':hover') && !imgElement.matches(':hover')) {
        btn.classList.remove('visible');
      }
    }, 300);
  });

  return btn;
}

// 显示右键菜单
function showContextMenu(x, y, imgSrc, imgElement) {
  removeContextMenu();
  
  var menu = document.createElement('div');
  menu.className = 'img-prompt-context-menu';
  menu.style.position = 'fixed';
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
  menu.style.zIndex = '2147483647';
  
  var menuItems = [
    {
      text: '禁用此图片',
      action: function() {
        disableImage(imgSrc);
        var btn = document.body.querySelector('.img-prompt-btn[data-img-src="' + CSS.escape(imgSrc) + '"]');
        if (btn) btn.remove();
        imgElement.dataset.promptSetup = 'false';
        removeContextMenu();
      }
    },
    {
      text: '禁用整个站点',
      action: function() {
        disableCurrentSite();
        document.body.querySelectorAll('.img-prompt-btn').forEach(function(btn) {
          btn.remove();
        });
        removeContextMenu();
      }
    },
    {
      text: '恢复所有禁用',
      action: function() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        localStorage.setItem(SITE_STORAGE_KEY, JSON.stringify([]));
        removeContextMenu();
        location.reload();
      }
    }
  ];
  
  menuItems.forEach(function(item) {
    var menuItem = document.createElement('div');
    menuItem.className = 'img-prompt-context-menu-item';
    menuItem.textContent = item.text;
    menuItem.addEventListener('click', item.action);
    menu.appendChild(menuItem);
  });
  
  document.body.appendChild(menu);
  
  // 点击其他位置关闭菜单
  var closeMenu = function(e) {
    removeContextMenu();
    document.removeEventListener('click', closeMenu);
  };
  setTimeout(function() {
    document.addEventListener('click', closeMenu);
  }, 100);
}

// 移除右键菜单
function removeContextMenu() {
  var menu = document.querySelector('.img-prompt-context-menu');
  if (menu) menu.remove();
}

function updateButtonPosition(btn, imgElement) {
  const rect = imgElement.getBoundingClientRect();
  const btnWidth = 32;
  const btnHeight = 32;
  const offset = 4;
  
  btn.style.left = (rect.right - btnWidth - offset) + 'px';
  btn.style.top = (rect.bottom - btnHeight - offset) + 'px';
}

function getBtnIconHTML() {
  return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getImageData(imgElement) {
  return new Promise(function(resolve, reject) {
    const src = imgElement.src;
    
    if (src.startsWith('data:')) {
      resolve(src);
      return;
    }
    
    fetch(src).then(function(response) {
      if (response.ok) {
        return response.blob();
      }
      throw new Error('Fetch failed');
    }).then(function(blob) {
      const reader = new FileReader();
      reader.onloadend = function() {
        resolve(reader.result);
      };
      reader.onerror = function() {
        reject(new Error('文件读取失败'));
      };
      reader.readAsDataURL(blob);
    }).catch(function(e) {
      // 回退方案
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        let width = img.naturalWidth;
        let height = img.naturalHeight;
        const maxSize = 1024;
        
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        try {
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        } catch (e) {
          reject(new Error('Canvas 处理失败'));
        }
      };
      
      img.onerror = function() {
        reject(new Error('图片加载失败'));
      };
      img.src = src;
    });
  });
}

function showFloatingWindow(imgData, imgElement) {
  removeFloatingWindow();
  
  const windowEl = document.createElement('div');
  windowEl.className = 'img-prompt-floating-window';
  windowEl.id = PREVIEW_MODAL_ID;
  
  windowEl.innerHTML = 
    '<div class="img-prompt-floating-drag-handle">' +
      '<span class="img-prompt-floating-title">AI生图提示词</span>' +
      '<button class="img-prompt-floating-close">&times;</button>' +
    '</div>' +
    '<div class="img-prompt-floating-content">' +
      '<div class="img-prompt-floating-preview">' +
        '<img src="' + imgData + '" alt="预览">' +
      '</div>' +
      '<button class="img-prompt-floating-btn">' +
        '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">' +
          '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>' +
        '</svg>' +
        '生成提示词' +
      '</button>' +
    '</div>';
  
  document.body.appendChild(windowEl);
  
  positionFloatingWindow(windowEl, imgElement);
  initDragFunctionality(windowEl);
  
  // 关闭按钮
  const closeBtn = windowEl.querySelector('.img-prompt-floating-close');
  closeBtn.addEventListener('click', removeFloatingWindow);
  
  let isGenerating = false;
  
  // 生成按钮点击事件
  const generateBtn = windowEl.querySelector('.img-prompt-floating-btn');
  const content = windowEl.querySelector('.img-prompt-floating-content');
  
  generateBtn.addEventListener('click', function() {
    console.log('[图生提示词] 生成按钮被点击, isGenerating:', isGenerating);
    if (isGenerating) return;
    isGenerating = true;
    
    generateBtn.classList.add('loading');
    generateBtn.innerHTML = '<span class="spinner"></span> 生成中...';
    
    console.log('[图生提示词] 发送请求到 background...');
    
    chrome.runtime.sendMessage({
      type: 'GENERATE_PROMPT',
      imageData: imgData
    }, function(response) {
      console.log('[图生提示词] 收到响应:', response);
      isGenerating = false;
      
      if (response && response.success) {
        const promptText = response.prompt;
        const lineCount = promptText.split('\n').length;
        const estimatedHeight = Math.min(Math.max(120, lineCount * 20 + 100), 400);
        
        content.innerHTML = 
          '<div class="img-prompt-result-wrapper">' +
            '<div class="img-prompt-result-preview">' +
              '<img src="' + imgData + '" alt="预览">' +
            '</div>' +
            '<div class="img-prompt-result-textarea-wrapper" style="max-height: ' + estimatedHeight + 'px">' +
              '<div class="img-prompt-result-textarea">' + escapeHtml(promptText) + '</div>' +
            '</div>' +
            '<button class="img-prompt-result-copy-btn">复制提示词</button>' +
          '</div>';
        
        content.querySelector('.img-prompt-result-copy-btn').addEventListener('click', function() {
          navigator.clipboard.writeText(promptText).then(function() {
            const copyBtn = content.querySelector('.img-prompt-result-copy-btn');
            copyBtn.textContent = '已复制!';
            copyBtn.classList.add('copied');
            setTimeout(function() {
              copyBtn.textContent = '复制提示词';
              copyBtn.classList.remove('copied');
            }, 2000);
          });
        });
      } else {
        content.innerHTML = 
          '<div class="img-prompt-result-wrapper">' +
            '<div class="img-prompt-result-error">' + (response?.error || '生成失败，请重试') + '</div>' +
            '<button class="img-prompt-result-retry-btn">重新生成</button>' +
          '</div>';
        
        content.querySelector('.img-prompt-result-retry-btn').addEventListener('click', function() {
          generateBtn.click();
        });
      }
    });
  });
  
  // 点击外部关闭
  const closeOnClickOutside = function(e) {
    if (isGenerating) return;
    if (windowEl.contains(e.target)) return;
    if (e.target.closest('.img-prompt-btn')) return;
    removeFloatingWindow();
    document.removeEventListener('click', closeOnClickOutside);
  };
  setTimeout(function() {
    document.addEventListener('click', closeOnClickOutside);
  }, 100);
}

function positionFloatingWindow(windowEl, imgElement) {
  const rect = imgElement.getBoundingClientRect();
  const windowWidth = 280;
  const padding = 16;
  
  const spaceRight = window.innerWidth - rect.right;
  const spaceLeft = rect.left;
  
  let left;
  
  if (spaceRight >= windowWidth + padding) {
    left = rect.right + padding;
  } else if (spaceLeft >= windowWidth + padding) {
    left = rect.left - windowWidth - padding;
  } else {
    left = Math.max(padding, (window.innerWidth - windowWidth) / 2);
  }
  
  let top = rect.top;
  
  if (top < padding) {
    top = padding;
  }
  
  windowEl.style.left = left + 'px';
  windowEl.style.top = top + 'px';
  windowEl.style.position = 'fixed';
}

function initDragFunctionality(windowEl) {
  const handle = windowEl.querySelector('.img-prompt-floating-drag-handle');
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  
  handle.addEventListener('mousedown', function(e) {
    if (e.target.classList.contains('img-prompt-floating-close')) return;
    
    isDragging = true;
    const rect = windowEl.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    
    windowEl.style.cursor = 'grabbing';
  });
  
  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    
    const x = e.clientX - dragOffsetX;
    const y = e.clientY - dragOffsetY;
    
    windowEl.style.left = x + 'px';
    windowEl.style.top = y + 'px';
  });
  
  document.addEventListener('mouseup', function() {
    if (isDragging) {
      isDragging = false;
      windowEl.style.cursor = 'grab';
    }
  });
  
  handle.style.cursor = 'grab';
}

function removeFloatingWindow() {
  const windowEl = document.getElementById(PREVIEW_MODAL_ID);
  if (windowEl) windowEl.remove();
}

// 监听新图片
const observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    mutation.addedNodes.forEach(function(node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'IMG') {
          setupImageHover(node);
        }
        if (node.querySelectorAll) {
          node.querySelectorAll('img').forEach(setupImageHover);
        }
      }
    });
  });
});

observer.observe(document.body, { childList: true, subtree: true });

function setupImageHover(img) {
  if (img.dataset.promptSetup === 'true') return;
  
  // 尺寸太小的不识别（logo、图标、头像、缩略图）
  if (img.naturalWidth < 200 || img.naturalHeight < 200) return;
  if (img.width < 200 || img.height < 200) return;
  
  // 跳过明显的 logo/图标/头像/缩略图
  if (isLikelyLogo(img)) return;
  
  createFloatingButton(img);
}

// 判断是否可能是 logo、头像、图标或小缩略图
function isLikelyLogo(img) {
  const src = (img.src || '').toLowerCase();
  const alt = (img.alt || '').toLowerCase();
  const className = (img.className || '').toLowerCase();
  const id = (img.id || '').toLowerCase();
  const parent = img.parentElement;
  const parentTag = parent?.tagName?.toLowerCase() || '';
  
  // ============ 最高优先级检测 ============
  
  // GitHub 头像 - 最先检测，因为太常见
  // avatars.githubusercontent.com 且包含 u/ 或 size= 或 v= 参数
  if (src.indexOf('avatars.githubusercontent') !== -1 || src.indexOf('githubusercontent') !== -1) {
    return true;
  }
  
  // data-component 属性检测（如 GitHub Avatar 组件）
  var dataComponent = (img.getAttribute('data-component') || '').toLowerCase();
  if (dataComponent.indexOf('avatar') !== -1 || dataComponent.indexOf('image') !== -1) {
    return true;
  }
  
  // data-testid 检测（如 github-avatar）
  var dataTestid = (img.getAttribute('data-testid') || '').toLowerCase();
  if (dataTestid.indexOf('avatar') !== -1 || dataTestid.indexOf('image') !== -1) {
    return true;
  }
  
  // srcset 检测（响应式图片通常是缩略图/头像）
  if (img.srcset && img.srcset.length > 0) {
    return true;
  }
  
  // alt 文本是纯用户名（不是图片描述）
  // 如果 alt 是纯字母数字且较短，可能是用户名
  if (alt.length > 0 && alt.length < 30 && /^[\w\s\-]+$/.test(alt) && !alt.match(/\b(photo|image|picture|img|图|照片|图片)\b/i)) {
    // 且包含常见用户名关键词
    if (alt.match(/^\w+$/) || alt.match(/^(user|profile|name|person)/i)) {
      return true;
    }
  }
  
  // ============ 其他检测 ============
  
  // URL 包含常见 logo/头像/图标 关键词
  var logoKeywords = ['logo', 'icon', 'favicon', 'avatar', 'profile', 'user', 'photo', 'headshot', 'placeholder', 'spinner', 'loading', 'pixel', '1x1', 'blank', 'sprite', 'btn', 'button', 'nav', 'menu', 'social', 'share', 'thumb', 'thumbnail', 'small', 'mini'];
  for (var i = 0; i < logoKeywords.length; i++) {
    if (src.indexOf(logoKeywords[i]) !== -1) return true;
  }
  
  // 常见图标/头像后缀
  if (src.match(/\.(ico|svg)\?/) || src.indexOf('.ico') !== -1 || src.endsWith('.svg')) {
    return true;
  }
  
  // data URI 很短的通常是占位图
  if (src.startsWith('data:image') && src.length < 10000) {
    return true;
  }
  
  // alt 文本包含 logo/头像/图标 关键词
  var altKeywords = ['logo', 'icon', 'avatar', 'profile', '用户', '头像', '图标', '商标', '按钮', '头像', '缩略图', 'thumbnail', 'picture', 'photo of'];
  for (var j = 0; j < altKeywords.length; j++) {
    if (alt.indexOf(altKeywords[j]) !== -1) return true;
  }
  
  // class 包含常见 logo/icon/头像 类名（包括加密类名如 prc-Avatar-）
  var classKeywords = ['logo', 'icon', 'avatar', 'profile', 'user', 'photo', 'thumb', 'badge', 'flag', 'brand', 'sprite', 'nav', 'menu', 'btn', 'button', 'social', 'share', 'mini', 'small', 'tiny', 'round', 'circle', 'square', 'gravatar', 'member', 'author', 'dropdown', 'popover', 'image'];
  for (var k = 0; k < classKeywords.length; k++) {
    if (className.indexOf(classKeywords[k]) !== -1) return true;
  }
  
  // 如果类名包含 "Avatar"（不区分大小写）
  if (className.indexOf('avatar') !== -1) {
    return true;
  }
  
  // id 包含关键词
  var idKeywords = ['logo', 'icon', 'avatar', 'profile', 'user', 'brand', 'nav', 'menu', 'header', 'thumb', 'photo', 'gravatar', 'account', 'global'];
  for (var idIdx = 0; idIdx < idKeywords.length; idIdx++) {
    if (id.indexOf(idKeywords[idIdx]) !== -1) return true;
  }
  
  // 父元素是链接（通常是 logo 或头像链接）
  if (parentTag === 'a') {
    var parentClass = (parent.className || '').toLowerCase();
    var parentHref = (parent.href || '').toLowerCase();
    var parentAria = (parent.getAttribute('aria-label') || '').toLowerCase();
    if (parentClass.indexOf('logo') !== -1 || parentClass.indexOf('avatar') !== -1 || parentClass.indexOf('profile') !== -1 || 
        parentClass.indexOf('user') !== -1 || parentClass.indexOf('account') !== -1 ||
        parentHref.indexOf('logo') !== -1 || parentHref.indexOf('avatar') !== -1 ||
        parentAria.indexOf('logo') !== -1 || parentAria.indexOf('avatar') !== -1 || parentAria.indexOf('user') !== -1 || parentAria.indexOf('profile') !== -1) {
      return true;
    }
  }
  
  // 父元素是 figure 且包含 avatar 类名
  if (parentTag === 'figure') {
    var parentClass = (parent.className || '').toLowerCase();
    if (parentClass.indexOf('avatar') !== -1 || parentClass.indexOf('profile') !== -1 || parentClass.indexOf('user') !== -1) {
      return true;
    }
  }
  
  // 检查父元素是否在页面顶部导航区域
  if (parentTag === 'header' || parentTag === 'div') {
    var parentClass = (parent.className || '').toLowerCase();
    var parentId = (parent.id || '').toLowerCase();
    var parentStyle = (parent.getAttribute('style') || '').toLowerCase();
    
    // 顶部/右上角相关
    var cornerKeywords = ['header', 'nav', 'toolbar', 'action', 'user', 'profile', 'account', 'avatar', 'dropdown', 'menu', 'app', 'global', 'site', 'topbar', 'top-bar', 'right', 'login', 'signin', 'authenticated'];
    for (var ck = 0; ck < cornerKeywords.length; ck++) {
      if (parentClass.indexOf(cornerKeywords[ck]) !== -1 || parentId.indexOf(cornerKeywords[ck]) !== -1) {
        return true;
      }
    }
  }
  
  // 父元素是 header、nav、footer、aside 或 div（通常包含 logo/导航图标）
  if (parentTag === 'header' || parentTag === 'nav' || parentTag === 'footer' || parentTag === 'aside' || parentTag === 'div') {
    var parentClass = (parent.className || '').toLowerCase();
    var parentId = (parent.id || '').toLowerCase();
    var layoutKeywords = ['header', 'nav', 'footer', 'sidebar', 'brand', 'logo', 'toolbar', 'tool-bar', 'action', 'bottom', 'top-bar', 'user', 'profile', 'widget', 'card', 'app', 'global', 'site', 'login', 'signin', 'authenticated', 'header-wrapper', 'nav-wrapper'];
    for (var l = 0; l < layoutKeywords.length; l++) {
      if (parentClass.indexOf(layoutKeywords[l]) !== -1 || parentId.indexOf(layoutKeywords[l]) !== -1) {
        return true;
      }
    }
  }
  
  // 检查祖先元素
  var ancestor = parent;
  var maxChecks = 12;
  var count = 0;
  while (ancestor && count < maxChecks) {
    var ancTag = ancestor.tagName?.toLowerCase() || '';
    if (ancTag === 'header' || ancTag === 'nav' || ancTag === 'footer' || ancTag === 'aside') {
      var ancClass = (ancestor.className || '').toLowerCase();
      var ancId = (ancestor.id || '').toLowerCase();
      var layoutKw = ['header', 'nav', 'footer', 'sidebar', 'brand', 'logo', 'toolbar', 'action', 'user', 'profile', 'app', 'global', 'site', 'login', 'signin', 'authenticated'];
      for (var m = 0; m < layoutKw.length; m++) {
        if (ancClass.indexOf(layoutKw[m]) !== -1 || ancId.indexOf(layoutKw[m]) !== -1) {
          return true;
        }
      }
    }
    // 检查 article/main 等可能包含用户内容区域的祖先
    var articleTag = ancestor.tagName?.toLowerCase() || '';
    if (articleTag === 'article' || articleTag === 'main') {
      var ancClass = (ancestor.className || '').toLowerCase();
      if (ancClass.indexOf('comment') !== -1 || ancClass.indexOf('reply') !== -1 || ancClass.indexOf('user') !== -1 || ancClass.indexOf('author') !== -1) {
        return true;
      }
    }
    ancestor = ancestor.parentElement;
    count++;
  }
  
  // 极端比例可能是图标 (比例 > 1.8:1 或 < 1:1.8)
  var ratio = img.naturalWidth / img.naturalHeight;
  if (ratio > 1.8 || ratio < 0.56) {
    return true;
  }
  
  // 图片总尺寸很小（面积 < 40000 像素）
  if (img.naturalWidth * img.naturalHeight < 40000) {
    return true;
  }
  
  // 尺寸较小（任一边小于 250）
  if (img.naturalWidth < 250 || img.naturalHeight < 250) {
    return true;
  }
  
  // 在列表中（可能是列表项图标/头像）
  if (parentTag === 'ul' || parentTag === 'ol' || parentTag === 'li' || parentTag === 'dl' || parentTag === 'dt' || parentTag === 'dd') {
    return true;
  }
  
  // 父元素是 article 或 section 中的小图片
  var ancestor2 = parent;
  var count2 = 0;
  while (ancestor2 && count2 < 4) {
    var ancTag2 = ancestor2.tagName?.toLowerCase() || '';
    if (ancTag2 === 'article' || ancTag2 === 'section' || ancTag2 === 'main') {
      var ancClass2 = (ancestor2.className || '').toLowerCase();
      if (ancClass2.indexOf('comment') !== -1 || ancClass2.indexOf('post') !== -1 || ancClass2.indexOf('item') !== -1 || ancClass2.indexOf('list') !== -1 || ancClass2.indexOf('feed') !== -1) {
        return true;
      }
    }
    ancestor2 = ancestor2.parentElement;
    count2++;
  }
  
  // 检查是否有 data-src 或 lazy load（可能是缩略图）
  if (img.dataset.src || img.dataset.lazySrc || img.dataset.lazyLoad || img.getAttribute('loading') === 'lazy') {
    if (img.naturalWidth < 300 || img.naturalHeight < 300) {
      return true;
    }
  }
  
  return false;
}

// 滚动时更新按钮位置
function updateAllButtonPositions() {
  document.querySelectorAll('.img-prompt-btn').forEach(function(btn) {
    const imgSrc = btn.dataset.imgSrc;
    if (!imgSrc) return;
    
    const img = document.querySelector('img[src="' + CSS.escape(imgSrc) + '"]');
    if (img) {
      updateButtonPosition(btn, img);
    }
  });
}

window.addEventListener('scroll', function() {
  requestAnimationFrame(updateAllButtonPositions);
}, { passive: true });

// 初始化已有图片
document.querySelectorAll('img').forEach(setupImageHover);

// 初始化本地存储
initStorage();

console.log('[图生提示词] 扩展已加载');

// 定期检查新图片
setInterval(function() {
  document.querySelectorAll('img').forEach(function(img) {
    if (!img.dataset.promptSetup && img.naturalWidth >= 50 && img.naturalHeight >= 50) {
      createFloatingButton(img);
    }
  });
}, 2000);
