import JoinForm from "./join-form";

export default function JoinPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f5f5f5" }}>
      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", padding: 40, width: 400 }}>
        <JoinForm />
      </div>
    </div>
  );
} 