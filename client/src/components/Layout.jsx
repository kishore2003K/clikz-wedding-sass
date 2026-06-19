import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Settings, LogOut,
  Film, Bell, User, Plus, ChevronRight, Sparkles, Calendar, Briefcase
} from 'lucide-react';
import { useState, useEffect } from 'react';
import clikzLogo from '../assets/clikz_logo.png';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/invoices', label: 'Invoices', icon: FileText },
  { to: '/master-event', label: 'Master Event', icon: Calendar },
  { to: '/master-service', label: 'Master Service', icon: Briefcase },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getPageTitle = () => {
    const item = navItems.find(i =>
      i.end ? location.pathname === i.to : location.pathname.startsWith(i.to)
    );
    return item?.label || 'Dashboard';
  };

  return (
    <div style={styles.shell}>
      {/* ── Sidebar ── */}
      <aside
        style={{
          ...styles.sidebar,
          width: isSidebarCollapsed ? 72 : 260,
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Brand */}
        <div
          style={{
            ...styles.logo,
            padding: isSidebarCollapsed ? '20px 0' : '20px 24px 16px',
            justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
          }}
        >
          <div
            style={{
              ...styles.logoBadge,
              background: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <img
              src={clikzLogo}
              alt="Clikz Logo"
              style={{
                width: '28px',
                height: '28px',
                objectFit: 'contain',
              }}
            />
          </div>

          {!isSidebarCollapsed && (
            <div style={{ overflow: 'hidden' }}>
              <p style={styles.logoName}>CLIKZ</p>
              <p style={styles.logoSub}>Wedding Films</p>
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          style={{
            ...styles.collapseBtn,
            transform: isSidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
          aria-label="Toggle sidebar"
        >
          <ChevronRight size={14} color="#8a9aa0" />
        </button>

        {/* User chip */}
        <div style={{
          ...styles.userChip,
          padding: isSidebarCollapsed ? '12px 0' : '16px 20px',
          justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
          flexDirection: isSidebarCollapsed ? 'column' : 'row',
          gap: isSidebarCollapsed ? 8 : 12,
        }}>
          <div style={styles.avatar}>AD</div>
          {!isSidebarCollapsed && (
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              <p style={styles.userName}>Admin User</p>
              <p style={styles.userRole}>Administrator</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={styles.nav}>
          {!isSidebarCollapsed && (
            <p style={styles.secLabel}>Main Menu</p>
          )}
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              item={item}
              collapsed={isSidebarCollapsed}
            />
          ))}
        </nav>

        {/* Pro Banner */}
        {!isSidebarCollapsed && (
          <div style={styles.proBanner}>
            <div style={styles.proIcon}>
              <Sparkles size={16} color="#0d9488" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={styles.proTitle}>Pro Plan</p>
              <p style={styles.proDesc}>Advanced features</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          ...styles.sbFooter,
          padding: isSidebarCollapsed ? '12px 0' : '12px 16px 16px',
        }}>
          <button
            onClick={handleLogout}
            style={{
              ...styles.logoutBtn,
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              padding: isSidebarCollapsed ? '10px 0' : '10px 14px',
            }}
          >
            <LogOut size={16} color="#8a9aa0" strokeWidth={2} />
            {!isSidebarCollapsed && (
              <span style={styles.logoutLabel}>Sign Out</span>
            )}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div style={{
        ...styles.main,
        marginLeft: isSidebarCollapsed ? 72 : 260,
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <header style={{
          ...styles.topbar,
          boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.04)' : '0 1px 3px rgba(0,0,0,0.02)',
        }}>
          <div style={styles.pageCrumb}>
            <div style={styles.crumbIcon}>
              <LayoutDashboard size={16} color="#0d9488" strokeWidth={2.5} />
            </div>
            <div>
              <span style={styles.pageTitle}>{getPageTitle()}</span>
              <span style={styles.pageSubtitle}>Welcome back, Admin</span>
            </div>
          </div>
          <div style={styles.topbarRight}>
            <button style={styles.tbBtn} aria-label="Notifications">
              <Bell size={16} color="#64748b" strokeWidth={2} />
              <span style={styles.notificationDot} />
            </button>
            <button style={styles.tbBtn} aria-label="Account">
              <User size={16} color="#64748b" strokeWidth={2} />
            </button>
            {/* <button
              style={styles.newBtn}
              onClick={() => navigate('/invoices/new')}
            >
              <Plus size={16} color="#fff" strokeWidth={2.5} />
              <span style={styles.newBtnLabel}>New Invoice</span>
            </button> */}
          </div>
        </header>

        <div style={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function NavItem({ item, collapsed }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      {({ isActive }) => (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: collapsed ? 0 : 12,
          padding: collapsed ? '12px 0' : '11px 16px',
          margin: '0 12px 4px',
          borderRadius: 10,
          background: isActive ? 'rgba(13, 148, 136, 0.12)' : 'transparent',
          border: isActive ? '1px solid rgba(13, 148, 136, 0.15)' : '1px solid transparent',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.2s ease',
        }}>
          {isActive && (
            <div style={{
              position: 'absolute',
              left: -12,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 3,
              height: 20,
              background: '#0d9488',
              borderRadius: '0 4px 4px 0',
            }} />
          )}
          <Icon
            size={18}
            color={isActive ? '#0d9488' : '#8a9aa0'}
            strokeWidth={isActive ? 2.5 : 2}
            style={{
              flexShrink: 0,
              transition: 'color 0.2s ease',
            }}
          />
          {!collapsed && (
            <span style={{
              fontSize: 13.5,
              color: isActive ? '#0d9488' : '#8a9aa0',
              fontWeight: isActive ? 600 : 500,
              letterSpacing: '-0.01em',
              transition: 'color 0.2s ease',
              whiteSpace: 'nowrap',
            }}>
              {item.label}
            </span>
          )}
          {isActive && !collapsed && (
            <div style={{
              marginLeft: 'auto',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#0d9488',
              flexShrink: 0,
            }} />
          )}
        </div>
      )}
    </NavLink>
  );
}

const styles = {
  shell: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f4f6f5',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  sidebar: {
    background: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 50,
    borderRight: '1px solid rgba(255,255,255,0.04)',
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    transition: 'padding 0.3s ease',
  },

  logoBadge: {
    width: 36,
    height: 36,
    background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
  },

  logoName: {
    fontSize: 15,
    fontWeight: 800,
    color: '#f1f5f9',
    letterSpacing: '0.08em',
    margin: 0,
    lineHeight: 1.2,
  },

  logoSub: {
    fontSize: 10,
    color: '#64748b',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    margin: 0,
    marginTop: 2,
    fontWeight: 500,
  },

  collapseBtn: {
    position: 'absolute',
    right: -10,
    top: 68,
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: '#1e293b',
    border: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 60,
    transition: 'transform 0.3s ease, background 0.2s ease',
    padding: 0,
  },

  userChip: {
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.3s ease',
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: 'linear-gradient(135deg, rgba(13,148,136,0.2) 0%, rgba(13,148,136,0.1) 100%)',
    border: '1.5px solid rgba(13, 148, 136, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    color: '#14b8a6',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(13, 148, 136, 0.15)',
  },

  userName: {
    fontSize: 13,
    color: '#e2e8f0',
    fontWeight: 600,
    margin: 0,
    lineHeight: 1.3,
  },

  userRole: {
    fontSize: 10.5,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    margin: 0,
    marginTop: 2,
    fontWeight: 500,
  },

  nav: {
    flex: 1,
    padding: '16px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    overflowY: 'auto',
    overflowX: 'hidden',
  },

  secLabel: {
    fontSize: 10,
    color: '#475569',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    padding: '8px 24px 6px',
    margin: 0,
    fontWeight: 600,
  },

  proBanner: {
    margin: '0 16px 16px',
    padding: '14px 16px',
    background: 'linear-gradient(135deg, rgba(13,148,136,0.1) 0%, rgba(13,148,136,0.05) 100%)',
    borderRadius: 12,
    border: '1px solid rgba(13, 148, 136, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },

  proIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: 'rgba(13, 148, 136, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  proTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#e2e8f0',
    margin: 0,
    lineHeight: 1.3,
  },

  proDesc: {
    fontSize: 10.5,
    color: '#64748b',
    margin: 0,
    marginTop: 2,
  },

  sbFooter: {
    borderTop: '1px solid rgba(255,255,255,0.06)',
    transition: 'padding 0.3s ease',
  },

  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    borderRadius: 10,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    transition: 'background 0.2s ease',
    color: '#8a9aa0',
  },

  logoutLabel: {
    fontSize: 13,
    color: '#8a9aa0',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },

  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  topbar: {
    background: 'rgba(248, 250, 252, 0.85)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
    height: 64,
    padding: '0 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 40,
    transition: 'box-shadow 0.3s ease',
  },

  pageCrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },

  crumbIcon: {
    width: 36,
    height: 36,
    background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(13, 148, 136, 0.08)',
  },

  pageTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: '#0f172a',
    display: 'block',
    letterSpacing: '-0.01em',
  },

  pageSubtitle: {
    fontSize: 11.5,
    color: '#64748b',
    display: 'block',
    marginTop: 2,
    fontWeight: 500,
  },

  topbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },

  tbBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    border: '1px solid rgba(226, 232, 240, 0.8)',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },

  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#0d9488',
    border: '2px solid #fff',
  },

  newBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '0 18px',
    height: 38,
    background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(13, 148, 136, 0.25)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },

  newBtnLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#fff',
    letterSpacing: '-0.01em',
  },

  content: {
    flex: 1,
    padding: '28px 32px',
    maxWidth: 1400,
  },
};