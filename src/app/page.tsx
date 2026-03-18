import Link from "next/link";

export default function Home() {
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "4rem 2rem", textAlign: "center", fontFamily: "sans-serif" }}>
      <h1>Bem-vindo ao Sistema de Assinaturas Digitais</h1>
      <p style={{ marginTop: "1rem", marginBottom: "2rem", color: "#666" }}>
        Uma plataforma segura para assinar e verificar documentos usando criptografia RSA.
      </p>
      <Link href="/sign" style={{ padding: "0.8rem 1.5rem", backgroundColor: "#0070f3", color: "white", textDecoration: "none", borderRadius: "5px", fontWeight: "bold" }}>
        Ir para a Tela de Assinatura
      </Link>
    </div>
  );
}
