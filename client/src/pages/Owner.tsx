import { FormEvent, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  ArrowDownRight,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  FileCheck2,
  Gauge,
  LayoutDashboard,
  Menu,
  Package,
  Plus,
  ShieldCheck,
  Truck,
  WalletCards,
  X,
} from "lucide-react";

type OwnerView = "overview" | "equipment" | "proposals" | "availability" | "payments";
type ProposalStatus = "Nova proposta" | "Em negociação" | "Aguardando cliente" | "Aceita" | "Recusada";

type Equipment = {
  id: string;
  name: string;
  dailyRate: number;
  activeRentals: number;
  tone: string;
};

type Proposal = {
  id: string;
  initials: string;
  color: string;
  client: string;
  machine: string;
  period: string;
  place: string;
  value: number;
  addOns: string[];
  status: ProposalStatus;
};

type BlockedPeriod = {
  id: string;
  equipmentId: string;
  start: string;
  end: string;
  mode: "blocked" | "available";
};

const initialEquipment: Equipment[] = [
  { id: "esc-320", name: "Escavadeira hidráulica 320", dailyRate: 980, activeRentals: 1, tone: "green-machine" },
  { id: "cat-938", name: "Pá carregadeira CAT 938", dailyRate: 860, activeRentals: 2, tone: "blue-machine" },
  { id: "jcb", name: "Retroescavadeira JCB", dailyRate: 720, activeRentals: 0, tone: "gray-machine" },
];

const initialProposals: Proposal[] = [
  { id: "prop-1", initials: "MC", color: "green", client: "Mariana Costa", machine: "Escavadeira hidráulica 320", period: "14 — 18 out, 2026", place: "São Paulo, SP", value: 5450, addOns: ["Seguro"], status: "Nova proposta" },
  { id: "prop-2", initials: "RA", color: "orange", client: "Rafael Almeida", machine: "Pá carregadeira CAT 938", period: "21 — 23 out, 2026", place: "Barueri, SP", value: 2580, addOns: [], status: "Em negociação" },
  { id: "prop-3", initials: "NS", color: "blue", client: "Norte Sul Obras", machine: "Escavadeira hidráulica 320", period: "03 — 12 nov, 2026", place: "Campinas, SP", value: 9800, addOns: ["Operador"], status: "Aguardando cliente" },
];

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function formatDate(value: string) {
  if (!value) return "";
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}

function BrandMark() {
  return <div className="brand-lockup"><span className="brand-mark"><span /></span><span className="brand-name">LOQ</span></div>;
}

function SideNav({ active, onNavigate, onBack, onSwitchProfile, pendingCount }: { active: OwnerView; onNavigate: (view: OwnerView) => void; onBack: () => void; onSwitchProfile: () => void; pendingCount: number }) {
  const operationItems = [
    { id: "overview" as const, label: "Visão geral", icon: LayoutDashboard },
    { id: "equipment" as const, label: "Meus equipamentos", icon: Package },
    { id: "proposals" as const, label: "Propostas recebidas", icon: FileCheck2, count: pendingCount },
    { id: "availability" as const, label: "Disponibilidade", icon: CalendarDays },
  ];

  return (
    <aside className="side-nav owner-side">
      <BrandMark />
      <details className="owner-profile-menu">
        <summary className="profile-switcher" aria-label="Abrir opções do perfil">
          <div className="avatar avatar-lime">TF</div>
          <div><strong>Terra Forte</strong><span>Proprietário</span></div>
          <ChevronDown size={15} />
        </summary>
        <div className="owner-profile-options">
          <span>Perfil atual · Proprietário</span>
          <button type="button" onClick={onSwitchProfile}>Trocar perfil <ArrowRight size={14} /></button>
        </div>
      </details>
      <div className="nav-section-label">Gestão da operação</div>
      <nav>{operationItems.map(({ id, label, icon: Icon, count }) => <button className={`nav-item ${active === id ? "active" : ""}`} key={id} onClick={() => onNavigate(id)} aria-current={active === id ? "page" : undefined}><Icon size={18} /><span>{label}</span>{count ? <b>{count}</b> : null}</button>)}</nav>
      <div className="nav-section-label nav-spacer">Financeiro</div>
      <nav><button className={`nav-item ${active === "payments" ? "active" : ""}`} onClick={() => onNavigate("payments")} aria-current={active === "payments" ? "page" : undefined}><WalletCards size={18} /><span>Pagamentos</span></button><button className="nav-item" onClick={() => toast.info("Indicadores", { description: "Os indicadores exibidos nesta demonstração são ilustrativos." })}><Gauge size={18} /><span>Indicadores</span></button></nav>
      <div className="side-nav-bottom"><button className="back-to-client" onClick={onBack}><ArrowRight size={15} /> Voltar para área do cliente</button><div className="security-note"><ShieldCheck size={17} /><span>Receba com segurança<br /><b>em cada locação</b></span></div></div>
    </aside>
  );
}

function Metric({ label, value, delta, icon: Icon, tone }: { label: string; value: string; delta: string; icon: typeof Gauge; tone: string }) {
  return <div className="metric-card"><div className={`metric-icon ${tone}`}><Icon size={18} /></div><span>{label}</span><strong>{value}</strong><small><ArrowDownRight size={13} /> {delta}</small></div>;
}

function EquipmentDialog({ equipment, onClose, onSave }: { equipment: Equipment | null; onClose: () => void; onSave: (name: string, rate: number) => void }) {
  const [name, setName] = useState(equipment?.name ?? "");
  const [rate, setRate] = useState(equipment?.dailyRate.toString() ?? "");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedRate = Number(rate);
    if (!name.trim() || !Number.isFinite(parsedRate) || parsedRate <= 0) {
      toast.error("Confira os dados do equipamento", { description: "Informe o nome e um valor de diária maior que zero." });
      return;
    }
    onSave(name.trim(), parsedRate);
  };

  return <div className="modal-backdrop" onMouseDown={onClose}><section className="proposal-modal owner-dialog" role="dialog" aria-modal="true" aria-labelledby="equipment-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
    <div className="proposal-header"><div><span className="eyebrow">{equipment ? "Atualizar cadastro" : "Novo equipamento"}</span><h2 id="equipment-dialog-title">{equipment ? "Editar equipamento" : "Cadastrar equipamento"}</h2></div><button className="modal-close inline" onClick={onClose} aria-label="Fechar"><X size={19} /></button></div>
    <form className="form-column" onSubmit={submit}><label htmlFor="equipment-name">Nome e modelo</label><div className="field-with-icon"><Package size={16} /><input id="equipment-name" value={name} onChange={(event) => setName(event.target.value)} required placeholder="Ex.: Escavadeira hidráulica 320" /></div><label htmlFor="equipment-rate">Valor da diária (R$)</label><div className="field-with-icon"><WalletCards size={16} /><input id="equipment-rate" type="number" min="1" step="1" value={rate} onChange={(event) => setRate(event.target.value)} required placeholder="980" /></div><p className="owner-demo-note">Os dados são demonstrativos e ficam disponíveis somente nesta sessão.</p><button className="primary-button full-button" type="submit">{equipment ? "Salvar alterações" : "Adicionar equipamento"} <Check size={15} /></button></form>
  </section></div>;
}

function CounterOfferDialog({ proposal, onClose, onSave }: { proposal: Proposal; onClose: () => void; onSave: (value: number) => void }) {
  const [value, setValue] = useState(proposal.value.toString());
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedValue = Number(value);
    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      toast.error("Informe um valor válido para a contraproposta.");
      return;
    }
    onSave(parsedValue);
  };
  return <div className="modal-backdrop" onMouseDown={onClose}><section className="proposal-modal owner-dialog" role="dialog" aria-modal="true" aria-labelledby="counter-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
    <div className="proposal-header"><div><span className="eyebrow">Negociação · {proposal.client}</span><h2 id="counter-dialog-title">Apresentar novas condições</h2></div><button className="modal-close inline" onClick={onClose} aria-label="Fechar"><X size={19} /></button></div>
    <form className="form-column" onSubmit={submit}><p className="owner-dialog-copy">{proposal.machine} · {proposal.period}<br />Valor solicitado: <strong>{formatCurrency(proposal.value)}</strong></p><label htmlFor="counter-value">Sua proposta total (R$)</label><div className="field-with-icon"><WalletCards size={16} /><input id="counter-value" type="number" min="1" step="1" value={value} onChange={(event) => setValue(event.target.value)} required /></div><p className="owner-demo-note">A atualização de status e valor é apenas demonstrativa nesta sessão.</p><button className="primary-button full-button" type="submit">Enviar contraproposta <ArrowRight size={15} /></button></form>
  </section></div>;
}

function EquipmentList({ equipment, onEdit }: { equipment: Equipment[]; onEdit: (item: Equipment) => void }) {
  return <div className="owner-panel owner-list-panel"><div className="panel-heading"><div><span className="eyebrow">Catálogo publicado</span><h2>Meus equipamentos <span className="count-badge">{equipment.length}</span></h2></div></div><div className="fleet-list">{equipment.map((item) => <article className="fleet-item owner-fleet-item" key={item.id}><div className={`fleet-thumb ${item.tone}`}><Truck size={20} /></div><div><strong>{item.name}</strong><span>{formatCurrency(item.dailyRate)}/dia · {item.activeRentals ? `${item.activeRentals} locações ativas` : "Sem locação ativa"}</span></div><span className={`fleet-status ${item.activeRentals ? "busy" : ""}`}>{item.activeRentals ? "Em uso" : "Disponível"}</span><button className="outline-button owner-edit-button" onClick={() => onEdit(item)}>Editar</button></article>)}</div><p className="owner-demo-note">Edite nome e diária para manter as informações do catálogo atualizadas. Os dados não são persistidos.</p></div>;
}

function ProposalList({ proposals, onUpdate, onCounter }: { proposals: Proposal[]; onUpdate: (id: string, status: ProposalStatus) => void; onCounter: (proposal: Proposal) => void }) {
  const actionableCount = proposals.filter((item) => item.status === "Nova proposta" || item.status === "Em negociação").length;
  return <div className="owner-panel owner-list-panel">
    <div className="panel-heading"><div><span className="eyebrow">Negociação da locação</span><h2>Propostas recebidas <span className="count-badge">{actionableCount}</span></h2></div></div>
    <div className="owner-proposals">{proposals.map((proposal) => <article className="owner-proposal" key={proposal.id}>
      <div className={`avatar avatar-${proposal.color}`}>{proposal.initials}</div>
      <div className="owner-proposal-info"><strong>{proposal.client}</strong><span>{proposal.machine}</span><small><CalendarDays size={13} /> {proposal.period} <span className="dot-separator" /> <span>{proposal.place}</span></small>{proposal.addOns.length > 0 && <span className="proposal-extras">Inclui: {proposal.addOns.join(" e ")}</span>}</div>
      <div className="owner-proposal-value"><strong>{formatCurrency(proposal.value)}</strong><span className={`proposal-status ${proposal.status === "Nova proposta" ? "new" : proposal.status === "Aceita" ? "accepted" : proposal.status === "Recusada" ? "rejected" : ""}`}>{proposal.status}</span>{proposal.status === "Aceita" && <small className="payment-inline">Pagamento: aguardando</small>}</div>
      <div className="proposal-actions">{proposal.status === "Nova proposta" || proposal.status === "Em negociação" ? <><button className="accept-action" onClick={() => onUpdate(proposal.id, "Aceita")}>Aceitar</button><button className="reject-action" onClick={() => onUpdate(proposal.id, "Recusada")}>Recusar</button><button className="counter-action" onClick={() => onCounter(proposal)}>Contrapropor</button></> : null}</div>
    </article>)}</div>
    <p className="owner-demo-note">As decisões alteram somente esta demonstração; notificações e contratos reais dependem da integração com o servidor.</p>
  </div>;
}

function AvailabilityPanel({ equipment, periods, onAddPeriod, onRemovePeriod }: { equipment: Equipment[]; periods: BlockedPeriod[]; onAddPeriod: (equipmentId: string, start: string, end: string, mode: BlockedPeriod["mode"]) => boolean; onRemovePeriod: (id: string) => void }) {
  const [equipmentId, setEquipmentId] = useState(equipment[0]?.id ?? "");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [mode, setMode] = useState<BlockedPeriod["mode"]>("blocked");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!equipmentId || !start || !end || end < start) {
      toast.error("Confira o período", { description: "Selecione um equipamento e datas válidas; o fim deve ser igual ou posterior ao início." });
      return;
    }
    if (onAddPeriod(equipmentId, start, end, mode)) {
      setStart("");
      setEnd("");
    }
  };

  return <div className="owner-grid owner-single-grid"><section className="owner-panel owner-list-panel"><div className="panel-heading"><div><span className="eyebrow">Agenda da frota</span><h2>Definir período</h2></div><CalendarDays size={20} /></div><form className="availability-form" onSubmit={submit}><label htmlFor="availability-equipment">Equipamento</label><select id="availability-equipment" value={equipmentId} onChange={(event) => setEquipmentId(event.target.value)} required>{equipment.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><label htmlFor="availability-mode">Condição do equipamento</label>  <select id="availability-mode" value={mode} onChange={(event) => setMode(event.target.value === "available" ? "available" : "blocked")}><option value="blocked">Indisponível (manutenção ou pausa)</option><option value="available">Disponível para locação</option></select><div className="availability-dates"><div><label htmlFor="availability-start">Início do período</label><input id="availability-start" type="date" value={start} onChange={(event) => setStart(event.target.value)} required /></div><div><label htmlFor="availability-end">Fim do período</label><input id="availability-end" type="date" min={start || undefined} value={end} onChange={(event) => setEnd(event.target.value)} required /></div></div><button className="primary-button" type="submit">{mode === "blocked" ? "Bloquear período" : "Marcar como disponível"} <CalendarDays size={15} /></button></form><p className="owner-demo-note">A agenda é demonstrativa; períodos são mantidos somente nesta sessão.</p></section><section className="owner-panel owner-list-panel"><div className="panel-heading"><div><span className="eyebrow">Agenda cadastrada</span><h2>Períodos <span className="count-badge">{periods.length}</span></h2></div></div>{periods.length ? <div className="blocked-period-list">{periods.map((period) => { const item = equipment.find((machine) => machine.id === period.equipmentId); return <article className="blocked-period" key={period.id}><div><strong>{item?.name ?? "Equipamento removido"}</strong><span>{formatDate(period.start)} — {formatDate(period.end)}</span></div><span className={`availability-state ${period.mode}`}>{period.mode === "blocked" ? "Indisponível" : "Disponível"}</span><button className="reject-action" onClick={() => onRemovePeriod(period.id)}>Remover período</button></article>; })}</div> : <div className="empty-state owner-empty"><CalendarDays size={25} /><h3>Nenhum período cadastrado</h3><p>Defina a disponibilidade ou bloqueie períodos da sua frota.</p></div>}</section></div>;
}

function PaymentList({ proposals }: { proposals: Proposal[] }) {
  const accepted = proposals.filter((proposal) => proposal.status === "Aceita");
  return <div className="owner-panel owner-list-panel"><div className="panel-heading"><div><span className="eyebrow">Acompanhamento financeiro</span><h2>Pagamentos de locações</h2></div><WalletCards size={20} /></div>{accepted.length ? <div className="payment-list">{accepted.map((proposal) => <article className="payment-row" key={proposal.id}><div className="payment-icon"><WalletCards size={18} /></div><div><strong>{proposal.machine}</strong><span>{proposal.client} · {proposal.period}</span></div><strong className="payment-amount">{formatCurrency(proposal.value)}</strong><span className="payment-status"><span className="status-pip" /> Aguardando pagamento</span></article>)}</div> : <div className="empty-state owner-empty"><WalletCards size={25} /><h3>Nenhuma locação aceita</h3><p>Os pagamentos aparecerão aqui após a aceitação de uma proposta.</p></div>}<p className="owner-demo-note">O status é ilustrativo. A confirmação e liberação financeira serão conectadas ao pagamento seguro na próxima etapa.</p></div>;
}

export default function Owner() {
  const [, setLocation] = useLocation();
  const [activeView, setActiveView] = useState<OwnerView>("overview");
  const [equipment, setEquipment] = useState(initialEquipment);
  const [proposals, setProposals] = useState(initialProposals);
  const [blockedPeriods, setBlockedPeriods] = useState<BlockedPeriod[]>([]);
  const [equipmentDialog, setEquipmentDialog] = useState<Equipment | "new" | null>(null);
  const [counterProposal, setCounterProposal] = useState<Proposal | null>(null);
  const pendingCount = proposals.filter((item) => item.status === "Nova proposta" || item.status === "Em negociação").length;
  const activeRentals = proposals.filter((item) => item.status === "Aceita").length;
  const heading = {
    overview: ["Visão geral", "Bom dia, Terra Forte", "Acompanhe propostas, frota e recebimentos em um só lugar."],
    equipment: ["Meus equipamentos", "Sua frota, sob controle.", "Atualize os valores e dados dos equipamentos anunciados."],
    proposals: ["Propostas recebidas", "Negocie cada locação.", "Revise período, local e valor antes de responder ao cliente."],
    availability: ["Disponibilidade", "Organize a agenda da frota.", "Bloqueie períodos de manutenção ou indisponibilidade."],
    payments: ["Pagamentos", "Acompanhe seus recebimentos.", "Consulte o valor e o status das locações aceitas."],
  }[activeView];

  const updateProposal = (id: string, status: ProposalStatus) => {
    setProposals((current) => current.map((proposal) => proposal.id === id ? { ...proposal, status } : proposal));
    const action = status === "Aceita" ? "aceita" : "recusada";
    toast.success(`Proposta ${action}`, { description: "O status foi atualizado nesta sessão de demonstração." });
  };

  const saveEquipment = (name: string, dailyRate: number) => {
    if (equipmentDialog && equipmentDialog !== "new") {
      setEquipment((current) => current.map((item) => item.id === equipmentDialog.id ? { ...item, name, dailyRate } : item));
      toast.success("Equipamento atualizado nesta demonstração.");
    } else {
      setEquipment((current) => [...current, { id: `equipment-${Date.now()}`, name, dailyRate, activeRentals: 0, tone: "gray-machine" }]);
      toast.success("Equipamento adicionado nesta demonstração.");
    }
    setEquipmentDialog(null);
  };

  const addBlockedPeriod = (equipmentId: string, start: string, end: string, mode: BlockedPeriod["mode"]) => {
    const conflict = blockedPeriods.some((period) => period.equipmentId === equipmentId && start <= period.end && end >= period.start);
    if (conflict) {
      toast.error("Já existe um período cadastrado que se sobrepõe a essas datas.");
      return false;
    }
    setBlockedPeriods((current) => [...current, { id: `period-${Date.now()}`, equipmentId, start, end, mode }]);
    toast.success(mode === "blocked" ? "Período bloqueado nesta demonstração." : "Disponibilidade registrada nesta demonstração.");
    return true;
  };

  const updateCounterProposal = (value: number) => {
    if (!counterProposal) return;
    setProposals((current) => current.map((proposal) => proposal.id === counterProposal.id ? { ...proposal, value, status: "Aguardando cliente" } : proposal));
    setCounterProposal(null);
    toast.success("Contraproposta registrada", { description: "O valor e o status foram atualizados nesta sessão de demonstração." });
  };

  return <div className="app-shell owner-shell">
    <SideNav active={activeView} onNavigate={setActiveView} onBack={() => setLocation("/")} onSwitchProfile={() => setLocation("/login")} pendingCount={pendingCount} />
    <main className="main-content">
      <header className="topbar"><div className="mobile-brand"><Menu size={20} /><BrandMark /></div><div className="breadcrumb"><span>Área do proprietário</span><ChevronRight size={14} /><strong>{heading[0]}</strong></div><div className="topbar-actions"><button className="help-button" onClick={() => toast.info("Central de ajuda", { description: "Entre em contato com o suporte LOQ para dúvidas sobre locações." })}><CircleHelp size={17} /> Ajuda</button><button className="icon-button" aria-label="Notificações" onClick={() => toast.info(pendingCount ? `${pendingCount} proposta(s) aguardando sua resposta.` : "Você está em dia", { description: "Notificações reais estarão disponíveis após a integração com o servidor." })}><Bell size={18} /></button><button className="top-avatar avatar-lime top-avatar-button" onClick={() => setLocation("/login")} aria-label="Trocar perfil">TF</button></div></header>
      <section className="owner-heading"><div><span className="eyebrow">{heading[0]}</span><h1>{heading[1]}</h1><p>{heading[2]}</p></div>{activeView === "overview" || activeView === "equipment" ? <button className="primary-button" onClick={() => setEquipmentDialog("new")}><Plus size={17} /> Cadastrar equipamento</button> : null}</section>

      {activeView === "overview" && <>
        <section className="metrics-grid"><Metric label="Receita este mês" value="R$ 18.420" delta="12,8% vs. mês anterior" icon={WalletCards} tone="green" /><Metric label="Locações ativas" value={String(activeRentals).padStart(2, "0")} delta="Propostas aceitas" icon={Truck} tone="blue" /><Metric label="Taxa de ocupação" value="78%" delta="4,2% vs. mês anterior" icon={Gauge} tone="lime" /><Metric label="Avaliação média" value="4,9" delta="28 avaliações" icon={ShieldCheck} tone="purple" /></section>
        <section className="owner-grid"><div className="owner-panel proposals-panel"><div className="panel-heading"><div><span className="eyebrow">Ação necessária</span><h2>Propostas recebidas <span className="count-badge">{pendingCount}</span></h2></div><button className="text-action" onClick={() => setActiveView("proposals")}>Ver todas <ArrowRight size={15} /></button></div><div className="owner-proposals">{proposals.slice(0, 3).map((proposal) => <article className="owner-proposal" key={proposal.id}><div className={`avatar avatar-${proposal.color}`}>{proposal.initials}</div><div className="owner-proposal-info"><strong>{proposal.client}</strong><span>{proposal.machine}</span><small><CalendarDays size={13} /> {proposal.period} <span className="dot-separator" /> <span>{proposal.place}</span></small></div><div className="owner-proposal-value"><strong>{formatCurrency(proposal.value)}</strong><span className={`proposal-status ${proposal.status === "Nova proposta" ? "new" : proposal.status === "Aceita" ? "accepted" : ""}`}>{proposal.status}</span></div>{proposal.status === "Nova proposta" ? <div className="proposal-actions"><button className="accept-action" onClick={() => updateProposal(proposal.id, "Aceita")}>Aceitar</button><button className="reject-action" onClick={() => updateProposal(proposal.id, "Recusada")}>Recusar</button></div> : <button className="icon-button small" aria-label={`Ver proposta de ${proposal.client}`} onClick={() => setActiveView("proposals")}><ChevronRight size={17} /></button>}</article>)}</div></div>
          <div className="owner-panel fleet-panel"><div className="panel-heading"><div><span className="eyebrow">Visão da frota</span><h2>Seus equipamentos</h2></div><button className="icon-button small" aria-label="Ver equipamentos" onClick={() => setActiveView("equipment")}><ArrowRight size={16} /></button></div><div className="fleet-list">{equipment.slice(0, 3).map((item) => <div className="fleet-item" key={item.id}><div className={`fleet-thumb ${item.tone}`}><Truck size={20} /></div><div><strong>{item.name}</strong><span>{formatCurrency(item.dailyRate)}/dia · {item.activeRentals ? `${item.activeRentals} locações ativas` : "Sem agenda"}</span></div><span className={`fleet-status ${item.activeRentals ? "busy" : ""}`}>{item.activeRentals ? "Em uso" : "Disponível"}</span></div>)}</div><button className="outline-button full-button" onClick={() => setActiveView("availability")}>Gerenciar disponibilidade <CalendarDays size={15} /></button></div>
        </section><section className="owner-insight"><div className="insight-icon"><Gauge size={23} /></div><div><strong>Deixe sua frota pronta para novas locações</strong><span>Revise os valores e bloqueie períodos em que seus equipamentos não estarão disponíveis.</span></div><button className="text-action" onClick={() => setActiveView("availability")}>Organizar agenda <ArrowRight size={15} /></button></section>
      </>}

      {activeView === "equipment" && <EquipmentList equipment={equipment} onEdit={setEquipmentDialog} />}
      {activeView === "proposals" && <ProposalList proposals={proposals} onUpdate={updateProposal} onCounter={setCounterProposal} />}
      {activeView === "availability" && <AvailabilityPanel equipment={equipment} periods={blockedPeriods} onAddPeriod={addBlockedPeriod} onRemovePeriod={(id) => setBlockedPeriods((current) => current.filter((period) => period.id !== id))} />}
      {activeView === "payments" && <PaymentList proposals={proposals} />}

      <footer className="main-footer"><span>LOQ · Gestão inteligente de equipamentos</span><span>Dados demonstrativos desta sessão <span className="live-dot" /></span></footer>
    </main>
    {equipmentDialog !== null && <EquipmentDialog equipment={equipmentDialog === "new" ? null : equipmentDialog} onClose={() => setEquipmentDialog(null)} onSave={saveEquipment} />}
    {counterProposal && <CounterOfferDialog proposal={counterProposal} onClose={() => setCounterProposal(null)} onSave={updateCounterProposal} />}
  </div>;
}
