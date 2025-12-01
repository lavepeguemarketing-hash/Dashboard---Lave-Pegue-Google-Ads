export interface DailyPerformance {
  date: string;
  clicks: number;
  impressions: number;
  cost: number;
  conversions: number;
  costPerConversion: number;
  
  // Specific Local Metrics
  directions: number;   // Rotas
  calls: number;        // Chamadas
  storeVisits: number;  // Visitas ao local
}

export interface ConversionActionData {
  actionName: string;
  conversions: number;
}

export interface DashboardMetrics {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  ctr: number;
  cpc: number;
  costPerConversion: number; // Custo / conv.
  conversionRate: number;
  
  // Specific Totals
  totalDirections: number;
  totalCalls: number;
  totalStoreVisits: number;
  
  dateRange: string;
}

export interface AppData {
  metrics: DashboardMetrics;
  dailyData: DailyPerformance[];
  conversionActions: ConversionActionData[];
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  DASHBOARD = 'DASHBOARD'
}