"use client";
import { useState } from "react";
import { generateSHA256 } from "../../utils/crypto";

export default function SignPage() {
  const [text, setText] = useState("");
  const [userId, setUserId] = useState("1");
  const [status, setStatus] = useState("");
  const [signatureId, setSignatureId] = useState("");

  const handleSign = async () => {
    if (!text) { setStatus("Por favor, insira um texto para assinar."); return; }
    if (!userId) { setStatus("Por favor, informe o ID do usuario."); return; }
    try {
      setStatus("Processando...");
      const documentHash = await generateSHA256(text);
      const response = await fetch("http://localhost:8000/api/signatures/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: parseInt(userId), document_hash: documentHash }),
      });
      if (!response.ok) throw new Error("Erro ao assinar");
      const data = await response.json();
      setSignatureId(data.signature_id);
      setStatus("Documento assinado com sucesso!");
    } catch (error) {
      console.error(error);
      setStatus("Falha. Verifique se esse ID de usuario existe no banco de dados.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
      <h2>Area de Assinatura</h2>
      
      <div style={{ marginBottom: "1rem", padding: "1rem", backgroundColor: "#f0f0f0", borderRadius: "8px" }}>
        <label style={{ fontWeight: "bold", marginRight: "10px", color: "#333" }}>ID do Signatario:</label>
        <input 
          type="number" 
          min="1" 
          value={userId} 
          onChange={(e) => setUserId(e.target.value)} 
          style={{ padding: "0.5rem", width: "80px", color: "#000" }} 
        />
        <span style={{ marginLeft: "10px", fontSize: "0.8rem", color: "#666" }}>(Crie novos IDs no Swagger)</span>
      </div>

      <textarea 
        rows={10} 
        style={{ width: "100%", padding: "1rem", marginBottom: "1rem", color: "#000" }} 
        placeholder="Cole o texto do documento aqui..." 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
      />
      
      <button 
        onClick={handleSign} 
        style={{ padding: "0.5rem 1rem", cursor: "pointer", backgroundColor: "#0070f3", color: "#fff", border: "none", fontWeight: "bold" }}>
        Assinar Documento
      </button>
      
      {status && <p style={{ marginTop: "1rem", fontWeight: "bold" }}>{status}</p>}
      {signatureId && (
        <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #ccc", backgroundColor: "#e6f7ff", color: "#000" }}>
          <p><strong>ID da Assinatura gerada:</strong> <br/>{signatureId}</p>
          <p style={{ fontSize: "0.9rem", marginTop: "10px" }}>Guarde este ID. Ele e a prova matematica da sua assinatura.</p>
        </div>
      )}
    </div>
  );
}