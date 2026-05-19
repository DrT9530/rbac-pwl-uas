import { useState, useEffect, createContext, useContext } from "react";

const API_BASE = "http://localhost:5000/api";

const AuthContext = createContext(null);

function useAuth() {
  return useContext(AuthContext);
}

function getToken() {
  return localStorage.getItem("token");
}
function getUser() {
  try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
}
function getPermissions() {
  try { return JSON.parse(localStorage.getItem("permissions")) || []; } catch { return []; }
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || "Request gagal");
  return data;
}

export default function App() {
  const [user, setUser] = useState(getUser);
  const [permissions, setPermissions] = useState(getPermissions);

  function login(userData, token, perms) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("permissions", JSON.stringify(perms));
    setUser(userData);
    setPermissions(perms);
  }

  function logout() {
    localStorage.clear();
    setUser(null);
    setPermissions([]);
  }

  return (
    <AuthContext.Provider value={{ user, permissions, login, logout }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=Source+Sans+3:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Source Sans 3', sans-serif; background: #fdf6f0; color: #2c1810; }
        :root {
          --orange: #ff6600;
          --orange-dark: #cc5200;
          --orange-light: #ff944d;
          --orange-pale: #fff0e6;
          --orange-border: #ffd4b3;
          --cream: #fdf6f0;
          --brown-dark: #2c1810;
          --brown-mid: #7a4030;
          --brown-light: #c8866a;
          --white: #ffffff;
          --gray-light: #f5f0eb;
          --gray-mid: #d4c9c0;
          --gray-text: #5c4a42;
          --red: #c0392b;
          --green: #27ae60;
          --radius: 8px;
          --shadow: 0 2px 8px rgba(44,24,16,0.10);
          --shadow-hover: 0 4px 16px rgba(255,102,0,0.18);
        }
        button { cursor: pointer; font-family: inherit; }
        input, textarea, select { font-family: inherit; }
        h1, h2, h3 { font-family: 'Lora', serif; }
      `}</style>
      {user ? <Dashboard /> : <AuthPages />}
    </AuthContext.Provider>
  );
}

function AuthPages() {
  const [page, setPage] = useState("login");
  return page === "login"
    ? <LoginPage onSwitch={() => setPage("register")} />
    : <RegisterPage onSwitch={() => setPage("login")} />;
}

function LoginPage({ onSwitch }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      const perms = parsePermissionsFromToken(data.token);
      login(data.user, data.token, perms);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.authWrap}>
      <div style={styles.authCard}>
        <div style={styles.authLogo}>
          <BloggerIcon size={40} />
          <h1 style={{ fontSize: 28, color: "var(--orange)", marginTop: 8 }}>BlogRBAC</h1>
          <p style={{ color: "var(--gray-text)", fontSize: 14, marginTop: 4 }}>Masuk ke akun Anda</p>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.errorBox}>{error}</div>}
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            placeholder="email@contoh.com"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
          />
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            required
          />
          <button style={loading ? { ...styles.btnPrimary, opacity: 0.7 } : styles.btnPrimary} type="submit" disabled={loading}>
            {loading ? "Masuk..." : "Masuk"}
          </button>
        </form>
        <p style={styles.switchText}>
          Belum punya akun?{" "}
          <span style={styles.link} onClick={onSwitch}>Daftar sekarang</span>
        </p>
      </div>
    </div>
  );
}

function RegisterPage({ onSwitch }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "", roleName: "USER" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await apiFetch("/auth/register", { method: "POST", body: JSON.stringify(form) });
      setSuccess("Registrasi berhasil! Silakan login.");
      setTimeout(onSwitch, 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.authWrap}>
      <div style={styles.authCard}>
        <div style={styles.authLogo}>
          <BloggerIcon size={40} />
          <h1 style={{ fontSize: 28, color: "var(--orange)", marginTop: 8 }}>BlogRBAC</h1>
          <p style={{ color: "var(--gray-text)", fontSize: 14, marginTop: 4 }}>Buat akun baru</p>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.errorBox}>{error}</div>}
          {success && <div style={styles.successBox}>{success}</div>}
          <label style={styles.label}>Username</label>
          <input style={styles.input} placeholder="username" value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
          <label style={styles.label}>Email</label>
          <input style={styles.input} type="email" placeholder="email@contoh.com" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          <label style={styles.label}>Password</label>
          <input style={styles.input} type="password" placeholder="••••••••" value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          <label style={styles.label}>Role</label>
          <select style={styles.input} value={form.roleName}
            onChange={e => setForm(f => ({ ...f, roleName: e.target.value }))}>
            <option value="USER">USER — Baca artikel saja</option>
            <option value="EDITOR">EDITOR — Buat & edit artikel</option>
            <option value="ADMIN">ADMIN — Akses penuh</option>
          </select>
          <button style={loading ? { ...styles.btnPrimary, opacity: 0.7 } : styles.btnPrimary} type="submit" disabled={loading}>
            {loading ? "Mendaftar..." : "Daftar"}
          </button>
        </form>
        <p style={styles.switchText}>
          Sudah punya akun?{" "}
          <span style={styles.link} onClick={onSwitch}>Masuk</span>
        </p>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user, permissions, logout } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  const can = (perm) => permissions.includes(perm);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function loadArticles() {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/articles");
      setArticles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadArticles(); }, []);

  async function handleDelete(id) {
    if (!window.confirm("Yakin hapus artikel ini?")) return;
    try {
      await apiFetch(`/articles/${id}`, { method: "DELETE" });
      showToast("Artikel berhasil dihapus");
      loadArticles();
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  function openCreate() { setModal({ mode: "create" }); }
  function openEdit(article) { setModal({ mode: "edit", article }); }

  async function handleSave(formData, mode, id) {
    try {
      if (mode === "create") {
        await apiFetch("/articles", { method: "POST", body: JSON.stringify(formData) });
        showToast("Artikel berhasil dibuat!");
      } else {
        await apiFetch(`/articles/${id}`, { method: "PUT", body: JSON.stringify(formData) });
        showToast("Artikel berhasil diperbarui!");
      }
      setModal(null);
      loadArticles();
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  const roleColor = {
    ADMIN: { bg: "#fff0e6", color: "#cc5200", border: "#ffd4b3" },
    EDITOR: { bg: "#e8f5e9", color: "#2e7d32", border: "#a5d6a7" },
    USER: { bg: "#e3f2fd", color: "#1565c0", border: "#90caf9" },
  }[user?.role] || { bg: "#f5f5f5", color: "#555", border: "#ddd" };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navInner}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <BloggerIcon size={28} />
            <span style={{ fontFamily: "'Lora',serif", fontSize: 22, fontWeight: 700, color: "var(--white)", letterSpacing: "-0.5px" }}>
              BlogRBAC
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "var(--white)", fontWeight: 600, fontSize: 15 }}>{user?.username}</div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "2px 10px",
                borderRadius: 20, background: roleColor.bg,
                color: roleColor.color, border: `1px solid ${roleColor.border}`,
                letterSpacing: 0.5
              }}>{user?.role}</span>
            </div>
            <button onClick={logout} style={styles.btnLogout}>Keluar</button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
        {/* Header area */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
          <div>
            <h2 style={{ fontSize: 26, color: "var(--brown-dark)" }}>Daftar Artikel</h2>
            <p style={{ color: "var(--gray-text)", marginTop: 4, fontSize: 14 }}>
              {articles.length} artikel tersedia
            </p>
          </div>
          {can("CREATE_ARTICLE") && (
            <button onClick={openCreate} style={styles.btnPrimary}>
              + Tulis Artikel
            </button>
          )}
        </div>

        {/* RBAC Info Banner */}
        <RbacBanner permissions={permissions} role={user?.role} />

        {/* Error */}
        {error && <div style={{ ...styles.errorBox, marginBottom: 20 }}>{error}</div>}

        {/* Loading */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--gray-text)" }}>
            Memuat artikel...
          </div>
        ) : articles.length === 0 ? (
          <EmptyState canCreate={can("CREATE_ARTICLE")} onCreate={openCreate} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {articles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                canEdit={can("UPDATE_ARTICLE")}
                canDelete={can("DELETE_ARTICLE")}
                onEdit={() => openEdit(article)}
                onDelete={() => handleDelete(article.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {modal && (
        <ArticleModal
          mode={modal.mode}
          article={modal.article}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 9999,
          background: toast.type === "error" ? "var(--red)" : "var(--orange)",
          color: "#fff", padding: "12px 24px",
          borderRadius: "var(--radius)", boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          fontWeight: 600, fontSize: 15,
          animation: "fadeIn 0.2s ease"
        }}>
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
      `}</style>
    </div>
  );
}

function RbacBanner({ permissions, role }) {
  const allPerms = ["READ_ARTICLE", "CREATE_ARTICLE", "UPDATE_ARTICLE", "DELETE_ARTICLE"];
  const labels = {
    READ_ARTICLE: "Baca",
    CREATE_ARTICLE: "Tulis",
    UPDATE_ARTICLE: "Edit",
    DELETE_ARTICLE: "Hapus",
  };
  return (
    <div style={{
      background: "var(--white)", border: "1.5px solid var(--orange-border)",
      borderRadius: "var(--radius)", padding: "14px 18px",
      marginBottom: 24, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap"
    }}>
      <span style={{ fontSize: 13, color: "var(--gray-text)", fontWeight: 600 }}>Izin akses Anda:</span>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {allPerms.map(p => {
          const has = permissions.includes(p);
          return (
            <span key={p} style={{
              fontSize: 12, padding: "3px 12px", borderRadius: 20, fontWeight: 600,
              background: has ? "var(--orange-pale)" : "var(--gray-light)",
              color: has ? "var(--orange-dark)" : "var(--gray-mid)",
              border: `1px solid ${has ? "var(--orange-border)" : "var(--gray-mid)"}`,
            }}>
              {has ? "✓" : "✗"} {labels[p]}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function ArticleCard({ article, canEdit, canDelete, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(article.createdAt).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric"
  });
  const preview = article.content.length > 200 ? article.content.slice(0, 200) + "..." : article.content;

  return (
    <div style={styles.card} onMouseEnter={e => e.currentTarget.style.boxShadow = "var(--shadow-hover)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "var(--shadow)"}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontFamily: "'Lora',serif", fontSize: 19, color: "var(--brown-dark)", marginBottom: 6, lineHeight: 1.35 }}>
            {article.title}
          </h3>
          <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: "var(--gray-text)" }}>
              ✍️ {article.author?.username || "Anonim"}
            </span>
            <span style={{ fontSize: 13, color: "var(--gray-text)" }}>📅 {date}</span>
          </div>
          <p style={{ fontSize: 15, color: "var(--gray-text)", lineHeight: 1.65 }}>
            {expanded ? article.content : preview}
          </p>
          {article.content.length > 200 && (
            <button onClick={() => setExpanded(v => !v)} style={styles.btnText}>
              {expanded ? "Sembunyikan ↑" : "Baca selengkapnya ↓"}
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {canEdit && (
            <button onClick={onEdit} style={styles.btnEdit} title="Edit">✏️ Edit</button>
          )}
          {canDelete && (
            <button onClick={onDelete} style={styles.btnDelete} title="Hapus">🗑 Hapus</button>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ canCreate, onCreate }) {
  return (
    <div style={{ textAlign: "center", padding: "72px 24px" }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>📝</div>
      <h3 style={{ fontFamily: "'Lora',serif", fontSize: 20, color: "var(--brown-mid)", marginBottom: 8 }}>
        Belum ada artikel
      </h3>
      <p style={{ color: "var(--gray-text)", marginBottom: 24, fontSize: 15 }}>
        {canCreate ? "Yuk mulai tulis artikel pertamamu!" : "Belum ada artikel yang dipublikasikan."}
      </p>
      {canCreate && (
        <button onClick={onCreate} style={styles.btnPrimary}>+ Tulis Artikel Pertama</button>
      )}
    </div>
  );
}

function ArticleModal({ mode, article, onClose, onSave }) {
  const [form, setForm] = useState({
    title: article?.title || "",
    content: article?.content || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError("Judul dan konten wajib diisi.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSave(form, mode, article?.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={styles.modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Lora',serif", fontSize: 22, color: "var(--brown-dark)" }}>
            {mode === "create" ? "✍️ Tulis Artikel Baru" : "✏️ Edit Artikel"}
          </h2>
          <button onClick={onClose} style={styles.btnClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div style={{ ...styles.errorBox, marginBottom: 16 }}>{error}</div>}
          <label style={styles.label}>Judul Artikel</label>
          <input
            style={{ ...styles.input, marginBottom: 16 }}
            placeholder="Masukkan judul artikel yang menarik..."
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            required
          />
          <label style={styles.label}>Konten</label>
          <textarea
            style={{ ...styles.input, minHeight: 200, resize: "vertical", lineHeight: 1.65 }}
            placeholder="Tulis konten artikel di sini..."
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            required
          />
          <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={styles.btnSecondary}>Batal</button>
            <button type="submit" style={loading ? { ...styles.btnPrimary, opacity: 0.7 } : styles.btnPrimary} disabled={loading}>
              {loading ? "Menyimpan..." : mode === "create" ? "Publikasikan" : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BloggerIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#ff6600" />
      <rect x="10" y="14" width="28" height="4" rx="2" fill="white" />
      <rect x="10" y="22" width="20" height="4" rx="2" fill="white" />
      <rect x="10" y="30" width="24" height="4" rx="2" fill="white" />
    </svg>
  );
}

function parsePermissionsFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.permissions || [];
  } catch {
    return [];
  }
}

const styles = {
  authWrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #fff0e6 0%, #fdf6f0 60%, #ffe4cc 100%)",
    padding: 16,
  },
  authCard: {
    background: "var(--white)",
    borderRadius: 16,
    boxShadow: "0 8px 40px rgba(255,102,0,0.13)",
    padding: "40px 36px",
    width: "100%",
    maxWidth: 420,
    border: "1.5px solid var(--orange-border)",
  },
  authLogo: {
    textAlign: "center",
    marginBottom: 32,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--brown-mid)",
    marginBottom: 6,
    marginTop: 12,
    display: "block",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    border: "1.5px solid var(--gray-mid)",
    borderRadius: "var(--radius)",
    fontSize: 15,
    background: "var(--cream)",
    color: "var(--brown-dark)",
    outline: "none",
    transition: "border 0.2s",
  },
  btnPrimary: {
    background: "var(--orange)",
    color: "#fff",
    border: "none",
    borderRadius: "var(--radius)",
    padding: "11px 24px",
    fontSize: 15,
    fontWeight: 700,
    marginTop: 20,
    transition: "background 0.18s, transform 0.12s",
    cursor: "pointer",
  },
  btnSecondary: {
    background: "var(--gray-light)",
    color: "var(--brown-mid)",
    border: "1.5px solid var(--gray-mid)",
    borderRadius: "var(--radius)",
    padding: "10px 20px",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnLogout: {
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
    border: "1.5px solid rgba(255,255,255,0.4)",
    borderRadius: "var(--radius)",
    padding: "7px 18px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnEdit: {
    background: "var(--orange-pale)",
    color: "var(--orange-dark)",
    border: "1.5px solid var(--orange-border)",
    borderRadius: "var(--radius)",
    padding: "6px 14px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnDelete: {
    background: "#fdf0f0",
    color: "var(--red)",
    border: "1.5px solid #f5c6c6",
    borderRadius: "var(--radius)",
    padding: "6px 14px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnText: {
    background: "none",
    border: "none",
    color: "var(--orange)",
    fontWeight: 600,
    fontSize: 13,
    padding: "4px 0",
    marginTop: 8,
    cursor: "pointer",
    display: "block",
  },
  btnClose: {
    background: "var(--gray-light)",
    border: "none",
    borderRadius: "50%",
    width: 32,
    height: 32,
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "var(--gray-text)",
    flexShrink: 0,
  },
  navbar: {
    background: "var(--orange)",
    boxShadow: "0 2px 8px rgba(255,102,0,0.25)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  navInner: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "14px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  card: {
    background: "var(--white)",
    border: "1.5px solid var(--orange-border)",
    borderRadius: 12,
    padding: "22px 24px",
    boxShadow: "var(--shadow)",
    transition: "box-shadow 0.2s",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(44,24,16,0.45)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modal: {
    background: "var(--white)",
    borderRadius: 16,
    padding: "32px 32px 28px",
    width: "100%",
    maxWidth: 560,
    boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  errorBox: {
    background: "#fdf0f0",
    color: "var(--red)",
    border: "1px solid #f5c6c6",
    borderRadius: "var(--radius)",
    padding: "10px 14px",
    fontSize: 14,
    marginBottom: 4,
  },
  successBox: {
    background: "#f0fdf4",
    color: "var(--green)",
    border: "1px solid #a5d6a7",
    borderRadius: "var(--radius)",
    padding: "10px 14px",
    fontSize: 14,
    marginBottom: 4,
  },
  switchText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
    color: "var(--gray-text)",
  },
  link: {
    color: "var(--orange)",
    fontWeight: 700,
    cursor: "pointer",
    textDecoration: "underline",
  },
};