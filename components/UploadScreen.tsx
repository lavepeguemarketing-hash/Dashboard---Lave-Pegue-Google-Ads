import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, BarChart2, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadScreenProps {
  onLoadDemo: () => void;
  onFilesUpload: (files: FileList) => void;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({ onLoadDemo, onFilesUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesUpload(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      onFilesUpload(e.target.files);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-10">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
            <BarChart2 className="text-white h-8 w-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            AdsVisor Local
          </h1>
          <p className="text-lg text-gray-500">
            Arraste suas planilhas do Google Ads para gerar o dashboard.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8">
            <div 
              className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50 hover:border-blue-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple
                accept=".csv"
                onChange={handleChange}
              />
              <div className="bg-blue-50 p-4 rounded-full mb-4">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Carregar Relatórios CSV</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mb-4">
                Selecione os arquivos "Performance da campanha" e "Ação de Conversão" simultaneamente.
              </p>
              <span className="text-xs text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
                Suporta múltiplos arquivos
              </span>
            </div>

            <div className="mt-8 relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-white text-sm text-gray-500">ou para testar</span>
              </div>
            </div>

            <button
              onClick={onLoadDemo}
              className="mt-6 w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-xl text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
            >
              <FileSpreadsheet className="mr-2 h-5 w-5" />
              Ver Demonstração com Dados Fictícios
            </button>
          </div>
          
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex items-start space-x-3">
             <AlertCircle size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
             <p className="text-xs text-gray-500">
              Certifique-se de que os arquivos são CSVs exportados diretamente do Google Ads. O sistema identifica automaticamente qual arquivo contém os custos e qual contém as ações de conversão.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};