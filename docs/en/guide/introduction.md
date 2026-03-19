# Introduction to KiraAI

## What is KiraAI?

KiraAI is a modular, cross-platform AI digital life project centered around digital life, connecting large language models (LLMs) with various chat platforms (QQ, Telegram, etc.).

The goal of KiraAI is not to create a personal AI assistant, but to create a digital life that can interact, speak, and interact with the outside world like a human.

::: tip
You can enter [Quick Start](/en/guide/quickstart) to learn how to quickly deploy and configure KiraAI.
:::

## Core Features

Unlike traditional ChatBots, KiraAI is specially optimized for anthropomorphic scenarios.

### 1. Message Processing Flow

The message processing flow of traditional ChatBots is:
```
Receive user message -> Pass to LLM for processing -> Receive LLM's reply -> Send reply to user
```

However, the one-question-one-answer mode is relatively rigid. Humans often view multiple messages at once and reply based on context. To better simulate human dialogue, KiraAI adopts a message buffering mechanism:
- Receive user messages
- Plugins determine message processing strategies (caching, direct LLM calls, discarding, etc.)
- When needing to call the LLM for a reply, the cached messages are sent to the LLM for processing together.

### 2. Message Sending

KiraAI does not directly send the text reply from the LLM to the user. Instead, it allows the LLM to organize message content using XML. Therefore, the AI can flexibly combine different message elements such as text, images, voice, etc. At the same time, a single reply is not limited to one message or rule-based message segmentation, but the AI has full control over how many messages to send and what each message contains.

## Open Source License

KiraAI adopts the AGPL-3.0 open source license, and community contributions and usage are welcome.

::: info
During active development of this project, there may be **breaking updates**. Please back up your configuration files and data before updating.
:::
