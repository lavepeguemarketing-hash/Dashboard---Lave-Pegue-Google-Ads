import { AppData, DailyPerformance, ConversionActionData, DashboardMetrics } from "../types";

export const generateMockData = (): AppData => {
  // Simulate 30 days of data for a Local PMAX campaign
  const dailyData: DailyPerformance[] = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const clicks = Math.floor(Math.random() * 25) + 5;
    const cost = clicks * (Math.random() * 1.5 + 0.8); // CPC around 1.00 - 2.00
    
    // Distribute conversions among types
    const totalConvForDay = Math.floor(clicks * (Math.random() * 0.4 + 0.1)); 
    
    const directions = Math.floor(totalConvForDay * 0.6);
    const calls = Math.floor(totalConvForDay * 0.2);
    const storeVisits = Math.floor(totalConvForDay * 0.1);
    const conversions = directions + calls + storeVisits; // Simplified total

    return {
      date: `2025-09-${day < 10 ? '0' + day : day}`,
      clicks,
      impressions: clicks * (Math.floor(Math.random() * 15) + 10),
      cost,
      conversions,
      costPerConversion: conversions > 0 ? cost / conversions : 0,
      directions,
      calls,
      storeVisits
    };
  });

  const totalSpend = dailyData.reduce((acc, d) => acc + d.cost, 0);
  const totalClicks = dailyData.reduce((acc, d) => acc + d.clicks, 0);
  const totalImpressions = dailyData.reduce((acc, d) => acc + d.impressions, 0);
  const totalConversions = dailyData.reduce((acc, d) => acc + d.conversions, 0);
  
  const totalDirections = dailyData.reduce((acc, d) => acc + d.directions, 0);
  const totalCalls = dailyData.reduce((acc, d) => acc + d.calls, 0);
  const totalStoreVisits = dailyData.reduce((acc, d) => acc + d.storeVisits, 0);

  const metrics: DashboardMetrics = {
    totalSpend,
    totalImpressions,
    totalClicks,
    totalConversions,
    ctr: (totalClicks / totalImpressions) * 100,
    cpc: totalSpend / totalClicks,
    costPerConversion: totalConversions > 0 ? totalSpend / totalConversions : 0,
    conversionRate: (totalConversions / totalClicks) * 100,
    totalDirections,
    totalCalls,
    totalStoreVisits,
    dateRange: "01 de Setembro - 30 de Setembro"
  };

  const conversionActions: ConversionActionData[] = [
    { actionName: "Local actions - Directions", conversions: totalDirections },
    { actionName: "Clicks to call", conversions: totalCalls },
    { actionName: "Store visits", conversions: totalStoreVisits },
  ];

  return { metrics, dailyData, conversionActions };
};