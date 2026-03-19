# Zeabur Deployment

Zeabur is a cloud deployment platform (PaaS) that provides a simple and fast way to deploy and manage applications. It offers a $5 free credit per month. For details, see [Zeabur Pricing](https://zeabur.com/docs/en-US/billing/pricing)

## 1. Register a Zeabur Account

1. Visit the [Zeabur official website](https://zeabur.com/) and click the "Sign Up" button.
2. Fill in your email, username, and password to complete the registration.
3. Log in to your Zeabur account.

## 2. Create a New Project

1. On the Zeabur platform, click the "New Project" button.
2. Enter the project name, such as "KiraAI", and click the "Create" button.

## 3. Deploy KiraAI

1. On the project page, click the "Deploy" button.
2. Select "Deploy from Docker Image".
3. Enter the Docker image URL for KiraAI: `xxynet/kira-ai:latest`
4. Map ports: Map container port 5267 to host port 5267.
5. Volume: Mount the `data` directory to the container's `/app/data` directory.
6. Click the "Deploy" button.
