(function() {
    const CONFIG = {
      shareUrl: 'https://gpt域名', // 请替换为您的实际 shareUrl
    };
    const DOMAIN = CONFIG.shareUrl;
    let menu;
    let menuButton;
    let enableSiteShop = false;
  
    // 添加获取配置的函数
    async function fetchConfig() {
      try {
        const response = await fetch(DOMAIN + '/public-api/site/config');
        const { code, data } = await response.json();
        if (code === 200) {
          enableSiteShop = data.enableSiteShop === true || data.enableSiteShop === 'true';
          console.log('Shop enabled:', enableSiteShop);
        }
      } catch (error) {
        console.error('获取配置失败:', error);
        enableSiteShop = false; // 出错时默认禁用
      }
    }
  
    // 在创建菜单之前获取最新配置
    async function initMenu() {
      await fetchConfig();
      await createMenu();
    }
  
    function createMenuIcon() {
      const htmlClass = document.documentElement.className;
      return htmlClass === 'dark' 
        ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>'
        : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
    }
  
    // 创建菜单
    async function createMenu() {
      if (document.getElementById('menuButton')) return;
  
      // 菜单项配置
      const menuItems = [
        {
          text: "回到首页",
          action: () => { window.location.href = DOMAIN + "/list/#/home"; }
        },
      ];
  
      // 根据enableSiteShop状态添加套餐商店选项
      if (enableSiteShop) {
        menuItems.push({
          text: "套餐商店",
          action: () => {
            createShopModal();
          }
        });
      }
  
      // 创建菜单按钮
      menuButton = document.createElement('div');
      menuButton.id = 'menuButton';
      Object.assign(menuButton.style, {
        position: "fixed",
        right: "20px",
        top: "10%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        cursor: "pointer",
        zIndex: "1000"
      });
      menuButton.innerHTML = createMenuIcon();
  
      // 创建菜单容器
      menu = document.createElement('div');
      menu.id = 'menu';
      Object.assign(menu.style, {
        position: "fixed",
        right: "20px",
        top: "15%",
        background: "white",
        borderRadius: "10px",
        padding: "10px 0",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        display: "none",
        zIndex: "999"
      });
  
      // 添加菜单项
      menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        Object.assign(menuItem.style, {
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          whiteSpace: "nowrap"
        });
        
        menuItem.innerHTML = `<span style="color: #111;">${item.text}</span>`;
        menuItem.addEventListener('click', item.action);
        
        menu.appendChild(menuItem);
      });
  
      // 添加到页面
      document.body.appendChild(menuButton);
      document.body.appendChild(menu);
  
      // 添加事件监听
      menuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.style.display = menu.style.display === "none" ? "block" : "none";
      });
  
      document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !menuButton.contains(e.target)) {
          menu.style.display = "none";
        }
      });
    }
  
    // 创建商店模态框
    function createShopModal() {
      const modal = document.createElement('div');
      Object.assign(modal.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        height: '80%',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        zIndex: '2000',
        display: 'flex',
        flexDirection: 'column'
      });
  
      // 创建标题栏
      const titleBar = document.createElement('div');
      Object.assign(titleBar.style, {
        padding: '10px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      });
      titleBar.innerHTML = '<span>套餐商店</span>';
  
      // 创建关闭按钮
      const closeButton = document.createElement('button');
      Object.assign(closeButton.style, {
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        fontSize: '20px'
      });
      closeButton.innerHTML = '×';
      closeButton.onclick = () => {
        modal.remove();
        overlay.remove();
      };
      titleBar.appendChild(closeButton);
  
      // 创建iframe
      const iframe = document.createElement('iframe');
      Object.assign(iframe.style, {
        width: '100%',
        height: '100%',
        border: 'none'
      });
      iframe.src = DOMAIN + "/list/#/shop";
  
      // 创建遮罩层
      const overlay = document.createElement('div');
      Object.assign(overlay.style, {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: '1999'
      });
      overlay.onclick = () => {
        modal.remove();
        overlay.remove();
      };
  
      // 组装模态框
      modal.appendChild(titleBar);
      modal.appendChild(iframe);
      document.body.appendChild(overlay);
      document.body.appendChild(modal);
    }
  
    // 确保菜单始终存在
    async function ensureMenu() {
      if (!document.getElementById('menuButton')) {
        await initMenu();
      }
      requestAnimationFrame(ensureMenu);
    }
  
    // 启动
    ensureMenu();
  })();