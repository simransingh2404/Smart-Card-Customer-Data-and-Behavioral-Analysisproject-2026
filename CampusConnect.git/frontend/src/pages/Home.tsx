import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('[id]') as HTMLElement;
      if (!btn) {
        if (target.closest('.cc-explore-btn')) navigate('/register');
        return;
      }
      if (btn.id === 'cc-signin-btn') navigate('/login');
      else if (btn.id === 'cc-getstarted-btn') navigate('/register');
      else if (btn.id === 'cc-hero-cta') navigate('/register');
      else if (btn.id === 'cc-cta-register') navigate('/register');
      else if (btn.id === 'cc-cta-signin') navigate('/login');
    };

    document.addEventListener('click', handleClick);

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    const onScroll = () => {
      if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Showcase tabs
    (window as any).setTab = function(btn: HTMLElement, tab: string) {
      document.querySelectorAll('.showcase-tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      const titles: Record<string, string> = {
        dashboard: 'Procurement Overview',
        vendors: 'Vendor Directory',
        quotations: 'Quotation Management',
        analytics: 'Analytics Dashboard'
      };
      const subs: Record<string, string> = {
        dashboard: 'Delhi Public School, Patna · AY 2024–25 Q2',
        vendors: 'Browse 50+ verified vendors · Filter by category & rating',
        quotations: 'RFQ #024 · School Uniforms · 7 bids received',
        analytics: 'Spend analysis · Vendor performance · Procurement trends'
      };
      const titleEl = document.getElementById('sf-title');
      const subEl = document.getElementById('sf-sub');
      if (titleEl) titleEl.textContent = titles[tab];
      if (subEl) subEl.textContent = subs[tab];
    };

    // Intersection observer for animations
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); });
    }, { threshold: 0.15 });
    document.querySelectorAll('.step-card,.feature-card,.metric-block,.benefit-item').forEach(el => obs.observe(el));

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', onScroll);
      obs.disconnect();
    };
  }, [navigate]);

  return (
    <>
      <style>{`
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --navy:#0F172A;
  --white:#FFFFFF;
  --emerald:#10B981;
  --emerald-light:#D1FAE5;
  --emerald-dark:#059669;
  --slate:#64748B;
  --bg:#F8FAFC;
  --border:#E2E8F0;
  --border-light:#F1F5F9;
  --text-primary:#0F172A;
  --text-secondary:#475569;
  --text-muted:#94A3B8;
  --font-sans:'DM Sans',system-ui,sans-serif;
  --font-serif:'Instrument Serif',Georgia,serif;
  --radius-sm:6px;
  --radius-md:12px;
  --radius-lg:20px;
  --radius-xl:28px;
  --shadow-sm:0 1px 3px rgba(15,23,42,.06),0 1px 2px rgba(15,23,42,.04);
  --shadow-md:0 4px 16px rgba(15,23,42,.08),0 2px 6px rgba(15,23,42,.04);
  --shadow-lg:0 20px 60px rgba(15,23,42,.12),0 8px 24px rgba(15,23,42,.06);
  --shadow-xl:0 32px 80px rgba(15,23,42,.16);
}
html{scroll-behavior:smooth}
body{font-family:var(--font-sans);color:var(--text-primary);background:var(--white);line-height:1.6;overflow-x:hidden;-webkit-font-smoothing:antialiased}

/* ─── NAV ─────────────────────────────────────────────── */
nav{position:fixed;top:0;left:0;right:0;z-index:1000;background:rgba(255,255,255,.92);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid transparent;transition:border-color .3s,box-shadow .3s}
nav.scrolled{border-color:var(--border);box-shadow:0 1px 20px rgba(15,23,42,.06)}
.nav-inner{max-width:1200px;margin:0 auto;padding:0 32px;display:flex;align-items:center;height:68px;gap:40px}
.logo{font-family:var(--font-sans);font-weight:700;font-size:18px;color:var(--navy);text-decoration:none;display:flex;align-items:center;gap:10px;flex-shrink:0}
.logo-mark{width:32px;height:32px;background:var(--navy);border-radius:8px;display:flex;align-items:center;justify-content:center}
.logo-mark svg{width:18px;height:18px}
.nav-links{display:flex;align-items:center;gap:4px;flex:1}
.nav-links a{font-size:14px;font-weight:500;color:var(--text-secondary);text-decoration:none;padding:6px 14px;border-radius:var(--radius-sm);transition:color .2s,background .2s}
.nav-links a:hover{color:var(--navy);background:var(--bg)}
.nav-actions{display:flex;align-items:center;gap:10px;flex-shrink:0}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-family:var(--font-sans);font-size:14px;font-weight:600;padding:9px 20px;border-radius:var(--radius-sm);cursor:pointer;text-decoration:none;transition:all .2s;border:none;white-space:nowrap}
.btn-ghost{background:transparent;color:var(--text-secondary);border:1px solid transparent}
.btn-ghost:hover{background:var(--bg);color:var(--navy);border-color:var(--border)}
.btn-primary{background:var(--navy);color:var(--white)}
.btn-primary:hover{background:#1E293B;transform:translateY(-1px);box-shadow:var(--shadow-md)}
.btn-emerald{background:var(--emerald);color:var(--white)}
.btn-emerald:hover{background:var(--emerald-dark);transform:translateY(-1px);box-shadow:0 8px 24px rgba(16,185,129,.3)}
.btn-outline{background:transparent;color:var(--navy);border:1.5px solid var(--border)}
.btn-outline:hover{background:var(--bg);border-color:var(--navy)}
.btn-lg{font-size:15px;padding:13px 28px;border-radius:var(--radius-md)}
.btn-white{background:var(--white);color:var(--navy)}
.btn-white:hover{background:#F8FAFC;transform:translateY(-1px);box-shadow:var(--shadow-md)}

/* ─── HERO ────────────────────────────────────────────── */
.hero{min-height:100vh;display:flex;align-items:center;padding:120px 32px 80px;background:var(--white);position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 70% 50%,rgba(16,185,129,.05) 0%,transparent 60%),radial-gradient(ellipse 60% 80% at 80% 20%,rgba(15,23,42,.04) 0%,transparent 50%)}
.hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(15,23,42,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(15,23,42,.025) 1px,transparent 1px);background-size:60px 60px;pointer-events:none}
.hero-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;position:relative;z-index:1}
.hero-badge{display:inline-flex;align-items:center;gap:8px;background:var(--emerald-light);color:#065F46;font-size:12px;font-weight:600;padding:6px 14px;border-radius:100px;margin-bottom:28px;letter-spacing:.02em;text-transform:uppercase}
.hero-badge::before{content:'';width:6px;height:6px;background:var(--emerald);border-radius:50%;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.7;transform:scale(1.3)}}
h1{font-family:var(--font-sans);font-size:clamp(40px,5vw,60px);font-weight:700;line-height:1.1;letter-spacing:-.03em;color:var(--navy);margin-bottom:10px}
.h1-serif{font-family:var(--font-serif);font-style:italic;font-weight:400;color:var(--emerald);display:block}
.hero-sub{font-size:18px;color:var(--text-secondary);line-height:1.7;max-width:480px;margin:24px 0 36px;font-weight:400}
.hero-actions{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:48px}
.hero-stats{display:flex;gap:32px;flex-wrap:wrap}
.stat{display:flex;flex-direction:column;gap:2px}
.stat-num{font-size:22px;font-weight:700;color:var(--navy);letter-spacing:-.02em}
.stat-label{font-size:12px;color:var(--text-muted);font-weight:500;text-transform:uppercase;letter-spacing:.05em}
.stat-divider{width:1px;background:var(--border);align-self:stretch}

/* Dashboard mockup */
.hero-visual{position:relative}
.dashboard-wrap{position:relative;border-radius:var(--radius-xl);overflow:hidden;box-shadow:var(--shadow-xl),0 0 0 1px rgba(15,23,42,.08);background:var(--white)}
.dash-topbar{background:var(--navy);padding:16px 20px;display:flex;align-items:center;justify-content:space-between}
.dash-title{color:rgba(255,255,255,.9);font-size:13px;font-weight:600;display:flex;align-items:center;gap:10px}
.dash-dot{width:8px;height:8px;border-radius:50%;background:var(--emerald)}
.dash-meta{color:rgba(255,255,255,.4);font-size:11px}
.dash-body{background:#F8FAFC;padding:16px}
.dash-section-title{font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px}
.vendor-table{background:var(--white);border-radius:12px;border:1px solid var(--border);overflow:hidden;margin-bottom:14px}
.vt-head{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 80px;padding:10px 16px;background:#F1F5F9;border-bottom:1px solid var(--border)}
.vt-head span{font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em}
.vt-row{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 80px;padding:11px 16px;border-bottom:1px solid var(--border-light);align-items:center;transition:background .15s}
.vt-row:last-child{border-bottom:none}
.vt-row:hover{background:#FAFBFD}
.vendor-name{font-size:12px;font-weight:600;color:var(--navy)}
.vendor-sub{font-size:10px;color:var(--text-muted);margin-top:1px}
.vt-price{font-size:12px;font-weight:700;color:var(--navy)}
.vt-rating{display:flex;align-items:center;gap:3px;font-size:11px;font-weight:600;color:#D97706}
.rating-star{color:#F59E0B;font-size:11px}
.vt-delivery{font-size:11px;color:var(--text-secondary)}
.badge-sm{font-size:10px;font-weight:700;padding:3px 8px;border-radius:100px}
.badge-green{background:#D1FAE5;color:#065F46}
.badge-amber{background:#FEF3C7;color:#92400E}
.badge-blue{background:#DBEAFE;color:#1E40AF}
.badge-red{background:#FEE2E2;color:#991B1B}
.dash-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px}
.metric-card{background:var(--white);border-radius:10px;border:1px solid var(--border);padding:12px 14px}
.metric-num{font-size:18px;font-weight:700;color:var(--navy);letter-spacing:-.02em}
.metric-change{font-size:10px;font-weight:600;color:#059669;margin-top:2px}
.metric-label{font-size:10px;color:var(--text-muted);margin-top:4px;text-transform:uppercase;letter-spacing:.04em}
.mini-bar{height:4px;background:#E2E8F0;border-radius:2px;margin-top:8px;overflow:hidden}
.mini-bar-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,var(--emerald),#34D399)}
.dash-approvals{background:var(--white);border-radius:12px;border:1px solid var(--border);padding:12px 16px}
.approval-item{display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-light)}
.approval-item:last-child{border-bottom:none;padding-bottom:0}
.approval-name{font-size:11px;font-weight:600;color:var(--navy)}
.approval-school{font-size:10px;color:var(--text-muted)}

/* ─── SECTION COMMON ─────────────────────────────────── */
section{padding:100px 32px}
.container{max-width:1200px;margin:0 auto}
.section-badge{display:inline-block;background:var(--emerald-light);color:#065F46;font-size:11px;font-weight:700;padding:5px 14px;border-radius:100px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:16px}
.section-heading{font-size:clamp(32px,4vw,48px);font-weight:700;line-height:1.15;letter-spacing:-.03em;color:var(--navy);margin-bottom:16px}
.section-heading em{font-family:var(--font-serif);font-style:italic;font-weight:400;color:var(--emerald)}
.section-sub{font-size:18px;color:var(--text-secondary);line-height:1.7;max-width:560px}

/* ─── PROBLEM SECTION ────────────────────────────────── */
.problem-section{background:var(--navy);color:var(--white)}
.problem-section .section-badge{background:rgba(16,185,129,.15);color:#6EE7B7}
.problem-section .section-heading{color:var(--white)}
.problem-section .section-sub{color:rgba(255,255,255,.6)}
.flow-comparison{display:grid;grid-template-columns:1fr auto 1fr;gap:40px;align-items:start;margin-top:64px}
.flow-divider{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding-top:60px}
.vs-badge{background:rgba(255,255,255,.1);color:rgba(255,255,255,.8);font-size:12px;font-weight:700;padding:8px 16px;border-radius:100px;letter-spacing:.06em}
.vs-line{width:1px;flex:1;background:rgba(255,255,255,.1);min-height:80px}
.flow-card{border-radius:var(--radius-lg);padding:32px;position:relative;overflow:hidden}
.flow-card-old{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)}
.flow-card-new{background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.2)}
.flow-card-title{font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:28px;display:flex;align-items:center;gap:10px}
.flow-card-old .flow-card-title{color:rgba(255,255,255,.5)}
.flow-card-new .flow-card-title{color:var(--emerald)}
.flow-icon{width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:13px}
.flow-steps{display:flex;flex-direction:column;gap:0}
.flow-step{display:flex;flex-direction:column;align-items:flex-start;position:relative}
.flow-step-node{display:flex;align-items:center;gap:12px;padding:10px 16px;border-radius:10px;width:100%;font-size:13px;font-weight:600;transition:background .2s}
.flow-card-old .flow-step-node{color:rgba(255,255,255,.7);background:rgba(255,255,255,.04)}
.flow-card-new .flow-step-node{color:var(--white);background:rgba(16,185,129,.1)}
.flow-step-dot-old{width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:rgba(255,255,255,.4);flex-shrink:0}
.flow-step-dot-new{width:28px;height:28px;border-radius:50%;background:rgba(16,185,129,.2);border:1px solid rgba(16,185,129,.4);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.flow-arrow-connector{width:1px;height:20px;margin-left:26px;opacity:.3}
.flow-card-old .flow-arrow-connector{background:rgba(255,255,255,.2)}
.flow-card-new .flow-arrow-connector{background:var(--emerald)}
.flow-problems{margin-top:24px;display:flex;flex-direction:column;gap:8px}
.flow-problem{display:flex;align-items:center;gap:10px;font-size:12px;color:rgba(255,255,255,.5)}
.flow-problem::before{content:'×';color:#EF4444;font-weight:700;font-size:14px;flex-shrink:0}
.flow-benefit{display:flex;align-items:center;gap:10px;font-size:12px;color:rgba(255,255,255,.6)}
.flow-benefit::before{content:'✓';color:var(--emerald);font-weight:700;font-size:13px;flex-shrink:0}

/* ─── HOW IT WORKS ───────────────────────────────────── */
.how-section{background:var(--white)}
.steps-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin-top:64px;position:relative}
.steps-grid::before{content:'';position:absolute;top:28px;left:calc(12.5% + 28px);right:calc(12.5% + 28px);height:1px;background:linear-gradient(90deg,var(--border),var(--emerald),var(--border));z-index:0}
.step-card{text-align:center;padding:0 24px;position:relative;z-index:1}
.step-num{width:56px;height:56px;border-radius:50%;background:var(--white);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:18px;font-weight:700;color:var(--text-muted);transition:all .3s;position:relative}
.step-num.active,.step-card:hover .step-num{background:var(--navy);border-color:var(--navy);color:var(--white)}
.step-num.emerald{background:var(--emerald);border-color:var(--emerald);color:var(--white)}
.step-title{font-size:16px;font-weight:700;color:var(--navy);margin-bottom:10px;letter-spacing:-.01em}
.step-desc{font-size:13px;color:var(--text-secondary);line-height:1.6}

/* ─── FEATURES ───────────────────────────────────────── */
.features-section{background:var(--bg)}
.features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:56px}
.feature-card{background:var(--white);border-radius:var(--radius-lg);padding:32px;border:1px solid var(--border);transition:all .3s;position:relative;overflow:hidden}
.feature-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(16,185,129,.04),transparent 50%);opacity:0;transition:opacity .3s}
.feature-card:hover{transform:translateY(-4px);box-shadow:var(--shadow-lg);border-color:rgba(16,185,129,.2)}
.feature-card:hover::before{opacity:1}
.feature-icon{width:48px;height:48px;border-radius:12px;background:var(--navy);display:flex;align-items:center;justify-content:center;margin-bottom:20px}
.feature-icon svg{width:22px;height:22px;color:var(--white)}
.feature-title{font-size:17px;font-weight:700;color:var(--navy);margin-bottom:10px;letter-spacing:-.01em}
.feature-desc{font-size:14px;color:var(--text-secondary);line-height:1.7}
.feature-link{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:var(--emerald);margin-top:16px;text-decoration:none;opacity:0;transition:opacity .3s}
.feature-card:hover .feature-link{opacity:1}

/* ─── PRODUCT SHOWCASE ───────────────────────────────── */
.showcase-section{background:var(--white);overflow:hidden}
.showcase-tabs{display:flex;gap:4px;background:var(--bg);border-radius:var(--radius-md);padding:4px;margin:40px 0 32px;width:fit-content}
.showcase-tab{font-size:13px;font-weight:600;padding:8px 18px;border-radius:var(--radius-sm);cursor:pointer;color:var(--text-secondary);transition:all .2s;border:none;background:transparent;font-family:var(--font-sans)}
.showcase-tab.active{background:var(--white);color:var(--navy);box-shadow:var(--shadow-sm)}
.showcase-frame{background:var(--navy);border-radius:var(--radius-xl);overflow:hidden;box-shadow:var(--shadow-xl);border:1px solid rgba(255,255,255,.06)}
.sf-topbar{background:rgba(255,255,255,.04);border-bottom:1px solid rgba(255,255,255,.06);padding:14px 24px;display:flex;align-items:center;gap:20px}
.sf-dots{display:flex;gap:6px}
.sf-dot{width:10px;height:10px;border-radius:50%}
.sf-nav-items{display:flex;gap:2px}
.sf-nav-item{font-size:12px;font-weight:500;padding:5px 14px;border-radius:6px;color:rgba(255,255,255,.5);cursor:pointer;transition:all .2s}
.sf-nav-item.active{background:rgba(255,255,255,.08);color:var(--white)}
.sf-body{display:grid;grid-template-columns:220px 1fr;height:440px}
.sf-sidebar{background:rgba(0,0,0,.2);border-right:1px solid rgba(255,255,255,.05);padding:20px 0}
.sf-sidebar-section{padding:0 16px;margin-bottom:20px}
.sf-sidebar-label{font-size:10px;font-weight:700;color:rgba(255,255,255,.25);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;padding:0 8px}
.sf-sidebar-item{font-size:12px;font-weight:500;color:rgba(255,255,255,.5);padding:7px 12px;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:10px;transition:all .2s}
.sf-sidebar-item.active{background:rgba(255,255,255,.08);color:var(--white)}
.sf-sidebar-item:hover:not(.active){background:rgba(255,255,255,.04);color:rgba(255,255,255,.8)}
.sf-sidebar-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.2);flex-shrink:0}
.sf-sidebar-item.active .sf-sidebar-dot{background:var(--emerald)}
.sf-content{padding:24px;overflow:auto}
.sf-page-title{font-size:16px;font-weight:700;color:var(--white);margin-bottom:4px}
.sf-page-sub{font-size:12px;color:rgba(255,255,255,.4);margin-bottom:20px}
.sf-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
.sf-stat{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:14px}
.sf-stat-num{font-size:20px;font-weight:700;color:var(--white);letter-spacing:-.02em}
.sf-stat-change{font-size:10px;color:#34D399;margin-top:2px}
.sf-stat-label{font-size:10px;color:rgba(255,255,255,.35);margin-top:6px;text-transform:uppercase;letter-spacing:.04em}
.sf-table{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:10px;overflow:hidden}
.sf-table-head{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr;padding:10px 16px;background:rgba(255,255,255,.03);border-bottom:1px solid rgba(255,255,255,.05)}
.sf-table-head span{font-size:10px;font-weight:700;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:.06em}
.sf-table-row{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,.04);align-items:center}
.sf-table-row:last-child{border-bottom:none}
.sf-vendor-name{font-size:12px;font-weight:600;color:rgba(255,255,255,.9)}
.sf-vendor-sub{font-size:10px;color:rgba(255,255,255,.3);margin-top:1px}
.sf-cell{font-size:12px;color:rgba(255,255,255,.6)}
.sf-cell.strong{font-weight:700;color:var(--white)}
.sf-badge{font-size:10px;font-weight:700;padding:3px 8px;border-radius:100px}
.sf-badge-green{background:rgba(16,185,129,.15);color:#6EE7B7}
.sf-badge-amber{background:rgba(245,158,11,.15);color:#FCD34D}
.sf-badge-blue{background:rgba(96,165,250,.15);color:#93C5FD}
.sf-progress{display:flex;flex-direction:column;gap:8px;margin-top:4px}
.sf-progress-item{display:flex;align-items:center;gap:10px}
.sf-progress-label{font-size:11px;color:rgba(255,255,255,.5);width:100px;flex-shrink:0}
.sf-progress-bar{flex:1;height:4px;background:rgba(255,255,255,.08);border-radius:2px;overflow:hidden}
.sf-progress-fill{height:100%;border-radius:2px}

/* ─── BENEFITS ───────────────────────────────────────── */
.benefits-section{background:var(--bg)}
.benefits-grid{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:64px}
.benefit-panel{background:var(--white);border-radius:var(--radius-xl);padding:48px;border:1px solid var(--border)}
.benefit-panel-header{display:flex;align-items:center;gap:16px;margin-bottom:36px}
.benefit-panel-icon{width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center}
.benefit-panel-icon.navy{background:var(--navy)}
.benefit-panel-icon.emerald{background:var(--emerald)}
.benefit-panel-title{font-size:22px;font-weight:700;color:var(--navy);letter-spacing:-.02em}
.benefit-panel-sub{font-size:13px;color:var(--text-muted);margin-top:3px}
.benefit-items{display:flex;flex-direction:column;gap:16px}
.benefit-item{display:flex;align-items:flex-start;gap:14px}
.benefit-check{width:24px;height:24px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;margin-top:2px}
.benefit-check.navy{background:rgba(15,23,42,.08)}
.benefit-check.emerald{background:rgba(16,185,129,.1)}
.benefit-item-text{font-size:15px;font-weight:500;color:var(--navy);line-height:1.5}
.benefit-item-sub{font-size:13px;color:var(--text-secondary);margin-top:3px;line-height:1.6}

/* ─── METRICS ────────────────────────────────────────── */
.metrics-section{background:var(--navy);padding:80px 32px}
.metrics-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:rgba(255,255,255,.06);border-radius:var(--radius-lg);overflow:hidden;margin-top:60px}
.metric-block{background:var(--navy);padding:48px 36px;text-align:center;transition:background .3s}
.metric-block:hover{background:#1E293B}
.metric-big{font-size:clamp(48px,5vw,72px);font-weight:700;color:var(--white);line-height:1;letter-spacing:-.04em;margin-bottom:8px}
.metric-big span{color:var(--emerald)}
.metric-big-label{font-size:14px;color:rgba(255,255,255,.5);line-height:1.5;max-width:160px;margin:0 auto}

/* ─── WHY SECTION ────────────────────────────────────── */
.why-section{background:var(--white)}
.why-grid{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;margin-top:64px}
.why-visual{position:relative}
.why-card-stack{position:relative;height:420px}
.why-card{position:absolute;background:var(--white);border-radius:var(--radius-lg);padding:28px;border:1px solid var(--border);box-shadow:var(--shadow-md)}
.why-card-1{top:0;left:0;right:0;z-index:3}
.why-card-2{top:20px;left:16px;right:-16px;z-index:2;opacity:.85}
.why-card-3{top:40px;left:32px;right:-32px;z-index:1;opacity:.6}
.why-card-title{font-size:14px;font-weight:700;color:var(--navy);margin-bottom:4px}
.why-card-sub{font-size:12px;color:var(--text-muted);margin-bottom:16px}
.why-card-score-row{display:flex;align-items:center;gap:12px;margin-bottom:10px}
.why-card-score-label{font-size:12px;color:var(--text-secondary);width:120px;flex-shrink:0}
.why-card-score-bar{flex:1;height:6px;background:var(--bg);border-radius:3px;overflow:hidden}
.why-card-score-fill{height:100%;border-radius:3px;background:var(--emerald);transition:width 1s ease}
.why-card-score-val{font-size:12px;font-weight:700;color:var(--navy);width:30px;text-align:right;flex-shrink:0}
.why-items{display:flex;flex-direction:column;gap:24px}
.why-item{display:flex;gap:16px;align-items:flex-start}
.why-item-icon{width:44px;height:44px;border-radius:10px;background:var(--bg);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:20px}
.why-item-title{font-size:16px;font-weight:700;color:var(--navy);margin-bottom:6px;letter-spacing:-.01em}
.why-item-desc{font-size:14px;color:var(--text-secondary);line-height:1.7}

/* ─── TESTIMONIALS ───────────────────────────────────── */
.testimonials-section{background:var(--bg)}
.insight-banner{background:var(--white);border-radius:var(--radius-lg);border:1px solid var(--border);padding:32px 40px;text-align:center;margin-bottom:48px;box-shadow:var(--shadow-sm)}
.insight-banner p{font-size:16px;color:var(--text-secondary);font-style:italic;font-family:var(--font-serif);line-height:1.8}
.insight-banner cite{font-size:13px;color:var(--text-muted);font-style:normal;font-family:var(--font-sans);font-weight:600;margin-top:8px;display:block}
.cards-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.insight-card{background:var(--white);border-radius:var(--radius-lg);padding:28px;border:1px solid var(--border);transition:all .3s}
.insight-card:hover{transform:translateY(-3px);box-shadow:var(--shadow-md)}
.insight-avatar{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:16px}
.insight-quote{font-size:14px;color:var(--text-secondary);line-height:1.8;font-style:italic;font-family:var(--font-serif);margin-bottom:16px}
.insight-author-name{font-size:13px;font-weight:700;color:var(--navy)}
.insight-author-role{font-size:12px;color:var(--text-muted);margin-top:2px}
.insight-tag{display:inline-block;font-size:10px;font-weight:700;padding:3px 10px;border-radius:100px;margin-top:12px;background:var(--bg);color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em}

/* ─── CTA ────────────────────────────────────────────── */
.cta-section{background:linear-gradient(135deg,var(--navy) 0%,#1E293B 50%,#0F2B1E 100%);padding:120px 32px;text-align:center;position:relative;overflow:hidden}
.cta-section::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 50% 50%,rgba(16,185,129,.12) 0%,transparent 60%)}
.cta-section::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 40% at 50% -20%,rgba(255,255,255,.03),transparent);pointer-events:none}
.cta-inner{position:relative;z-index:1}
.cta-badge{display:inline-block;background:rgba(16,185,129,.15);color:#6EE7B7;font-size:11px;font-weight:700;padding:5px 16px;border-radius:100px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:24px;border:1px solid rgba(16,185,129,.25)}
.cta-heading{font-size:clamp(36px,5vw,58px);font-weight:700;color:var(--white);letter-spacing:-.03em;line-height:1.1;margin-bottom:20px}
.cta-heading em{font-family:var(--font-serif);font-style:italic;color:var(--emerald)}
.cta-sub{font-size:18px;color:rgba(255,255,255,.6);max-width:520px;margin:0 auto 48px;line-height:1.7}
.cta-actions{display:flex;justify-content:center;gap:16px;flex-wrap:wrap}
.cta-note{margin-top:24px;font-size:13px;color:rgba(255,255,255,.3)}

/* ─── FOOTER ─────────────────────────────────────────── */
footer{background:var(--navy);color:rgba(255,255,255,.6);padding:80px 32px 40px}
.footer-inner{max-width:1200px;margin:0 auto}
.footer-top{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr;gap:60px;margin-bottom:60px}
.footer-brand .logo{color:var(--white);margin-bottom:16px;display:inline-flex}
.footer-desc{font-size:13px;color:rgba(255,255,255,.4);line-height:1.7;max-width:260px;margin-bottom:24px}
.footer-socials{display:flex;gap:10px}
.social-icon{width:36px;height:36px;border-radius:8px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s}
.social-icon:hover{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.15)}
.social-icon svg{width:15px;height:15px;color:rgba(255,255,255,.5)}
.footer-col h4{font-size:12px;font-weight:700;color:rgba(255,255,255,.9);text-transform:uppercase;letter-spacing:.08em;margin-bottom:16px}
.footer-col a{display:block;font-size:13px;color:rgba(255,255,255,.45);text-decoration:none;margin-bottom:10px;transition:color .2s}
.footer-col a:hover{color:rgba(255,255,255,.8)}
.footer-bottom{border-top:1px solid rgba(255,255,255,.07);padding-top:32px;display:flex;align-items:center;justify-content:space-between;flex-wrap:gap-16px}
.footer-copy{font-size:12px;color:rgba(255,255,255,.25)}
.footer-legal{display:flex;gap:20px}
.footer-legal a{font-size:12px;color:rgba(255,255,255,.25);text-decoration:none;transition:color .2s}
.footer-legal a:hover{color:rgba(255,255,255,.5)}

/* ─── ANIMATIONS ─────────────────────────────────────── */
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideRight{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
.animate-fade-up{opacity:0;animation:fadeUp .7s ease forwards}
.animate-fade-up.delay-1{animation-delay:.1s}
.animate-fade-up.delay-2{animation-delay:.2s}
.animate-fade-up.delay-3{animation-delay:.3s}
.animate-fade-up.delay-4{animation-delay:.4s}
.animate-fade-up.delay-5{animation-delay:.5s}
.animate-fade-in{opacity:0;animation:fadeIn .8s ease forwards}

/* ─── MOBILE ─────────────────────────────────────────── */
.mob-menu-btn{display:none;background:transparent;border:none;cursor:pointer;padding:4px}
@media(max-width:900px){
  .nav-links,.nav-actions .btn-ghost{display:none}
  .mob-menu-btn{display:block}
  .hero-inner{grid-template-columns:1fr;gap:48px;text-align:center}
  .hero-sub{max-width:100%;margin-left:auto;margin-right:auto}
  .hero-stats{justify-content:center}
  .hero-actions{justify-content:center}
  .hero-badge{margin:0 auto 28px}
  .flow-comparison{grid-template-columns:1fr;gap:20px}
  .flow-divider{flex-direction:row;padding-top:0}
  .vs-line{width:40px;height:1px;flex:none;min-height:unset}
  .steps-grid{grid-template-columns:repeat(2,1fr);gap:32px}
  .steps-grid::before{display:none}
  .features-grid{grid-template-columns:1fr 1fr}
  .sf-body{grid-template-columns:1fr;height:auto}
  .sf-sidebar{display:none}
  .metrics-grid{grid-template-columns:1fr 1fr}
  .benefits-grid{grid-template-columns:1fr}
  .why-grid{grid-template-columns:1fr}
  .cards-grid{grid-template-columns:1fr}
  .footer-top{grid-template-columns:1fr 1fr;gap:32px}
  .sf-stats{grid-template-columns:1fr 1fr}
  section{padding:72px 20px}
  .hero{padding:100px 20px 60px}
}
@media(max-width:600px){
  .features-grid{grid-template-columns:1fr}
  .metrics-grid{grid-template-columns:1fr}
  .footer-top{grid-template-columns:1fr}
  .why-card-stack{height:300px}
  .showcase-tabs{flex-wrap:wrap}
  h1{font-size:36px}
}
`}</style>
      <div dangerouslySetInnerHTML={{ __html: `

<!-- NAV -->
<nav id="navbar">
  <div class="nav-inner">
    <a href="#" class="logo">
      <div class="logo-mark">
        <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="6" height="6" rx="1.5" fill="#10B981"/>
          <rect x="10" y="2" width="6" height="6" rx="1.5" fill="rgba(255,255,255,.5)"/>
          <rect x="2" y="10" width="6" height="6" rx="1.5" fill="rgba(255,255,255,.5)"/>
          <rect x="10" y="10" width="6" height="6" rx="1.5" fill="rgba(255,255,255,.3)"/>
        </svg>
      </div>
      Campus Connect
    </a>
    <div class="nav-links">
      <a href="#features">Features</a>
      <a href="#solutions">Solutions</a>
      <a href="#how-it-works">How It Works</a>
      <a href="#schools">Schools</a>
      <a href="#vendors">Vendors</a>
      <a href="#contact">Contact</a>
    </div>
    <div class="nav-actions">
      <button id="cc-signin-btn" class="btn btn-ghost">Sign In</button>
      <button id="cc-getstarted-btn" class="btn btn-primary">Get Started</button>
    </div>
    <button class="mob-menu-btn" aria-label="Menu">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="6" width="18" height="1.5" rx=".75" fill="#0F172A"/><rect x="2" y="11" width="18" height="1.5" rx=".75" fill="#0F172A"/><rect x="2" y="16" width="12" height="1.5" rx=".75" fill="#0F172A"/></svg>
    </button>
  </div>
</nav>

<!-- HERO -->
<section class="hero" id="hero">
  <div class="hero-grid"></div>
  <div class="hero-inner container">
    <div>
      <div class="hero-badge animate-fade-up">Trusted Procurement Platform for Schools</div>
      <h1 class="animate-fade-up delay-1">Modern Procurement<br><em class="h1-serif">for Modern Schools</em></h1>
      <p class="hero-sub animate-fade-up delay-2">Campus Connect helps schools discover vendors, compare quotations, evaluate suppliers, and manage procurement workflows — all from a single digital platform.</p>
      <div class="hero-actions animate-fade-up delay-3">
        <button id="cc-hero-cta" class="btn btn-primary btn-lg">Get Started →</button>
        <a href="#how-it-works" class="btn btn-outline btn-lg">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M6.5 5.5l4 2.5-4 2.5V5.5Z" fill="currentColor"/></svg>
          Watch Product Tour
        </a>
      </div>
      <div class="hero-stats animate-fade-up delay-4">
        <div class="stat">
          <span class="stat-num">100+</span>
          <span class="stat-label">Schools</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-num">50+</span>
          <span class="stat-label">Vendors</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-num">1000+</span>
          <span class="stat-label">Quotations Processed</span>
        </div>
      </div>
    </div>
    <div class="hero-visual animate-fade-in" style="animation-delay:.4s">
      <div class="dashboard-wrap">
        <div class="dash-topbar">
          <div class="dash-title">
            <div class="dash-dot"></div>
            Procurement Dashboard
          </div>
          <div class="dash-meta">FY 2024–25 · Q2</div>
        </div>
        <div class="dash-body">
          <div class="dash-metrics">
            <div class="metric-card">
              <div class="metric-num">₹4.2L</div>
              <div class="metric-change">↑ 18% vs last quarter</div>
              <div class="metric-label">Total Bids Received</div>
              <div class="mini-bar"><div class="mini-bar-fill" style="width:72%"></div></div>
            </div>
            <div class="metric-card">
              <div class="metric-num">8</div>
              <div class="metric-change">↑ 3 new this week</div>
              <div class="metric-label">Active RFQs</div>
              <div class="mini-bar"><div class="mini-bar-fill" style="width:55%"></div></div>
            </div>
            <div class="metric-card">
              <div class="metric-num">94%</div>
              <div class="metric-change">↑ 6pts improvement</div>
              <div class="metric-label">On-time Delivery</div>
              <div class="mini-bar"><div class="mini-bar-fill" style="width:94%"></div></div>
            </div>
          </div>
          <div class="dash-section-title">Vendor Comparison — School Uniforms RFQ #024</div>
          <div class="vendor-table">
            <div class="vt-head">
              <span>Vendor</span><span>Unit Price</span><span>Rating</span><span>Delivery</span><span>Status</span>
            </div>
            <div class="vt-row">
              <div><div class="vendor-name">Apex Uniforms Pvt. Ltd.</div><div class="vendor-sub">Mumbai · Verified ✓</div></div>
              <div class="vt-price">₹485/unit</div>
              <div class="vt-rating"><span class="rating-star">★</span> 4.8</div>
              <div class="vt-delivery">12 days</div>
              <div><span class="badge-sm badge-green">Best Fit</span></div>
            </div>
            <div class="vt-row">
              <div><div class="vendor-name">BlueStar Apparels</div><div class="vendor-sub">Pune · Verified ✓</div></div>
              <div class="vt-price">₹462/unit</div>
              <div class="vt-rating"><span class="rating-star">★</span> 4.5</div>
              <div class="vt-delivery">18 days</div>
              <div><span class="badge-sm badge-amber">Review</span></div>
            </div>
            <div class="vt-row">
              <div><div class="vendor-name">SwiftWear Solutions</div><div class="vendor-sub">Delhi · Verified ✓</div></div>
              <div class="vt-price">₹510/unit</div>
              <div class="vt-rating"><span class="rating-star">★</span> 4.9</div>
              <div class="vt-delivery">10 days</div>
              <div><span class="badge-sm badge-blue">Premium</span></div>
            </div>
          </div>
          <div class="dash-section-title">Pending Approvals</div>
          <div class="dash-approvals">
            <div class="approval-item">
              <div><div class="approval-name">Lab Equipment — Science Dept.</div><div class="approval-school">Delhi Public School, Patna</div></div>
              <span class="badge-sm badge-amber">Awaiting</span>
            </div>
            <div class="approval-item">
              <div><div class="approval-name">Library Books Procurement</div><div class="approval-school">St. Xavier's School, Ranchi</div></div>
              <span class="badge-sm badge-blue">In Review</span>
            </div>
            <div class="approval-item">
              <div><div class="approval-name">Sports Equipment RFQ #031</div><div class="approval-school">Loyola High School, Jamshedpur</div></div>
              <span class="badge-sm badge-green">Approved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- PROBLEM SECTION -->
<section class="problem-section" id="solutions">
  <div class="container">
    <div class="section-badge">The Problem</div>
    <h2 class="section-heading" style="color:white">School Procurement Shouldn't<br>Be <em>This Complicated</em></h2>
    <p class="section-sub">Traditional procurement is fragmented, manual, and inefficient. Campus Connect fixes it.</p>
    <div class="flow-comparison">
      <div class="flow-card flow-card-old">
        <div class="flow-card-title">
          <div class="flow-icon" style="background:rgba(239,68,68,.15)">⚠</div>
          Traditional Process
        </div>
        <div class="flow-steps">
          <div class="flow-step">
            <div class="flow-step-node"><div class="flow-step-dot-old">1</div>Phone Calls</div>
            <div class="flow-arrow-connector"></div>
          </div>
          <div class="flow-step">
            <div class="flow-step-node"><div class="flow-step-dot-old">2</div>WhatsApp Messages</div>
            <div class="flow-arrow-connector"></div>
          </div>
          <div class="flow-step">
            <div class="flow-step-node"><div class="flow-step-dot-old">3</div>Email Quotations</div>
            <div class="flow-arrow-connector"></div>
          </div>
          <div class="flow-step">
            <div class="flow-step-node"><div class="flow-step-dot-old">4</div>Excel Comparisons</div>
            <div class="flow-arrow-connector"></div>
          </div>
          <div class="flow-step">
            <div class="flow-step-node"><div class="flow-step-dot-old">5</div>Manual Vendor Selection</div>
          </div>
        </div>
        <div class="flow-problems" style="margin-top:24px">
          <div class="flow-problem">Time-consuming and error-prone</div>
          <div class="flow-problem">No transparency or audit trail</div>
          <div class="flow-problem">Scattered communication channels</div>
          <div class="flow-problem">Difficult side-by-side comparison</div>
          <div class="flow-problem">Poor documentation and accountability</div>
        </div>
      </div>
      <div class="flow-divider">
        <div class="vs-line"></div>
        <div class="vs-badge">VS</div>
        <div class="vs-line"></div>
      </div>
      <div class="flow-card flow-card-new">
        <div class="flow-card-title">
          <div class="flow-icon" style="background:rgba(16,185,129,.15)">✦</div>
          Campus Connect
        </div>
        <div class="flow-steps">
          <div class="flow-step">
            <div class="flow-step-node">
              <div class="flow-step-dot-new"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2v8" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/></svg></div>
              Create Procurement Requirement
            </div>
            <div class="flow-arrow-connector"></div>
          </div>
          <div class="flow-step">
            <div class="flow-step-node">
              <div class="flow-step-dot-new"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1l1.5 3H11l-2.8 2 1.1 3.3L6 7.5 2.7 9.3l1.1-3.3L1 4h3.5L6 1Z" fill="#10B981"/></svg></div>
              Invite Verified Vendors
            </div>
            <div class="flow-arrow-connector"></div>
          </div>
          <div class="flow-step">
            <div class="flow-step-node">
              <div class="flow-step-dot-new"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1.5" y="2.5" width="9" height="7" rx="1.5" stroke="#10B981" stroke-width="1.5"/><path d="M4 5.5h4M4 7.5h2.5" stroke="#10B981" stroke-width="1" stroke-linecap="round"/></svg></div>
              Receive Digital Quotations
            </div>
            <div class="flow-arrow-connector"></div>
          </div>
          <div class="flow-step">
            <div class="flow-step-node">
              <div class="flow-step-dot-new"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 8l2.5-2.5 2 2L10 4" stroke="#10B981" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
              Compare Bids Instantly
            </div>
            <div class="flow-arrow-connector"></div>
          </div>
          <div class="flow-step">
            <div class="flow-step-node">
              <div class="flow-step-dot-new"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.5l2.5 2.5 4.5-5" stroke="#10B981" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
              Select Best Vendor
            </div>
          </div>
        </div>
        <div class="flow-problems" style="margin-top:24px">
          <div class="flow-benefit">Faster, data-driven decisions</div>
          <div class="flow-benefit">Full transparency and audit trail</div>
          <div class="flow-benefit">Centralized communication hub</div>
          <div class="flow-benefit">Instant side-by-side comparison</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section class="how-section" id="how-it-works">
  <div class="container">
    <div style="text-align:center">
      <div class="section-badge">Process</div>
      <h2 class="section-heading" style="text-align:center">How <em>Campus Connect</em> Works</h2>
      <p class="section-sub" style="margin:0 auto;text-align:center">From requirement to selection in four streamlined steps.</p>
    </div>
    <div class="steps-grid">
      <div class="step-card">
        <div class="step-num emerald">01</div>
        <div class="step-title">Create Procurement Requirement</div>
        <div class="step-desc">Schools submit their procurement needs — specify items, quantity, quality standards, and timeline through a structured digital form.</div>
      </div>
      <div class="step-card">
        <div class="step-num active">02</div>
        <div class="step-title">Vendor Participation</div>
        <div class="step-desc">Verified vendors receive automated invitations and submit structured digital quotations within your defined deadline.</div>
      </div>
      <div class="step-card">
        <div class="step-num">03</div>
        <div class="step-title">Smart Comparison</div>
        <div class="step-desc">Our engine compares price, quality ratings, delivery timelines, and vendor history in a unified, side-by-side view.</div>
      </div>
      <div class="step-card">
        <div class="step-num">04</div>
        <div class="step-title">Confident Selection</div>
        <div class="step-desc">Select vendors using transparent data and insights. Full audit trail generated automatically for every procurement decision.</div>
      </div>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section class="features-section" id="features">
  <div class="container">
    <div class="section-badge">Features</div>
    <h2 class="section-heading">Everything schools need to<br><em>procure smarter</em></h2>
    <p class="section-sub">Six core modules, built for the modern procurement officer.</p>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">
          <svg viewBox="0 0 22 22" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round"><circle cx="9" cy="9" r="5.5"/><path d="M13 13l5.5 5.5"/></svg>
        </div>
        <div class="feature-title">Vendor Discovery</div>
        <div class="feature-desc">Browse a curated directory of verified suppliers. Filter by category, location, rating, and past performance to find the right fit.</div>
        <button class="feature-link cc-explore-btn">Explore →</button>
      </div>
      <div class="feature-card">
        <div class="feature-icon">
          <svg viewBox="0 0 22 22" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="4" width="16" height="14" rx="2"/><path d="M7 8h8M7 11h5M7 14h4"/></svg>
        </div>
        <div class="feature-title">Digital Quotations</div>
        <div class="feature-desc">Replace email chains with structured digital bids. Vendors submit standardized quotations; you receive everything in one place.</div>
        <button class="feature-link cc-explore-btn">Explore →</button>
      </div>
      <div class="feature-card">
        <div class="feature-icon">
          <svg viewBox="0 0 22 22" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round"><path d="M3 11h16M3 7h16M3 15h10"/><circle cx="17" cy="15" r="2.5"/></svg>
        </div>
        <div class="feature-title">Smart Comparison Engine</div>
        <div class="feature-desc">Compare vendors side-by-side across price, quality, delivery, and ratings. AI-powered scoring highlights the best-fit supplier.</div>
        <button class="feature-link cc-explore-btn">Explore →</button>
      </div>
      <div class="feature-card">
        <div class="feature-icon">
          <svg viewBox="0 0 22 22" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round"><path d="M11 2l2.3 4.6L19 7.5l-4 3.9.9 5.4L11 14.3l-4.9 2.5.9-5.4L3 7.5l5.7-.9L11 2Z"/></svg>
        </div>
        <div class="feature-title">Vendor Performance Ratings</div>
        <div class="feature-desc">Data-driven vendor scores based on delivery history, quality feedback, and responsiveness. Make informed decisions every time.</div>
        <button class="feature-link cc-explore-btn">Explore →</button>
      </div>
      <div class="feature-card">
        <div class="feature-icon">
          <svg viewBox="0 0 22 22" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="12" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="12" width="7" height="7" rx="1.5"/><rect x="12" y="12" width="7" height="7" rx="1.5"/></svg>
        </div>
        <div class="feature-title">Procurement Dashboard</div>
        <div class="feature-desc">Track all active RFQs, pending approvals, and procurement status in a single unified control center for your institution.</div>
        <button class="feature-link cc-explore-btn">Explore →</button>
      </div>
      <div class="feature-card">
        <div class="feature-icon">
          <svg viewBox="0 0 22 22" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round"><path d="M3 16l4-4 3 3 4-5 5 6"/><path d="M3 3h16v16"/></svg>
        </div>
        <div class="feature-title">Analytics &amp; Reporting</div>
        <div class="feature-desc">Gain actionable insights into spend patterns, vendor performance trends, and procurement cycle efficiency across your school.</div>
        <button class="feature-link cc-explore-btn">Explore →</button>
      </div>
    </div>
  </div>
</section>

<!-- PRODUCT SHOWCASE -->
<section class="showcase-section" id="schools">
  <div class="container">
    <div class="section-badge">Platform</div>
    <h2 class="section-heading">Built for how schools<br><em>actually work</em></h2>
    <div class="showcase-tabs">
      <button class="showcase-tab active" onclick="setTab(this,'dashboard')">Dashboard</button>
      <button class="showcase-tab" onclick="setTab(this,'vendors')">Vendor Directory</button>
      <button class="showcase-tab" onclick="setTab(this,'quotations')">Quotations</button>
      <button class="showcase-tab" onclick="setTab(this,'analytics')">Analytics</button>
    </div>
    <div class="showcase-frame">
      <div class="sf-topbar">
        <div class="sf-dots">
          <div class="sf-dot" style="background:#FF5F57"></div>
          <div class="sf-dot" style="background:#FEBC2E"></div>
          <div class="sf-dot" style="background:#28C840"></div>
        </div>
        <div class="sf-nav-items">
          <div class="sf-nav-item active">campus-connect.in</div>
        </div>
      </div>
      <div class="sf-body">
        <div class="sf-sidebar">
          <div class="sf-sidebar-section">
            <div class="sf-sidebar-label">Overview</div>
            <div class="sf-sidebar-item active"><div class="sf-sidebar-dot"></div>Dashboard</div>
            <div class="sf-sidebar-item"><div class="sf-sidebar-dot"></div>Procurement Hub</div>
          </div>
          <div class="sf-sidebar-section">
            <div class="sf-sidebar-label">Procurement</div>
            <div class="sf-sidebar-item"><div class="sf-sidebar-dot"></div>All RFQs</div>
            <div class="sf-sidebar-item"><div class="sf-sidebar-dot"></div>Active Bids</div>
            <div class="sf-sidebar-item"><div class="sf-sidebar-dot"></div>Approvals</div>
            <div class="sf-sidebar-item"><div class="sf-sidebar-dot"></div>Orders</div>
          </div>
          <div class="sf-sidebar-section">
            <div class="sf-sidebar-label">Vendors</div>
            <div class="sf-sidebar-item"><div class="sf-sidebar-dot"></div>Directory</div>
            <div class="sf-sidebar-item"><div class="sf-sidebar-dot"></div>Performance</div>
          </div>
          <div class="sf-sidebar-section">
            <div class="sf-sidebar-label">Reports</div>
            <div class="sf-sidebar-item"><div class="sf-sidebar-dot"></div>Analytics</div>
            <div class="sf-sidebar-item"><div class="sf-sidebar-dot"></div>Audit Trail</div>
          </div>
        </div>
        <div class="sf-content">
          <div class="sf-page-title" id="sf-title">Procurement Overview</div>
          <div class="sf-page-sub" id="sf-sub">Delhi Public School, Patna · AY 2024–25 Q2</div>
          <div class="sf-stats">
            <div class="sf-stat"><div class="sf-stat-num">8</div><div class="sf-stat-change">↑ 2 new this week</div><div class="sf-stat-label">Active RFQs</div></div>
            <div class="sf-stat"><div class="sf-stat-num">23</div><div class="sf-stat-change">↑ 7 received today</div><div class="sf-stat-label">Vendor Bids</div></div>
            <div class="sf-stat"><div class="sf-stat-num">3</div><div class="sf-stat-change">Due today</div><div class="sf-stat-label">Pending Approvals</div></div>
            <div class="sf-stat"><div class="sf-stat-num">₹8.4L</div><div class="sf-stat-change">↑ 12% vs last year</div><div class="sf-stat-label">Total Procured</div></div>
          </div>
          <div class="sf-table">
            <div class="sf-table-head"><span>RFQ / Category</span><span>Bids</span><span>Best Price</span><span>Deadline</span><span>Status</span></div>
            <div class="sf-table-row">
              <div><div class="sf-vendor-name">School Uniforms — Std VI–X</div><div class="sf-vendor-sub">RFQ #024 · 1200 units</div></div>
              <div class="sf-cell strong">7</div>
              <div class="sf-cell strong">₹462/unit</div>
              <div class="sf-cell">Dec 18</div>
              <div><span class="sf-badge sf-badge-green">Comparing</span></div>
            </div>
            <div class="sf-table-row">
              <div><div class="sf-vendor-name">Lab Equipment Pack</div><div class="sf-vendor-sub">RFQ #025 · Science Dept.</div></div>
              <div class="sf-cell strong">4</div>
              <div class="sf-cell">₹1.2L</div>
              <div class="sf-cell">Dec 22</div>
              <div><span class="sf-badge sf-badge-amber">Bidding</span></div>
            </div>
            <div class="sf-table-row">
              <div><div class="sf-vendor-name">Library Books — FY25</div><div class="sf-vendor-sub">RFQ #026 · Library Dept.</div></div>
              <div class="sf-cell strong">5</div>
              <div class="sf-cell">₹84K</div>
              <div class="sf-cell">Dec 30</div>
              <div><span class="sf-badge sf-badge-blue">Open</span></div>
            </div>
            <div class="sf-table-row">
              <div><div class="sf-vendor-name">Sports Equipment</div><div class="sf-vendor-sub">RFQ #023 · Sports Dept.</div></div>
              <div class="sf-cell strong">6</div>
              <div class="sf-cell">₹52K</div>
              <div class="sf-cell">Dec 10</div>
              <div><span class="sf-badge sf-badge-green">Approved</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- BENEFITS -->
<section class="benefits-section" id="vendors">
  <div class="container">
    <div style="text-align:center;margin-bottom:0">
      <div class="section-badge">Benefits</div>
      <h2 class="section-heading" style="text-align:center">A better experience for<br><em>everyone involved</em></h2>
    </div>
    <div class="benefits-grid">
      <div class="benefit-panel">
        <div class="benefit-panel-header">
          <div class="benefit-panel-icon navy">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round"><path d="M13 3L4.5 7v5c0 5.5 3.6 10.7 8.5 12 4.9-1.3 8.5-6.5 8.5-12V7L13 3Z"/></svg>
          </div>
          <div>
            <div class="benefit-panel-title">For Schools</div>
            <div class="benefit-panel-sub">Principals, Administrators &amp; Procurement Officers</div>
          </div>
        </div>
        <div class="benefit-items">
          <div class="benefit-item">
            <div class="benefit-check navy"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#0F172A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
            <div>
              <div class="benefit-item-text">Faster procurement cycles</div>
              <div class="benefit-item-sub">Reduce procurement time from weeks to days with digitized workflows.</div>
            </div>
          </div>
          <div class="benefit-item">
            <div class="benefit-check navy"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#0F172A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
            <div>
              <div class="benefit-item-text">Improved transparency</div>
              <div class="benefit-item-sub">Every decision is backed by data and an automated audit trail.</div>
            </div>
          </div>
          <div class="benefit-item">
            <div class="benefit-check navy"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#0F172A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
            <div>
              <div class="benefit-item-text">Better vendor selection</div>
              <div class="benefit-item-sub">Compare based on price, quality, and ratings — not just relationships.</div>
            </div>
          </div>
          <div class="benefit-item">
            <div class="benefit-check navy"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#0F172A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
            <div>
              <div class="benefit-item-text">Reduced manual effort</div>
              <div class="benefit-item-sub">No more Excel sheets, WhatsApp chains, or disorganized email threads.</div>
            </div>
          </div>
          <div class="benefit-item">
            <div class="benefit-check navy"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#0F172A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
            <div>
              <div class="benefit-item-text">Centralized documentation</div>
              <div class="benefit-item-sub">All procurement records in one place, always accessible, always compliant.</div>
            </div>
          </div>
        </div>
      </div>
      <div class="benefit-panel">
        <div class="benefit-panel-header">
          <div class="benefit-panel-icon emerald">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round"><circle cx="13" cy="9" r="4.5"/><path d="M5 22c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>
          </div>
          <div>
            <div class="benefit-panel-title">For Vendors</div>
            <div class="benefit-panel-sub">Uniform Manufacturers, Suppliers &amp; Providers</div>
          </div>
        </div>
        <div class="benefit-items">
          <div class="benefit-item">
            <div class="benefit-check emerald"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#059669" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
            <div>
              <div class="benefit-item-text">Access to procurement opportunities</div>
              <div class="benefit-item-sub">Discover and bid on procurement requirements across 100+ schools.</div>
            </div>
          </div>
          <div class="benefit-item">
            <div class="benefit-check emerald"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#059669" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
            <div>
              <div class="benefit-item-text">Increased visibility</div>
              <div class="benefit-item-sub">Get discovered by schools searching for verified suppliers in your category.</div>
            </div>
          </div>
          <div class="benefit-item">
            <div class="benefit-check emerald"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#059669" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
            <div>
              <div class="benefit-item-text">Streamlined bidding process</div>
              <div class="benefit-item-sub">Submit structured quotations digitally — no paperwork, no follow-up calls.</div>
            </div>
          </div>
          <div class="benefit-item">
            <div class="benefit-check emerald"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#059669" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
            <div>
              <div class="benefit-item-text">Stronger credibility through ratings</div>
              <div class="benefit-item-sub">Build a verified performance track record that wins more business over time.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- METRICS -->
<section class="metrics-section">
  <div class="container">
    <div style="text-align:center">
      <div class="section-badge" style="background:rgba(16,185,129,.15);color:#6EE7B7">Impact</div>
      <h2 class="section-heading" style="color:white;text-align:center">Measurable results from<br><em>day one</em></h2>
    </div>
    <div class="metrics-grid">
      <div class="metric-block">
        <div class="metric-big">90<span>%</span></div>
        <div class="metric-big-label">Reduction in manual comparison effort</div>
      </div>
      <div class="metric-block">
        <div class="metric-big">60<span>%</span></div>
        <div class="metric-big-label">Faster procurement decision cycles</div>
      </div>
      <div class="metric-block">
        <div class="metric-big">100<span>%</span></div>
        <div class="metric-big-label">Digital quotation management</div>
      </div>
      <div class="metric-block">
        <div class="metric-big" style="font-size:56px">24/7</div>
        <div class="metric-big-label">Procurement visibility and control</div>
      </div>
    </div>
  </div>
</section>

<!-- WHY SECTION -->
<section class="why-section">
  <div class="container">
    <div class="why-grid">
      <div class="why-visual">
        <div class="why-card-stack">
          <div class="why-card why-card-1">
            <div class="why-card-title">Vendor Evaluation — RFQ #024</div>
            <div class="why-card-sub">School Uniforms · 1200 units · 3 vendors evaluated</div>
            <div class="why-card-score-row">
              <div class="why-card-score-label">Price Competitiveness</div>
              <div class="why-card-score-bar"><div class="why-card-score-fill" style="width:88%"></div></div>
              <div class="why-card-score-val">88</div>
            </div>
            <div class="why-card-score-row">
              <div class="why-card-score-label">Quality Rating</div>
              <div class="why-card-score-bar"><div class="why-card-score-fill" style="width:95%"></div></div>
              <div class="why-card-score-val">95</div>
            </div>
            <div class="why-card-score-row">
              <div class="why-card-score-label">Delivery Timeline</div>
              <div class="why-card-score-bar"><div class="why-card-score-fill" style="width:92%"></div></div>
              <div class="why-card-score-val">92</div>
            </div>
            <div class="why-card-score-row">
              <div class="why-card-score-label">Past Performance</div>
              <div class="why-card-score-bar"><div class="why-card-score-fill" style="width:96%"></div></div>
              <div class="why-card-score-val">96</div>
            </div>
            <div style="margin-top:16px;display:flex;align-items:center;justify-content:space-between">
              <span style="font-size:13px;font-weight:700;color:var(--navy)">Recommended: Apex Uniforms Pvt. Ltd.</span>
              <span class="badge-sm badge-green">Score: 93/100</span>
            </div>
          </div>
          <div class="why-card why-card-2"></div>
          <div class="why-card why-card-3"></div>
        </div>
      </div>
      <div>
        <div class="section-badge">Why Campus Connect</div>
        <h2 class="section-heading">Why schools <em>choose us</em></h2>
        <div class="why-items">
          <div class="why-item">
            <div class="why-item-icon">🔍</div>
            <div>
              <div class="why-item-title">Transparency in procurement</div>
              <div class="why-item-desc">Every bid, decision, and approval is logged and visible to authorized stakeholders — building trust across your institution.</div>
            </div>
          </div>
          <div class="why-item">
            <div class="why-item-icon">📊</div>
            <div>
              <div class="why-item-title">Standardized vendor evaluation</div>
              <div class="why-item-desc">A consistent scoring framework ensures fair, objective, and comparable evaluation across all vendors and procurement cycles.</div>
            </div>
          </div>
          <div class="why-item">
            <div class="why-item-icon">🌐</div>
            <div>
              <div class="why-item-title">Better vendor discovery</div>
              <div class="why-item-desc">Access a growing network of verified vendors beyond your existing contacts — find better pricing and new quality suppliers.</div>
            </div>
          </div>
          <div class="why-item">
            <div class="why-item-icon">⚡</div>
            <div>
              <div class="why-item-title">Faster decision-making</div>
              <div class="why-item-desc">Smart comparison dashboards surface the most relevant data so procurement officers decide in minutes, not days.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- TESTIMONIALS / INSIGHTS -->
<section class="testimonials-section" id="contact">
  <div class="container">
    <div style="text-align:center;margin-bottom:48px">
      <div class="section-badge">Built With You</div>
      <h2 class="section-heading" style="text-align:center">Shaped by the people who<br><em>know procurement best</em></h2>
      <p class="section-sub" style="margin:0 auto;text-align:center">Built with insights from school administrators, procurement stakeholders, and educational vendors across India.</p>
    </div>
    <div class="insight-banner">
      <p>"Managing vendor quotations through WhatsApp and email was a nightmare — no history, no comparison, no accountability. The need for a structured digital platform has never been more clear."</p>
      <cite>— School Principal, Private CBSE School · Bihar</cite>
    </div>
    <div class="cards-grid">
      <div class="insight-card">
        <div class="insight-avatar" style="background:#EFF6FF">🏫</div>
        <div class="insight-quote">"We spend hours every procurement cycle just organizing vendor responses. A centralized system would save us enormous time and reduce errors in vendor selection."</div>
        <div class="insight-author-name">School Administrator</div>
        <div class="insight-author-role">Procurement Officer · Eastern India</div>
        <div class="insight-tag">School Insight</div>
      </div>
      <div class="insight-card">
        <div class="insight-avatar" style="background:#F0FDF4">🤝</div>
        <div class="insight-quote">"As a supplier, reaching the right schools is difficult. Most procurement happens through personal networks. A transparent platform would open doors for verified vendors like us."</div>
        <div class="insight-author-name">Apparel Supplier</div>
        <div class="insight-author-role">Uniform Manufacturer · North India</div>
        <div class="insight-tag">Vendor Insight</div>
      </div>
      <div class="insight-card">
        <div class="insight-avatar" style="background:#FFF7ED">📋</div>
        <div class="insight-quote">"Our trust oversees 14 schools. Standardizing procurement evaluation and getting visibility across all campuses is something we've needed for years."</div>
        <div class="insight-author-name">Management Committee Member</div>
        <div class="insight-author-role">Educational Trust · West Bengal</div>
        <div class="insight-tag">Trust Insight</div>
      </div>
    </div>
  </div>
</section>

<!-- CTA SECTION -->
<section class="cta-section" id="cta">
  <div class="cta-inner">
    <div class="cta-badge">Get Started Today</div>
    <h2 class="cta-heading">Ready to Transform<br><em>School Procurement?</em></h2>
    <p class="cta-sub">Join the next generation of schools bringing transparency, efficiency, and intelligence to procurement decisions.</p>
    <div class="cta-actions">
      <button id="cc-cta-register" class="btn btn-emerald btn-lg">Register Now →</button>
      <button id="cc-cta-signin" class="btn btn-white btn-lg">Sign In</button>
    </div>
    <div class="cta-note">No commitment required · Setup in under 24 hours</div>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="footer-inner">
    <div class="footer-top">
      <div class="footer-brand">
        <a href="#" class="logo">
          <div class="logo-mark"><svg viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="6" height="6" rx="1.5" fill="#10B981"/><rect x="10" y="2" width="6" height="6" rx="1.5" fill="rgba(255,255,255,.4)"/><rect x="2" y="10" width="6" height="6" rx="1.5" fill="rgba(255,255,255,.4)"/><rect x="10" y="10" width="6" height="6" rx="1.5" fill="rgba(255,255,255,.2)"/></svg></div>
          Campus Connect
        </a>
        <p class="footer-desc">The procurement operating system for educational institutions. Smarter vendor selection starts here.</p>
        <div class="footer-socials">
          <div class="social-icon" title="LinkedIn"><svg viewBox="0 0 15 15" fill="none"><path d="M2.5 5h2v7h-2V5Zm1-3.5a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5ZM6 5h1.9v1s.7-1.5 2.6-1.5C12.3 4.5 13 6 13 8v4h-2V8.5c0-1.2-.3-2-1.4-2-1.4 0-1.7 1.1-1.7 2.2V12H6V5Z" stroke="rgba(255,255,255,.5)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
          <div class="social-icon" title="Twitter/X"><svg viewBox="0 0 15 15" fill="none"><path d="M12 2L8.5 7 13 13H10.5L7.5 9 4 13H2l3.8-5.5L2 2h2.5l2.7 3.7L10 2h2Z" stroke="rgba(255,255,255,.5)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
          <div class="social-icon" title="Email"><svg viewBox="0 0 15 15" fill="none"><rect x="1.5" y="3" width="12" height="9" rx="1.5" stroke="rgba(255,255,255,.5)" stroke-width="1"/><path d="M1.5 4.5l6 4.5 6-4.5" stroke="rgba(255,255,255,.5)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        </div>
      </div>
      <div class="footer-col">
        <h4>Product</h4>
        <a href="#">Features</a>
        <a href="#">Solutions</a>
        <a href="#">Security</a>
        <a href="#">Roadmap</a>
      </div>
      <div class="footer-col">
        <h4>Resources</h4>
        <a href="#">Blog</a>
        <a href="#">Documentation</a>
        <a href="#">Support</a>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <a href="#">About</a>
        <a href="#">Contact</a>
      </div>
      <div class="footer-col">
        <h4>Legal</h4>
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="footer-copy">© 2025 Campus Connect. All rights reserved.</div>
      <div class="footer-legal">
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
        <a href="#">Cookies</a>
      </div>
    </div>
  </div>
</footer>

<script>
// Navbar scroll
const navbar=document.getElementById('navbar');
window.addEventListener('scroll',()=>{navbar.classList.toggle('scrolled',window.scrollY>10)},{ passive:true});

// Showcase tabs
function setTab(btn,tab){
  document.querySelectorAll('.showcase-tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  const titles={dashboard:'Procurement Overview',vendors:'Vendor Directory',quotations:'Quotation Management',analytics:'Analytics Dashboard'};
  const subs={dashboard:'Delhi Public School, Patna · AY 2024–25 Q2',vendors:'Browse 50+ verified vendors · Filter by category & rating',quotations:'RFQ #024 · School Uniforms · 7 bids received',analytics:'Spend analysis · Vendor performance · Procurement trends'};
  document.getElementById('sf-title').textContent=titles[tab];
  document.getElementById('sf-sub').textContent=subs[tab];
}

// Intersection observer for step animations
const obs=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in-view')});
},{threshold:.15});
document.querySelectorAll('.step-card,.feature-card,.metric-block,.benefit-item').forEach(el=>obs.observe(el));
</script>
` }} />
    </>
  );
}
