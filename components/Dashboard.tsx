import React, { useState } from 'react';
import { AppData } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  Legend, BarChart, Bar, AreaChart, Area, ComposedChart
} from 'recharts';
import { 
  Target, MousePointer, Eye, DollarSign, 
  MapPin, Phone, Wand2, Store, TrendingUp, Percent
} from 'lucide-react';
import { generateCampaignAnalysis } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface DashboardProps {
  data: AppData;
  onBack: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, onBack }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const handleAiAnalysis = async () => {
    setLoadingAi(true);
    const result = await generateCampaignAnalysis(data);
    setAnalysis(result);
    setLoadingAi(false);
  };

  const Card = ({ title, value, icon: Icon, colorClass }: any) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-2">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10 text-opacity-100`}>
          <Icon size={18} className={colorClass.replace('bg-', 'text-')} />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <MapPin className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AdsVisor Local</h1>
              <p className="text-xs text-gray-500">{data.metrics.dateRange}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleAiAnalysis}
              disabled={loadingAi}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                loadingAi ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-200'
              }`}
            >
              <Wand2 size={16} className={`mr-2 ${loadingAi ? 'animate-spin' : ''}`} />
              {loadingAi ? 'Analisando...' : 'Gerar Relatório IA'}
            </button>
            <button 
              onClick={onBack}
              className="text-sm text-gray-500 hover:text-gray-900 font-medium"
            >
              Nova Importação
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* AI Analysis Section */}
        {analysis && (
          <div className="bg-white border border-purple-100 rounded-xl p-6 shadow-sm ring-1 ring-purple-100 animate-fadeIn">
            <div className="flex items-center mb-4 pb-4 border-b border-gray-100">
              <div className="bg-purple-100 p-2 rounded-full mr-3">
                <Wand2 className="text-purple-600" size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Análise de Performance</h2>
            </div>
            <div className="prose prose-purple prose-sm max-w-none text-gray-600">
               <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* 10 Fundamental Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card 
            title="Custo Total" 
            value={`R$ ${data.metrics.totalSpend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
            icon={DollarSign} 
            colorClass="bg-blue-600 text-blue-600" 
          />
          <Card 
            title="Custo / Conv." 
            value={`R$ ${data.metrics.costPerConversion.toFixed(2)}`} 
            icon={TrendingUp} 
            colorClass="bg-orange-500 text-orange-500" 
          />
          <Card 
            title="Conversões" 
            value={data.metrics.totalConversions} 
            icon={Target} 
            colorClass="bg-green-600 text-green-600" 
          />
          <Card 
            title="Rotas" 
            value={data.metrics.totalDirections} 
            icon={MapPin} 
            colorClass="bg-blue-500 text-blue-500" 
          />
          <Card 
            title="Clique Chamada" 
            value={data.metrics.totalCalls} 
            icon={Phone} 
            colorClass="bg-indigo-500 text-indigo-500" 
          />
           <Card 
            title="Visitas ao Local" 
            value={data.metrics.totalStoreVisits} 
            icon={Store} 
            colorClass="bg-teal-500 text-teal-500" 
          />
          <Card 
            title="CPC Médio" 
            value={`R$ ${data.metrics.cpc.toFixed(2)}`} 
            icon={DollarSign} 
            colorClass="bg-gray-600 text-gray-600" 
          />
          <Card 
            title="CTR" 
            value={`${data.metrics.ctr.toFixed(2)}%`} 
            icon={Percent} 
            colorClass="bg-purple-500 text-purple-500" 
          />
          <Card 
            title="Impressões" 
            value={data.metrics.totalImpressions.toLocaleString()} 
            icon={Eye} 
            colorClass="bg-yellow-500 text-yellow-500" 
          />
          <Card 
            title="Cliques" 
            value={data.metrics.totalClicks.toLocaleString()} 
            icon={MousePointer} 
            colorClass="bg-blue-400 text-blue-400" 
          />
        </div>

        {/* Charts Section */}
        <div className="space-y-8">
          
          {/* Chart 1: Custo vs Custo/Conversão */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <DollarSign className="mr-2 text-gray-400" size={18} />
              Custo vs Custo por Conversão
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(str) => str.split('-')[2]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9CA3AF', fontSize: 12}}
                    minTickGap={30}
                  />
                  <YAxis 
                    yAxisId="left" 
                    orientation="left" 
                    tickFormatter={(val) => `R$${val}`}
                    axisLine={false} 
                    tickLine={false}
                    label={{ value: 'Investimento', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF' } }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    tickFormatter={(val) => `R$${val}`}
                    axisLine={false} 
                    tickLine={false}
                    label={{ value: 'Custo/Conv.', angle: 90, position: 'insideRight', style: { fill: '#9CA3AF' } }}
                  />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, '']}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="cost" name="Custo Total" fill="#BFDBFE" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="costPerConversion" name="Custo / Conv." stroke="#F97316" strokeWidth={3} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Chart 2: Rotas */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <MapPin className="mr-2 text-blue-500" size={18} />
                Rotas (Directions)
              </h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.dailyData}>
                    <defs>
                      <linearGradient id="colorRotas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" hide />
                    <YAxis axisLine={false} tickLine={false} width={30} />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="directions" stroke="#3B82F6" fillOpacity={1} fill="url(#colorRotas)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Clique Chamada */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Phone className="mr-2 text-indigo-500" size={18} />
                Clique Chamada
              </h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.dailyData}>
                    <defs>
                      <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" hide />
                    <YAxis axisLine={false} tickLine={false} width={30} />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="calls" stroke="#6366F1" fillOpacity={1} fill="url(#colorCalls)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Visitas ao Local */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Store className="mr-2 text-teal-500" size={18} />
                Visitas ao Local
              </h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.dailyData}>
                    <defs>
                      <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" hide />
                    <YAxis axisLine={false} tickLine={false} width={30} />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="storeVisits" stroke="#14B8A6" fillOpacity={1} fill="url(#colorVisits)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};