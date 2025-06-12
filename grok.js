(function() {
  // 动态获取shareUrl的函数
  function getShareUrl() {
    // 方法1：从URL参数获取
    const urlParams = new URLSearchParams(window.location.search);
    const paramUrl = urlParams.get('shareUrl');
    if (paramUrl) {
      return paramUrl;
    }
    
    // 方法2：从document.referrer获取
    if (document.referrer) {
      try {
        const referrerUrl = new URL(document.referrer);
        return referrerUrl.origin;
      } catch (e) {
        console.warn('无法解析referrer URL:', e);
      }
    }
    
    // 默认值为空
    return '';
  }

  const DOMAIN = getShareUrl();
  console.log('当前使用的域名:', DOMAIN);
  
  let homeButton;
  let tooltip;

  // 创建首页图标
  function createHomeIcon() {
    return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9,22 9,12 15,12 15,22"></polyline></svg>';
  }

  // 创建回首页按钮
  function createHomeButton() {
    if (document.getElementById('homeButton')) return;

    // 创建提示文字
    tooltip = document.createElement('div');
    tooltip.id = 'homeTooltip';
    tooltip.textContent = '回到首页';
    Object.assign(tooltip.style, {
      position: "fixed",
      background: "rgba(0, 0, 0, 0.8)",
      color: "white",
      padding: "6px 10px",
      borderRadius: "6px",
      fontSize: "12px",
      whiteSpace: "nowrap",
      zIndex: "1001",
      opacity: "0",
      transition: "opacity 0.3s ease",
      pointerEvents: "none",
      fontFamily: "Arial, sans-serif"
    });

    homeButton = document.createElement('div');
    homeButton.id = 'homeButton';
    Object.assign(homeButton.style, {
      position: "fixed",
      right: "20px",
      top: "10%",
      width: "50px",
      height: "50px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      borderRadius: "50%",
      cursor: "pointer",
      zIndex: "1000",
      boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
      transition: "all 0.3s ease",
      border: "2px solid rgba(255,255,255,0.3)"
    });
    
    homeButton.innerHTML = `<div style="color: white;">${createHomeIcon()}</div>`;
    
    // 添加悬停效果
    homeButton.addEventListener('mouseenter', (e) => {
      homeButton.style.transform = 'scale(1.1)';
      homeButton.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
      
      // 显示提示文字
      const rect = homeButton.getBoundingClientRect();
      tooltip.style.right = (window.innerWidth - rect.left + 10) + 'px';
      tooltip.style.top = (rect.top + rect.height / 2 - 12) + 'px'; // 12px是大约的tooltip高度的一半
      tooltip.style.opacity = '1';
    });
    
    homeButton.addEventListener('mouseleave', () => {
      homeButton.style.transform = 'scale(1)';
      homeButton.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
      
      // 隐藏提示文字
      tooltip.style.opacity = '0';
    });

    // 点击事件 - 回到首页
    homeButton.addEventListener('click', () => {
      const homeUrl = DOMAIN ? DOMAIN + "/list/#/home" : "/list/#/home";
      window.location.href = homeUrl;
    });

    // 添加到页面
    document.body.appendChild(tooltip);
    document.body.appendChild(homeButton);
  }

  // 确保按钮始终存在
  function ensureHomeButton() {
    if (!document.getElementById('homeButton') || !document.getElementById('homeTooltip')) {
      createHomeButton();
    }
    requestAnimationFrame(ensureHomeButton);
  }

  // 启动
  console.log('回首页按钮脚本加载完成');
  
  // 确保页面加载完成后再创建按钮
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureHomeButton);
  } else {
    ensureHomeButton();
  }
})();
