const express = require('express');
const router = express.Router();

let OpenAI;
try {
  const openaiLib = require('openai');
  OpenAI = openaiLib?.OpenAI ?? openaiLib;
} catch (error) {
  OpenAI = null;
}

let openaiClient = null;
if (OpenAI && process.env.OPENAI_API_KEY) {
  openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

const SYSTEM_PROMPT = `你是"构属植物基因组数据库（GPGDB）"的对话式智能助手。你的职责是：
1. 通过自然语言与研究人员互动，理解他们的科研需求。
2. 根据下方提供的工具列表，规划并调用最合适的工具。
3. 严格按照 JSON 格式输出指令，便于系统解析和执行。

以下是你可调用的工具：
- search_species: 根据拉丁名或通用名检索物种基础信息。参数：{ "query": string }
- fetch_species_overview: 获取物种的基因组概览。参数：{ "speciesId": string }
- run_blast: 执行 BLAST 序列比对。参数：{ "sequence": string, "database": "cds"|"genome" }
- analyze_ssr: 运行 SSR 标记分析。参数：{ "speciesId": string, "motifLength": number (2-6) }
- run_de_analysis: 触发差异表达基因分析。参数：{ "experimentId": string }
- open_jbrowse_view: 生成在 JBrowse 中查看的配置。参数：{ "speciesId": string, "locus": string }
- fetch_download_links: 获取可下载数据表。参数：{ "category": "genome"|"transcriptome"|"markers" }

你的输出必须是符合 JSON 规范的对象，包含：
{
  "assistantMessage": string,
  "actions": [
    {
      "action": string,
      "params": object,
      "explanation": string
    }
  ]
}

如果无需调用任何工具，"actions" 应是空数组。`;

const sanitizeMessages = (messages) =>
  messages.map((msg) => ({
    role: msg.role,
    content: String(msg.content || '').slice(0, 2000),
  }));

async function requestLLMCompletion(messages) {
  if (!openaiClient) {
    return null;
  }

  try {
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 1200,
    });

    const responseText = completion.choices?.[0]?.message?.content;

    if (!responseText) {
      throw new Error('LLM 返回内容为空');
    }

    const parsed = JSON.parse(responseText);

    return {
      assistantMessage: parsed.assistantMessage,
      actions: (parsed.actions || []).map((action) => ({
        action: action.action,
        params: action.params || {},
        explanation: action.explanation,
        status: 'pending',
      })),
      results: [],
      meta: {
        model: completion.model,
        usage: completion.usage,
      },
    };
  } catch (error) {
    console.error('[AI_QUERY_LLM_ERROR]', error);
    return null;
  }
}

function buildFallbackResponse(latestUserMessage = '') {
  const lowerMessage = latestUserMessage.toLowerCase();

  const fallbackRules = [
    {
      keywords: ['blast', '序列比对', '比对'],
      assistantMessage: '好的，我将为您打开 BLAST 序列比对工具。您可以在这里上传您的序列进行比对分析。',
      action: {
        action: 'run_blast',
        params: {},
        explanation: '用户请求使用 BLAST 工具',
      },
    },
    {
      keywords: ['jbrowse', '基因组浏览', '浏览器'],
      assistantMessage: '好的，我将为您打开 JBrowse 基因组浏览器。您可以在这里浏览和查看基因组信息。',
      action: {
        action: 'open_jbrowse_view',
        params: {},
        explanation: '用户请求使用 JBrowse 工具',
      },
    },
    {
      keywords: ['ssr', '标记分析', '简单重复序列'],
      assistantMessage: '好的，我将为您打开 SSR Finder 工具。您可以使用此工具进行 SSR 标记分析。',
      action: {
        action: 'analyze_ssr',
        params: {},
        explanation: '用户请求进行 SSR 分析',
      },
    },
    {
      keywords: ['差异表达', 'de ', '基因表达'],
      assistantMessage: '好的，我将为您打开差异表达基因分析工具。您可以在这里进行基因表达分析。',
      action: {
        action: 'run_de_analysis',
        params: {},
        explanation: '用户请求进行差异表达分析',
      },
    },
    {
      keywords: ['搜索', '查找', '物种'],
      assistantMessage: '我将为您打开搜索页面，您可以在这里搜索物种信息。',
      action: {
        action: 'search_species',
        params: {},
        explanation: '用户请求搜索物种',
      },
    },
    {
      keywords: ['下载', '资源'],
      assistantMessage: '好的，我将为您打开下载页面，您可以在这里获取各种数据资源。',
      action: {
        action: 'fetch_download_links',
        params: {},
        explanation: '用户请求下载资源',
      },
    },
    {
      keywords: ['基因组', 'genomes'],
      assistantMessage: '好的，我将为您打开基因组概览页面，您可以在这里查看各个物种的基因组信息。',
      action: {
        action: 'fetch_species_overview',
        params: {},
        explanation: '用户请求查看基因组概览',
      },
    },
  ];

  const matchedRule = fallbackRules.find((rule) =>
    rule.keywords.some((keyword) => lowerMessage.includes(keyword))
  );

  if (matchedRule) {
    return {
      assistantMessage: matchedRule.assistantMessage,
      actions: [
        {
          ...matchedRule.action,
          status: 'pending',
        },
      ],
      results: [],
      meta: {
        model: 'rule-based-mock',
        usage: { prompt_tokens: 0, completion_tokens: 0 },
      },
    };
  }

  return {
    assistantMessage:
      '我理解您的需求。以下是我们数据库提供的主要功能：\n\n• 🔍 搜索物种信息\n• 🧬 BLAST 序列比对\n• 📈 SSR 标记分析\n• 📉 差异表达基因分析\n• 🗺️ JBrowse 基因组浏览\n• 📥 下载数据资源\n\n请告诉我您具体想要使用哪项功能？',
    actions: [],
    results: [],
    meta: {
      model: 'rule-based-mock',
      usage: { prompt_tokens: 0, completion_tokens: 0 },
    },
  };
}

router.post('/ai-query', async (req, res) => {
  const { messages = [] } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages 字段必须为非空数组' });
  }

  const formattedMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...sanitizeMessages(messages),
  ];

  const llmResponse = await requestLLMCompletion(formattedMessages);

  if (llmResponse) {
    return res.json(llmResponse);
  }

  const latestUserMessage = messages[messages.length - 1]?.content || '';

  return res.json(buildFallbackResponse(latestUserMessage));
});

module.exports = router;
