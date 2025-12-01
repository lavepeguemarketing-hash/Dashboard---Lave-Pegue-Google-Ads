import { GoogleGenAI } from "@google/genai";
import { AppData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCampaignAnalysis = async (
  data: AppData
): Promise<string> => {
  try {
    const prompt = `
      Atue como um Especialista Sênior em Google Ads focado em Negócios Locais (Local Store Visits).
      
      Analise os dados desta campanha Performance Max (PMAX) para o dono do negócio:

      MÉTRICAS PRINCIPAIS:
      - Investimento Total: R$ ${data.metrics.totalSpend.toFixed(2)}
      - Custo/Conversão: R$ ${data.metrics.costPerConversion.toFixed(2)}
      - Conversões Totais: ${data.metrics.totalConversions}
      
      AÇÕES LOCAIS (Ouro para negócios locais):
      - Rotas (Directions): ${data.metrics.totalDirections} (Pessoas indo até a loja)
      - Ligações (Calls): ${data.metrics.totalCalls}
      - Visitas à Loja (Store Visits): ${data.metrics.totalStoreVisits}

      DADOS TÉCNICOS:
      - CPC Médio: R$ ${data.metrics.cpc.toFixed(2)}
      - CTR: ${data.metrics.ctr.toFixed(2)}%
      - Impressões: ${data.metrics.totalImpressions}
      - Cliques: ${data.metrics.totalClicks}

      Gere um relatório executivo.
      
      Estrutura do relatório (Use Markdown):
      1. **Resumo de Impacto**: Destaque quantas pessoas efetivamente traçaram rota ou ligaram. Relacione isso com o custo.
      2. **Análise de Custo**: O Custo por Conversão (CPA) está sustentável? Se o custo subiu mas as rotas aumentaram, explique que é positivo.
      3. **Comportamento do Cliente**: O cliente prefere ligar ou ir direto? (Compare Rotas vs Calls).
      4. **Recomendação Estratégica**: Uma dica prática baseada no CTR ou no CPC.

      Seja direto. Use emojis para facilitar a leitura. Fale de ROI (Retorno).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Não foi possível gerar a análise no momento.";
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    return "Erro ao conectar com a IA. Verifique sua chave de API.";
  }
};