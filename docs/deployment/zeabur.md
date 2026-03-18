# Zeabur部署

Zeabur 是一个云部署平台（PaaS），它提供了简单、快速的方式来部署和管理应用程序。每月提供5美元的免费额度，详情见[Zeabur定价](https://zeabur.com/docs/zh-CN/billing/pricing)

## 1. 注册Zeabur账号

1. 访问[Zeabur官网](https://zeabur.com/)，点击"注册"按钮。
2. 填写您的邮箱、用户名和密码，完成注册。
3. 登录您的Zeabur账号。

## 2. 创建新项目

1. 在Zeabur平台上，点击"新建项目"按钮。
2. 输入项目名称，例如"KiraAI"，点击"创建"按钮。

## 3. 部署KiraAI

1. 在项目页面，点击"部署"按钮。
2. 选择"从Docker镜像部署"。
3. 输入KiraAI的Docker镜像URL：`xxynet/kira-ai:latest`
4. 映射端口：将容器端口5267映射到主机端口5267。
5. volume：将`data`目录挂载到容器的`/app/data`目录。
6. 点击"部署"按钮。
