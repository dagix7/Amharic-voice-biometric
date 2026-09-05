'use client';
import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:8000/predict', formData);
      setResult(res.data);
    } catch (error) {
      console.error(error);
      alert('Error processing audio');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🎙️ Amharic Voice Recognizer</h1>
      <div style={styles.card}>
        <input type="file" accept=".wav" onChange={handleFileChange} style={styles.input } />
        <button
          onClick={handleUpload}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          style={{
            ...styles.button,
            cursor: loading ? 'not-allowed' : isHovering ? 'pointer' : 'pointer',
          }}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Predict Voice'}
        </button>

        {result && (
          <div style={styles.resultBox}>
            <h2>Results:</h2>
            <p><strong>Gender:</strong> {result.gender}</p>
            <p><strong>Speaker:</strong> {result.speaker}</p>
            <p><strong>Confidence:</strong> {(result.speaker_confidence * 100).toFixed(2)}%</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f172a', color: 'white', fontFamily: 'sans-serif' },
  title: { fontSize: '2.5rem', marginBottom: '2rem' },
  card: { background: '#1e293b', padding: '2rem', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', width: '400px', textAlign: 'center' },
  input: { marginBottom: '1rem', padding: '0.5rem', width: '100%' },
  button: { background: '#3b82f6', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontSize: '1rem', cursor: 'pointer', width: '100%', transition: '0.3s' },
  resultBox: { marginTop: '1.5rem', padding: '1rem', background: '#0f172a', borderRadius: '0.5rem' }
};