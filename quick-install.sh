#!/bin/bash

# Ubuntu 一键安装 Docker + Caddy + SASS（带 HTTPS 自动配置）
# 使用方法：chmod +x install_docker_caddy.sh && sudo ./install_docker_caddy.sh

# 检查是否为 root 用户
if [ "$(id -u)" -ne 0 ]; then
  echo "请使用 root 用户或通过 sudo 运行此脚本"
  exit 1
fi

# 检查命令是否存在的函数
check_command() {
    if command -v $1 &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# 域名正则（简单校验二级及以上域名，不含 http(s)://，不含特殊字符）
DOMAIN_REGEX="^([a-zA-Z0-9][-a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$"

# 初始化域名变量
DOMAIN1=""
DOMAIN2=""
DOMAIN3=""

# 询问是否需要配置 GPT 域名
read -p "是否需要配置 GPT 域名？(y/n): " CONFIG_GPT
if [[ $CONFIG_GPT == "y" ]]; then
    while true; do
        read -p "请输入 GPT 二级域名（如：api.example.com）: " DOMAIN1
        if [[ $DOMAIN1 =~ $DOMAIN_REGEX ]]; then
            break
        else
            echo "❌ 域名格式不正确，请重新输入！"
        fi
    done
fi

# 询问是否需要配置 Claude 域名
read -p "是否需要配置 Claude 域名？(y/n): " CONFIG_CLAUDE
if [[ $CONFIG_CLAUDE == "y" ]]; then
    while true; do
        read -p "请输入 Claude 二级域名（如：oauth.example.com）: " DOMAIN2
        if [[ $DOMAIN2 =~ $DOMAIN_REGEX ]]; then
            break
        else
            echo "❌ 域名格式不正确，请重新输入！"
        fi
    done
fi

# 询问是否需要配置 Grok 域名
read -p "是否需要配置 Grok 域名？(y/n): " CONFIG_GROK
if [[ $CONFIG_GROK == "y" ]]; then
    while true; do
        read -p "请输入 Grok 二级域名（如：web.example.com）: " DOMAIN3
        if [[ $DOMAIN3 =~ $DOMAIN_REGEX ]]; then
            break
        else
            echo "❌ 域名格式不正确，请重新输入！"
        fi
    done
fi

# 显示已配置的域名
echo "已配置的域名："
if [[ -n $DOMAIN1 ]]; then
    echo "1. GPT: $DOMAIN1"
fi
if [[ -n $DOMAIN2 ]]; then
    echo "2. Claude: $DOMAIN2"
fi
if [[ -n $DOMAIN3 ]]; then
    echo "3. Grok: $DOMAIN3"
fi

# 检查并安装 Docker
if ! check_command docker; then
    echo "➤ 1. 安装 Docker..."
    apt-get update
    apt-get install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io

    # 启动 Docker 并设置开机自启
    systemctl start docker
    systemctl enable docker
else
    echo "✓ Docker 已安装，跳过安装步骤"
fi

# 检查并安装 Docker Compose
if ! check_command docker-compose; then
    echo "➤ 2. 安装 Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/v2.23.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    echo "✓ Docker Compose 已安装，跳过安装步骤"
fi

# 检查并安装 Caddy
if ! check_command caddy; then
    echo "➤ 3. 安装 Caddy..."
    apt install -y debian-keyring debian-archive-keyring apt-transport-https
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
    apt update
    apt install -y caddy

    # 启动 Caddy
    systemctl enable caddy
    systemctl restart caddy
else
    echo "✓ Caddy 已安装，跳过安装步骤"
fi

# 验证安装
echo "➤ 4. 验证安装..."
docker --version
docker-compose --version
caddy version

echo "✅ 安装docker和caddy完成！"

# 自动生成 Caddyfile 到 /etc/caddy/Caddyfile
cat > /etc/caddy/Caddyfile <<EOF
# GPT 配置
${DOMAIN1:+${DOMAIN1} {
    handle /expander-api/* {
        reverse_proxy localhost:9301 {
            header_up Host {host}
            header_up X-Real-IP {remote_host}
            header_up X-Forwarded-For {http.request.remote.for}
            header_up REMOTE-HOST {remote_host}
            }
        }
    handle /public-api/* {
        reverse_proxy localhost:9301 {
            header_up Host {host}
            header_up X-Real-IP {remote_host}
            header_up X-Forwarded-For {http.request.remote.for}
            header_up REMOTE-HOST {remote_host}
            }
        }
   handle /app/* {
        reverse_proxy localhost:9301
        }
   handle /expander/* {
        reverse_proxy localhost:9301
        }
  
   redir /list /list/
   handle_path /list/* {
       rewrite *  /app/index.html
       reverse_proxy localhost:9301
   }
reverse_proxy localhost:9300
}}

# Claude 配置
${DOMAIN2:+${DOMAIN2} {
    reverse_proxy localhost:9302 
}}

# Grok 配置
${DOMAIN3:+${DOMAIN3} {
    reverse_proxy localhost:9303
}}
EOF

# 重启 Caddy 以应用新配置
systemctl restart caddy

set -e

## 克隆仓库到本地
echo "➤ 5. 开始拉取代码..."
git clone -b deploy --depth=1 https://github.com/seven2202/expander-sass.git expander-sass

## 进入目录
cd expander-sass
echo "➤ 6. 开始配置 docker-compose.yml 信息..."

# 提示用户输入 CHATPROXY 和 OAUTH_URL
echo -n "请输入接入 gpt 的网关地址，要带https (如：https://a.baidu.com)："
read CHATPROXY < /dev/tty

# 替换 docker-compose.yml 文件中的 CHATPROXY 和 OAUTH_URL
sed -i "s|CHATPROXY: .*|CHATPROXY: \"$CHATPROXY\"|g" docker-compose.yml

# 生成一个 UUID 并写入到配置文件中
UUID=$(uuidgen)
sed -i "s|APIAUTH: .*|APIAUTH: \"$UUID\"|g" docker-compose.yml

# 提示用户确认是否继续执行
echo -n "➤ 7. 配置信息已更新，是否继续拉取并启动 Docker 服务？(y/n)："
read confirm < /dev/tty

if [[ $confirm == "y" ]]; then
    echo "➤ 8. 开始拉取并启动 Docker 服务..."
    docker compose pull
    docker compose up -d --remove-orphans
    echo "✅ expander sass安装完成"
    if [[ -n $DOMAIN1 ]]; then
        echo "请访问 https://${DOMAIN1} 查看前台效果"
        echo "https://${DOMAIN1}/expander 查看后台效果"
    fi
    echo "管理员账号: admin"
    echo "管理员密码: 123456"
    echo "请及时修改管理员密码!!!"
else
    echo "❌操作已取消。"
fi
