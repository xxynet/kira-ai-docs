# Manual Deployment

If you need a more flexible deployment method, you can choose to manually deploy KiraAI to your server.

## System Requirements

- Operating System: Ubuntu 20.04+ / CentOS 8+ / Debian 11+ / Windows Server
- CPU: At least 2 cores
- Memory: At least 4GB
- Disk: At least 20GB available space
- Network: Can access the external network
- Python 3.10+

## Deployment Steps

### 1. System Update and Python Installation

```bash
# Ubuntu/Debian
apt update && apt upgrade -y
apt install python3 python3-pip python3-venv git -y

# CentOS/RHEL
yum update -y
yum install python3 python3-pip python3-venv git -y
```

### 2. Clone Project Code

```bash
git clone https://github.com/xxynet/KiraAI.git
cd KiraAI
```

### 3. Create and Activate Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# Ubuntu/Debian/CentOS
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 4. Install Dependencies

```bash
# Install project dependencies
pip install -r requirements.txt
```

### 5. Start the Project

```bash
# Start the project
python main.py

# Or start with script
# Ubuntu/Debian/CentOS
chmod +x scripts/run.sh
./scripts/run.sh

# Windows
scripts\run.bat
```

### 6. Access Web Management Interface

After starting the project, access the Web management interface through a browser for configuration.

## Notes

- Ensure the firewall allows the ports used by the project
- Regularly back up configuration files and data
- Timely update project code to the latest version
- It is recommended to use process management tools (such as PM2, systemd, etc.) to manage services in production environments

## Troubleshooting

- Check if Python version meets requirements (3.10+)
- Ensure the virtual environment is properly activated
- View project logs to locate error information
- Check if the network connection is normal, especially the connection to LLM service providers