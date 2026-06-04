import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

export default function NexoHeader() {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Inicio" },
    { path: "/projects", label: "Proyectos" },
    { path: "/info", label: "Nosotros" },
  ];

  // No mostrar header en Home (tiene su propio header integrado en el vortex)
  if (location.pathname === "/") return null;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.97)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.07)",
        boxShadow: scrolled ? "0 2px 20px rgba(0,79,205,0.08)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo NEXO */}
          <Link to="/" className="flex items-center gap-3 group" style={{ textDecoration: "none" }}>
  <img 
    src="/images/logo-nexo.png" 
    className="h-8 w-auto transition-transform duration-300 group-hover:scale-105"
  />
</Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nexo-nav-link ${isActive(link.path) ? 'text-nexo-primary after:w-full' : ''}`}
              >
                {link.label}
              </Link>
            ))}
            
            {isAuthenticated && (
              <Link
                to="/upload"
                className={`nexo-nav-link ${isActive("/upload") ? 'text-nexo-primary after:w-full' : ''}`}
              >
                Subir
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className={`nexo-nav-link ${isActive("/admin") ? 'text-nexo-primary after:w-full' : ''}`}
                style={{ color: "#004FCD", fontWeight: 700 }}
              >
                ⚙ Admin
              </Link>
            )}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/yo")}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-full transition-all duration-300 hover:bg-blue-50"
                >
                  <img 
  src={user?.avatar || "/images/avatar_default.jpg"} 
  alt={user?.name}
  className="w-8 h-8 rounded-full object-cover shadow-md"
/>
                  <span className="text-sm font-medium font-montserrat text-nexo-dark">
                    {user?.name.split(" ")[0]}
                  </span>
                </button>
                <button
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-red-500 transition-colors font-montserrat"
                >
                  Salir
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("openLoginModal"));
                  if (location.pathname !== "/") navigate("/");
                }}
                className="nexo-btn-primary text-sm"
              >
                Acceso
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ background: "rgba(0,79,205,0.07)" }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menú"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`block h-0.5 transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} style={{ background: "#004FCD" }} />
              <span className={`block h-0.5 transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`} style={{ background: "#004FCD" }} />
              <span className={`block h-0.5 transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} style={{ background: "#004FCD" }} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4 animate-fade-in">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-lg font-medium py-3 px-4 rounded-xl transition-colors font-montserrat ${
                    isActive(link.path) 
                      ? "bg-blue-50 text-nexo-primary" 
                      : "text-nexo-dark hover:bg-gray-50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <Link
                    to="/upload"
                    className="text-lg font-medium py-3 px-4 rounded-xl font-montserrat text-white flex items-center gap-2"
                    style={{ background: "linear-gradient(135deg,#004FCD,#3b7de8)" }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    + Subir proyecto
                  </Link>
                  <Link
                    to="/yo"
                    className="text-lg font-medium py-3 px-4 rounded-xl font-montserrat"
                    style={{ background: "rgba(0,79,205,0.07)", color: "#004FCD" }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mi Perfil
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="text-lg font-medium py-3 px-4 rounded-xl font-montserrat"
                      style={{ background: "rgba(0,79,205,0.05)", color: "#004FCD" }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      ⚙ Admin
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="text-lg font-medium py-3 px-4 rounded-xl text-left font-montserrat transition-colors"
                    style={{ color: "#ef4444" }}
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("openLoginModal"));
                    navigate("/");
                    setMobileMenuOpen(false);
                  }}
                  className="nexo-btn-primary text-center mt-2"
                >
                  Acceso
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}