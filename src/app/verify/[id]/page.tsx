"use client";
import { useEffect, useState } from 'react';

interface VerificationResult {
  status: string; signatario: string; algoritmo: string; data: string;
}

export default function VerifyPage({ params }: { params: { id: string } }) {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySignature = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/signatures/verify/${params.id}`);
        if (!response.ok) throw new Error('Assinatura nao encontrada ou erro no servidor');
        const data = await response.json();
        setResult(data);
      } catch (err: any) { setError(err.message); } 
      finally { setLoading(false); }
    };
    verifySignature();
  }, [params.id]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Verificando assinatura...</div>;
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}><h2>Ocorreu um erro</h2><p>{error}</p></div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
      <h2>Verificacao de Assinatura Digital</h2>
      <div style={{ marginTop: '2rem', padding: '2rem', border: `3px solid ${result?.status === 'VALIDA' ? 'green' : 'red'}`, borderRadius: '8px' }}>
        <h1 style={{ color: result?.status === 'VALIDA' ? 'green' : 'red' }}>{result?.status}</h1>
        <div style={{ marginTop: '1.5rem', textAlign: 'left', lineHeight: '1.6' }}>
          <p><strong>Signatario:</strong> {result?.signatario}</p>
          <p><strong>Algoritmo:</strong> {result?.algoritmo}</p>
          <p><strong>Data:</strong> {result?.data}</p>
          <p style={{ fontSize: '0.8rem', color: '#666', wordBreak: 'break-all' }}><strong>ID da Assinatura:</strong> {params.id}</p>
        </div>
      </div>
    </div>
  );
}