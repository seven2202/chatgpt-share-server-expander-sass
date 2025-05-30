let $menu;
let $menuButton;
let validityText;
let usageText;
let htmlClass = document.documentElement.classList.contains('dark') ? 'dark' : '';
let isVisitor = getCookie('visitor');
let FAQ;
let siteNotice;
let backApiUrl;
let enableSiteShop;
let fkAddress;
let originUrl = window.location.origin;
let enableExpirationReminder;
let enableNoLogin;
let enableBackNode;
let enableShowRemaining;
let enableNoSelectCar;
let closeCardExchange;

// Utility function to get cookie value
function getCookie (name) {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
      return cookie.substring(name.length + 1);
    }
  }
  return undefined;
}

// Load external scripts more reliably
function loadExternalScript (url, callback) {
  // Check if script already exists to avoid duplication
  const existingScript = document.querySelector(`script[src="${url}"]`);
  if (existingScript) {
    console.log(`Script already loaded: ${url}`);
    if (callback) callback();
    return;
  }
  
  let script = document.createElement('script');
  script.src = url;
  script.type = 'text/javascript';
  
  // Set onload before setting src to avoid race conditions
  script.onload = () => {
    console.log(`Script loaded successfully: ${url}`);
    if (callback) callback();
  };
  
  script.onerror = () => {
    console.error(`Failed to load script: ${url}`);
    // Call callback anyway to continue sequence
    if (callback) callback();
  };
  
  document.head.appendChild(script);
}

// Main initialization function
function init () {
  console.log("Initializing custom UI...");

  // First add styles before jQuery loads to prevent FOUC
  addAllStyles();
  
  // Add OpenAI visitor styles immediately
  addOpenAIStyles();

  // Load jQuery if it's not already loaded
  if (typeof jQuery === 'undefined') {
    loadExternalScript('/jquery.min.js', function () {
      console.log('jQuery loaded');
      loadRequiredScripts();
    });
  } else {
    console.log('jQuery already loaded');
    loadRequiredScripts();
  }
  
  // Set up initializers that don't require jQuery
  setupBasicEventListeners();
}

// Set up basic event listeners that don't require jQuery
function setupBasicEventListeners() {
  // Listen for theme changes to update UI accordingly
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'class' && 
          mutation.target === document.documentElement) {
        // Theme has changed, update styles
        htmlClass = document.documentElement.classList.contains('dark') ? 'dark' : '';
        if (document.getElementById('menuButton')) {
          document.getElementById('menuButton').innerHTML = createMenuIcon();
        }
      }
    });
  });
  
  observer.observe(document.documentElement, { attributes: true });
  
  // Set up other event listeners that don't require jQuery
  document.addEventListener('click', function(e) {
    // Handle clicks outside the menu to close it
    const menu = document.getElementById('menu');
    const menuButton = document.getElementById('menuButton');
    
    if (menu && menuButton && showMenu() && 
        !menu.contains(e.target) && 
        !menuButton.contains(e.target)) {
      menu.style.display = 'none';
    }
  });
}

// Load the required scripts in sequence
function loadRequiredScripts () {
  loadExternalScript(
    '/app/libs/dom-to-image_nofonts.js',
    function () {
      loadExternalScript(
        '/app/libs/FileSaver.min.js',
        function () {
          loadExternalScript(
            '/app/libs/mhtmlToWord.js',
            function () {
              // Initialize after all scripts are loaded - ONLY INITIALIZE ONCE
              initCustomUI();
              // Get config first, then create menu after config is loaded
              getConfig();
            }
          );
        }
      );
    }
  );
}

// Add custom icons CSS to replace layui icons
function addCustomIconsStyles () {
  if (document.getElementById('custom-icons-styles')) return;

  const style = document.createElement('style');
  style.id = 'custom-icons-styles';
  style.textContent = `
    .custom-icon {
      font-size: 16px;
      font-style: normal;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      display: inline-block;
      margin-right: 8px;
    }
    
    .custom-icon-home:before { content: '馃彔'; }
    .custom-icon-util:before { content: '馃攧'; }
    .custom-icon-user:before { content: '馃懁'; }
    .custom-icon-diamond:before { content: '馃拵'; }
    .custom-icon-notice:before { content: '馃摙'; }
    .custom-icon-read:before { content: '馃摉'; }
    .custom-icon-file:before { content: '馃搫'; }
    .custom-icon-picture:before { content: '馃柤锔?; }
    .custom-icon-mike:before { content: '馃帳'; }
    .custom-icon-senior:before { content: '馃'; }
    .custom-icon-website:before { content: '馃寪'; }
    .custom-icon-logout:before { content: '馃毆'; }
    .custom-icon-gift:before { content: '馃巵'; }
    .custom-icon-key:before { content: '馃攽'; }
    .custom-icon-right:before { content: '鉃★笍'; }
    
    .custom-font-20 {
      font-size: 20px;
    }
    
    .custom-btn {
      display: inline-block;
      height: 38px;
      line-height: 38px;
      padding: 0 18px;
      background-color: #009688;
      color: #fff;
      white-space: nowrap;
      text-align: center;
      font-size: 14px;
      border: none;
      border-radius: 2px;
      cursor: pointer;
      transition: all .3s;
      -webkit-transition: all .3s;
      box-sizing: border-box;
    }
    
    .custom-btn:hover {
      opacity: 0.8;
    }
    
    .custom-btn-radius {
      border-radius: 100px;
    }
    
    .custom-bg-black {
      background-color: #393D49;
    }
    
    .custom-bg-primary {
      background-color: #fff;
      color: #666;
      border: 1px solid #eee;
    }
    
    .custom-hide {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
}

// Add custom styles to replace layui's styles
function addCustomStyles () {
  if (document.getElementById('custom-ui-styles')) return;

  const style = document.createElement('style');
  style.id = 'custom-ui-styles';
  style.textContent = `
    .custom-input {
      height: 38px;
      line-height: 1.3;
      border-width: 1px;
      border-style: solid;
      background-color: #fff;
      border-radius: 2px;
      padding-left: 10px;
      width: 100%;
      box-sizing: border-box;
    }
    
    .custom-form-item {
      margin-bottom: 15px;
      clear: both;
    }
    
    .custom-btn-normal {
      background-color: #1E9FFF;
    }
    
    .custom-btn-fluid {
      width: 100%;
    }
    
    .custom-layer-rim {
      border: 6px solid #8D8D8D;
      border: 6px solid rgba(0,0,0,.3);
      border-radius: 5px;
    }
    
    .custom-hide {
      display: none !important;
    }
    
    /* Modal styles */
    .custom-modal-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.3);
      z-index: 19891014;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .custom-modal-content {
      background-color: white;
      border-radius: 2px;
      box-shadow: 1px 1px 50px rgba(0,0,0,.3);
      overflow: hidden;
      position: relative;
    }
    
    .custom-modal-title {
      padding: 0 80px 0 20px;
      height: 42px;
      line-height: 42px;
      border-bottom: 1px solid #eee;
      font-size: 14px;
      color: #333;
      overflow: hidden;
      background-color: #F8F8F8;
      border-radius: 2px 2px 0 0;
    }
    
    .custom-modal-close {
      position: absolute;
      right: 15px;
      top: 15px;
      font-size: 18px;
      color: #999;
      cursor: pointer;
      background: none;
      border: none;
    }
    
    .custom-modal-body {
      position: relative;
      padding: 20px;
      line-height: 24px;
      word-break: break-all;
      overflow-x: hidden;
      overflow-y: auto;
    }
    
    .custom-modal-footer {
      display: flex;
      justify-content: flex-end;
      padding: 15px;
      text-align: right;
      border-top: 1px solid #eee;
    }
    
    html.dark .custom-modal-footer {
      border-top: 1px solid #333;
    }
    
    .custom-modal-footer button {
      margin-left: 10px;
    }
    
    .custom-modal-content {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    
    .custom-modal-body {
      flex: 1;
      overflow: auto;
    }
    
    .custom-msg {
      min-width: 100px;
      background-color: rgba(0,0,0,.7);
      color: #fff;
      border-radius: 3px;
      padding: 10px 20px;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 19891015;
    }
    
    #menuButton {
      position: fixed;
      right: 20px;
      top: 10%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      cursor: pointer;
      z-index: 1000;
    }
    
    #menu {
      position: fixed;
      right: 20px;
      top: 15%;
      background: #222;
      border-radius: 10px;
      padding: 0;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 999;
      width: 240px;
      max-width: 80vw;
      color: white;
    }
    
    html.dark #menu {
      background: #222;
      color: #fff;
    }
    
    html.dark #menuButton {
      color: #fff;
    }
    
    html:not(.dark) #menuButton {
      color: #000;
    }
    
    @keyframes custom-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .custom-loader {
      display: inline-block;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #3498db;
      animation: custom-spin 1s linear infinite;
      margin-right: 10px;
    }
    
    /* Fix for visitor bottom area */
    .visitor-buttons {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 5px;
      margin-top: 5px;
    }
    
    .visitor-buttons .custom-btn {
      height: 36px;
      line-height: 34px;
      padding: 0 16px;
      font-size: 14px;
      margin: 3px;
      flex: 1 1 auto;
      min-width: 80px;
      max-width: calc(50% - 6px);
    }
    
    /* Menu grid layout matching the screenshot */
    .menu-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    
    /* Dark theme menu item styling */
    .menu-item-dark {
      display: flex;
      align-items: center;
      padding: 10px;
      border-radius: 5px;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.2s ease;
      background: #333;
      color: white;
      text-decoration: none;
    }
    
    .menu-item-dark:hover {
      background: #444;
    }
    
    .menu-icon {
      width: 18px;
      height: 18px;
      margin-right: 8px;
      stroke-width: 2;
      stroke: currentColor;
    }
    
    /* Redemption button styling */
    .redemption-btn {
      background: #10a37f;
      color: white;
      border-radius: 4px;
      padding: 8px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .redemption-btn span {
      margin-left: 6px;
    }
    
    .redemption-btn:hover {
      background: #0d8c6d;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    
    /* Dark mode input fixes */
    html.dark .custom-modal-content {
      background-color: #333;
      color: white;
    }
    
    html.dark .custom-modal-title {
      background-color: #444;
      color: white;
      border-bottom: 1px solid #555;
    }
    
    html.dark .custom-input {
      background-color: #444;
      color: white;
      border-color: #555;
    }
    
    html.dark .custom-input::placeholder {
      color: #aaa;
    }
    
    /* Ensure icons display properly in all contexts */
    .custom-icon {
      display: inline-block !important;
      visibility: visible !important;
      opacity: 1 !important;
      font-size: 16px !important;
      margin-right: 8px !important;
    }
    
    /* Fix for visitor bottom buttons */
    .visitor-buttons button {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    
    .visitor-buttons button i {
      margin-right: 5px !important;
      font-size: 14px !important;
    }
  `;
  document.head.appendChild(style);
}

// Add all CSS at once to prevent FOUC
function addAllStyles() {
  // Add custom styles first
  addCustomStyles();
  
  // Add custom icons styles
  addCustomIconsStyles();
  
  // Add dynamic CSS for visitor buttons, scrolling fixes, etc.
  const dynamicStyles = document.createElement('style');
  dynamicStyles.id = 'dynamic-ui-styles';
  dynamicStyles.textContent = `
    div.h-full[class|=react-scroll-to-bottom--css]>div[class|=react-scroll-to-bottom--css] {
      overflow-y: auto;
      height: 100%;
    }
    
    /* Removed forced styles for visitor buttons */
    
    /* Basic styles for custom elements only */
    #menuButton {
      position: fixed;
      right: 20px;
      top: 10%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      cursor: pointer;
      z-index: 1000;
    }
    
    #menu {
      position: fixed;
      right: 20px;
      top: 15%;
      background: #222;
      border-radius: 10px;
      padding: 0;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 999;
      width: 240px;
      max-width: 80vw;
      color: white;
    }
    
    html.dark #menu {
      background: #222;
      color: #fff;
    }
    
    html.dark #menuButton {
      color: #fff;
    }
    
    html:not(.dark) #menuButton {
      color: #000;
    }
  `;
  
  // Only add if it doesn't exist already
  if (!document.getElementById('dynamic-ui-styles')) {
    document.head.appendChild(dynamicStyles);
  }
}

// Start initialization on page load
document.addEventListener('DOMContentLoaded', init);

function isMobile () {
  const userAgent = navigator.userAgent.toLowerCase();
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(
    userAgent
  );
};

// Custom modal implementation to replace layer.open
const customModal = {
  instances: [],
  nextId: 1,

  open: function (options) {
    const modalId = this.nextId++;

    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.className = 'custom-modal-container';
    modalContainer.id = `custom-modal-${modalId}`;

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'custom-modal-content';

    if (options.area) {
      modalContent.style.width = options.area[0];
      modalContent.style.height = options.area[1];
    }

    // Create title if specified
    if (options.title) {
      const titleDiv = document.createElement('div');
      titleDiv.className = 'custom-modal-title';

      if (Array.isArray(options.title)) {
        titleDiv.textContent = options.title[0];
        if (options.title[1]) {
          titleDiv.style.cssText += options.title[1];
        }
      } else {
        titleDiv.textContent = options.title;
      }

      modalContent.appendChild(titleDiv);
    }

    // Create close button
    if (options.closeBtn !== false) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'custom-modal-close';
      closeBtn.innerHTML = '&#215;'; // 脳 symbol
      closeBtn.onclick = () => {
        this.close(modalId);
        if (options.end) options.end();
      };

      modalContent.appendChild(closeBtn);
    }

    // Create content based on type
    const contentDiv = document.createElement('div');
    contentDiv.className = 'custom-modal-body';

    if (options.type === 1) {  // HTML content
      contentDiv.innerHTML = options.content;
    } else if (options.type === 2) {  // iframe
      const iframe = document.createElement('iframe');
      iframe.src = options.content;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      contentDiv.style.padding = '0';
      contentDiv.appendChild(iframe);
    }

    modalContent.appendChild(contentDiv);

    // Create buttons if specified
    if (options.btn && options.btn.length) {
      const btnContainer = document.createElement('div');
      btnContainer.className = 'custom-modal-footer';
      btnContainer.style.justifyContent = options.btnAlign || 'flex-end';

      options.btn.forEach((btnText, index) => {
        const btn = document.createElement('button');
        btn.textContent = btnText;
        btn.className = 'custom-btn';

        if (index === 0) {
          // Primary button
          btn.style.backgroundColor = '#009688';
          btn.style.color = 'white';
          btn.style.border = 'none';

          btn.onclick = function () {
            if (options.yes) {
              options.yes(modalId);
            } else {
              customModal.close(modalId);
            }
          };
        } else {
          // Secondary button
          btn.style.backgroundColor = '#f0f0f0';
          btn.style.color = '#333';
          btn.style.border = '1px solid #ddd';

          btn.onclick = function () {
            if (options[`btn${index + 1}`]) {
              options[`btn${index + 1}`]();
            } else {
              customModal.close(modalId);
            }
          };
        }

        btnContainer.appendChild(btn);
      });

      modalContent.appendChild(btnContainer);
    }

    modalContainer.appendChild(modalContent);
    document.body.appendChild(modalContainer);

    // Handle shade close
    if (options.shadeClose) {
      modalContainer.addEventListener('click', function (e) {
        if (e.target === modalContainer) {
          customModal.close(modalId);
          if (options.end) options.end();
        }
      });
    }

    // Store instance
    this.instances[modalId] = {
      container: modalContainer,
      options: options
    };

    // Execute success callback if provided
    if (options.success) {
      options.success(modalContainer, modalId);
    }

    return modalId;
  },

  close: function (id) {
    // Close specific modal if ID is provided
    if (id !== undefined) {
      if (this.instances[id]) {
        const container = this.instances[id].container;
        if (container && document.body.contains(container)) {
          document.body.removeChild(container);
        }
        delete this.instances[id];
      }
    } else {
      // Close all modals
      Object.keys(this.instances).forEach(id => {
        const container = this.instances[id].container;
        if (container && document.body.contains(container)) {
          document.body.removeChild(container);
        }
      });
      this.instances = [];
    }
  },

  msg: function (content, options = {}) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'custom-msg';

    // Handle icon
    if (options.icon === 16) {  // Loading icon
      const loader = document.createElement('div');
      loader.className = 'custom-loader';
      msgDiv.appendChild(loader);
    }

    // Message content
    const span = document.createElement('span');
    span.textContent = content;
    msgDiv.appendChild(span);

    document.body.appendChild(msgDiv);

    const msgId = this.nextId++;
    this.instances[msgId] = {
      container: msgDiv,
      options: options
    };

    // Auto remove after specified time unless disabled
    const duration = options.time === 0 ? 0 : (options.time || 3000);
    if (duration > 0) {
      setTimeout(() => {
        this.close(msgId);
      }, duration);
    }

    return msgId;
  },

  confirm: function (content, options = {}) {
    return this.open({
      title: options.title || '纭',
      content: content,
      type: 1,
      btn: ['纭畾', '鍙栨秷'],
      yes: function (index) {
        customModal.close(index);
        if (options.yes) options.yes();
      },
      btn2: function () {
        if (options.btn2) options.btn2();
      }
    });
  },

  closeAll: function () {
    this.close(); // No ID means close all
  }
};

function showAnnouncement (announcement) {
  const savedAnnouncement = localStorage.getItem('lastAnnouncement');
  console.log("savedAnnouncement", savedAnnouncement);
  console.log("announcement", announcement);
  if (announcement && savedAnnouncement !== announcement) {
    // 淇濆瓨鏂扮殑鍏憡鍒?localStorage
    const isMobileVal = isMobile();
    width = isMobileVal
      ? $(window).width()
      : 800 || Math.min($(window).width(), 1024);
    height = isMobileVal
      ? $(window).height()
      : 600 || Math.min($(window).height(), 800);
    customModal.open({
      type: 1,
      title: ['绯荤粺閫氱煡', 'font-size: 18px;'],
      shadeClose: true,
      shade: 0.2,
      maxmin: true,
      btn: ['鐭ラ亾浜?],
      btnAlign: 'right',
      scrollbar: false,
      offset: 'auto',
      area: [`${width}px`, `${height}px`],
      content: announcement,
      yes: function (index) {
        localStorage.setItem('lastAnnouncement', announcement);
        customModal.close(index); // 鍏抽棴绐楀彛
      }
    });
  }
}

// 淇敼鍏憡鑾峰彇鍑芥暟锛屾坊鍔犲欢杩?
function fetchAnnouncement () {
  console.log("璁″垝鑾峰彇鍏憡涓?..");
  
  // 闃叉閲嶅璇锋眰
  if (window.fetchingAnnouncement) {
    console.log("宸叉湁鍏憡璇锋眰杩涜涓紝璺宠繃");
    return;
  }
  
  window.fetchingAnnouncement = true;
  
  fetch('/api/notice/getLatestNotice', { method: 'GET' })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data) {
        const announcement = data?.data?.content;
        showAnnouncement(announcement);
      }
    })
    .catch((err) => {
      console.error('Error fetching the latest announcement:', err);
    })
    .finally(() => {
      window.fetchingAnnouncement = false;
    });
}

// 鍦ㄩ〉闈㈠畬鍏ㄥ姞杞藉悗寤惰繜鑾峰彇鍏憡
window.addEventListener('load', function() {
  // 寤惰繜3绉掑悗鑾峰彇鍏憡锛岀‘淇濋〉闈㈠凡瀹屽叏鍔犺浇骞舵覆鏌?
  setTimeout(function() {
    console.log("椤甸潰宸插畬鍏ㄥ姞杞斤紝寮€濮嬭幏鍙栧叕鍛?..");
    fetchAnnouncement();
  }, 3000);
});

const setLoading = (element) => {
  const loading = customModal.msg(element, {
    icon: 16,
    shade: 0.01,
    time: 0  // Don't auto-close
  });
  return loading;
};
const getMenuItemHtml = (text, iconName, onClick) => {
  // Convert from layui icon names to custom icon names if needed
  const iconClass = iconName.replace('layui-icon-', 'custom-icon-');

  return `<a style="flex:1;" class="flex gap-2 rounded p-2.5 text-sm cursor-pointer focus:ring-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700" onclick="${onClick};">
            <i class="custom-icon ${iconClass}" aria-hidden="true"></i>
            ${text}
          </a>`;
};

function getCurrentTitle () {
  let title = document.getElementsByClassName(
    'bg-token-sidebar-surface-secondary'
  )[0]?.innerText;
  if (title) {
    return title;
  } else {
    return null;
  }
}
function addDeliver () {
  let element = document.getElementsByClassName('markdown');
  Array.from(element).forEach((element) => {
    element.insertAdjacentHTML(
      'afterend',
      `<div class="dom-to-docx"><br><br>&nbsp;&nbsp;<br><br></div>`
    );
  });
}
function deleteDeliver () {
  let element = document.getElementsByClassName('dom-to-docx');
  Array.from(element).forEach((element) => {
    element.remove();
  });
}
function export2File () {
  // First check if we have content to export
  const markdownElements = document.querySelectorAll('.markdown.prose');
      
  if (!markdownElements || markdownElements.length === 0) {
    window.alert('鏈壘鍒拌亰澶╄褰? 鏃犳硶瀵煎嚭鏂囨。, 璇峰厛閫夋嫨涓€涓亰澶╄褰?);
    return;
  }
  
  // Check if required scripts are loaded
  if (typeof window.exportWord !== 'function') {
    loadDependencies(function() {
      // Try again after loading dependencies
      setTimeout(window.MinimalTools.exportDoc, 1000);
    });
    return;
  }
  
  // Get current title if available
  let title = '鑱婂ぉ璁板綍';
  const titleElement = document.querySelector('.bg-token-sidebar-surface-secondary');
  if (titleElement && titleElement.innerText) {
    title = titleElement.innerText;
  }
  
  // Add spacing elements for better formatting
  const spacers = [];
  markdownElements.forEach(function(element) {
    const spacer = document.createElement('div');
    spacer.className = 'dom-to-docx';
    spacer.innerHTML = '<br><br>&nbsp;&nbsp;<br><br>';
    element.insertAdjacentElement('afterend', spacer);
    spacers.push(spacer);
  });
  
  // Export the document
  try {
    window.exportWord({
      selector: '.markdown.prose',
      filename: title
    });
  } catch (e) {
    console.error('Export error:', e);
    window.alert('瀵煎嚭杩囩▼涓嚭閿欙紝璇风◢鍚庡啀璇?);
  }
  
  // Remove spacers
  spacers.forEach(function(spacer) {
    spacer.remove();
  });
}

// Helper function to load export dependencies
function loadExportDependencies(callback) {
  let dependenciesLoaded = 0;
  const requiredDependencies = 3; // dom-to-image, FileSaver, mhtmlToWord
  
  // Check if each script is already loaded
  function checkAllLoaded() {
    dependenciesLoaded++;
    if (dependenciesLoaded >= requiredDependencies) {
      callback();
    }
  }
  
  // Load dom-to-image if not already loaded
  if (!window.domtoimage) {
    loadExternalScript('/app/libs/dom-to-image_nofonts.js', checkAllLoaded);
  } else {
    checkAllLoaded();
  }
  
  // Load FileSaver if not already loaded
  if (!window.saveAs) {
    loadExternalScript('/app/libs/FileSaver.min.js', checkAllLoaded);
  } else {
    checkAllLoaded();
  }
  
  // Load mhtmlToWord if not already loaded
  if (!window.exportWord) {
    loadExternalScript('/app/libs/mhtmlToWord.js', checkAllLoaded);
  } else {
    checkAllLoaded();
  }
}

function isLogin () {
  if (isVisitor == 'true' || !isVisitor) {
    customModal.msg('鎮ㄨ繕鏈櫥褰?鏆傛椂鏃犳硶浣跨敤璇ュ姛鑳?);
    return false;
  }
  return true;
}

function showMenu () {
  if (isVisitor == 'true' || !isVisitor) {
    return false;
  }
  return true;
}


function banGptAccount (carid) {
  console.log('绂佺敤璐﹀彿', carid);
  fetch(`/api/session/updateGptStatus?carId=${carid}`, { method: 'GET' })
    .then((response) => {
      console.log('绂佺敤璐﹀彿缁撴灉', response);
    })
    .catch((error) => {
      console.error('绂佺敤璐﹀彿澶辫触', error);
    });
}


function getUserId () {
  const user = localStorage.getItem('user');
  let userId;

  if (user) {
    try {
      const parsedUser = JSON.parse(user);
      userId = parsedUser.id;
    } catch (e) {
      console.error('Error parsing JSON:', e);
    }
  }
  return userId;
}

function setSessionCookie (name, value) {
  // 璁＄畻30澶╁悗鐨勬椂闂?
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 30);

  // 璁剧疆cookie锛屽寘鍚繃鏈熸椂闂?
  document.cookie = `${name}=${value}; expires=${expirationDate.toUTCString()}; path=/`;
}
function deleteCookie (name) {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}
function logout () {
  deleteCookie('gfsessionid');
  setSessionCookie('visitor', true);
  localStorage.removeItem('accessToken');
  window.location.href = originUrl;
}

function autoSelectClaude () {
  if (isLogin()) {
    const loadIndex = setLoading('姝ｅ湪璺宠浆鍒癱laude,璇风◢鍚?..');
    const username = getCookie('username');
    fetch(
      `/api/claude/getClaudeLoginUrl?username=${encodeURIComponent(username)}`
    )
      .then((element) => {
        if (!element.ok) {
          throw new Error(`HTTP error! Status: ${element.status}`);
        }
        return element.text();
      })
      .then((element) => {
        console.log('Response from server:', element);
        let res;
        try {
          res = JSON.parse(element);
        } catch (error) {
          res = element;
        }
        if (typeof res === 'string') {
          window.location.href = res;
        } else {
          if (res && res.code !== 1) {
            console.log(res.msg);
            customModal.msg(res.msg);
          } else {
            customModal.msg('鏈兘鎴愬姛鑾峰彇Claude鐧诲綍鍦板潃,璇风◢鍚庨噸璇?);
          }
        }
      })
      .catch((element) => {
        console.error('There was a problem with the fetch operation:', element);
      })
      .finally(() => {
        customModal.close(loadIndex);
      });
  }
}
function autoSelectCarAction () {
  if (isLogin()) {
    const loadIndex = setLoading('姝ｅ湪涓烘偍鑷姩閫夎溅,璇风◢鍚?..');

    const token = localStorage.getItem('accessToken');
    if (!token) {
      customModal.msg('鎮ㄨ繕鏈櫥褰?璇峰厛鐧诲綍');
      goHome();
    }
    const username = getCookie('username');
    if (!username) {
      customModal.msg('鎮ㄨ繕鏈櫥褰曪紝璇峰厛鐧诲綍');
    }
    fetch(`/api/session/getIdleCar?username=${encodeURIComponent(username)}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((element) => {
        console.log('閫夎溅缁撴灉', element);
        if (!element.ok) {
          throw new Error(`HTTP error! Status: ${element.status}`);
        }
        return element.text();
      })
      .then((element) => {
        const res = JSON.parse(element);
        const idleCar = res.carID;
        const nodeType = res.nodeType;
        const planType = res.planType;
        if (idleCar) {
          const username = getCookie('username');
          if (!username || !nodeType) {
            customModal.msg('鑷姩閫夎溅寮傚父,姝ｅ湪涓烘偍鑷姩璺宠浆鍒伴椤?璇烽噸鏂伴€夋嫨');
            goHome();
          }
          let loginData = {
            usertoken: username,
            carid: idleCar,
            nodeType: nodeType,
            planType: planType,
          };
          fetch(`/auth/login?carid=${idleCar}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData),
          }).then((element) => {
            console.log('閫夎溅鍚庣粨鏋?, element);
            if (element.redirected) {
              window.location.href = '/';
            } else {
              customModal.msg('鑷姩閫夎溅澶辫触,璇峰洖鍒伴椤靛悗鎵嬪姩閫夋嫨');
            }
          });
        } else {
          throw new Error('Idle car not found');
        }
      })
      .catch((element) => {
        console.error('Error:', element);
        customModal.msg('鑷姩閫夎溅澶辫触,灏嗗洖鍒伴椤?);
        goHome();
      })
      .finally(() => {
        customModal.close(loadIndex);
      });
  }
}

function createMenuIcon () {
  const isDark = document.documentElement.classList.contains('dark');
  if (isDark) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="4" y1="6" x2="20" y2="6"></line>
      <line x1="4" y1="12" x2="20" y2="12"></line>
      <line x1="4" y1="18" x2="20" y2="18"></line>
    </svg>`;
  } else {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="4" y1="6" x2="20" y2="6"></line>
      <line x1="4" y1="12" x2="20" y2="12"></line>
      <line x1="4" y1="18" x2="20" y2="18"></line>
    </svg>`;
  }
}

function fetchValidity () {
  // Prevent multiple simultaneous requests
  if (window.fetchingValidity) {
    console.log("Already fetching validity, skipping duplicate request");
  }
  
  window.fetchingValidity = true;
  
  return new Promise((resolve, reject) => {
    const username = getCookie('username');
    if (!username) {
      validityText = '鏈櫥褰?;
      usageText = '璇峰厛鐧诲綍';
      $('#menuValidity').text(`鏈夋晥鏈?${validityText}`);
      $('#menuUsage').text(usageText);
      window.fetchingValidity = false;
      reject(new Error('Not logged in'));
      return;
    }
    
    console.log("Fetching validity data for user:", username);
    
    $.ajax({
      url: `/api/user/validity-usage?username=${encodeURIComponent(username)}`,
      method: 'GET',
      success: function (response) {
        console.log("Received validity data:", response);
        validityText = response.validity
          ? `${response.validity}`
          : '鏈夋晥鏈熸湭鐭?;
        usageText = response.usage ? `${response.usage}` : '涓嶉檺鍒朵娇鐢?;
        $('#menuValidity').text(`鏈夋晥鏈?${validityText}`);
        $('#menuUsage').text(usageText);
        window.fetchingValidity = false;
        resolve(validityText);
      },
      error: function (err) {
        console.error("Error fetching validity data:", err);
        validityText = '鏃犳硶鑾峰彇鏈夋晥鏈?;
        usageText = '鏃犳硶鑾峰彇浣跨敤閲?;
        $('#menuValidity').text(`鏈夋晥鏈?${validityText}`);
        $('#menuUsage').text(usageText);
        window.fetchingValidity = false;
        reject(err);
      },
    });
  });
}
// 鍒涘缓涓€涓嚱鏁版潵鏍规嵁褰撳墠涓婚鏇存柊鏍峰紡
function updateThemeStyles () {
  const isDarkMode = document.documentElement.classList.contains('dark');

  // Remove existing menu elements if they exist
  if (document.getElementById('menuButton')) {
    document.getElementById('menuButton').remove();
  }

  if (document.getElementById('menu')) {
    document.getElementById('menu').remove();
  }

  // Create menu button
  const menuButton = document.createElement('div');
  menuButton.id = 'menuButton';
  menuButton.innerHTML = createMenuIcon();
  document.body.appendChild(menuButton);

  // Create menu
  const menu = document.createElement('div');
  menu.id = 'menu';
  menu.style.display = 'none';
  document.body.appendChild(menu);

  // Store jQuery references
  $menuButton = $(menuButton);
  $menu = $(menu);

  // Attach click handler
  $menuButton.on('click', function () {
    $menu.toggle();
  });
}

function createMenu() {
  // Only create menu if it doesn't already exist
  if (document.getElementById('menuButton')) {
    return; // Menu already exists, don't recreate
  }
  
  updateThemeStyles();

  // Initialize menu content based on user status
  let menuItems = '';
  
  // For logged in users, include the functionality from the bottom-left corner
  if (isVisitor === 'false') {
    // Check if we should show the redemption button based on enableCalcCarCodes
    const showRedemption = closeCardExchange=== undefined || closeCardExchange=== 'false';
    console.log("closeCardExchange",closeCardExchange);
    console.log("showRedemption",showRedemption);
    menuItems = `<div class="flex flex-col space-y-1" style="padding: 8px;">
      <!-- User info section -->
      <div style="margin-bottom: 10px;">
        <!-- Redemption button - only show if closeCardExchangeis undefined or 'true' -->
        ${showRedemption ? `<div style="margin-bottom: 8px; text-align: center; width: 100%;">
          <a class="redemption-btn" onclick="showRedeemDialog();">
            <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>鍗″瘑鍏戞崲</span>
          </a>
        </div>` : ''}
      </div>
      
      <!-- Main menu items in a grid layout matching the screenshot -->
      <div class="menu-grid">
        <a class="menu-item-dark" onclick="goHome()">
          <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          棣栭〉
        </a>
        <a class="menu-item-dark" onclick="autoSelectCarAction()">
          <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M16.2 7.8l-2 6.3-6.4 2.1 2-6.3z"></path>
          </svg>
          閫夎溅
        </a>
        <a class="menu-item-dark" onclick="showGoodsDialog()">
          <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          缁垂
        </a>
        <a class="menu-item-dark" onclick="showoNoticeDialog()">
          <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          鍏憡
        </a>
        <a class="menu-item-dark" onclick="export2File()">
          <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
          瀵煎嚭
        </a>
        <a class="menu-item-dark" onclick="showFAQDialog()">
          <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          璇存槑
        </a>
        <a class="menu-item-dark" onclick="autoSelectClaude()">
          <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          Claude
        </a>
        <a class="menu-item-dark" onclick="logout()">
          <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          閫€鍑?
        </a>
      </div>
    </div>`;
  } else {
    // For non-logged in users, keep the grid layout
    menuItems = `<div class="flex flex-col space-y-1" style="padding: 8px;">
      <div class="menu-grid">
        <a class="menu-item-dark" onclick="goHome()">
          <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          棣栭〉
        </a>
        <a class="menu-item-dark" onclick="autoSelectCarAction()">
          <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M16.2 7.8l-2 6.3-6.4 2.1 2-6.3z"></path>
          </svg>
          閫夎溅
        </a>
        <a class="menu-item-dark" onclick="showGoodsDialog()">
          <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          缁垂
        </a>
        <a class="menu-item-dark" onclick="showoNoticeDialog()">
          <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          鍏憡
        </a>
        <a class="menu-item-dark" onclick="export2File()">
          <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
          瀵煎嚭
        </a>
        <a class="menu-item-dark" onclick="showFAQDialog()">
          <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          璇存槑
        </a>
        <a class="menu-item-dark" onclick="autoSelectClaude()">
          <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          Claude
        </a>
        <a class="menu-item-dark" onclick="login()">
          <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
          鐧诲綍
        </a>
      </div>
    </div>`;
  }

  $menu.html(menuItems);
  // Don't show menu by default, let user click the menu button
  $menu.hide();
}

function showExpireTip () {
  if (validityText) {
    // 灏嗘湁鏁堟湡杞崲涓?Date 瀵硅薄
    let validityDate = new Date(validityText);
    let currentDate = new Date();

    // 璁＄畻鍓╀綑澶╂暟
    let timeDiff = validityDate - currentDate;
    let daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // 灏嗘绉掕浆鎹负澶╂暟

    // 濡傛灉鍓╀綑澶╂暟灏忎簬绛変簬3澶╋紝鏄剧ず鎻愮ず妗?
    if (daysLeft <= 3 && daysLeft > 0) {
      customModal.open({
        type: 1,
        title: false,
        closeBtn: false,
        area: ['300px', 'auto'],
        shade: 0.8,
        id: 'LAY_layuipro',
        btn: ['绔嬪嵆缁垂', '绋嶅悗澶勭悊'],
        btnAlign: 'right',
        moveType: 1,
        content: `<div style="padding: 50px; line-height: 22px; background-color: #fff; color: #333; font-weight: 300;">
                            <i class="custom-icon custom-icon-notice" style="font-size: 30px; color: #FF9800;"></i>
                            <p style="margin-top:20px;">灏婃暚鐨勭敤鎴凤紝鎮ㄧ殑浼氬憳鏈夋晥鏈熷皢鍦?${daysLeft} 澶╁悗杩囨湡</p>
                         </div>`,
        yes: function () {
          showGoodsDialog();
        },
      });
    } else if (daysLeft <= 0) {
      customModal.open({
        type: 1,
        title: false,
        closeBtn: false,
        area: ['300px', 'auto'],
        shade: 0.8,
        id: 'LAY_layuipro',
        btn: ['绔嬪嵆缁垂', '绋嶅悗澶勭悊'],
        btnAlign: 'right',
        moveType: 1,
        content: `<div style="padding: 50px; line-height: 22px; background-color: #fff; color: #333; font-weight: 300;">
                            <i class="custom-icon custom-icon-notice" style="font-size: 30px; color: #FF9800;"></i>
                            <p style="margin-top:20px;">灏婃暚鐨勭敤鎴凤紝鎮ㄧ殑浼氬憳宸插埌鏈燂紒</p>
                         </div>`,
        yes: function () {
          showGoodsDialog();
        },
      });
    }
  } else {
    console.log(validityText); // 濡傛灉鏈夋晥鏈熸湭鐭ワ紝鍒欒緭鍑烘彁绀?
  }
}

(function () {
  console.log('list-version 20250427');

  // Load styles first to prevent FOUC
  addAllStyles();

  // Define a function to initialize when jQuery is available
  function initWhenReady () {
    if (typeof $ === 'undefined') {
      // jQuery not loaded yet, load it
      loadExternalScript('/jquery.min.js', function () {
        // Load other required scripts
        loadRequiredScripts();
      });
    } else {
      // jQuery already loaded, proceed with other scripts
      loadRequiredScripts();
    }
  }

  // Load required scripts in sequence
  function loadRequiredScripts () {
    loadExternalScript(
      '/app/libs/dom-to-image_nofonts.js',
      function () {
        loadExternalScript(
          '/app/libs/FileSaver.min.js',
          function () {
            loadExternalScript(
              '/app/libs/mhtmlToWord.js',
              function () {
                // All scripts loaded, initialize UI and get config
                initCustomUI();
                getConfig();
              }
            );
          }
        );
      }
    );
  }

  // Start initialization when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhenReady);
  } else {
    // DOM already loaded, start immediately
    initWhenReady();
  }
})();

function initCustomUI () {
  console.log("Initializing custom UI components...");
  
  // Check if already initialized to prevent duplicate initialization
  if (window.customUIInitialized) {
    console.log("UI already initialized, skipping");
    return;
  }
  
  window.customUIInitialized = true;

  // Define closure functions just once
  const closeChatDialog = (element) => {
    if (!element) {
      return;
    }
    if (!isMobile()) {
      const nav = document.querySelector('[data-headlessui-state] nav');
      if (nav && nav.parentElement) {
        nav.parentElement.classList.add('custom-hide');
      }
      
      const portal = document.getElementById('headlessui-portal-root');
      if (portal) {
        portal.classList.add('custom-hide');
      }
    }
  };

  // Define all global functions once
  if (!window.showProfile) {
    window.showProfile = (element) => {
      if (isLogin()) {
        closeChatDialog(element);
        showIframeDialog('涓汉涓績', '/list/#/external-profile', 600, 1000, 2);
      }
    };
  
    window.showFAQDialog = (element) => {
      closeChatDialog(element);
      showIframeDialog(
        '浣跨敤璇存槑',
        FAQ,
        600,
        1000,
        FAQ && FAQ.startsWith('http') ? 2 : 1
      );
    };
  
    window.showGoodsDialog = (element) => {
      if (isLogin()) {
        closeChatDialog(element);
        if (enableSiteShop === 'true') {
          showIframeDialog(
            '绔欏唴璐拱',
            originUrl + '/list/#/shop',
            800,
            1000,
            2
          );
        } else {
          if (fkAddress) {
            showIframeDialog('鍗″瘑璐拱', fkAddress, 700, 1200, 2);
          } else {
            customModal.msg('绠＄悊鍛樿繕鏈厤缃崱瀵嗗湴鍧€');
          }
        }
      }
    };
  
    window.showoNoticeDialog = (element) => {
      closeChatDialog(element);
      showIframeDialog(
        '绔欏唴鍏憡',
        siteNotice,
        600,
        1000,
        siteNotice && siteNotice.startsWith('http') ? 2 : 1
      );
    };
    
    // Define global navigation functions
    window.goHome = () => {
      window.location.href = originUrl + '/list/#/home';
    };
  
    window.login = () => {
      window.location.href = originUrl + '/list/#/login';
    };
  
    window.register = () => {
      window.location.href = originUrl + '/list/#/register';
    };
  }

  // Initialize buttons with default approach - ONLY ONCE
  initRegAndLoginButton();
  
  // Set up all other event listeners
  setupEventListeners();
}

// Modify the initRegAndLoginButton function to prevent flashing
function initRegAndLoginButton() {
  // If we've already initialized elements properly, don't repeat the process
  if (document.querySelector('.visitor-buttons-initialized')) {
    return;
  }

  // Apply OpenAI visitor styles
  addOpenAIStyles();

  // Delete rate reminder style
  const rateElement = document.querySelector(
    'div.flex.w-full.items-start.gap-4.rounded-2xl.border.border-token-border-light'
  );
  if (rateElement) {
    rateElement.style.display = 'none';
    rateElement.remove();
  }

  // Find the target divs in the navigation
  var $div = $(
    '.flex.h-full.min-h-0 nav>div:nth-child(7)'
  );
  if ($div.length === 0) {
    // Target element doesn't exist yet, retry after a short delay
    setTimeout(initRegAndLoginButton, 500);
    return;
  }

  // Only proceed with initialization if we need to
  if ($div.hasClass('init')) {
    return;
  }

  // Mark as initialized
  $div.addClass('init');

  // Different HTML based on login status
  if (isVisitor == 'true' || !isVisitor) {
    // Not logged in, show login/register buttons
    // Hide profile button
    const profileBtn = document.querySelector("button[data-testid='profile-button']");
    if (profileBtn) {
      profileBtn.style.display = 'none';
    }

    // Create a persistent container for the buttons to prevent flashing
    let html = `<div class="flex flex-col space-y-2 mb-10 visitor-buttons-initialized">
      <div class="visitor-buttons">
        <button onclick="login();" class="custom-btn login-btn">
          <svg class="login-btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
          <span>鐧诲綍</span>
        </button>
        <button onclick="register();" class="custom-btn register-btn">
          <svg class="register-btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
          <span>娉ㄥ唽</span>
        </button>
      </div>
    </div>`;
    
    // Set HTML content only if it hasn't been set already
    if (!$div.find('.visitor-buttons-initialized').length) {
      $div.html(html);
      
      // Add a class to the parent element for better CSS targeting
      $div.addClass('visitor-container');
      
      // Add a MutationObserver to watch for changes to this element
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && !$div.find('.visitor-buttons-initialized').length) {
            // Our content was removed, add it back
            $div.html(html);
          }
        });
      });
      
      // Start observing
      observer.observe($div[0], { childList: true });
    }
  } else {
    // Logged in - Show with OpenAI style flat layout
    // Get validity period display text and usage info
    const validityDisplayText = validityText ? validityText.split(' ')[0] : '鏁版嵁鍔犺浇涓?;
    const usageDisplayText = usageText || '鏁版嵁鍔犺浇涓?;
    
    let html = `<div class="flex flex-col mb-6 visitor-buttons-initialized openai-user-info">
      <div class="openai-user-stats">
        <div class="flex justify-between items-center mb-2 openai-user-row">
          <div class="openai-stat-icon-wrapper">
            <svg class="openai-stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div id="bottom-validity-display" class="openai-stat-value">${validityDisplayText}</div>
        </div>
        ${enableShowRemaining === 'true' ? `
        <div class="flex justify-between items-center mb-2 openai-user-row">
          <div class="openai-stat-icon-wrapper">
            <svg class="openai-stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
            </svg>
          </div>
          <div id="bottom-usage-display" class="openai-stat-value">${usageDisplayText}</div>
        </div>
        ` : ''}
      </div>
      <button onclick="showGoodsDialog();" class="openai-recharge-btn" aria-label="缁垂/鍏呭€?>
        <svg class="openai-btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"></rect>
          <line x1="2" y1="10" x2="22" y2="10"></line>
        </svg>
        缁垂/鍏呭€?
      </button>
    </div>`;
    
    // Set HTML content only if it hasn't been set already
    if (!$div.find('.visitor-buttons-initialized').length) {
      $div.html(html);
      
      // Add a class to the parent element for better CSS targeting
      $div.addClass('visitor-container');
      
      // Add a MutationObserver to watch for changes to this element
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && !$div.find('.visitor-buttons-initialized').length) {
            // Our content was removed, add it back
            $div.html(html);
          }
        });
      });
      
      // Start observing
      observer.observe($div[0], { childList: true });
      
      // Update validity and usage when it changes
      fetchValidity().then(() => {
        const validityShortText = validityText ? validityText : '鏈煡';
        const bottomValidityDisplay = document.getElementById('bottom-validity-display');
        const bottomUsageDisplay = document.getElementById('bottom-usage-display');
        
        if (bottomValidityDisplay) {
          bottomValidityDisplay.textContent = validityShortText;
        }
        console.log('enableShowRemaining:',enableShowRemaining)
        if (bottomUsageDisplay && enableShowRemaining === 'true') {
          bottomUsageDisplay.textContent = usageText || '10/10(姣?灏忔椂)';
        }
      }).catch(err => {
        console.error('鑾峰彇鏈夋晥鏈熷け璐?', err);
      });
    }
  }
}

// Modify the setupEventListeners function to ensure stability
function setupEventListeners() {
  // Clean up existing event listeners
  $(document).off('click', '.draggable.sticky button.inline-flex');
  $(document).off('click', '[data-link]');
  
  // Set up new event listeners
  $(document).on('click', '.draggable.sticky button.inline-flex', function(event) {
    event.stopPropagation();
    initRegAndLoginButton();
  });

  $(document).on('click', '[data-link]', function(event) {
    event.stopPropagation();
    const url = $(this).data('link');
    window.location.href = url;
  });
  
  // Add global click handler
  $(document).on('click', function(e) {
    if (
      !$(e.target).closest('#menu').length &&
      !$(e.target).closest('#menuButton').length &&
      showMenu() && $menu
    ) {
      $menu.hide();
    }
  });
  
  // Set up an interval to check and restore the buttons if they disappear
  clearRegLoginButtonInterval();
  window.regLoginButtonInterval = setInterval(() => {
    const visitorButtonsExist = document.querySelector('.visitor-buttons-initialized');
    if (!visitorButtonsExist && (isVisitor === 'true' || !isVisitor)) {
      console.log("鎭㈠宸︿笅瑙掓寜閽?..");
      initRegAndLoginButton();
    }
  }, 1000);
}

// Helper function to clear interval
function clearRegLoginButtonInterval() {
  if (window.regLoginButtonInterval) {
    clearInterval(window.regLoginButtonInterval);
    window.regLoginButtonInterval = null;
  }
}

// Add the getConfig function before the initialization IIFE
function getConfig () {
  // Prevent multiple simultaneous requests
  if (window.fetchingConfig) {
    console.log("Already fetching config, skipping duplicate request");
    return;
  }
  
  window.fetchingConfig = true;
  console.log("Fetching site configuration...");
  
  const url = `/api/sys/site-data`;
  fetch(url)
    .then((response) => response.json())
    .then(({ code, data }) => {
      if (code === 1) {
        console.log("Received site configuration:", data);
        siteNotice = data.siteAnnouncement;
        FAQ = data.userGuideUrl;
        backApiUrl = data.backupUrl;
        enableSiteShop = data.enableSiteShop;
        enableExpirationReminder = data.enableExpirationReminder;
        fkAddress = data.fkAddress;
        enableNoLogin = data.enableNoLogin;
        enableBackNode = data.enableBackNode;
        enableShowRemaining = data.enableShowRemaining;
        enableNoSelectCar = data.enableNoSelectCar;
        closeCardExchange = data.closeCardExchange;

        // 寮€鍚鐢ㄩ暅鍍忔椂锛屽垹闄ookie
        if (enableBackNode == 'true') {
          deleteCookie('gfsessionid');
        }

        // 鏈紑鍚厤鐧荤殑璇濓紝淇敼娓稿妯″紡涓篺alse
        if (enableNoLogin == 'false') {
          setSessionCookie('visitor', false);
        }

        // Clear existing intervals to prevent multiple menu creations
        clearIntervals();
        
        // Only proceed with menu creation once (for logged-in users)
        if (showMenu()) {
          // Remove existing menu elements to avoid duplicates
          if (document.getElementById('menuButton')) {
            document.getElementById('menuButton').remove();
          }

          if (document.getElementById('menu')) {
            document.getElementById('menu').remove();
          }
          
          // Reset menu variables
          $menuButton = null;
          $menu = null;
          
          // Fetch validity information first
          fetchValidity()
            .then(() => {
              if (enableExpirationReminder == 'true') {
                showExpireTip();
              }
              // Create menu once after config and validity are loaded
              createMenu();
            })
            .catch((err) => {
              console.error('鑾峰彇鏈夋晥鏈熷け璐?', err);
              // Create menu even if validity fetch fails
              createMenu();
            });
        }
        
        // Always re-initialize login/register/recharge buttons based on current login status
        console.log("閰嶇疆鍔犺浇鍚庡垵濮嬪寲搴曢儴鎸夐挳锛屽綋鍓嶆父瀹㈢姸鎬?", isVisitor);
        
        // Force re-initialization of the left corner buttons by removing initialized class
        const existingButtons = document.querySelector('.visitor-buttons-initialized');
        if (existingButtons) {
          existingButtons.parentNode.removeChild(existingButtons);
        }
        
        const $div = $('.draggable.relative.h-full.w-full.flex-1.items-start nav>div:nth-child(3)');
        if ($div.length > 0) {
          $div.removeClass('init');
        }
        
        initRegAndLoginButton();
        
        // Reset intervals
        setupRegLoginButtonInterval();
      } else {
        customModal.msg(data);
      }
      
      window.fetchingConfig = false;
    })
    .catch((error) => {
      console.error('Error fetching config:', error);
      window.fetchingConfig = false;
      
      // Ensure login/register buttons are initialized even if config fails
      if (isVisitor == 'true' || !isVisitor) {
        console.log("閰嶇疆鍔犺浇澶辫触锛屼粛鐒跺垵濮嬪寲搴曢儴鎸夐挳...");
        initRegAndLoginButton();
      }
    });
}

// Helper function to clear all intervals
function clearIntervals() {
  clearRegLoginButtonInterval();
  
  if (window.menuCreateInterval) {
    clearInterval(window.menuCreateInterval);
    window.menuCreateInterval = null;
  }
}

// Helper function to set up register/login button interval
function setupRegLoginButtonInterval() {
  clearRegLoginButtonInterval();
  
  if ((isVisitor === 'true' || !isVisitor) && !window.regLoginButtonInterval) {
    window.regLoginButtonInterval = setInterval(() => {
      const visitorButtonsExist = document.querySelector('.visitor-buttons-initialized');
      if (!visitorButtonsExist) {
        console.log("妫€娴嬪埌搴曢儴鎸夐挳娑堝け锛岄噸鏂板垵濮嬪寲...");
        initRegAndLoginButton();
      }
    }, 1000);
  }
}

// Make showIframeDialog a global function by attaching it to window
// Replace the function definition
function showIframeDialog (title, url, height, width, type = 1) {
  // Make it globally available directly in function definition
  window.showIframeDialog = showIframeDialog;
  
  // Get viewport dimensions - use cached values when available
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  
  // Check if mobile
  const isMobileDevice = isMobile();
  
  // Calculate responsive dimensions
  let modalWidth, modalHeight;
  
  if (isMobileDevice) {
    // On mobile, use nearly full screen with small margins
    modalWidth = Math.max(viewportWidth - 20, 300) + 'px';
    modalHeight = Math.max(viewportHeight - 60, 400) + 'px';
  } else {
    // On desktop, use provided dimensions or calculate based on screen size
    const maxWidth = Math.min(viewportWidth * 0.9, width || 1000);
    const maxHeight = Math.min(viewportHeight * 0.85, height || 800);
    
    // Set minimum sizes to ensure content is visible
    modalWidth = Math.max(maxWidth, 320) + 'px';
    modalHeight = Math.max(maxHeight, 400) + 'px';
  }
  
  // Add responsive styles for iframe - only add once to the document
  if (!document.getElementById('iframe-dialog-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'iframe-dialog-styles';
    styleElement.textContent = `
      .custom-iframe {
        width: 100%;
        height: 100%;
        border: none;
        overflow: auto;
      }
      .custom-modal-body {
        padding: 0;
        height: calc(100% - 42px); /* Subtract header height */
        overflow: hidden;
      }
      @media (max-width: 768px) {
        .custom-modal-content {
          width: 95% !important;
          height: 90% !important;
          max-width: none !important;
          max-height: none !important;
        }
      }
    `;
    document.head.appendChild(styleElement);
  }
  
  // Create content based on type
  let content;
  if (type === 1) {
    // HTML content
    content = url;
  } else if (type === 2) {
    // iframe
    content = `<iframe src="${url}" class="custom-iframe" allowfullscreen></iframe>`;
  }
  
  // Open the modal with responsive settings
  return customModal.open({
    type: 1, // Always use HTML type, we'll handle iframe ourselves
    title: [title, 'font-size: 18px;'],
    shadeClose: true,
    shade: 0.2,
    maxmin: true,
    resize: !isMobileDevice, // Only allow resizing on desktop
    scrollbar: false,
    offset: 'auto', // Center the modal
    area: [modalWidth, modalHeight],
    content: content,
    success: function(layero, index) {
      // Add resize handler for window size changes
      const handleResize = function() {
        const newViewportWidth = window.innerWidth || document.documentElement.clientWidth;
        const newViewportHeight = window.innerHeight || document.documentElement.clientHeight;
        
        if (isMobileDevice) {
          $(layero).find('.custom-modal-content').css({
            'width': Math.max(newViewportWidth - 20, 300) + 'px',
            'height': Math.max(newViewportHeight - 60, 400) + 'px'
          });
        } else {
          const newMaxWidth = Math.min(newViewportWidth * 0.9, width || 1000);
          const newMaxHeight = Math.min(newViewportHeight * 0.85, height || 800);
          
          $(layero).find('.custom-modal-content').css({
            'width': Math.max(newMaxWidth, 320) + 'px',
            'height': Math.max(newMaxHeight, 400) + 'px'
          });
        }
      };
      
      // Use debounced resize handler to improve performance
      let resizeTimeout;
      window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 100);
      });
      
      // Remove event listener when modal is closed
      $(layero).on('remove', function() {
        window.removeEventListener('resize', handleResize);
      });
    }
  });
}
// Make it globally available
window.showIframeDialog = showIframeDialog;

// Update the showRedeemDialog function with the correct implementation
window.showRedeemDialog = function() {
  // Only show dialog if closeCardExchangeis not 'false'
  if (closeCardExchange=== 'true') {
    customModal.msg('鍗″瘑鍏戞崲鍔熻兘宸茬鐢?);
    return;
  }
  
  if (isLogin()) {
    customModal.open({
      type: 1,
      title: '鍗″瘑鍏戞崲',
      closeBtn: true,
      area: ['350px', 'auto'],
      shadeClose: true,
      content: `
        <div style="padding: 20px;">
          <div style="margin-bottom: 15px;">
            <input type="text" id="cardKey" placeholder="璇疯緭鍏ュ崱瀵? class="custom-input" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background-color: ${document.documentElement.classList.contains('dark') ? '#444' : '#fff'}; color: ${document.documentElement.classList.contains('dark') ? '#fff' : '#333'};">
          </div>
          <div style="text-align: center;">
            <button id="redeemSubmit" class="custom-btn" style="background: #f90; border-radius: 4px; color: white; cursor: pointer; transition: all 0.2s; font-weight: 500;">纭畾鍏戞崲</button>
          </div>
        </div>
      `,
      success: function(layer, index) {
        // Add hover effect to button
        const submitBtn = document.getElementById('redeemSubmit');
        submitBtn.addEventListener('mouseover', function() {
          this.style.backgroundColor = '#ff7b00';
          this.style.transform = 'translateY(-1px)';
          this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        });
        submitBtn.addEventListener('mouseout', function() {
          this.style.backgroundColor = '#f90';
          this.style.transform = 'translateY(0)';
          this.style.boxShadow = 'none';
        });
        
        // Add click event
        submitBtn.addEventListener('click', function() {
          redeemCard();
        });
        
        // Add key press event for Enter key
        const cardKeyInput = document.getElementById('cardKey');
        cardKeyInput.addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            redeemCard();
          }
        });
      }
    });
  }
};

// Add the redeemCard function with correct API implementation
window.redeemCard = function() {
  const cardKey = $('#cardKey').val().trim();
  if (!cardKey) {
    customModal.msg('璇疯緭鍏ュ崱瀵?);
    return;
  }

  const loadIndex = setLoading('姝ｅ湪鍏戞崲,璇风◢鍚?..');
  const token = localStorage.getItem('accessToken');

  if (!token) {
    customModal.close(loadIndex);
    customModal.msg('璁よ瘉宸茶繃鏈燂紝璇烽噸鏂扮櫥褰?);
    return;
  }
  
  let userId = getUserId();

  fetch(
    `/api/codes/redeem?key=${encodeURIComponent(
      cardKey
    )}&userId=${encodeURIComponent(userId)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      customModal.close(loadIndex);
      if (data && data.code === 1) {
        // 鏍规嵁瀹為檯杩斿洖鐮佽皟鏁?
        customModal.msg('鍏戞崲鎴愬姛锛?);
        // 閲嶆柊鑾峰彇鐢ㄦ埛鏈夋晥鏈熷拰浣跨敤閲?
        fetchValidity();
        // 鍏抽棴鍏戞崲寮圭獥
        customModal.closeAll();
      } else {
        customModal.msg(data.msg || '鍏戞崲澶辫触锛岃妫€鏌ュ崱瀵嗘槸鍚︽纭?);
      }
    })
    .catch((error) => {
      customModal.close(loadIndex);
      if (error.message.includes('401')) {
        customModal.msg('璁よ瘉宸茶繃鏈燂紝璇烽噸鏂扮櫥褰?);
      } else {
        customModal.msg('鍏戞崲澶辫触锛岃绋嶅悗閲嶈瘯');
      }
      console.error('Error:', error);
    });
};

// Add responsive OpenAI style for visitor buttons
function addOpenAIStyles() {
  if (document.getElementById('openai-visitor-styles')) {
    return;
  }
  
  const styleEl = document.createElement('style');
  styleEl.id = 'openai-visitor-styles';
  styleEl.textContent = `
    .visitor-buttons-initialized {
      margin-bottom: 16px !important;
    }
    
    .visitor-buttons {
      display: flex !important;
      gap: 10px !important; 
      margin-bottom: 8px !important;
      margin-top: 5px !important;
    }
    
    .visitor-buttons button {
      transition: all 0.2s ease !important;
      min-width: 70px !important;
      border-radius: 4px !important; 
      font-weight: 500 !important; 
      height: 36px !important; 
      padding: 0 12px !important; 
      font-size: 14px !important;
      display: flex !important;
      align-items: center !important; 
      justify-content: center !important;
    }
    
    .visitor-buttons button:hover {
      opacity: 0.85 !important;
    }
    
    .visitor-buttons button:active {
      transform: scale(0.98) !important;
    }
    
    .login-btn-icon, .register-btn-icon {
      width: 16px;
      height: 16px;
      margin-right: 6px;
      stroke: currentColor;
    }
    
    /* OpenAI-specific styles */
    .visitor-buttons .login-btn {
      background-color: #0f0f0f !important;
      color: white !important;
      border: none !important;
    }
    
    .visitor-buttons .register-btn {
      background-color: transparent !important;
      color: #0f0f0f !important;
      border: 1px solid #e5e5e5 !important;
    }
    
    /* Dark mode styles */
    html.dark .visitor-buttons .login-btn {
      background-color: #ffffff !important;
      color: #0f0f0f !important;
      border: none !important;
    }
    
    html.dark .visitor-buttons .register-btn {
      background-color: rgba(255, 255, 255, 0.1) !important;
      color: #ffffff !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
    }
    
    /* OpenAI style for logged-in user info */
    .openai-user-info {
      padding: 0 12px;
      width: 100%;
    }
    
    .openai-user-stats {
      border: 1px solid #e5e5e5;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 8px;
      background-color: #f9f9f9;
    }
    
    html.dark .openai-user-stats {
      border-color: #333;
      background-color: #262626;
    }
    
    .openai-user-row {
      padding: 4px 0;
      display: flex;
      align-items: center;
    }
    
    .openai-stat-icon-wrapper {
      display: flex;
      align-items: center;
    }
    
    .openai-stat-icon {
      width: 16px;
      height: 16px;
      margin-right: 8px;
      color: #6e6e80;
    }
    
    html.dark .openai-stat-icon {
      color: #acacbe;
    }
    
    .openai-stat-value {
      font-size: 12px;
      color: #353740;
      font-weight: 600;
      margin-left: auto;
    }
    
    html.dark .openai-stat-label {
      color: #acacbe;
    }
    
    html.dark .openai-stat-value {
      color: #ffffff;
    }
    
    .openai-recharge-btn {
      width: 100%;
      background-color: #10a37f;
      color: white;
      border: none;
      border-radius: 6px;
      height: 36px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .openai-btn-icon {
      width: 16px;
      height: 16px;
      margin-right: 6px;
      stroke: currentColor;
    }
    
    .openai-recharge-btn:hover {
      background-color: #0d8c6d;
    }
    
    /* Mobile styles */
    @media (max-width: 768px) {
      .visitor-buttons {
        width: 100% !important;
      }
      
      .visitor-buttons button {
        flex: 1 !important;
        padding: 0 8px !important;
        font-size: 13px !important;
      }
      
      .login-btn-icon, .register-btn-icon {
        margin-right: 4px;
        width: 14px;
        height: 14px;
      }
      
      .openai-user-stats {
        padding: 6px 10px;
      }
    }
  `;
  
  document.head.appendChild(styleEl);
}
