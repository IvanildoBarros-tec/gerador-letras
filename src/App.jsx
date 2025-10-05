import { useState } from 'react';
import { Music, Wand2, Key, Download, X, Save, Settings } from 'lucide-react';

const MusicLyricsGenerator = () => {
  const [currentView, setCurrentView] = useState('home');
  const [apiKey, setApiKey] = useState('');
  const [tempApiKey, setTempApiKey] = useState('');
  const [inspiration, setInspiration] = useState('');
  const [generatedLyrics, setGeneratedLyrics] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const saveApiKey = () => {
    setApiKey(tempApiKey);
    alert('API Key salva com sucesso!');
    setCurrentView('gemini');
  };

  const clearApiKey = () => {
    setTempApiKey('');
    setApiKey('');
  };

  const generateLyrics = async () => {
    if (!apiKey) {
      alert('Por favor, configure sua API Key do Gemini primeiro!');
      return;
    }

    if (!inspiration.trim()) {
      alert('Por favor, insira uma inspiração para a música!');
      return;
    }

    setIsGenerating(true);

    try {
      // Primeiro, testa se a API Key é válida listando os modelos disponíveis
      console.log('🔍 Verificando modelos disponíveis...');
      const listResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
      
      if (!listResponse.ok) {
        const listError = await listResponse.json();
        console.error('❌ Erro ao listar modelos:', listError);
        throw new Error('API Key inválida ou sem permissões. Erro: ' + (listError.error?.message || 'Desconhecido'));
      }
      
      const listData = await listResponse.json();
      console.log('✅ Modelos disponíveis:', listData);
      
      // Extrai os nomes dos modelos disponíveis
      const availableModels = listData.models?.map(m => m.name.replace('models/', '')) || [];
      console.log('📋 Modelos que você pode usar:', availableModels);
      
      // Encontra o primeiro modelo que suporta generateContent
      const modelToUse = listData.models?.find(m => 
        m.supportedGenerationMethods?.includes('generateContent')
      );
      
      if (!modelToUse) {
        throw new Error('Nenhum modelo disponível suporta geração de conteúdo.');
      }
      
      const modelName = modelToUse.name;
      console.log(`🎯 Usando modelo: ${modelName}`);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Crie uma letra completa de música para o Suno AI baseada nesta inspiração: "${inspiration}". 

Inclua os seguintes elementos:
1. Music Name (nome da música)
2. Lyrics (letra completa com [Intro], [Verse 1], [Pre-Chorus], [Chorus], [Verse 2], [Bridge], [Outro] e indicações de vocais/instrumentos)
3. Style Prompt (descrição do estilo musical, BPM, instrumentos)
4. Persona (descrição do artista/voz)
5. Exclude Styles (estilos a evitar)
6. Weirdness (número de 0-100)
7. Style Influence (número de 0-100)

Formate de forma clara e organizada.`
              }]
            }]
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erro ao gerar conteúdo');
      }

      const data = await response.json();
      console.log('✅ Resposta recebida:', data);
      
      if (data.candidates && data.candidates[0]) {
        const generatedText = data.candidates[0].content.parts[0].text;
        setGeneratedLyrics({
          fullText: generatedText,
          timestamp: new Date().toLocaleString()
        });
      } else if (data.error) {
        let errorMessage = data.error.message || 'Erro desconhecido na API do Gemini';
        
        // Mensagens de erro mais amigáveis
        if (errorMessage.includes('API key not valid')) {
          errorMessage = 'API Key inválida! Por favor, verifique se você copiou a chave correta do Google AI Studio.';
        } else if (errorMessage.includes('not found')) {
          errorMessage = 'Modelo não encontrado. Usando gemini-pro como padrão.';
        }
        
        throw new Error(errorMessage);
      } else {
        throw new Error('Formato de resposta inesperado. Verifique sua API Key e tente novamente.');
      }
    } catch (error) {
      console.error('Erro completo:', error);
      alert('❌ Erro ao gerar letras:\n\n' + error.message + '\n\n💡 Dicas:\n- Verifique se sua API Key está correta\n- Gere uma nova chave em: https://aistudio.google.com/app/apikey\n- Certifique-se de ter acesso à API do Gemini');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadTXT = () => {
    if (!generatedLyrics) return;
    
    const element = document.createElement('a');
    const file = new Blob([generatedLyrics.fullText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'letra_musica.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadPDF = () => {
    if (!generatedLyrics) return;
    
    const element = document.createElement('a');
    const content = `LETRA DE MÚSICA - SUNO AI
Gerado em: ${generatedLyrics.timestamp}

${generatedLyrics.fullText}`;
    
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'letra_musica.pdf.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              Gerador de Letras de Música
            </h1>
            <p className="text-xl text-purple-200">Powered by Suno AI</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <button
              onClick={() => setCurrentView('gemini')}
              className="bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white p-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <Wand2 className="w-12 h-12 mx-auto mb-4" />
              <span className="text-xl font-bold">Gemini</span>
            </button>

            <button className="bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white p-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300">
              <Music className="w-12 h-12 mx-auto mb-4" />
              <span className="text-xl font-bold">ChatGPT</span>
            </button>

            <button className="bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300">
              <Music className="w-12 h-12 mx-auto mb-4" />
              <span className="text-xl font-bold">Claude</span>
            </button>

            <button className="bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white p-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300">
              <Music className="w-12 h-12 mx-auto mb-4" />
              <span className="text-xl font-bold">Llama</span>
            </button>

            <button className="bg-gradient-to-br from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white p-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300">
              <Music className="w-12 h-12 mx-auto mb-4" />
              <span className="text-xl font-bold">Mistral</span>
            </button>

            <button className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white p-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300">
              <Music className="w-12 h-12 mx-auto mb-4" />
              <span className="text-xl font-bold">Perplexity</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'apiConfig') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
              <Key className="mr-3 text-purple-600" />
              Configurar API Gemini
            </h2>
            <button
              onClick={() => setCurrentView('gemini')}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Chave API do Gemini
            </label>
            <input
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="Cole sua API Key aqui... (ex: AIzaSy...)"
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
            />
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="text-blue-800 mb-2">
              <strong>🔑 Como obter sua API Key:</strong>
            </p>
            <ol className="list-decimal list-inside text-blue-800 space-y-1 text-sm">
              <li>Acesse <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-blue-600">Google AI Studio</a></li>
              <li>Clique em "Create API Key"</li>
              <li>Copie a chave gerada</li>
              <li>Cole aqui e clique em "Save & Close"</li>
            </ol>
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

  if (currentView === 'gemini') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-bold text-gray-800 flex items-center">
                <Wand2 className="mr-3 text-purple-600" />
                Gemini - Gerador de Letras
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentView('apiConfig')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center transition-colors duration-300"
                >
                  <Settings className="mr-2" />
                  Configurar API
                </button>
                <button
                  onClick={() => setCurrentView('home')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300"
                >
                  Voltar
                </button>
              </div>
            </div>

            {!apiKey && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
                <p className="text-yellow-800">
                  ⚠️ <strong>API Key não configurada!</strong> Clique em "Configurar API" para adicionar sua chave do Gemini.
                </p>
              </div>
            )}

            {!generatedLyrics ? (
              <div>
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2 text-lg">
                    Inspiração para a Música
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
                  disabled={isGenerating}
                  className={`w-full ${
                    isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  } text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-300 transform hover:scale-105 shadow-lg`}
                >
                  {isGenerating ? '⏳ Gerando...' : '🎵 Gerar Letra Completa'}
                </button>
              </div>
            ) : (
              <div>
                <div className="bg-gray-50 rounded-lg p-6 mb-6 max-h-96 overflow-y-auto border-2 border-gray-200">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
                    {generatedLyrics.fullText}
                  </pre>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={downloadTXT}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center transition-colors duration-300"
                  >
                    <Download className="mr-2" />
                    Download TXT
                  </button>
                  <button
                    onClick={downloadPDF}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center transition-colors duration-300"
                  >
                    <Download className="mr-2" />
                    Download PDF
                  </button>
                  <button
                    onClick={() => setGeneratedLyrics(null)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-300"
                  >
                    Nova Letra
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MusicLyricsGenerator;