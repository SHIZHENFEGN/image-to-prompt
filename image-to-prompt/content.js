// 图生提示词扩展 - 内容脚本
console.log('[图生提示词] Content script loaded');

const PREVIEW_MODAL_ID = 'img-prompt-preview-modal';

function createFloatingButton(imgElement) {
  const imgSrc = imgElement.src;
  
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
  btn.title = '生成AI提示词';
  btn.dataset.imgSrc = imgSrc;
  
  document.body.appendChild(btn);
  
  updateButtonPosition(btn, imgElement);
  
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
  if (img.naturalWidth < 50 || img.naturalHeight < 50) return;
  createFloatingButton(img);
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

console.log('[图生提示词] 扩展已加载');

// 定期检查新图片
setInterval(function() {
  document.querySelectorAll('img').forEach(function(img) {
    if (!img.dataset.promptSetup && img.naturalWidth >= 50 && img.naturalHeight >= 50) {
      createFloatingButton(img);
    }
  });
}, 2000);
