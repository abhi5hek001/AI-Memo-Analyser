import React, { useState } from 'react';
import { Upload, FileText, TrendingUp, AlertCircle, Clock, DollarSign, Brain, CheckCircle, XCircle } from 'lucide-react';

const InvestmentMemoAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  // <-- 1. ADD STATE FOR MODEL SELECTION -->
  const [modelChoice, setModelChoice] = useState('gemini'); 

  const analyzeDocument = async (text, model_choice) => { 
    try {
      const promptText = `You are an expert investment analyst. Analyze this investment memo/pitch deck and provide a structured assessment in JSON format.
Document text:
${text}

Return ONLY valid JSON (no markdown, no preamble) with this exact structure:
{
  "investmentThesis": "Brief summary of the investment opportunity",
  "riskScore": 45,
  "opportunityScore": 78,
  "keyStrengths": ["strength 1", "strength 2", "strength 3"],
  "keyRisks": ["risk 1", "risk 2", "risk 3"],
  "marketSize": "Market size and TAM analysis",
  "competitivePosition": "Competitive analysis summary",
  "financialHighlights": "Key financial metrics and projections",
  "recommendation": "INVEST/PASS/REVIEW",
  "reasoning": "Detailed reasoning for recommendation",
  "dueDiligenceItems": ["item 1", "item 2", "item 3"]
}`;

      const response = await fetch("http://localhost:3001/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: promptText, 
          model_choice: model_choice 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Server Error: ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      
      return data;
      
    } catch (err) {
      console.error("Analysis API Call Failed:", err);
      throw new Error(`Failed to analyze document: ${err.message}. Ensure the backend server is running and the API key is correct.`);
    }
  };

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setAnalyzing(true);
    setError(null);
    setResults(null);

    try {
      const text = await uploadedFile.text();
      const analysis = await analyzeDocument(text, modelChoice); 
      setResults(analysis);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const getRecommendationColor = (rec) => {
    if (rec === 'INVEST') return 'text-green-600 bg-green-50 border-green-200';
    if (rec === 'PASS') return 'text-red-600 bg-red-50 border-red-200';
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  };

  const getRecommendationIcon = (rec) => {
    if (rec === 'INVEST') return <CheckCircle className="w-6 h-6" />;
    if (rec === 'PASS') return <XCircle className="w-6 h-6" />;
    return <AlertCircle className="w-6 h-6" />;
  };

 return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">AI Investment Memo Analyzer</h1>
              <p className="text-slate-600 mt-1">Automated due diligence and deal assessment powered by Claude / OpenAI / Gemini</p>
            </div>
          </div>
          
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <label className="text-sm font-medium text-slate-700">
                Select AI Model:
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setModelChoice('claude')}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    modelChoice === 'claude'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                  }`}
                  disabled={analyzing}
                >
                  Anthropic Claude
                </button>
                <button
                  onClick={() => setModelChoice('openai')}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    modelChoice === 'openai'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                  }`}
                  disabled={analyzing}
                >
                  OpenAI GPT
                </button>

                <button
                  onClick={() => setModelChoice('gemini')}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    modelChoice === 'gemini'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                  }`}
                  disabled={analyzing}
                >
                  Google Gemini
                </button>
              </div>
              <div className="text-xs text-slate-500 mt-1 sm:mt-0">
                  Current Model: 
                  <span className="font-semibold text-blue-600">
                    {modelChoice === 'claude' ? 'Claude-3.5-Sonnet' : modelChoice === 'openai' ? 'GPT-4o' : 'Gemini-2.5-Pro'}
                  </span>
              </div>
          </div>


          <div className="mt-6">
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer bg-blue-50 hover:bg-blue-100 transition-all">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 text-blue-600 mb-3" />
                <p className="mb-2 text-sm text-slate-600">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-500">Investment memo, pitch deck, or financial report (TXT, MD)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".txt,.md"
                onChange={handleFileUpload}
                disabled={analyzing}
              />
            </label>
            {file && (
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                <FileText className="w-4 h-4" />
                <span>{file.name}</span>
              </div>
            )}
          </div>
        </div>

        {analyzing && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-lg">Analyzing investment opportunity with {modelChoice === 'claude' ? 'Claude' : 'GPT'}...</p>
            <p className="text-slate-500 text-sm mt-2">This may take 15-30 seconds</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle className="w-6 h-6" />
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {results && (
          <div className="space-y-6">
            <div className={`rounded-2xl shadow-lg p-6 border-2 ${getRecommendationColor(results.recommendation)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getRecommendationIcon(results.recommendation)}
                  <div>
                    <h2 className="text-2xl font-bold">Recommendation: {results.recommendation}</h2>
                    <p className="mt-1 opacity-90">{results.reasoning}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-75">Risk Score</div>
                  <div className="text-3xl font-bold">{results.riskScore}/100</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-bold text-slate-800">Opportunity Score</h3>
                </div>
                <div className="text-5xl font-bold text-green-600 mb-2">{results.opportunityScore}</div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${results.opportunityScore}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <h3 className="text-xl font-bold text-slate-800">Risk Score</h3>
                </div>
                <div className="text-5xl font-bold text-red-600 mb-2">{results.riskScore}</div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-red-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${results.riskScore}%` }}
                  ></div>
                </div>
              </div>
            </div>

            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Investment Thesis
              </h3>
              <p className="text-slate-700 leading-relaxed">{results.investmentThesis}</p>
            </div>

            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Key Strengths
                </h3>
                <ul className="space-y-3">
                  {results.keyStrengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-slate-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Key Risks
                </h3>
                <ul className="space-y-3">
                  {results.keyRisks.map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-slate-700">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Market Size
                </h3>
                <p className="text-slate-700">{results.marketSize}</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Competitive Posi
                </h3>
                <p className="text-slate-700">{results.competitivePosition}</p>
              </div>
            </div>

            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Financial Highlights
              </h3>
              <p className="text-slate-700">{results.financialHighlights}</p>
            </div>

            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                Recommended Due Diligence Items
              </h3>
              <ul className="space-y-3">
                {results.dueDiligenceItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      {idx + 1}
                    </div>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        
        {!results && !analyzing && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl shadow-lg p-6 mt-6">
            <h3 className="text-lg font-bold text-blue-900 mb-3">💡 How to Use This Demo</h3>
            <ol className="space-y-2 text-blue-800 text-sm">
              <li>1. Upload a text file containing an investment memo, pitch deck, or company overview</li>
              <li>2. Select your desired AI model (Claude or OpenAI).</li>
              <li>3. The AI will analyze the document for investment potential, risks, and opportunities</li>
              <li>4. Review the automated assessment including scores, strengths, risks, and due diligence items</li>
              <li>5. Use insights to accelerate investment decision-making and focus human review on critical areas</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentMemoAnalyzer;