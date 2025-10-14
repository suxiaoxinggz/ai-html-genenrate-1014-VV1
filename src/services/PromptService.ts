// Prompt Enhancement Service
import { PageConfig, SEOData } from '../types';

export class PromptService {
  
  // 分析用户输入内容
  static analyzeUserInput(input: string, pageType: string): any {
    return {
      contentType: this.detectContentType(input),
      requiredSchemas: this.detectRequiredSchemas(input),
      designStyle: this.inferDesignStyle(input),
      seoRequirements: this.generateSEORequirements(input),
      hasProducts: /产品|商品|价格|购买|销售|店铺/.test(input),
      hasFAQ: /问题|疑问|如何|怎么|什么是|FAQ|常见问题/.test(input),
      hasSteps: /步骤|教程|指南|如何|怎么做|方法/.test(input),
      hasContacts: /联系|电话|地址|邮箱|微信|QQ/.test(input),
      hasTeam: /团队|员工|关于我们|介绍|成员/.test(input),
      hasReviews: /评价|评论|推荐|客户反馈/.test(input),
      hasTable: /表格|价格表|对比|参数|规格/.test(input)
    };
  }

  // 检测内容类型
  private static detectContentType(input: string): string {
    const patterns = {
      'business': /公司|企业|商务|服务|业务/,
      'ecommerce': /商店|购物|电商|销售|产品/,
      'blog': /博客|文章|新闻|资讯|分享/,
      'portfolio': /作品集|展示|设计|创作/,
      'education': /教育|培训|课程|学习/,
      'restaurant': /餐厅|菜单|美食|料理/,
      'personal': /个人|简历|介绍/
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(input)) return type;
    }
    
    return 'general';
  }

  // 检测需要的结构化数据
  private static detectRequiredSchemas(input: string): string[] {
    const schemas = [];
    
    if (/产品|商品|价格/.test(input)) schemas.push('Product');
    if (/问题|FAQ|疑问/.test(input)) schemas.push('FAQPage');
    if (/步骤|教程|指南/.test(input)) schemas.push('HowTo');
    if (/联系|地址|电话/.test(input)) schemas.push('Organization');
    if (/团队|员工|关于/.test(input)) schemas.push('Person');
    if (/评价|评论|推荐/.test(input)) schemas.push('Review');
    if (/表格|对比|参数/.test(input)) schemas.push('Table');
    if (/文章|博客|新闻/.test(input)) schemas.push('Article');
    
    return schemas;
  }

  // 推断设计风格
  private static inferDesignStyle(input: string): string {
    const styles = {
      'modern': /现代|简约|极简|时尚|科技/,
      'elegant': /优雅|精致|高端|奢华/,
      'warm': /温暖|温馨|舒适|亲切/,
      'professional': /专业|商务|正式|企业/,
      'creative': /创意|艺术|设计|个性/,
      'minimalist': /简洁|干净|清爽|简单/
    };

    for (const [style, pattern] of Object.entries(styles)) {
      if (pattern.test(input)) return style;
    }
    
    return 'modern';
  }

  // 生成SEO需求
  private static generateSEORequirements(input: string): any {
    return {
      keywords: this.extractKeywords(input),
      needsLocalSEO: /地址|位置|本地|附近/.test(input),
      needsProductSEO: /产品|商品|销售/.test(input),
      needsServiceSEO: /服务|咨询|预约/.test(input)
    };
  }

  // 提取关键词
  private static extractKeywords(input: string): string[] {
    // 简单的关键词提取逻辑，实际项目中可以使用更复杂的NLP
    const commonWords = ['的', '是', '在', '有', '和', '与', '或', '但', '也', '都', '要', '想', '可以', '能够'];
    const words = input.split(/[，。、！？\s]+/)
      .filter(word => word.length > 1 && !commonWords.includes(word))
      .slice(0, 10);
    
    return words;
  }

  // 生成专业提示词
  static generateProfessionalPrompt(
    userInput: string, 
    pageConfig: PageConfig, 
    analysis: any
  ): string {
    const basePrompt = this.getBasePrompt(userInput, pageConfig);
    const seoPrompt = this.getSEOPrompt(analysis);
    const responsivePrompt = this.getResponsivePrompt();
    const schemaPrompt = this.getSchemaPrompt(analysis.requiredSchemas);
    
    return `${basePrompt}\n\n${seoPrompt}\n\n${responsivePrompt}\n\n${schemaPrompt}`;
  }

  // 基础提示词模板
  private static getBasePrompt(userInput: string, pageConfig: PageConfig): string {
    return `
根据用户需求："${userInput}"生成专业HTML页面

页面配置：
- 标题：${pageConfig.title}
- 类型：${pageConfig.pageType}
- 主题色：${pageConfig.themeColor}
- 描述：${pageConfig.description}

技术要求：
- 完整HTML5 + Tailwind CSS响应式设计
- 三端适配：手机(sm:) 平板(md:) 桌面(lg: xl:)
- 完整SEO优化包含所有meta标签
- 禁止使用自定义CSS和内联样式
- 语义化HTML5标签结构

内容要求：
- 创造真实专业内容，不用占位符
- 图片占位符格式：{{IMAGE_PLACEHOLDER_N}}
- 所有图片必须有具体的alt描述
- 文案符合中国用户习惯
`;
  }

  // SEO优化提示词
  private static getSEOPrompt(analysis: any): string {
    return `
=== SEO优化要求 ===
基础SEO（必须包含）:
- <title>基于内容的专业标题</title>
- <meta name="description" content="吸引人的页面描述">
- <meta name="keywords" content="${analysis.seoRequirements.keywords.join(', ')}">
- <meta name="viewport" content="width=device-width, initial-scale=1.0">
- Open Graph完整标签集 (og:title, og:description, og:image, og:url)
- Twitter Card标签
- 正确的语言标签 <html lang="zh-CN">

语义化HTML要求：
- 使用header, nav, main, section, article, footer
- 正确的H1-H6层级结构
- 所有图片必须有具体alt属性
- 适当的内部链接结构
`;
  }

  // 响应式设计提示词
  private static getResponsivePrompt(): string {
    return `
=== 响应式设计要求 ===
完全使用Tailwind CSS实现三端适配:

布局响应式：
- 手机端：单列布局 grid-cols-1
- 平板端：双列布局 md:grid-cols-2  
- 桌面端：多列布局 lg:grid-cols-3 xl:grid-cols-4

文字响应式：
- 标题：text-2xl md:text-4xl lg:text-5xl
- 正文：text-sm md:text-base lg:text-lg
- 描述：text-xs md:text-sm lg:text-base

间距响应式：
- 容器：p-4 md:p-6 lg:p-8 xl:p-12
- 间隔：space-y-4 md:space-y-6 lg:space-y-8
- 边距：mb-4 md:mb-6 lg:mb-8

导航响应式：
- 手机端：折叠菜单 + 汉堡按钮
- 桌面端：水平导航栏
- 使用 hidden md:flex 和 md:hidden 切换
`;
  }

  // 结构化数据提示词
  private static getSchemaPrompt(requiredSchemas: string[]): string {
    if (requiredSchemas.length === 0) return '';

    const schemaTemplates = {
      'FAQPage': `
- FAQPage Schema for 问答内容：
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "具体问题",
      "acceptedAnswer": {
        "@type": "Answer", 
        "text": "详细回答"
      }
    }
  ]
}`,
      'Product': `
- Product Schema for 产品信息：
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "产品名称",
  "description": "产品描述", 
  "offers": {
    "@type": "Offer",
    "price": "价格",
    "priceCurrency": "CNY"
  }
}`,
      'HowTo': `
- HowTo Schema for 步骤说明：
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "教程标题",
  "step": [
    {
      "@type": "HowToStep",
      "name": "步骤名称",
      "text": "步骤详情"
    }
  ]
}`,
      'Organization': `
- Organization Schema for 联系信息：
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "组织名称",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "电话号码",
    "contactType": "customer service"
  }
}`
    };

    const schemas = requiredSchemas
      .filter(schema => schemaTemplates[schema as keyof typeof schemaTemplates])
      .map(schema => schemaTemplates[schema as keyof typeof schemaTemplates])
      .join('\n');

    return `
=== 智能结构化数据（JSON-LD格式嵌入<head>中）===
根据内容自动生成以下结构化数据：
${schemas}

注意：所有结构化数据必须基于页面实际内容填充，不使用占位符。
`;
  }

  // 获取图片生成提示词
  static generateImagePrompts(htmlContent: string): Array<{
    placeholder: string;
    description: string;
    style: string;
    aspectRatio: string;
    alt: string;
  }> {
    const placeholders = htmlContent.match(/{{IMAGE_PLACEHOLDER_\d+}}/g) || [];
    const images = [];

    for (let i = 0; i < placeholders.length; i++) {
      const placeholder = placeholders[i];
      const num = i + 1;
      
      // 根据上下文生成图片描述
      const context = this.getImageContext(htmlContent, placeholder);
      
      images.push({
        placeholder,
        description: context.description || `专业网站配图${num}`,
        style: context.style || 'photography',
        aspectRatio: context.aspectRatio || '16:9',
        alt: context.alt || `网站配图${num}`
      });
    }

    return images;
  }

  // 获取图片上下文信息
  private static getImageContext(html: string, placeholder: string): any {
    // 简化的上下文分析，实际项目中可以更复杂
    const lines = html.split('\n');
    const placeholderLine = lines.find(line => line.includes(placeholder));
    
    if (!placeholderLine) return {};
    
    const context: any = {};
    
    // 分析alt属性
    const altMatch = placeholderLine.match(/alt="([^"]+)"/);
    if (altMatch) {
      context.alt = altMatch[1];
      context.description = altMatch[1];
    }
    
    // 分析class属性推断尺寸
    if (placeholderLine.includes('w-full h-64')) {
      context.aspectRatio = '16:9';
    } else if (placeholderLine.includes('w-32 h-32') || placeholderLine.includes('rounded-full')) {
      context.aspectRatio = '1:1';
    }
    
    // 分析上下文推断风格
    const surroundingText = html.substring(
      Math.max(0, html.indexOf(placeholder) - 200),
      html.indexOf(placeholder) + 200
    ).toLowerCase();
    
    if (surroundingText.includes('hero') || surroundingText.includes('banner')) {
      context.style = 'photography';
      context.aspectRatio = '16:9';
    } else if (surroundingText.includes('team') || surroundingText.includes('author')) {
      context.style = 'photography';
      context.aspectRatio = '1:1';
    } else if (surroundingText.includes('product') || surroundingText.includes('service')) {
      context.style = 'photography';
      context.aspectRatio = '4:3';
    }
    
    return context;
  }
}