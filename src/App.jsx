import { useState, useEffect } from 'react';
import { Music, Wand2, Key, Download, X, Save, Settings, Shield } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [currentAI, setCurrentAI] = useState(null);
  const [apiKeys, setApiKeys] = useState({
    gemini: '',
    openai: '',
    claude: '',
    llama: '',
    mistral: '',
    perplexity: '',
    grok: ''
  });
  const [tempApiKeys, setTempApiKeys] = useState({
    gemini: '',
    openai: '',
    claude: '',
    llama: '',
    mistral: '',
    perplexity: '',
    grok: ''
  });
  const [inspiration, setInspiration] = useState('');
  const [generatedLyrics, setGeneratedLyrics] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  // Carregar API Keys do localStorage ao inicializar
  useEffect(() => {
    const savedKeys = localStorage.getItem('musicLyricsApiKeys');
    if (savedKeys) {
      const parsedKeys = JSON.parse(savedKeys);
      setApiKeys(parsedKeys);
      setTempApiKeys(parsedKeys);
    }
  }, []);

  // Salvar API Keys no localStorage
  const saveApiKeysToStorage = (keys) => {
    localStorage.setItem('musicLyricsApiKeys', JSON.stringify(keys));
  };

  const aiConfigs = {
    gemini: {
      name: 'Gemini',
      color: 'from-pink-500 to-purple-600',
      icon: Wand2,
      apiKeyLink: 'https://aistudio.google.com/app/apikey',
      keyPlaceholder: 'AIzaSy...'
    },
    openai: {
      name: 'ChatGPT',
      color: 'from-blue-500 to-cyan-600',
      icon: Music,
      apiKeyLink: 'https://platform.openai.com/api-keys',
      keyPlaceholder: 'sk-...'
    },
    claude: {
      name: 'Claude',
      color: 'from-green-500 to-emerald-600',
      icon: Music,
      apiKeyLink: 'https://console.anthropic.com/settings/keys',
      keyPlaceholder: 'sk-ant-...'
    },
    llama: {
      name: 'Llama',
      color: 'from-orange-500 to-red-600',
      icon: Music,
      apiKeyLink: 'https://console.groq.com/keys',
      keyPlaceholder: 'gsk_...'
    },
    mistral: {
      name: 'Mistral',
      color: 'from-yellow-500 to-orange-600',
      icon: Music,
      apiKeyLink: 'https://console.mistral.ai/api-keys',
      keyPlaceholder: 'API Key...'
    },
    perplexity: {
      name: 'Perplexity',
      color: 'from-indigo-500 to-purple-600',
      icon: Music,
      apiKeyLink: 'https://www.perplexity.ai/settings/api',
      keyPlaceholder: 'pplx-...'
    },
    grok: {
      name: 'Grok',
      color: 'from-red-500 to-pink-600',
      icon: Music,
      apiKeyLink: 'https://x.ai/',
      keyPlaceholder: 'xai-...'
    }
  };

  const saveApiKey = () => {
    const newApiKeys = { ...apiKeys, [currentAI]: tempApiKeys[currentAI] };
    setApiKeys(newApiKeys);
    saveApiKeysToStorage(newApiKeys);
    setError('');
    setCurrentView(currentAI);
  };

  const clearApiKey = () => {
    const newTempKeys = { ...tempApiKeys, [currentAI]: '' };
    const newApiKeys = { ...apiKeys, [currentAI]: '' };
    
    setTempApiKeys(newTempKeys);
    setApiKeys(newApiKeys);
    saveApiKeysToStorage(newApiKeys);
    setError('');
  };

  // Template comum para todas as APIs
  const getPromptTemplate = (inspiration) => {
    return `Crie uma letra completa de música para o Suno AI baseada nesta inspiração: "${inspiration}".

INSTRUÇÕES IMPORTANTES:
- Formate a resposta de forma CLARA e ORGANIZADA
- Use MARCAÇÕES para cada seção
- Mantenha em PORTUGUÊS (Brasil)

ELEMENTOS OBRIGATÓRIOS:

🎵 MUSIC NAME: [Nome criativo da música]

📝 LYRICS: 
[Intro]
[Letra da introdução]

[Verse 1]
[Letra do primeiro verso]

[Pre-Chorus]
[Letra do pré-refrão]

[Chorus]
[Letra do refrão]

[Verse 2]
[Letra do segundo verso]

[Bridge]
[Letra da ponte]

[Outro]
[Letra do encerramento]

🎹 STYLE PROMPT: [Descrição detalhada do estilo musical, BPM, instrumentos, atmosfera]

🎤 PERSONA: [Descrição do artista/voz, estilo vocal, características]

🚫 EXCLUDE STYLES: [Estilos musicais a evitar]

🎭 WEIRDNESS: [0-100] - Nível de experimentalidade

🎶 STYLE INFLUENCE: [0-100] - Influência do estilo principal

DICA: Crie uma música coesa, com refrão memorável e estrutura profissional.`;
  };

  const generateWithGemini = async () => {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKeys.gemini}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: getPromptTemplate(inspiration) }]
          }]
        })
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Erro ao gerar conteúdo');
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  };

  const generateWithOpenAI = async () => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKeys.openai}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: getPromptTemplate(inspiration)
        }]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Erro na API OpenAI');
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  };

  const generateWithClaude = async () => {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKeys.claude,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: getPromptTemplate(inspiration)
        }]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Erro na API Claude');
    }
    
    const data = await response.json();
    return data.content[0].text;
  };

  const generateWithGroq = async () => {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKeys.llama}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'user',
          content: getPromptTemplate(inspiration)
        }]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Erro na API Groq');
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  };

  const generateWithMistral = async () => {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKeys.mistral}`
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [{
          role: 'user',
          content: getPromptTemplate(inspiration)
        }]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Erro na API Mistral');
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  };

  const generateWithPerplexity = async () => {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKeys.perplexity}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [{
          role: 'user',
          content: getPromptTemplate(inspiration)
        }]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Erro na API Perplexity');
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  };

  const generateWithGrok = async () => {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKeys.grok}`
      },
      body: JSON.stringify({
        model: 'grok-2-latest',
        messages: [{
          role: 'user',
          content: getPromptTemplate(inspiration)
        }]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Erro na API Grok');
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  };

  const generateLyrics = async () => {
    if (!apiKeys[currentAI]) {
      setError('Por favor, configure sua API Key primeiro!');
      return;
    }

    if (!inspiration.trim()) {
      setError('Por favor, insira uma inspiração para a música!');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      let generatedText;
      
      switch(currentAI) {
        case 'gemini':
          generatedText = await generateWithGemini();
          break;
        case 'openai':
          generatedText = await generateWithOpenAI();
          break;
        case 'claude':
          generatedText = await generateWithClaude();
          break;
        case 'llama':
          generatedText = await generateWithGroq();
          break;
        case 'mistral':
          generatedText = await generateWithMistral();
          break;
        case 'perplexity':
          generatedText = await generateWithPerplexity();
          break;
        case 'grok':
          generatedText = await generateWithGrok();
          break;
        default:
          throw new Error('IA não suportada');
      }
      
      setGeneratedLyrics({
        fullText: generatedText,
        timestamp: new Date().toLocaleString('pt-BR'),
        ai: aiConfigs[currentAI].name
      });
    } catch (error) {
      console.error('Erro:', error);
      setError(`Erro ao gerar letras: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadTXT = () => {
    if (!generatedLyrics) return;
    
    const element = document.createElement('a');
    const file = new Blob([generatedLyrics.fullText], {type: 'text/plain;charset=utf-8'});
    element.href = URL.createObjectURL(file);
    element.download = `letra_musica_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyToClipboard = async () => {
    if (!generatedLyrics) return;
    
    try {
      await navigator.clipboard.writeText(generatedLyrics.fullText);
      alert('Letra copiada para a área de transferência!');
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mb-4"></div>
      <p className="text-gray-600">Gerando sua letra de música...</p>
    </div>
  );

  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">
              Gerador de Letras de Música
            </h1>
            <p className="text-lg sm:text-xl text-purple-200">Powered by Suno AI</p>
          </div>

          {/* AVISO DE SEGURANÇA PRINCIPAL - MAIS VISÍVEL */}
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-8 rounded-lg shadow-lg">
            <div className="flex items-start">
              <Shield className="text-green-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="text-green-800 font-bold text-lg">🔒 100% Seguro - Suas API Keys Protegidas</p>
                <p className="text-green-700 text-sm mt-1">
                  <strong>Suas chaves API ficam apenas no SEU navegador.</strong> Nunca são enviadas para nossos servidores. 
                  Comunicação direta e segura com as APIs oficiais. Use com tranquilidade!
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {Object.entries(aiConfigs).map(([key, config]) => {
              const Icon = config.icon;
              const hasApiKey = apiKeys[key] && apiKeys[key].trim() !== '';
              
              return (
                <button
                  key={key}
                  onClick={() => { 
                    setCurrentAI(key); 
                    setError('');
                    setGeneratedLyrics(null);
                    
                    if (!hasApiKey) {
                      setCurrentView('apiConfig');
                    } else {
                      setCurrentView(key);
                    }
                  }}
                  className={`bg-gradient-to-br ${config.color} hover:opacity-90 text-white p-6 sm:p-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 relative`}
                >
                  <Icon className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4" />
                  <span className="text-lg sm:text-xl font-bold">{config.name}</span>
                  
                  {hasApiKey && (
                    <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  
                  {!hasApiKey && (
                    <div className="absolute top-2 right-2 bg-yellow-500 rounded-full p-1" title="API Key não configurada">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* INFORMAÇÕES ADICIONAIS DE SEGURANÇA */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-8 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-800 font-semibold">✅ Como funciona a segurança:</p>
                <ul className="text-blue-700 mt-1 space-y-1">
                  <li>• API Keys salvas apenas no seu navegador</li>
                  <li>• Comunicação direta com APIs oficiais</li>
                  <li>• Nenhum dado enviado para nossos servidores</li>
                </ul>
              </div>
              <div>
                <p className="text-blue-800 font-semibold">💡 Dicas de uso seguro:</p>
                <ul className="text-blue-700 mt-1 space-y-1">
                  <li>• Use quotas nas suas contas de API</li>
                  <li>• Monitore seu consumo regularmente</li>
                  <li>• Revogue keys em caso de suspeita</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'apiConfig') {
    const config = aiConfigs[currentAI];
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
              <Key className="mr-3 text-purple-600" />
              Configurar API {config.name}
            </h2>
            <button
              onClick={() => setCurrentView('home')}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Chave API do {config.name}
            </label>
            <input
              type="password"
              value={tempApiKeys[currentAI]}
              onChange={(e) => setTempApiKeys(prev => ({ ...prev, [currentAI]: e.target.value }))}
              placeholder={`Cole sua API Key aqui... (${config.keyPlaceholder})`}
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
            />
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <p className="text-green-800 font-bold">🛡️ Sua API Key está Segura</p>
            <p className="text-green-800 text-sm">
              <strong>Sua chave fica armazenada apenas no SEU navegador.</strong>
              <br/>• Nunca é enviada para nossos servidores
              <br/>• Comunicação direta com a API oficial
              <br/>• Recomendamos usar quotas de uso
              <br/>• Em computadores públicos, limpe após o uso
            </p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="text-blue-800 mb-2">
              <strong>Como obter sua API Key:</strong>
            </p>
            <p className="text-blue-800 text-sm">
              Acesse <a href={config.apiKeyLink} target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-blue-600">{config.name} API Keys</a> e gere sua chave.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={clearApiKey}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
            >
              Limpar Key
            </button>
            <button
              onClick={saveApiKey}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center"
            >
              <Save className="mr-2" />
              Salvar & Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const config = aiConfigs[currentAI];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 flex items-center">
              <Icon className="mr-3 text-purple-600 w-6 h-6 sm:w-8 sm:h-8" />
              {config.name} - Gerador de Letras
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <button
                onClick={() => setCurrentView('apiConfig')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold flex items-center justify-center transition-colors duration-300 text-sm sm:text-base"
              >
                <Settings className="mr-2 w-4 h-4" />
                Configurar API
              </button>
              <button
                onClick={() => { 
                  setCurrentView('home'); 
                  setGeneratedLyrics(null); 
                  setError('');
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors duration-300 text-sm sm:text-base"
              >
                Voltar
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {!apiKeys[currentAI] && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
              <p className="text-yellow-800">
                ⚠️ API Key não configurada! Clique em "Configurar API" para adicionar sua chave do {config.name}.
              </p>
            </div>
          )}

          {isGenerating ? (
            <LoadingSpinner />
          ) : !generatedLyrics ? (
            <div>
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2 text-lg">
                  🎵 Inspiração para a Música
                </label>
                <textarea
                  value={inspiration}
                  onChange={(e) => setInspiration(e.target.value)}
                  placeholder="Digite ou cole sua inspiração aqui... (ex: uma música gospel trap sobre fé e perseverança no Rio de Janeiro)"
                  className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none h-40 resize-none"
                />
              </div>

              <button
                onClick={generateLyrics}
                disabled={isGenerating || !apiKeys[currentAI]}
                className={`w-full ${
                  isGenerating || !apiKeys[currentAI] 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                } text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-300 transform hover:scale-105 shadow-lg`}
              >
                {isGenerating ? '🎵 Gerando...' : '✨ Gerar Letra Completa'}
              </button>
            </div>
          ) : (
            <div>
              <div className="bg-gray-50 rounded-lg p-6 mb-6 max-h-96 overflow-y-auto border-2 border-gray-200">
                <div className="text-sm text-gray-600 mb-4 flex justify-between items-center">
                  <span>
                    🎶 Gerado com: <strong>{generatedLyrics.ai}</strong> | 📅 {generatedLyrics.timestamp}
                  </span>
                </div>
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
                  {generatedLyrics.fullText}
                </pre>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={downloadTXT}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center transition-colors duration-300"
                >
                  <Download className="mr-2" />
                  Download TXT
                </button>
                <button
                  onClick={copyToClipboard}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center transition-colors duration-300"
                >
                  📋 Copiar Texto
                </button>
                <button
                  onClick={() => setGeneratedLyrics(null)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-300"
                >
                  🎵 Nova Letra
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;