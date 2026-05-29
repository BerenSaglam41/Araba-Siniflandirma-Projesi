import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  // O anki sekme açıkken geçici cache görevi görecek dizi (State)
  const [history, setHistory] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null); 
    }
  };

  const handlePredict = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    setLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:8000/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        const newResult = {
          className: response.data.class,
          confidence: response.data.confidence,
          imgUrl: previewUrl // Önizleme linkini geçmiş kartında göstermek için saklıyoruz
        };

        setResult(newResult);

        // Geçici hafızaya (Cache) ekle - En son tahmin edilen en üste gelsin diye unshift mantığı
        setHistory(prevHistory => [newResult, ...prevHistory]);

      } else {
        alert("Model Tahmin Hatası: " + response.data.error);
      }
    } catch (error) {
      console.error("Bağlantı Hatası:", error);
      alert("Backend API sunucusuna bağlanılamadı! Port 8000'in açık olduğundan emin olun.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-layout">
      
      {/* SOL ALAN: ANA SINIFLANDIRICI */}
      <div className="container">
        <h1>Araba Gövde Tipi Sınıflandırma</h1>
        <p className="subtitle">Yazılım Laboratuvarı II - Proje III</p>

        <div className="upload-zone" onClick={() => document.getElementById('fileInput').click()}>
          <p>Sürükleyip bırakın veya bir araba resmi seçmek için tıklayın</p>
          <span>Desteklenen formatlar: JPG, JPEG, PNG</span>
          <input 
            type="file" 
            id="fileInput" 
            accept="image/*" 
            style={{ display: 'none' }} 
            onChange={handleFileChange} 
          />
        </div>

        {previewUrl && (
          <button className="predict-btn" onClick={handlePredict} disabled={loading}>
            {loading ? "⏳ Model Analiz Ediyor..." : "Modeli Çalıştır ve Tahmin Et"}
          </button>
        )}

        {previewUrl && (
          <div className="preview-result-wrapper">
            <div className="image-box">
              <img src={previewUrl} alt="Yüklenen Araba" />
            </div>

            {result && (
              <div className="result-box">
                <h2>Analiz Sonucu</h2>
                <div className="class-name">{result.className}</div>
                <p style={{ color: '#4a5568', fontSize: '13px', fontWeight: '600' }}>
                  Güven Oranı (Confidence)
                </p>
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill" 
                    style={{ width: `${result.confidence}%` }}
                  ></div>
                  <div className="confidence-text">%{result.confidence}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SAĞ ALAN: GEÇİCİ SEANS BELLEĞİ (CACHE PANELİ) */}
      <div className="history-panel">
        <h4>Geçmiş Analizler</h4>
        {history.length === 0 ? (
          <p className="no-history">Henüz bir analiz yapılmadı.</p>
        ) : (
          history.map((item, index) => (
            <div key={index} className="history-item">
              <img src={item.imgUrl} alt="Küçük Önizleme" className="history-thumb" />
              <div className="history-info">
                <p>{item.className}</p>
                <span>Güven: %{item.confidence}</span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default App;