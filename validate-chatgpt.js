// ChatGPT 集成验证脚本
// 使用内置的 fetch API

const BASE_URL = 'https://3000-ikc2mzj8yipjmpn0lp8bi-6532622b.e2b.dev';

async function validateChatGPTIntegration() {
    console.log('🤖 开始验证 ChatGPT 集成...\n');
    
    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };
    
    function addTest(name, success, message) {
        results.tests.push({ name, success, message });
        if (success) {
            results.passed++;
            console.log(`✅ ${name}: ${message}`);
        } else {
            results.failed++;
            console.log(`❌ ${name}: ${message}`);
        }
    }
    
    try {
        // 测试1: 主页面包含ChatGPT相关代码
        console.log('📝 测试1: 检查主页面ChatGPT代码...');
        const mainPageResponse = await fetch(BASE_URL);
        const htmlContent = await mainPageResponse.text();
        
        if (htmlContent.includes('chatGPTModal')) {
            addTest('ChatGPT模态框HTML', true, 'chatGPTModal 元素存在');
        } else {
            addTest('ChatGPT模态框HTML', false, 'chatGPTModal 元素缺失');
        }
        
        if (htmlContent.includes('showChatGPTConfigModal')) {
            addTest('ChatGPT配置函数', true, 'showChatGPTConfigModal 函数存在');
        } else {
            addTest('ChatGPT配置函数', false, 'showChatGPTConfigModal 函数缺失');
        }
        
        if (htmlContent.includes('chatgpt')) {
            addTest('ChatGPT后端集成', true, 'ChatGPT 后端路由已集成');
        } else {
            addTest('ChatGPT后端集成', false, 'ChatGPT 后端路由缺失');
        }
        
        if (htmlContent.includes('🤖 ChatGPT (gpt-image-1, dall-e-2, dall-e-3)')) {
            addTest('ChatGPT选择器选项', true, 'ChatGPT 选项已添加到下拉菜单');
        } else {
            addTest('ChatGPT选择器选项', false, 'ChatGPT 选项未添加到下拉菜单');
        }
        
        // 测试2: API端点响应测试
        console.log('\n📝 测试2: API端点响应...');
        try {
            const apiResponse = await fetch(`${BASE_URL}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userPrompt: 'Test ChatGPT integration',
                    pageConfig: {
                        title: 'ChatGPT测试页面',
                        pageType: 'business',
                        themeColor: '#3B82F6'
                    },
                    modelConfig: {
                        textModelProvider: 'openai',
                        textApiKey: 'test-key',
                        imageModelProvider: 'chatgpt',
                        imageModelName: 'gpt-image-1'
                    }
                })
            });
            
            const responseData = await apiResponse.json();
            
            if (responseData.success) {
                addTest('API端点响应', false, '意外成功 - 应该要求API Key');
            } else if (responseData.error && (
                responseData.error.includes('requires API key') ||
                responseData.error.includes('Incorrect API key') ||
                responseData.error.includes('invalid_api_key')
            )) {
                addTest('API Key验证', true, 'API Key验证正常工作');
            } else {
                addTest('API Key验证', false, `意外错误: ${responseData.error}`);
            }
        } catch (error) {
            addTest('API端点连接', false, `网络错误: ${error.message}`);
        }
        
        // 测试3: 测试页面访问
        console.log('\n📝 测试3: 测试页面访问...');
        try {
            const testPageResponse = await fetch(`${BASE_URL}/test-chatgpt`);
            if (testPageResponse.status === 200) {
                addTest('测试页面访问', true, 'ChatGPT测试页面可以访问');
            } else {
                addTest('测试页面访问', false, `HTTP ${testPageResponse.status}`);
            }
        } catch (error) {
            addTest('测试页面访问', false, error.message);
        }
        
    } catch (error) {
        addTest('主页面访问', false, error.message);
    }
    
    // 显示总结
    console.log('\n📊 测试总结:');
    console.log(`✅ 通过: ${results.passed}`);
    console.log(`❌ 失败: ${results.failed}`);
    console.log(`📈 成功率: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
    
    if (results.failed === 0) {
        console.log('\n🎉 ChatGPT 集成验证完全成功！');
    } else {
        console.log('\n⚠️  ChatGPT 集成存在问题，需要修复。');
    }
    
    return results;
}

// 运行验证
validateChatGPTIntegration().catch(console.error);