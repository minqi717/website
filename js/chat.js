class ChatUI {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendMessage');
        this.API_KEY = 'sk-SxYyLJ8mxrWTF0oFE24cD4B0F2Dd42BfB99e493aAd2e1713';
        this.API_URL = 'https://free.v36.cm/v1/chat/completions';
        
        this.initializeEventListeners();
        this.addWelcomeMessage();
    }

    initializeEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    addWelcomeMessage() {
        this.addMessage('AI助手', '你好！我是你的马来西亚旅游助手。有什么可以帮你的吗？', 'bot');
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;

        // 显示用户消息
        this.addMessage('你', message, 'user');
        this.userInput.value = '';

        // 显示加载状态
        const loadingId = this.addLoadingMessage();

        try {
            const response = await this.getAIResponse(message);
            // 移除加载消息
            this.removeMessage(loadingId);
            // 显示AI回复
            this.addMessage('AI助手', response, 'bot');
        } catch (error) {
            console.error('AI响应错误:', error);
            this.removeMessage(loadingId);
            this.addMessage('系统', '抱歉，发生了错误，请稍后重试。', 'error');
        }
    }

    async getAIResponse(message) {
        try {
            console.log('Sending request to API...'); // 调试日志
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "你是一个专业的马来西亚旅游顾问。"
                        },
                        {
                            role: "user",
                            content: message
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000,
                    top_p: 1,
                    frequency_penalty: 0,
                    presence_penalty: 0
                })
            });

            console.log('Response status:', response.status); // 调试日志

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText); // 调试日志
                throw new Error(`API请求失败: ${response.status}`);
            }

            const data = await response.json();
            console.log('API Response:', data); // 调试日志

            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('API响应格式错误');
            }

            return data.choices[0].message.content;

        } catch (error) {
            console.error('API调用详细错误:', error); // 详细错误日志
            throw error;
        }
    }

    addMessage(sender, text, type) {
        const messageDiv = document.createElement('div');
        const messageId = 'msg-' + Date.now();
        messageDiv.id = messageId;
        messageDiv.className = `chat-message ${type}-message`;
        
        // 将URL转换为可点击的链接
        const formattedText = text.replace(
            /(https?:\/\/[^\s]+)/g, 
            '<a href="$1" target="_blank">$1</a>'
        );
        
        messageDiv.innerHTML = `
            <div class="message-sender">${sender}</div>
            <div class="message-text">${formattedText}</div>
        `;
        
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        return messageId;
    }

    addLoadingMessage() {
        const loadingDiv = document.createElement('div');
        const loadingId = 'loading-' + Date.now();
        loadingDiv.id = loadingId;
        loadingDiv.className = 'chat-message loading-message';
        loadingDiv.innerHTML = '<div class="loading-dots"><span>.</span><span>.</span><span>.</span></div>';
        this.chatMessages.appendChild(loadingDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        return loadingId;
    }

    removeMessage(messageId) {
        const message = document.getElementById(messageId);
        if (message) {
            message.remove();
        }
    }
}

// 初始化聊天界面
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.chatUI = new ChatUI(); // 使其可以在控制台访问
    } catch (error) {
        console.error('初始化聊天界面失败:', error);
        document.getElementById('chatMessages').innerHTML = 
            '<div class="error-message">聊天功能加载失败，请刷新页面重试。</div>';
    }
}); 