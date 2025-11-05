// ============================================
// 配置和全局状态
// ============================================
(function() {
  'use strict';

  console.log('list-version 20250427-optimized');

  // 全局状态
  const state = {
    menu: null,
    menuButton: null,
    validityText: null,
    usageText: null,
    htmlClass: document.documentElement.classList.contains('dark') ? 'dark' : '',
    isVisitor: getCookie('visitor'),
    FAQ: null,
    siteNotice: null,
    backApiUrl: null,
    enableSiteShop: null,
    fkAddress: null,
    originUrl: window.location.origin,
    enableExpirationReminder: null,
    enableNoLogin: null,
    enableBackNode: null,
    enableShowRemaining: null,
    enableNoSelectCar: null,
    closeCardExchange: null,
    customUIInitialized: false,
    fetchingAnnouncement: false,
    fetchingValidity: false,
    fetchingConfig: false,
    menuPreloaded: false // 菜单预加载状态
  };

  // ============================================
  // 工具函数
  // ============================================

  function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name + '=')) {
        return cookie.substring(name.length + 1);
      }
    }
    return undefined;
  }

  function setSessionCookie(name, value) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);
    document.cookie = `${name}=${value}; expires=${expirationDate.toUTCString()}; path=/`;
  }

  function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }

  function isMobile() {
    const userAgent = navigator.userAgent.toLowerCase();
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
  }

  function getUserId() {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        return JSON.parse(user).id;
      } catch (e) {
        console.error('Error parsing JSON:', e);
      }
    }
    return null;
  }

  function isLogin() {
    if (state.isVisitor == 'true' || !state.isVisitor) {
      customModal.msg('您还未登录,暂时无法使用该功能');
      return false;
    }
    return true;
  }

  function showMenu() {
    return !(state.isVisitor == 'true' || !state.isVisitor);
  }

  // ============================================
  // 脚本加载
  // ============================================

  function loadExternalScript(url, callback) {
    const existingScript = document.querySelector(`script[src="${url}"]`);
    if (existingScript) {
      console.log(`Script already loaded: ${url}`);
      if (callback) callback();
      return;
    }

    const script = document.createElement('script');
    script.src = url;
    script.type = 'text/javascript';

    script.onload = () => {
      console.log(`Script loaded successfully: ${url}`);
      if (callback) callback();
    };

    script.onerror = () => {
      console.error(`Failed to load script: ${url}`);
      if (callback) callback();
    };

    document.head.appendChild(script);
  }

  function loadRequiredScripts() {
    loadExternalScript('/app/libs/dom-to-image_nofonts.js', () => {
      loadExternalScript('/app/libs/FileSaver.min.js', () => {
        loadExternalScript('/app/libs/mhtmlToWord.js', () => {
          initCustomUI();
          getConfig();
        });
      });
    });
  }

  // ============================================
  // 样式管理
  // ============================================

  const StyleManager = {
    addCustomIconsStyles() {
      if (document.getElementById('custom-icons-styles')) return;

      const style = document.createElement('style');
      style.id = 'custom-icons-styles';
      style.textContent = `
        .custom-icon {
          font-size: 16px;
          font-style: normal;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          display: inline-block !important;
          visibility: visible !important;
          opacity: 1 !important;
          margin-right: 8px !important;
        }

        .custom-icon-home:before { content: '🏠'; }
        .custom-icon-util:before { content: '🔧'; }
        .custom-icon-user:before { content: '👤'; }
        .custom-icon-diamond:before { content: '💎'; }
        .custom-icon-notice:before { content: '📢'; }
        .custom-icon-read:before { content: '📖'; }
        .custom-icon-file:before { content: '📁'; }
        .custom-icon-picture:before { content: '🖼️'; }
        .custom-icon-mike:before { content: '🎤'; }
        .custom-icon-senior:before { content: '⭐'; }
        .custom-icon-website:before { content: '🌐'; }
        .custom-icon-logout:before { content: '🚪'; }
        .custom-icon-gift:before { content: '🎁'; }
        .custom-icon-key:before { content: '🔑'; }
        .custom-icon-right:before { content: '▶️'; }

        .custom-font-20 { font-size: 20px; }
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
          box-sizing: border-box;
        }
        .custom-btn:hover { opacity: 0.8; }
        .custom-btn-radius { border-radius: 100px; }
        .custom-bg-black { background-color: #393D49; }
        .custom-bg-primary {
          background-color: #fff;
          color: #666;
          border: 1px solid #eee;
        }
        .custom-hide { display: none !important; }
      `;
      document.head.appendChild(style);
    },

    addCustomStyles() {
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
        .custom-form-item { margin-bottom: 15px; clear: both; }
        .custom-btn-normal { background-color: #1E9FFF; }
        .custom-btn-fluid { width: 100%; }

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
          display: flex;
          flex-direction: column;
          height: 100%;
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
          flex: 1;
        }
        .custom-modal-footer {
          display: flex;
          justify-content: flex-end;
          padding: 15px;
          text-align: right;
          border-top: 1px solid #eee;
        }
        .custom-modal-footer button { margin-left: 10px; }

        html.dark .custom-modal-footer { border-top: 1px solid #333; }
        html.dark .custom-modal-content { background-color: #333; color: white; }
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
        html.dark .custom-input::placeholder { color: #aaa; }

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
      `;
      document.head.appendChild(style);
    },

    addMenuStyles() {
      if (document.getElementById('menu-styles')) return;

      // 先添加 iconfont CSS
      const iconfontLink = document.createElement('link');
      iconfontLink.rel = 'stylesheet';
      iconfontLink.href = '//at.alicdn.com/t/c/font_4701800_bdaa743u04.css';
      document.head.appendChild(iconfontLink);

      const style = document.createElement('style');
      style.id = 'menu-styles';
      style.textContent = `
        /* 菜单按钮样式 - 添加预加载状态 */
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
          opacity: 0;
          transition: all 0.3s ease;
        }
        #menuButton.loaded {
          opacity: 1;
        }
        #menuButton:hover {
          transform: scale(1.1);
        }
        #menuButton:hover > div {
          box-shadow: 0 4px 16px rgba(0,0,0,0.25);
          transform: rotate(90deg);
        }
        #menuButton:active {
          transform: scale(0.95);
        }

        /* 菜单容器样式 - 添加渐变显示 */
        #menu {
          position: fixed;
          right: 20px;
          top: 15%;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          border-radius: 12px;
          padding: 0;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1);
          z-index: 999;
          width: 240px;
          max-width: 80vw;
          color: white;
          opacity: 0;
          transform: translateY(-10px);
          transition: opacity 0.3s ease, transform 0.3s ease;
          pointer-events: none;
        }
        #menu.show {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .menu-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        /* 菜单项样式 - 增强视觉效果 */
        .menu-item-dark {
          display: flex;
          align-items: center;
          padding: 12px 10px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: rgba(255, 255, 255, 0.08);
          color: white;
          text-decoration: none;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .menu-item-dark:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        /* iconfont 图标样式 - 增加大小和间距 */
        .menu-item-dark .iconfont {
          font-size: 20px;
          margin-right: 8px;
          width: 20px;
          height: 20px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #64b5f6;
        }

        /* 兑换按钮样式 - 增强视觉效果 */
        .redemption-btn {
          background: linear-gradient(135deg, #10a37f 0%, #0d8c6d 100%);
          color: white;
          border-radius: 8px;
          padding: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(16, 163, 127, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .redemption-btn .iconfont {
          font-size: 22px;
          margin-right: 8px;
          color: white;
        }
        .redemption-btn:hover {
          background: linear-gradient(135deg, #0d8c6d 0%, #0a7558 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(16, 163, 127, 0.4);
        }
      `;
      document.head.appendChild(style);
    },

    addOpenAIStyles() {
      if (document.getElementById('openai-visitor-styles')) return;

      const styleEl = document.createElement('style');
      styleEl.id = 'openai-visitor-styles';
      styleEl.textContent = `
        .visitor-buttons-initialized { margin-bottom: 16px !important; }
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
        .visitor-buttons button:hover { opacity: 0.85 !important; }
        .visitor-buttons button:active { transform: scale(0.98) !important; }

        .login-btn-icon, .register-btn-icon {
          width: 16px;
          height: 16px;
          margin-right: 6px;
          stroke: currentColor;
        }
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
        html.dark .visitor-buttons .login-btn {
          background-color: #ffffff !important;
          color: #0f0f0f !important;
        }
        html.dark .visitor-buttons .register-btn {
          background-color: rgba(255, 255, 255, 0.1) !important;
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
        }
        .menu-icon {
          width: 18px;
          height: 18px;
          margin-right: 8px;
          stroke-width: 2;
          stroke: currentColor;
        }
        /* OpenAI user info styles */
        .openai-user-info { padding: 0 12px; width: 100%; }
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
        .openai-stat-icon {
          width: 16px;
          height: 16px;
          margin-right: 8px;
          color: #6e6e80;
        }
        html.dark .openai-stat-icon { color: #acacbe; }
        .openai-stat-value {
          font-size: 12px;
          color: #353740;
          font-weight: 600;
          margin-left: auto;
        }
        html.dark .openai-stat-value { color: #ffffff; }
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
        .openai-recharge-btn:hover { background-color: #0d8c6d; }

        @media (max-width: 768px) {
          .visitor-buttons { width: 100% !important; }
          .visitor-buttons button {
            flex: 1 !important;
            padding: 0 8px !important;
            font-size: 13px !important;
          }
        }
      `;
      document.head.appendChild(styleEl);
    },

    addDynamicStyles() {
      if (document.getElementById('dynamic-ui-styles')) return;

      const dynamicStyles = document.createElement('style');
      dynamicStyles.id = 'dynamic-ui-styles';
      dynamicStyles.textContent = `
        div.h-full[class|=react-scroll-to-bottom--css]>div[class|=react-scroll-to-bottom--css] {
          overflow-y: auto;
          height: 100%;
        }
      `;
      document.head.appendChild(dynamicStyles);
    },

    addAll() {
      this.addCustomStyles();
      this.addCustomIconsStyles();
      this.addMenuStyles();
      this.addOpenAIStyles();
      this.addDynamicStyles();
    }
  };

  // ============================================
  // 自定义弹窗
  // ============================================

  const customModal = {
    instances: [],
    nextId: 1,

    open(options) {
      const modalId = this.nextId++;
      const modalContainer = document.createElement('div');
      modalContainer.className = 'custom-modal-container';
      modalContainer.id = `custom-modal-${modalId}`;

      const modalContent = document.createElement('div');
      modalContent.className = 'custom-modal-content';

      if (options.area) {
        modalContent.style.width = options.area[0];
        modalContent.style.height = options.area[1];
      }

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

      if (options.closeBtn !== false) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'custom-modal-close';
        closeBtn.innerHTML = '&#215;';
        closeBtn.onclick = () => {
          this.close(modalId);
          if (options.end) options.end();
        };
        modalContent.appendChild(closeBtn);
      }

      const contentDiv = document.createElement('div');
      contentDiv.className = 'custom-modal-body';

      if (options.type === 1) {
        contentDiv.innerHTML = options.content;
      } else if (options.type === 2) {
        const iframe = document.createElement('iframe');
        iframe.src = options.content;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        contentDiv.style.padding = '0';
        contentDiv.appendChild(iframe);
      }

      modalContent.appendChild(contentDiv);

      if (options.btn && options.btn.length) {
        const btnContainer = document.createElement('div');
        btnContainer.className = 'custom-modal-footer';
        btnContainer.style.justifyContent = options.btnAlign || 'flex-end';

        options.btn.forEach((btnText, index) => {
          const btn = document.createElement('button');
          btn.textContent = btnText;
          btn.className = 'custom-btn';

          if (index === 0) {
            btn.style.backgroundColor = '#009688';
            btn.style.color = 'white';
            btn.style.border = 'none';
            btn.onclick = function() {
              if (options.yes) {
                options.yes(modalId);
              } else {
                customModal.close(modalId);
              }
            };
          } else {
            btn.style.backgroundColor = '#f0f0f0';
            btn.style.color = '#333';
            btn.style.border = '1px solid #ddd';
            btn.onclick = function() {
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

      if (options.shadeClose) {
        modalContainer.addEventListener('click', function(e) {
          if (e.target === modalContainer) {
            customModal.close(modalId);
            if (options.end) options.end();
          }
        });
      }

      this.instances[modalId] = {
        container: modalContainer,
        options: options
      };

      if (options.success) {
        options.success(modalContainer, modalId);
      }

      return modalId;
    },

    close(id) {
      if (id !== undefined) {
        if (this.instances[id]) {
          const container = this.instances[id].container;
          if (container && document.body.contains(container)) {
            document.body.removeChild(container);
          }
          delete this.instances[id];
        }
      } else {
        Object.keys(this.instances).forEach(id => {
          const container = this.instances[id].container;
          if (container && document.body.contains(container)) {
            document.body.removeChild(container);
          }
        });
        this.instances = [];
      }
    },

    msg(content, options = {}) {
      const msgDiv = document.createElement('div');
      msgDiv.className = 'custom-msg';

      if (options.icon === 16) {
        const loader = document.createElement('div');
        loader.className = 'custom-loader';
        msgDiv.appendChild(loader);
      }

      const span = document.createElement('span');
      span.textContent = content;
      msgDiv.appendChild(span);

      document.body.appendChild(msgDiv);

      const msgId = this.nextId++;
      this.instances[msgId] = {
        container: msgDiv,
        options: options
      };

      const duration = options.time === 0 ? 0 : (options.time || 3000);
      if (duration > 0) {
        setTimeout(() => {
          this.close(msgId);
        }, duration);
      }

      return msgId;
    },

    confirm(content, options = {}) {
      return this.open({
        title: options.title || '确认',
        content: content,
        type: 1,
        btn: ['确定', '取消'],
        yes: function(index) {
          customModal.close(index);
          if (options.yes) options.yes();
        },
        btn2: function() {
          if (options.btn2) options.btn2();
        }
      });
    },

    closeAll() {
      this.close();
    }
  };

  window.customModal = customModal;

  // ============================================
  // 对话导出功能
  // ============================================

  const ConversationExporter = {
    async getCurrentChatId() {
      const pathSegments = location.pathname.split('/');
      const chatIndex = pathSegments.indexOf('c');
      if (chatIndex !== -1 && pathSegments[chatIndex + 1]) {
        return pathSegments[chatIndex + 1];
      }
      return null;
    },

    checkIfConversationStarted() {
      return location.pathname.includes('/c/');
    },

    async fetchConversation(chatId) {
      const baseUrl = window.location.origin;
      const apiUrl = `${baseUrl}/backend-api`;
      const url = `${apiUrl}/conversation/${chatId}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch conversation: ${response.statusText}`);
      }
      const data = await response.json();
      return { id: chatId, ...data };
    },

    processConversation(conversation) {
      const { id, title, create_time, update_time, mapping, current_node } = conversation;

      const buildConversationChain = (nodeId) => {
        const node = mapping[nodeId];
        if (!node) return [];

        const chain = [];
        if (node.parent) {
          chain.push(...buildConversationChain(node.parent));
        }
        if (node.message) {
          chain.push(node);
        }
        return chain;
      };

      const chain = current_node ? buildConversationChain(current_node) : [];

      return {
        id,
        title: title || "Untitled",
        model: conversation.default_model_slug || "unknown",
        modelSlug: conversation.default_model_slug || "unknown",
        createTime: create_time,
        updateTime: update_time,
        conversationNodes: chain.filter(node => node.message && node.message.author)
      };
    },

    transformAuthor(author) {
      switch (author.role) {
        case "assistant": return "ChatGPT";
        case "user": return "You";
        case "tool": return `Plugin${author.name ? ` (${author.name})` : ""}`;
        default: return author.role;
      }
    },

    transformContent(content, metadata) {
      if (!content) return "";

      switch (content.content_type) {
        case "text":
          return (content.parts || []).join("\n") || "";

        case "code":
          return content.text || "";

        case "execution_output":
          if (metadata?.aggregate_result?.messages) {
            return metadata.aggregate_result.messages
              .filter((msg) => msg.message_type === "image")
              .map(() => "[image]")
              .join("\n");
          }
          return content.text || "";

        case "tether_quote":
          return `> ${content.title || content.text || ""}`;

        case "tether_browsing_code":
          return "";

        case "tether_browsing_display":
          const metadataList = metadata?._cite_metadata?.metadata_list;
          if (Array.isArray(metadataList) && metadataList.length > 0) {
            return metadataList.map(({ title, url }) => `> [${title}](${url})`).join("\n");
          }
          return "";

        case "multimodal_text":
          return (content.parts || []).map(part => {
            if (typeof part === "string") return part;
            if (part.content_type === "image_asset_pointer") {
              return `![image](${part.asset_pointer})`;
            }
            if (part.content_type === "audio_transcription") {
              return `[audio] ${part.text}`;
            }
            return "";
          }).filter(Boolean).join("\n") || "";

        default:
          console.warn("未知的content_type:", content.content_type);
          return "";
      }
    },

    conversationToMarkdown(conversation) {
      const { id, title, conversationNodes } = conversation;

      const content = conversationNodes.map(node => {
        const { message } = node;
        if (!message || !message.content || !message.author) return null;
        if (message.author.role === "system") return null;
        if (message.recipient && message.recipient !== "all") return null;

        const author = this.transformAuthor(message.author);
        const messageContent = this.transformContent(message.content, message.metadata);

        if (!messageContent || messageContent.trim() === "") return null;

        return `#### ${author}:\n${messageContent}`;
      }).filter(Boolean).join("\n");

      return `# ${title}\n${content}`;
    },

    standardizeLineBreaks(text) {
      return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    },

    downloadFile(fileName, mimeType, content) {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    getFileNameWithFormat(format, extension, params) {
      const { title, chatId, createTime, updateTime } = params;
      let fileName = format
        .replace("{title}", title || "Untitled")
        .replace("{chatId}", chatId || "")
        .replace("{create_time}", createTime ? new Date(createTime * 1000).toISOString() : "")
        .replace("{update_time}", updateTime ? new Date(updateTime * 1000).toISOString() : "");

      fileName = fileName.replace(/[<>:"/\\|?*]/g, "_");

      return fileName.endsWith(`.${extension}`) ? fileName : `${fileName}.${extension}`;
    },

    async exportToMarkdown() {
      if (!this.checkIfConversationStarted()) {
        alert("请先开始一个对话");
        return false;
      }

      try {
        const chatId = await this.getCurrentChatId();
        if (!chatId) {
          alert("无法获取当前对话ID");
          return false;
        }

        const rawConversation = await this.fetchConversation(chatId);
        const conversation = this.processConversation(rawConversation);
        const markdown = this.conversationToMarkdown(conversation);

        const fileName = this.getFileNameWithFormat("{title}", "md", {
          title: conversation.title,
          chatId: conversation.id,
          createTime: conversation.createTime,
          updateTime: conversation.updateTime
        });

        this.downloadFile(fileName, "text/markdown", this.standardizeLineBreaks(markdown));
        return true;
      } catch (error) {
        console.error("导出失败:", error);
        alert("导出失败: " + error.message);
        return false;
      }
    }
  };

  window.exportToMarkdown = () => ConversationExporter.exportToMarkdown();

  // ============================================
  // 菜单管理（带自动重试）
  // ============================================

  function ensureMenuExists() {
    // 只在登录用户且菜单不存在时创建
    if (showMenu() && !document.getElementById('menuButton')) {
      console.log("菜单按钮不存在，尝试创建...");
      createMenu();
    }
  }

  function retryCreateMenuWithBackoff() {
    // 使用指数退避重试策略
    const maxRetries = 5;
    let retryCount = 0;

    function tryCreate() {
      if (!showMenu()) {
        console.log("用户为访客，不创建菜单");
        return;
      }

      if (document.getElementById('menuButton')) {
        console.log("菜单已存在，停止重试");
        return;
      }

      console.log(`尝试创建菜单 (${retryCount + 1}/${maxRetries})...`);
      createMenu();

      retryCount++;
      if (retryCount < maxRetries && !document.getElementById('menuButton')) {
        // 使用指数退避：1s, 2s, 4s, 8s, 16s
        const delay = Math.pow(2, retryCount) * 1000;
        console.log(`${delay}ms 后重试...`);
        setTimeout(tryCreate, delay);
      } else if (document.getElementById('menuButton')) {
        console.log("菜单创建成功！");
        // 菜单创建成功后启动监控
        startMenuMonitoring();
      } else {
        console.warn("菜单创建失败，已达最大重试次数");
      }
    }

    tryCreate();
  }

  function startMenuMonitoring() {
    // 清除现有的监控定时器
    if (window.menuMonitorInterval) {
      clearInterval(window.menuMonitorInterval);
    }

    // 清除现有的 MutationObserver
    if (window.menuDOMObserver) {
      window.menuDOMObserver.disconnect();
    }

    // 只为登录用户启动监控
    if (showMenu()) {
      console.log("启动菜单监控...");

      // 定时检查机制（作为备份）
      window.menuMonitorInterval = setInterval(() => {
        ensureMenuExists();
      }, 2000); // 每2秒检查一次

      // 使用 MutationObserver 监控 DOM 变化
      window.menuDOMObserver = new MutationObserver((mutations) => {
        // 检查菜单按钮是否还在 DOM 中
        if (!document.getElementById('menuButton')) {
          console.log("检测到菜单按钮被移除，准备重新创建...");
          // 延迟一下再创建，避免在 DOM 变动期间操作
          setTimeout(() => {
            ensureMenuExists();
          }, 500);
        }
      });

      // 监控 body 的子节点变化
      window.menuDOMObserver.observe(document.body, {
        childList: true,
        subtree: false
      });
    }
  }

  function stopMenuMonitoring() {
    if (window.menuMonitorInterval) {
      clearInterval(window.menuMonitorInterval);
      window.menuMonitorInterval = null;
      console.log("停止菜单定时监控");
    }

    if (window.menuDOMObserver) {
      window.menuDOMObserver.disconnect();
      window.menuDOMObserver = null;
      console.log("停止菜单DOM监控");
    }
  }

  // ============================================
  // UI 组件
  // ============================================

  function createMenuIcon() {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="4" y1="6" x2="20" y2="6"></line>
        <line x1="4" y1="12" x2="20" y2="12"></line>
        <line x1="4" y1="18" x2="20" y2="18"></line>
      </svg>`;
    } else {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="4" y1="6" x2="20" y2="6"></line>
        <line x1="4" y1="12" x2="20" y2="12"></line>
        <line x1="4" y1="18" x2="20" y2="18"></line>
      </svg>`;
    }
  }

  function createMenu() {
    // 检查是否应该显示菜单
    if (!showMenu()) {
      console.log("用户为访客，不需要菜单");
      return;
    }

    // 如果菜单已存在，先移除旧的
    const existingButton = document.getElementById('menuButton');
    const existingMenu = document.getElementById('menu');

    if (existingButton) {
      existingButton.remove();
    }
    if (existingMenu) {
      existingMenu.remove();
    }

    // 创建菜单按钮（初始隐藏）
    const menuButton = document.createElement('div');
    menuButton.id = 'menuButton';
    menuButton.innerHTML = createMenuIcon();
    document.body.appendChild(menuButton);

    // 创建菜单（初始隐藏）
    const menu = document.createElement('div');
    menu.id = 'menu';
    document.body.appendChild(menu);

    state.menuButton = $(menuButton);
    state.menu = $(menu);

    // 点击按钮切换菜单显示
    state.menuButton.on('click', function() {
      if (menu.classList.contains('show')) {
        menu.classList.remove('show');
      } else {
        menu.classList.add('show');
      }
    });

    const showRedemption = state.closeCardExchange === undefined || state.closeCardExchange === 'false';

    let menuItems = `<div class="flex flex-col space-y-1" style="padding: 10px;">`;

    if (state.isVisitor === 'false') {
      if (showRedemption) {
        menuItems += `<div style="margin-bottom: 10px; text-align: center; width: 100%;">
          <a class="redemption-btn" onclick="showRedeemDialog();">
            <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>卡密兑换</span>
          </a>
        </div>`;
      }

      menuItems += `
        <div class="menu-grid">
          <a class="menu-item-dark" onclick="goHome()">
             <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>首页
          </a>
          <a class="menu-item-dark" onclick="autoSelectCarAction()">
            <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M16.2 7.8l-2 6.3-6.4 2.1 2-6.3z"></path>
          </svg>选车
          </a>
          <a class="menu-item-dark" onclick="showGoodsDialog()">
            <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>续费
          </a>
          <a class="menu-item-dark" onclick="showoNoticeDialog()">
            <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>公告
          </a>
          <a class="menu-item-dark" onclick="exportToMarkdown()">
            <svg t="1761211340234" class="menu-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M145.621959 0c-44.79888 0-79.998 36.81188-79.998 81.61076v860.77848c0 44.79888 35.19912 81.61076 79.998 81.61076h732.781681a81.969151 81.969151 0 0 0 81.61076-81.61076V324.80468L657.60916 0h-511.987201z" fill="#20B2AA" p-id="21291"></path><path d="M657.60916 0v233.59416c0 25.59936 17.61236 92.79768 97.61036 92.79768h204.79488L657.60916 0z" fill="#FFFFFF" p-id="21292"></path><path d="M317.547261 697.275368c2.995125-11.698908 5.887853-22.604235 8.703783-32.690383s5.529462-19.762706 8.166196-29.029674l7.731006-26.930527c2.508737-8.703782 4.889478-17.561161 7.19342-26.546536 0.895978-3.507112 1.433564-6.886228 1.587161-10.137347s0.614385-6.630234 1.433564-10.137346c0.40959-1.20317 1.126372-2.278343 2.175946-3.225519a18.585135 18.585135 0 0 1 11.775705-4.710283c2.79033 0 5.119872 0.332792 6.963026 0.972776s3.353516 1.535962 4.505487 2.636734 1.945551 2.431939 2.40634 3.967901 0.665583 3.276718 0.665584 5.171071c0 3.404715-0.537587 6.835029-1.638359 10.265343s-2.457539 7.21902-4.044699 11.314917c4.710282-3.711907 9.522962-7.19342 14.463638-10.495738s10.060548-6.195045 15.308417-8.703782 10.623734-4.505487 16.127597-5.99025 11.21252-2.252744 17.100373-2.252744c2.687933 0 5.401465 0.435189 8.089397 1.279968s5.119872 2.175946 7.270219 3.967901 3.942301 4.147096 5.401465 7.039824 2.278343 6.451039 2.483138 10.649334c4.300692-2.892728 8.754981-5.836654 13.337266-8.780581s9.266968-5.60626 14.028449-7.961401 9.497363-4.249494 14.258844-5.708657 9.369366-2.175946 13.874853-2.175946c6.707032 0 12.236494 0.870378 16.562786 2.636734s7.807805 4.095898 10.342141 7.039824 4.351891 6.374241 5.401465 10.265344 1.58716 8.038199 1.587161 12.441289c0 4.81268-0.460788 9.753356-1.356766 14.847629s-1.894353 9.958151-2.995125 14.540436c-2.892728 11.59651-6.143846 22.578636-9.753357 32.920777s-7.500612 20.81228-11.698907 31.436014l-3.148721 7.961401c-1.100772 2.81593-2.38074 5.375866-3.814305 7.731007s-3.148721 4.300692-5.094273 5.862253-4.223894 2.329542-6.835029 2.329542c-5.887853 0-9.958151-0.998375-12.159696-2.995125s-3.302317-4.838279-3.302317-8.550186c0-0.998375 0.051199-2.150346 0.153596-3.455914s0.358391-2.559936 0.742381-3.737506c0.40959-1.510362 1.305567-3.686308 2.687933-6.527837s2.918327-5.913452 4.582286-9.21577 3.276718-6.630234 4.863878-9.98375 2.79033-6.271843 3.60951-8.780581c1.305567-4.300692 2.81593-9.266968 4.582285-14.924427s3.430314-11.340516 5.017475-17.100372 2.918327-11.21252 3.967901-16.357991 1.58716-9.318167 1.58716-12.518087c0-1.510362-0.153596-2.995125-0.460789-4.505488s-0.81918-2.79033-1.58716-3.891102-1.791955-1.99675-3.148721-2.687933-3.071923-1.049574-5.171071-1.049574c-2.995125 0-6.579036 0.844779-10.726132 2.559936s-8.447789 3.916702-12.902077 6.681433-8.78058 5.862253-12.978876 9.292568-7.807805 6.886228-10.80293 10.265343c-2.099148 2.40634-4.095898 4.351891-5.99025 5.862254s-3.788705 2.662333-5.708657 3.455913c-0.204795 0.40959-0.691183 1.715157-1.510362 3.967901s-1.740756 4.940676-2.841529 8.089398-2.252744 6.553436-3.455914 10.188545l-3.379116 10.188545-2.636734 7.961401c-0.716782 2.150346-1.049574 3.327917-1.049573 3.532712-0.691183 2.79033-1.305567 5.683058-1.791956 8.626984l-1.356766 8.473388c-0.40959 2.687933-0.767981 5.58066-1.126371 8.626985s-1.049574 5.887853-2.099148 8.550186-2.662333 4.81268-4.81268 6.527837-5.171071 2.559936-9.062173 2.559936c-1.99675 0-3.814305-0.511987-5.478263-1.510362s-3.071923-2.278343-4.275093-3.814305-2.150346-3.302317-2.841529-5.247869-1.100772-3.916702-1.20317-5.913452c2.303942-9.010975 4.556686-17.100372 6.758231-24.293793s4.40309-14.105247 6.604635-20.709882 4.326292-13.234869 6.37424-19.865103 4.070298-13.977251 6.067049-21.964251c0.511987-1.894353 0.895978-3.763106 1.20317-5.631859s0.460788-3.481513 0.460788-4.863879c0-2.40634-0.511987-4.377491-1.510362-5.913452s-2.739132-2.329542-5.247869-2.329542c-4.095898 0-8.166196 0.81918-12.236494 2.483138s-8.422189 4.223894-13.132472 7.731007-9.932552 7.961401-15.666808 13.337267-12.364491 11.852504-19.865103 19.353116c-0.79358 1.510362-1.843154 4.300692-3.148722 8.39659s-2.636734 8.447789-3.9679 13.055673-2.585535 8.882978-3.686308 12.82528-1.791955 6.579036-2.099148 7.884603c-1.100772 4.198295-1.843154 7.731007-2.252744 10.572535l-1.049573 7.731007c-0.204795 1.20317-0.511987 3.174321-0.895978 5.913452s-1.126372 5.529462-2.175946 8.319792-2.534337 5.273468-4.428689 7.423815-4.40309 3.225519-7.500612 3.225519c-4.607885 0-8.370991-1.254369-11.314917-3.737507a11.878103 11.878103 0 0 1-4.275094-11.391715 20.300292 20.300292 0 0 1 0.486388-1.99675zM579.60791 655.727607c1.305567-5.401465 3.020724-10.80293 5.171071-16.204395a109.078873 109.078873 0 0 1 34.866328-46.027649c3.9935-3.19992 8.217395-6.220644 12.671683-9.062174s8.985375-5.324667 13.567661-7.423814 9.21577-3.763106 13.874853-5.017475 9.21577-1.868753 13.721257-1.868753a37.682258 37.682258 0 0 1 16.050799 3.148721l8.012599-28.210495c4.326292-15.308417 9.676558-36.607085 15.974001-63.896002 1.100772-2.687933 2.662333-4.940676 4.659084-6.758231s4.40309-2.687933 7.19342-2.687933c1.99675 0 3.942301 0.179196 5.862253 0.537587s3.60951 1.049574 5.094273 2.099147 2.687933 2.483138 3.60951 4.275093 1.356766 4.147096 1.356766 7.039824l-30.156046 120.444989c-0.895978 3.404715-1.740756 7.987-2.559936 13.721257s-1.561561 11.826904-2.252744 18.226744-1.254369 12.722882-1.638359 18.969126-0.588785 11.622109-0.588785 16.127597c0 5.60626-0.639984 11.161321-1.945552 16.639584-0.588785 2.40634-1.228769 4.428689-1.868753 6.067048s-1.535962 2.995125-2.636734 4.044699-2.483138 1.791955-4.121497 2.252744-3.737507 0.665583-6.220645 0.665583c-2.892728 0-5.145471-0.307192-6.758231-0.895977s-2.79033-1.433564-3.609509-2.483138-1.279968-2.252744-1.433565-3.60951-0.255994-2.79033-0.307192-4.351891-0.153596-3.148721-0.307192-4.81268-0.563186-3.225519-1.279968-4.735882c-1.20317 0.79358-2.841529 1.843154-4.940677 3.148722l-6.37424 3.967901c-2.150346 1.331167-4.172696 2.611135-6.067049 3.737506l-4.198295 2.483138c-2.303942 1.305567-4.889478 2.662333-7.807805 4.121497s-6.01585 2.79033-9.369365 4.044699-6.860628 2.278343-10.495738 3.071923-7.321417 1.20317-11.033324 1.20317c-4.505487 0-8.882978-0.742381-13.132472-2.252744a32.434389 32.434389 0 0 1-19.404315-18.687532 42.930127 42.930127 0 0 1-2.995125-16.716383 55.883403 55.883403 0 0 1 1.817555-14.335641z m25.932151-1.20317c-0.79358 2.995125-1.20317 5.887853-1.203169 8.703782 0 2.892728 0.255994 5.631859 0.742381 8.166196s1.433564 4.78708 2.764731 6.681433 3.148721 3.430314 5.401465 4.582286 5.171071 1.715157 8.78058 1.715157c1.99675 0 4.147096-0.358391 6.451039-1.049574s4.582285-1.58716 6.835029-2.636734 4.351891-2.150346 6.297443-3.302318a151.394615 151.394615 0 0 0 15.59001-10.418939c3.251119-2.40634 6.169446-4.991875 8.78058-7.807805s4.863878-5.913452 6.83503-9.369366 3.532712-7.423814 4.735881-11.929301c0.998375-3.9935 1.868753-7.654209 2.636734-10.956527s1.433564-6.527837 2.02235-9.676558 1.151971-6.374241 1.638359-9.676558 0.998375-6.937427 1.510362-10.956526c-0.511987-0.588785-1.177571-1.177571-2.022349-1.715157s-2.124747-0.81918-3.814305-0.819179c-3.9935 0-8.39659 0.665583-13.20927 2.022349s-9.727757 3.276718-14.770831 5.785455-10.00935 5.555061-14.847628 9.138972-9.343766 7.628609-13.490863 12.082898-7.782205 9.318167-10.879728 14.617234-5.375866 10.930927-6.783831 16.81878z" fill="#FFFFFF" p-id="21293"></path></svg>导出
          </a>
          <a class="menu-item-dark" onclick="showFAQDialog()">
            <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>说明
          </a>
          <a class="menu-item-dark" onclick="autoSelectClaude()">
            <svg t="1761210359116" class="menu-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M252.8 652.8l167.89504-94.29504 2.76992-8.10496-2.76992-4.48h-8.11008l-28.16-1.70496-96-2.56-83.2-3.41504-80.64-4.26496-20.26496-4.27008-18.98496-24.96 1.92-12.58496 17.06496-11.52 24.32 2.13504L182.61504 486.4 263.68 491.94496l58.66496 3.41504 87.04 9.17504h13.87008l1.92-5.55008-4.69504-3.40992-3.62496-3.41504-83.84-56.74496-90.67008-60.16-47.56992-34.56L168.96 323.2l-13.01504-16.42496-5.54496-35.84 23.25504-25.81504 31.36 2.13504 7.88992 2.12992 31.79008 24.32 67.84 52.48 88.52992 65.28 13.01504 10.88 5.12-3.62496 0.64-2.56-5.76-9.81504-48.21504-87.04-51.40992-88.52992L291.62496 174.08l-5.96992-21.97504a107.85792 107.85792 0 0 1-3.63008-26.02496l26.67008-36.05504 14.72-4.68992 35.40992 4.68992L373.76 103.04l21.97504 50.34496 35.62496 79.36L486.61504 340.48l16.20992 32 8.75008 29.65504 3.2 9.16992h5.54496v-5.12l4.48-60.8 8.32-74.44992 8.10496-96 2.77504-27.09504 13.44-32.42496 26.66496-17.49504 20.69504 10.02496 17.06496 24.32-2.34496 15.79008-10.24 65.92-19.84 103.24992-13.01504 69.12h7.47008l8.74496-8.74496 34.98496-46.50496 58.67008-73.39008 26.02496-29.22496 30.29504-32.21504 19.40992-15.36H798.72l27.09504 40.11008-12.16 41.38496-37.76 48-31.36 40.53504-45.01504 60.58496-28.16 48.42496 2.56 3.84 6.61504-0.64 101.54496-21.54496 54.82496-10.02496 65.49504-11.31008 29.65504 13.87008 3.2 14.08-11.73504 28.8-69.97504 17.28-82.12992 16.42496-122.24 29.01504-1.49504 1.06496 1.70496 2.13504 55.04 5.12 23.47008 1.28h57.6l107.30496 7.88992 28.16 18.56 16.85504 22.61504-2.77504 17.28-43.30496 21.97504-58.24-13.87008-136.11008-32.42496-46.72-11.73504h-6.4v3.84l38.83008 37.97504 71.24992 64.42496 89.17504 82.99008 4.48 20.48-11.52 16.20992L824.32 803.84l-78.50496-58.88-30.29504-26.66496-68.48-57.6h-4.48v5.96992l15.78496 23.04 83.41504 125.23008 4.26496 38.4-5.96992 12.58496-21.55008 7.46496-23.68-4.26496-48.84992-68.48-50.35008-77.22496-40.52992-69.12-4.91008 2.76992-23.88992 258.13504-11.31008 13.22496-26.02496 10.03008-21.54496-16.43008-11.52-26.66496 11.52-52.48L481.28 774.4l11.30496-54.4 10.24-67.62496 5.97504-22.4-0.42496-1.49504-4.91008 0.64-50.98496 69.97504L374.82496 803.84l-61.44 65.70496-14.72 5.76-25.38496-13.22496 2.34496-23.46496 14.29504-20.91008 84.90496-107.94496 51.2-66.98496L459.09504 604.16v-5.54496h-2.13504l-225.49504 146.56-40.10496 5.12L174.08 734.08l2.13504-26.66496L184.32 698.66496l67.84-46.72h-0.21504l0.85504 0.85504z" fill="#D97757" p-id="19268"></path></svg>Claude
          </a>
          <a class="menu-item-dark" onclick="logout()">
             <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>退出
          </a>
        </div>`;
    } else {
      menuItems += `
        <div class="menu-grid">
          <a class="menu-item-dark" onclick="goHome()">
             <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>首页
          </a>
          <a class="menu-item-dark" onclick="login()">
            <i class="iconfont icon-denglu"></i>登录
          </a>
        </div>`;
    }

    menuItems += `</div>`;
    state.menu.html(menuItems);

    // 渐变显示菜单按钮
    setTimeout(() => {
      menuButton.classList.add('loaded');
      state.menuPreloaded = true;
    }, 100);
  }

  // ============================================
  // API 和网络功能
  // ============================================

  function fetchValidity() {
    if (state.fetchingValidity) {
      console.log("Already fetching validity");
      return Promise.reject(new Error('Already fetching'));
    }

    state.fetchingValidity = true;

    return new Promise((resolve, reject) => {
      const username = getCookie('username');
      if (!username) {
        state.validityText = '未登录';
        state.usageText = '请先登录';
        $('#menuValidity').text(`有效期:${state.validityText}`);
        $('#menuUsage').text(state.usageText);
        state.fetchingValidity = false;
        reject(new Error('Not logged in'));
        return;
      }

      $.ajax({
        url: `/client-api/validity-usage?username=${encodeURIComponent(username)}`,
        method: 'GET',
        success: function(response) {
          state.validityText = response.validity ? `${response.validity}` : '有效期未知';
          state.usageText = response.usage ? `${response.usage}` : '不限制使用';
          $('#menuValidity').text(`有效期:${state.validityText}`);
          $('#menuUsage').text(state.usageText);
          state.fetchingValidity = false;
          resolve(state.validityText);
        },
        error: function(err) {
          console.error("Error fetching validity:", err);
          state.validityText = '无法获取有效期';
          state.usageText = '无法获取使用量';
          state.fetchingValidity = false;
          reject(err);
        }
      });
    });
  }

  function getConfig() {
    if (state.fetchingConfig) {
      console.log("Already fetching config");
      return;
    }

    state.fetchingConfig = true;

    fetch(`/client-api/site/config`)
      .then((response) => response.json())
      .then(({ code, data }) => {
        if (code === 200) {
          Object.assign(state, {
            siteNotice: data.siteAnnouncement,
            FAQ: data.userGuideUrl,
            backApiUrl: data.backupUrl,
            enableSiteShop: data.enableSiteShop,
            enableExpirationReminder: data.enableExpirationReminder,
            fkAddress: data.fkAddress,
            enableNoLogin: data.enableNoLogin,
            enableBackNode: data.enableBackNode,
            enableShowRemaining: data.enableShowRemaining,
            enableNoSelectCar: data.enableNoSelectCar,
            closeCardExchange: data.closeCardExchange
          });

          if (state.enableBackNode == 'true') {
            deleteCookie('gfsessionid');
          }

          if (state.enableNoLogin == 'false') {
            setSessionCookie('visitor', false);
          }

          if (showMenu()) {
            fetchValidity()
              .then(() => {
                if (state.enableExpirationReminder == 'true') {
                  showExpireTip();
                }
                // 使用带重试的菜单创建
                retryCreateMenuWithBackoff();
              })
              .catch(() => {
                // 即使获取有效期失败，也要尝试创建菜单
                retryCreateMenuWithBackoff();
              });
          } else {
            // 如果是访客，确保停止菜单监控
            stopMenuMonitoring();
          }

          initRegAndLoginButton();
        }

        state.fetchingConfig = false;
      })
      .catch((error) => {
        console.error('Error fetching config:', error);
        state.fetchingConfig = false;

        // 配置加载失败，仍然尝试创建菜单（使用默认状态）
        if (showMenu()) {
          console.log("配置加载失败，使用默认设置创建菜单...");
          setTimeout(() => {
            retryCreateMenuWithBackoff();
          }, 1000);
        }

        // 确保登录/注册按钮被初始化
        if (state.isVisitor == 'true' || !state.isVisitor) {
          initRegAndLoginButton();
        }
      });
  }

  function fetchAnnouncement() {
    if (state.fetchingAnnouncement) {
      console.log("Already fetching announcement");
      return;
    }

    state.fetchingAnnouncement = true;

    fetch('/client-api/getLatestNotice', { method: 'GET' })
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
        console.error('Error fetching announcement:', err);
      })
      .finally(() => {
        state.fetchingAnnouncement = false;
      });
  }

  function showAnnouncement(announcement) {
    const savedAnnouncement = localStorage.getItem('lastAnnouncement');
    if (announcement && savedAnnouncement !== announcement) {
      const isMobileVal = isMobile();
      const width = isMobileVal ? $(window).width() : Math.min($(window).width(), 1024);
      const height = isMobileVal ? $(window).height() : Math.min($(window).height(), 800);

      customModal.open({
        type: 1,
        title: ['系统通知', 'font-size: 18px;'],
        shadeClose: true,
        shade: 0.2,
        maxmin: true,
        btn: ['知道了'],
        btnAlign: 'right',
        scrollbar: false,
        offset: 'auto',
        area: [`${width}px`, `${height}px`],
        content: announcement,
        yes: function(index) {
          localStorage.setItem('lastAnnouncement', announcement);
          customModal.close(index);
        }
      });
    }
  }

  // ============================================
  // UI 初始化
  // ============================================

  function initRegAndLoginButton() {
    if (document.querySelector('.visitor-buttons-initialized')) {
      return;
    }

    StyleManager.addOpenAIStyles();

    const rateElement = document.querySelector(
      'div.flex.w-full.items-start.gap-4.rounded-2xl.border.border-token-border-light'
    );
    if (rateElement) {
      rateElement.style.display = 'none';
      rateElement.remove();
    }

    const $div = $('nav.flex.h-full.w-full.flex-1.flex-col>div:nth-child(7)');
    if ($div.length === 0) {
      setTimeout(initRegAndLoginButton, 500);
      return;
    }

    if ($div.hasClass('init')) {
      return;
    }

    $div.addClass('init');

    let html;
    if (state.isVisitor == 'true' || !state.isVisitor) {
      const profileBtn = document.querySelector("button[data-testid='profile-button']");
      if (profileBtn) {
        profileBtn.style.display = 'none';
      }

      html = `<div class="flex flex-col space-y-2 mb-10 visitor-buttons-initialized">
        <div class="visitor-buttons">
          <button onclick="login();" class="custom-btn login-btn">
            <svg class="login-btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
            <span>登录</span>
          </button>
          <button onclick="register();" class="custom-btn register-btn">
            <svg class="register-btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            <span>注册</span>
          </button>
        </div>
      </div>`;
    } else {
      const validityDisplayText = state.validityText ? state.validityText.split(' ')[0] : '数据加载中';
      const usageDisplayText = state.usageText || '数据加载中';

      html = `<div class="flex flex-col mb-6 visitor-buttons-initialized openai-user-info">
        <div class="openai-user-stats">
          <div class="flex justify-between items-center mb-2 openai-user-row">
            <div class="openai-stat-icon-wrapper">
              <svg class="openai-stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div id="bottom-validity-display" class="openai-stat-value">${validityDisplayText}</div>
          </div>
          ${state.enableShowRemaining === 'true' ? `
          <div class="flex justify-between items-center mb-2 openai-user-row">
            <div class="openai-stat-icon-wrapper">
              <svg class="openai-stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
              </svg>
            </div>
            <div id="bottom-usage-display" class="openai-stat-value">${usageDisplayText}</div>
          </div>
          ` : ''}
        </div>
        <button onclick="showGoodsDialog();" class="openai-recharge-btn">
          <svg class="openai-btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="5" width="20" height="14" rx="2"></rect>
            <line x1="2" y1="10" x2="22" y2="10"></line>
          </svg>
          续费/充值
        </button>
      </div>`;

      $div.html(html);

      fetchValidity().then(() => {
        const validityShortText = state.validityText || '未知';
        const bottomValidityDisplay = document.getElementById('bottom-validity-display');
        const bottomUsageDisplay = document.getElementById('bottom-usage-display');

        if (bottomValidityDisplay) {
          bottomValidityDisplay.textContent = validityShortText;
        }
        if (bottomUsageDisplay && state.enableShowRemaining === 'true') {
          bottomUsageDisplay.textContent = state.usageText || '10/10(每3小时)';
        }
      }).catch(err => {
        console.error('获取有效期失败:', err);
      });

      return;
    }

    $div.html(html);
    $div.addClass('visitor-container');
  }

  function initCustomUI() {
    if (state.customUIInitialized) {
      console.log("UI already initialized");
      return;
    }

    state.customUIInitialized = true;

    const closeChatDialog = (element) => {
      if (!element) return;

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

    // Global dialog functions
    window.showProfile = (element) => {
      if (isLogin()) {
        closeChatDialog(element);
        showIframeDialog('个人中心', '/list/#/external-profile', 600, 1000, 2);
      }
    };

    window.showFAQDialog = (element) => {
      closeChatDialog(element);
      showIframeDialog(
        '使用说明',
        state.FAQ,
        600,
        1000,
        state.FAQ && state.FAQ.startsWith('http') ? 2 : 1
      );
    };

    window.showGoodsDialog = (element) => {
      if (isLogin()) {
        closeChatDialog(element);
        if (state.enableSiteShop === 'true') {
          showIframeDialog('站内购买', state.originUrl + '/list/#/shop', 800, 1000, 2);
        } else {
          if (state.fkAddress) {
            showIframeDialog('卡密购买', state.fkAddress, 700, 1200, 2);
          } else {
            customModal.msg('管理员还未配置卡密地址');
          }
        }
      }
    };

    window.showoNoticeDialog = (element) => {
      closeChatDialog(element);
      showIframeDialog(
        '站内公告',
        state.siteNotice,
        600,
        1000,
        state.siteNotice && state.siteNotice.startsWith('http') ? 2 : 1
      );
    };

    window.goHome = () => {
      window.location.href = state.originUrl + '/list/#/home';
    };

    window.login = () => {
      window.location.href = state.originUrl + '/list/#/login';
    };

    window.register = () => {
      window.location.href = state.originUrl + '/list/#/register';
    };

    window.logout = () => {
      deleteCookie('gfsessionid');
      setSessionCookie('visitor', true);
      localStorage.removeItem('accessToken');
      window.location.href = state.originUrl;
    };

    window.autoSelectClaude = () => {
      if (!isLogin()) return;

      const loadIndex = customModal.msg('正在跳转到claude,请稍后...', { icon: 16, time: 0 });
      const username = getCookie('username');

      fetch(`/client-api/getClaudeLoginUrl?username=${encodeURIComponent(username)}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.text();
        })
        .then((element) => {
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
              customModal.msg(res.msg);
            } else {
              customModal.msg('未能成功获取Claude登录地址,请稍后重试');
            }
          }
        })
        .catch((error) => {
          console.error('Claude login error:', error);
        })
        .finally(() => {
          customModal.close(loadIndex);
        });
    };

    window.autoSelectCarAction = () => {
      if (!isLogin()) return;

      const loadIndex = customModal.msg('正在为您自动选车,请稍后...', { icon: 16, time: 0 });
      const token = localStorage.getItem('accessToken');

      if (!token) {
        customModal.msg('您还未登录,请先登录');
        window.goHome();
        return;
      }

      const username = getCookie('username');
      if (!username) {
        customModal.msg('您还未登录，请先登录');
        return;
      }

      fetch(`/client-api/getIdleCar?username=${encodeURIComponent(username)}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.text();
        })
        .then((element) => {
          const res = JSON.parse(element);
          const { carID, nodeType, planType } = res;

          if (carID) {
            const username = getCookie('username');
            if (!username || !nodeType) {
              customModal.msg('自动选车异常,正在为您自动跳转到首页,请重新选择');
              window.goHome();
              return;
            }

            let loginData = {
              usertoken: username,
              carid: carID,
              nodeType: nodeType,
              planType: planType,
            };

            fetch(`/auth/login?carid=${carID}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(loginData),
            }).then((response) => {
              if (response.redirected) {
                window.location.href = '/';
              } else {
                customModal.msg('自动选车失败,请回到首页后手动选择');
              }
            });
          } else {
            throw new Error('Idle car not found');
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          customModal.msg('自动选车失败,将回到首页');
          window.goHome();
        })
        .finally(() => {
          customModal.close(loadIndex);
        });
    };

    window.showRedeemDialog = function() {
      if (state.closeCardExchange === 'true') {
        customModal.msg('卡密兑换功能已禁用');
        return;
      }

      if (!isLogin()) return;

      customModal.open({
        type: 1,
        title: '卡密兑换',
        closeBtn: true,
        area: ['350px', 'auto'],
        shadeClose: true,
        content: `
          <div style="padding: 20px;">
            <div style="margin-bottom: 15px;">
              <input type="text" id="cardKey" placeholder="请输入卡密" class="custom-input" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div style="text-align: center;">
              <button id="redeemSubmit" class="custom-btn" style="background: #f90; border-radius: 4px; color: white;">确定兑换</button>
            </div>
          </div>
        `,
        success: function(layer, index) {
          const submitBtn = document.getElementById('redeemSubmit');
          const cardKeyInput = document.getElementById('cardKey');

          submitBtn.onclick = window.redeemCard;
          cardKeyInput.onkeypress = function(e) {
            if (e.key === 'Enter') {
              window.redeemCard();
            }
          };
        }
      });
    };

    window.redeemCard = function() {
      const cardKey = $('#cardKey').val().trim();
      if (!cardKey) {
        customModal.msg('请输入卡密');
        return;
      }

      const loadIndex = customModal.msg('正在兑换,请稍后...', { icon: 16, time: 0 });
      const token = localStorage.getItem('accessToken');

      if (!token) {
        customModal.close(loadIndex);
        customModal.msg('认证已过期，请重新登录');
        return;
      }

      const userId = getUserId();

      fetch(`/client-api/code/redeem?key=${encodeURIComponent(cardKey)}&userId=${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          customModal.close(loadIndex);
          if (data && data.code === 1) {
            customModal.msg('兑换成功！');
            fetchValidity();
            customModal.closeAll();
          } else {
            customModal.msg(data.msg || '兑换失败，请检查卡密是否正确');
          }
        })
        .catch((error) => {
          customModal.close(loadIndex);
          if (error.message.includes('401')) {
            customModal.msg('认证已过期，请重新登录');
          } else {
            customModal.msg('兑换失败，请稍后重试');
          }
          console.error('Error:', error);
        });
    };

    initRegAndLoginButton();
    setupEventListeners();
  }

  function setupEventListeners() {
    $(document).off('click', '.draggable.sticky button.inline-flex');
    $(document).off('click', '[data-link]');

    $(document).on('click', '.draggable.sticky button.inline-flex', function(event) {
      event.stopPropagation();
      initRegAndLoginButton();
    });

    $(document).on('click', '[data-link]', function(event) {
      event.stopPropagation();
      const url = $(this).data('link');
      window.location.href = url;
    });

    $(document).on('click', function(e) {
      if (
        !$(e.target).closest('#menu').length &&
        !$(e.target).closest('#menuButton').length &&
        showMenu() && state.menu
      ) {
        const menu = document.getElementById('menu');
        if (menu) {
          menu.classList.remove('show');
        }
      }
    });
  }

  function showIframeDialog(title, url, height, width, type = 1) {
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const isMobileDevice = isMobile();

    let modalWidth, modalHeight;

    if (isMobileDevice) {
      modalWidth = Math.max(viewportWidth - 20, 300) + 'px';
      modalHeight = Math.max(viewportHeight - 60, 400) + 'px';
    } else {
      const maxWidth = Math.min(viewportWidth * 0.9, width || 1000);
      const maxHeight = Math.min(viewportHeight * 0.85, height || 800);
      modalWidth = Math.max(maxWidth, 320) + 'px';
      modalHeight = Math.max(maxHeight, 400) + 'px';
    }

    let content;
    if (type === 1) {
      content = url;
    } else if (type === 2) {
      content = `<iframe src="${url}" style="width:100%;height:100%;border:none;" allowfullscreen></iframe>`;
    }

    return customModal.open({
      type: 1,
      title: [title, 'font-size: 18px;'],
      shadeClose: true,
      shade: 0.2,
      maxmin: true,
      resize: !isMobileDevice,
      scrollbar: false,
      offset: 'auto',
      area: [modalWidth, modalHeight],
      content: content
    });
  }

  window.showIframeDialog = showIframeDialog;

  function showExpireTip() {
    if (!state.validityText) return;

    const validityDate = new Date(state.validityText);
    const currentDate = new Date();
    const timeDiff = validityDate - currentDate;
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (daysLeft <= 3 && daysLeft > 0) {
      customModal.open({
        type: 1,
        title: false,
        closeBtn: false,
        area: ['300px', 'auto'],
        shade: 0.8,
        btn: ['立即续费', '稍后处理'],
        btnAlign: 'right',
        content: `<div style="padding: 50px; line-height: 22px; background-color: #fff; color: #333;">
          <i class="custom-icon custom-icon-notice" style="font-size: 30px; color: #FF9800;"></i>
          <p style="margin-top:20px;">尊敬的用户，您的会员有效期将在 ${daysLeft} 天后过期</p>
        </div>`,
        yes: function() {
          window.showGoodsDialog();
        }
      });
    } else if (daysLeft <= 0) {
      customModal.open({
        type: 1,
        title: false,
        closeBtn: false,
        area: ['300px', 'auto'],
        shade: 0.8,
        btn: ['立即续费', '稍后处理'],
        btnAlign: 'right',
        content: `<div style="padding: 50px; line-height: 22px; background-color: #fff; color: #333;">
          <i class="custom-icon custom-icon-notice" style="font-size: 30px; color: #FF9800;"></i>
          <p style="margin-top:20px;">尊敬的用户，您的会员已到期！</p>
        </div>`,
        yes: function() {
          window.showGoodsDialog();
        }
      });
    }
  }

  // ============================================
  // 用户代理覆盖
  // ============================================

  (function() {
    const desktopChromeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

    Object.defineProperty(Navigator.prototype, 'userAgent', {
      get: function() { return desktopChromeUA; }
    });

    Object.defineProperty(Navigator.prototype, 'platform', {
      get: function() { return 'Win32'; }
    });

    Object.defineProperty(Navigator.prototype, 'appVersion', {
      get: function() { return '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'; }
    });

    Object.defineProperty(Navigator.prototype, 'vendor', {
      get: function() { return 'Google Inc.'; }
    });

    Object.defineProperty(Navigator.prototype, 'maxTouchPoints', {
      get: function() { return 0; }
    });

    window.isMobile = function() { return false; };
    window.isTouchDevice = function() { return false; };

    console.log('已启用桌面浏览器UA模拟');
  })();

  // ============================================
  // 初始化
  // ============================================

  function init() {
    console.log("初始化自定义UI...");
    StyleManager.addAll();

    if (typeof jQuery === 'undefined') {
      loadExternalScript('/jquery.min.js', function() {
        console.log('jQuery 已加载');
        loadRequiredScripts();
      });
    } else {
      console.log('jQuery 已经加载');
      loadRequiredScripts();
    }

    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'class' && mutation.target === document.documentElement) {
          state.htmlClass = document.documentElement.classList.contains('dark') ? 'dark' : '';
          if (document.getElementById('menuButton')) {
            document.getElementById('menuButton').innerHTML = createMenuIcon();
          }
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
  }

  // 开始初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 页面加载完成后获取公告
  window.addEventListener('load', function() {
    setTimeout(function() {
      console.log("页面已完全加载，开始获取公告...");
      fetchAnnouncement();
    }, 3000);
  });

})();
