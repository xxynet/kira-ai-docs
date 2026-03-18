# 手动部署

如果您需要更灵活的部署方式，可以选择手动部署KiraAI到服务器。

## 系统要求

- 操作系统：Ubuntu 20.04+ / CentOS 8+ / Debian 11+ / Windows Server
- CPU：至少2核
- 内存：至少4GB
- 磁盘：至少20GB可用空间
- 网络：可以访问外网
- Python 3.10+

## 部署步骤

### 1. 系统更新与Python安装

```bash
# Ubuntu/Debian
apt update && apt upgrade -y
apt install python3 python3-pip python3-venv git -y

# CentOS/RHEL
yum update -y
yum install python3 python3-pip python3-venv git -y
```

### 2. 克隆项目代码

```bash
git clone https://github.com/xxynet/KiraAI.git
cd KiraAI
```

### 3. 创建并激活虚拟环境

```bash
# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
# Ubuntu/Debian/CentOS
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 4. 安装依赖

```bash
# 安装项目依赖
pip install -r requirements.txt
```

### 5. 启动项目

```bash
# 启动项目
python main.py

# 或使用脚本启动
# Ubuntu/Debian/CentOS
chmod +x scripts/run.sh
./scripts/run.sh

# Windows
scripts\run.bat
```

### 6. 访问Web管理界面

启动项目后，通过浏览器访问Web管理界面进行配置。

## 注意事项

- 确保防火墙允许项目使用的端口
- 定期备份配置文件和数据
- 及时更新项目代码到最新版本
- 建议在生产环境中使用进程管理工具（如PM2、systemd等）来管理服务

## 故障排查

- 检查Python版本是否符合要求（3.10+）
- 确保虚拟环境已正确激活
- 查看项目日志以定位错误信息
- 检查网络连接是否正常，特别是LLM服务提供商的连接