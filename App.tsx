import React, { useState } from 'react';
import { UploadScreen } from './components/UploadScreen';
import { Dashboard } from './components/Dashboard';
import { AppState, AppData, DailyPerformance, ConversionActionData, DashboardMetrics } from './types';
import { generateMockData } from './utils/mockData';

// Helper to parse Brazilian number format "1.234,56" -> 1234.56
const parseBrNumber = (str: string): number => {
  if (!str) return 0;
  const cleanStr = str.replace(/^"|"$/g, '');
  const normalized = cleanStr.replace(/\./g, '').replace(',', '.');
  const val = parseFloat(normalized);
  return isNaN(val) ? 0 : val;
};

// Helper to clean CSV lines, handling quoted strings containing commas
const splitCsvLine = (line: string): string[] => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [data, setData] = useState<AppData | null>(null);

  const handleLoadDemo = () => {
    setData(generateMockData());
    setAppState(AppState.DASHBOARD);
  };

  const processFiles = async (files: FileList) => {
    const dailyDataMap = new Map<string, DailyPerformance>();
    const conversionActionMap = new Map<string, number>();
    let dateRange = "Período Personalizado";

    const readFile = (file: File): Promise<string> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsText(file);
      });
    };

    // First Pass: Identify files and initialize map
    for (let i = 0; i < files.length; i++) {
      const content = await readFile(files[i]);
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      
      let isGeneralFile = false;
      let isConversionFile = false;
      let headerIndex = -1;

      // Detect file type
      for(let j=0; j<10 && j<lines.length; j++) {
        const lineLower = lines[j].toLowerCase();
        if (lineLower.includes('custo') && lineLower.includes('cliques')) {
            isGeneralFile = true;
            headerIndex = j;
            break;
        }
        if (lineLower.includes('ação de conversão')) {
            isConversionFile = true;
            headerIndex = j;
            break;
        }
      }

      if (headerIndex === -1) continue;

      // Extract Date Range from General File if possible
      if (isGeneralFile && lines.length > 1 && lines[1].includes(' - ')) {
          dateRange = lines[1].replace(/"/g, '');
      }

      const headers = splitCsvLine(lines[headerIndex]).map(h => h.replace(/^"|"$/g, '').trim());
      const idxDay = headers.indexOf('Dia');

      if (isGeneralFile) {
        const idxCost = headers.indexOf('Custo');
        const idxClicks = headers.indexOf('Cliques');
        const idxImpr = headers.indexOf('Impr.'); // or "Impressões"
        const idxConversions = headers.indexOf('Conversões');

        for (let r = headerIndex + 1; r < lines.length; r++) {
          const cols = splitCsvLine(lines[r]);
          if (cols.length < headers.length) continue;

          const day = cols[idxDay];
          if (!day) continue;

          // Initialize or update day
          const current = dailyDataMap.get(day) || {
            date: day, clicks: 0, impressions: 0, cost: 0, conversions: 0, 
            costPerConversion: 0, directions: 0, calls: 0, storeVisits: 0
          };

          const cost = parseBrNumber(cols[idxCost]);
          const conversions = parseBrNumber(cols[idxConversions]);

          dailyDataMap.set(day, {
            ...current,
            cost: cost,
            clicks: parseBrNumber(cols[idxClicks]),
            impressions: parseBrNumber(idxImpr !== -1 ? cols[idxImpr] : cols[headers.indexOf('Impressões')]),
            conversions: conversions,
            costPerConversion: conversions > 0 ? cost / conversions : 0
          });
        }
      }
    }

    // Second Pass: Process Conversions File to populate detailed metrics
    for (let i = 0; i < files.length; i++) {
      const content = await readFile(files[i]);
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      
      let headerIndex = -1;
      for(let j=0; j<10 && j<lines.length; j++) {
        if (lines[j].toLowerCase().includes('ação de conversão')) {
            headerIndex = j;
            break;
        }
      }

      if (headerIndex !== -1) {
        const headers = splitCsvLine(lines[headerIndex]).map(h => h.replace(/^"|"$/g, '').trim());
        const idxDay = headers.indexOf('Dia');
        const idxAction = headers.indexOf('Ação de conversão');
        const idxConversions = headers.indexOf('Conversões');

        for (let r = headerIndex + 1; r < lines.length; r++) {
          const cols = splitCsvLine(lines[r]);
          if (cols.length < headers.length) continue;

          const day = cols[idxDay];
          const action = cols[idxAction]?.replace(/^"|"$/g, '');
          const conv = parseBrNumber(cols[idxConversions]);

          if (day && action && conv > 0) {
            // Update Aggregated Map
            const currentTotal = conversionActionMap.get(action) || 0;
            conversionActionMap.set(action, currentTotal + conv);

            // Update Daily Map specific fields
            const dailyStats = dailyDataMap.get(day);
            if (dailyStats) {
                const actionLower = action.toLowerCase();
                if (actionLower.includes('directions') || actionLower.includes('rotas')) {
                    dailyStats.directions += conv;
                } else if (actionLower.includes('call') || actionLower.includes('ligações')) {
                    dailyStats.calls += conv;
                } else if (actionLower.includes('store') || actionLower.includes('visitas') || actionLower.includes('local')) {
                    dailyStats.storeVisits += conv;
                }
                dailyDataMap.set(day, dailyStats);
            }
          }
        }
      }
    }

    // Transform Map to Array for Daily Data
    const dailyData = Array.from(dailyDataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    
    // Transform Map to Array for Conversion Actions
    const conversionActions = Array.from(conversionActionMap.entries()).map(([name, count]) => ({
      actionName: name,
      conversions: count
    })).sort((a, b) => b.conversions - a.conversions);

    // Calculate Totals
    const totalSpend = dailyData.reduce((acc, d) => acc + d.cost, 0);
    const totalClicks = dailyData.reduce((acc, d) => acc + d.clicks, 0);
    const totalImpressions = dailyData.reduce((acc, d) => acc + d.impressions, 0);
    const totalConversions = dailyData.reduce((acc, d) => acc + d.conversions, 0);
    
    const totalDirections = dailyData.reduce((acc, d) => acc + d.directions, 0);
    const totalCalls = dailyData.reduce((acc, d) => acc + d.calls, 0);
    const totalStoreVisits = dailyData.reduce((acc, d) => acc + d.storeVisits, 0);

    const metrics: DashboardMetrics = {
      totalSpend,
      totalClicks,
      totalImpressions,
      totalConversions,
      ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      cpc: totalClicks > 0 ? totalSpend / totalClicks : 0,
      costPerConversion: totalConversions > 0 ? totalSpend / totalConversions : 0,
      conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
      totalDirections,
      totalCalls,
      totalStoreVisits,
      dateRange
    };

    if (dailyData.length > 0) {
      setData({ metrics, dailyData, conversionActions });
      setAppState(AppState.DASHBOARD);
    } else {
      alert("Não foi possível processar os dados. Verifique se os arquivos são o CSV padrão do Google Ads.");
    }
  };

  const handleBack = () => {
    setAppState(AppState.UPLOAD);
    setData(null);
  };

  return (
    <>
      {appState === AppState.UPLOAD && (
        <UploadScreen onLoadDemo={handleLoadDemo} onFilesUpload={processFiles} />
      )}
      
      {appState === AppState.DASHBOARD && data && (
        <Dashboard 
          data={data}
          onBack={handleBack}
        />
      )}
    </>
  );
};

export default App;