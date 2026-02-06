// Supabase Configuration
const SUPABASE_URL = 'https://vbjuwbwwabctmyyzlzuu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_c8uJYXuq1clJ_LXS72ZkkA_GfLokXSI';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Estado Global Simulado (Ahora dinámico con Supabase)
 */
// State management
const state = {
    users: [],
    leads: [],
    flights: [],
    tickets: [],
    currentUser: {
        id: localStorage.getItem('user_id'),
        name: localStorage.getItem('user_name'),
        role: localStorage.getItem('user_role')
    },
    faqs: [],
    tips: [],
    messages: [],
    commissions: [] // New: Dynamic commissions
};

// Hardcoded rates removed. Now using state.commissions
// const COMMISSION_RATES = { ... }

// Cargar datos iniciales desde Supabase
async function loadInitialData() {
    try {
        const { data: faqs } = await supabaseClient.from('faqs').select('*');
        const { data: tips } = await supabaseClient.from('tips').select('*');
        const { data: commissions } = await supabaseClient.from('commission_settings').select('*'); // Fetch commissions
        if (faqs) state.faqs = faqs;
        if (tips) state.tips = tips;
        if (commissions) state.commissions = commissions; // Assign commissions

        if (state.currentUser.id) {
            const { data: profiles } = await supabaseClient.from('profiles').select('*');
            if (profiles) state.users = profiles;

            // Cargar tickets y mensajes
            const { data: tickets } = await supabaseClient.from('tickets').select('*');
            const { data: messages } = await supabaseClient.from('messages').select('*');
            if (tickets) state.tickets = tickets;
            if (messages) state.messages = messages;

            // Cargar leads y vuelos según rol
            const { data: flights } = await supabaseClient.from('flights').select('*');
            if (flights) state.flights = flights;

            if (state.currentUser.role === 'referidor') {
                const { data: leads } = await supabaseClient.from('leads').select('*').eq('referrer_id', state.currentUser.id);
                if (leads) state.leads = leads;
            } else {
                const { data: leads } = await supabaseClient.from('leads').select('*');
                if (leads) state.leads = leads;

                // Load Commission Settings (Only needed for Admin/Exec)
                const { data: commissions } = await supabaseClient.from('commission_settings').select('*');
                if (commissions) state.commissions = commissions;
            }
        }
    } catch (error) {
        console.error('Error cargando datos de Supabase:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('FlyReferral Platform | Initializing Supabase Connection');
    await loadInitialData();

    // Sesión Simatizada
    const path = window.location.pathname;
    const currentRole = localStorage.getItem('user_role');

    if (!currentRole && !path.includes('login.html')) {
        window.location.href = 'login.html';
        return;
    }

    initModals();

    if (path.includes('ejecutivo.html')) {
        renderExecutive();
    } else if (path.includes('admin.html')) {
        renderAdmin();
    } else {
        renderReferrerDashboard();
    }
});

function initModals() {
    const modalBtn = document.getElementById('new-prospect-btn');
    const modal = document.getElementById('prospect-modal');
    const closeBtn = document.getElementById('close-modal');

    if (modalBtn && modal) modalBtn.onclick = () => modal.classList.remove('hidden');
    if (closeBtn && modal) closeBtn.onclick = () => modal.classList.add('hidden');

    window.onclick = (e) => { if (e.target == modal) modal.classList.add('hidden'); };
}

/**
 * TAB SWITCHER (SIDEBAR)
 */
function switchReferrerTab(tab) {
    const tabs = ['dashboard', 'tickets', 'knowledge'];
    tabs.forEach(t => {
        const section = document.getElementById(`section-${t}`);
        const nav = document.getElementById(`nav-${t}`);

        if (!section || !nav) return;

        if (t === tab) {
            section.classList.remove('hidden');
            nav.className = 'w-full flex items-center gap-4 px-4 py-3 rounded-xl bg-aviation-purple text-white font-bold text-sm shadow-lg shadow-aviation-purple/20 transition-all';
        } else {
            section.classList.add('hidden');
            nav.className = 'w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white font-bold text-sm transition-all';
        }
    });
}

/**
 * DASHBOARD REFERIDOR
 * Solo ve sus propios leads y quién es su ejecutivo asignado.
 */
function renderReferrerDashboard() {
    const referrer = state.users.find(u => u.id === state.currentUser.id);
    if (!referrer) return;

    // Calcular comisiones y vuelos
    const myLeads = state.leads.filter(l => l.referrer_id === state.currentUser.id);
    const myLeadIds = myLeads.map(l => l.id);
    const myFlights = state.flights.filter(f => myLeadIds.includes(f.lead_id));
    const totalCommission = myFlights.reduce((sum, f) => sum + Number(f.amount), 0);

    // Actualizar Stats
    const commEl = document.getElementById('stat-total-commission');
    const leadsEl = document.getElementById('stat-active-leads');
    const flightsEl = document.getElementById('stat-total-flights');

    if (commEl) commEl.textContent = `$${totalCommission.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    if (leadsEl) leadsEl.textContent = myLeads.length;
    if (flightsEl) flightsEl.textContent = myFlights.length;

    // Actualizar Sidebar & Headers
    const tierName = (referrer.tier || 'Platinum').toUpperCase();

    // Sidebar Elements
    const sidebarName = document.getElementById('user-name-sidebar');
    const sidebarTier = document.getElementById('user-tier-sidebar');
    const sidebarInitial = document.getElementById('user-initial');

    // Hero Elements
    const heroName = document.getElementById('user-name');
    const heroTierCard = document.getElementById('stat-current-tier'); // In stats grid

    if (sidebarName) sidebarName.textContent = referrer.name;
    if (sidebarTier) sidebarTier.textContent = tierName;
    if (sidebarInitial) sidebarInitial.textContent = referrer.name ? referrer.name[0] : 'U';

    if (heroName) heroName.textContent = referrer.name.split(' ')[0]; // First name only
    if (heroTierCard) heroTierCard.textContent = tierName;


    // Mostrar Ejecutivo Asignado (Sidebar)
    const exec = state.users.find(u => u.id === referrer.assigned_exec_id);
    const sidebarExecInfo = document.getElementById('sidebar-exec-info');

    if (sidebarExecInfo && exec) {
        sidebarExecInfo.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-white/5">
                    ${exec.name ? exec.name[0] : '?'}
                </div>
                <div>
                    <p class="font-bold text-white text-xs">${exec.name}</p>
                    <p class="text-[9px] text-aviation-purple font-mono cursor-pointer hover:underline" onclick="switchReferrerTab('tickets')">Contactar</p>
                </div>
            </div>
        `;
    }

    // Filtrar Leads Propios
    const leadsBody = document.getElementById('leads-table-body');
    if (leadsBody) {
        if (myLeads.length === 0) {
            leadsBody.innerHTML = '<tr><td colspan="4" class="px-6 py-12 text-center text-slate-500">Aún no has registrado ningún referido.</td></tr>';
        } else {
            leadsBody.innerHTML = myLeads.map(lead => {
                const leadFlights = state.flights.filter(f => f.lead_id === lead.id);
                const leadComm = leadFlights.reduce((sum, f) => sum + Number(f.amount), 0);
                return `
                <tr class="hover:bg-white/5 transition-colors border-b border-white/5">
                    <td class="px-6 py-4 font-semibold text-white">${lead.name}</td>
                    <td class="px-6 py-4 text-slate-400">${lead.company || ''}</td>
                    <td class="px-6 py-4">
                        <span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${lead.status === 'Cerrado' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}">
                            ${lead.status}
                        </span>
                    </td>
                    <td class="px-6 py-4 font-mono text-aviation-purple text-right">$${leadComm.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td class="px-6 py-4 text-center">
                        <button onclick="openVuelosModal('${lead.id}')" class="px-3 py-1 bg-aviation-purple/10 text-aviation-purple text-[10px] font-bold rounded-lg border border-aviation-purple/20 hover:bg-aviation-purple hover:text-white transition-all">
                            Ver Vuelos
                        </button>
                    </td>
                </tr>
            `;
            }).join('');
        }
    }

    // Render Support Tickets
    renderTickets();
    renderKnowledge();
}

/**
 * CONSOLA EJECUTIVO
 * SEGMENTACIÓN: Solo ve referidores que tiene asignados.
 */
function renderExecutive() {
    const execId = state.currentUser.id;

    // Update Sidebar Name
    const sidebarNameEl = document.getElementById('exec-sidebar-name');
    if (sidebarNameEl && state.currentUser.name) {
        sidebarNameEl.textContent = state.currentUser.name;
    }

    // 1. Filtrar Referidores de este Ejecutivo
    const myReferrers = state.users.filter(u => u.role === 'referidor' && u.assigned_exec_id === execId);
    const myReferrerIds = myReferrers.map(r => r.id);

    // 2. Filtrar Leads de esos Referidores (y ordenar por ID para estabilidad visual)
    const myLeads = state.leads
        .filter(l => myReferrerIds.includes(l.referrer_id))
        .sort((a, b) => a.id - b.id);

    // 3. Calcular Utilidad Proyectada (Comisiones acumuladas de sus referidos)
    const myFlights = state.flights.filter(f => myLeads.map(l => l.id).includes(Number(f.lead_id)));
    const totalUtility = myFlights.reduce((sum, f) => sum + Number(f.amount), 0);
    const utilityEl = document.getElementById('stat-total-utility');
    if (utilityEl) utilityEl.textContent = `$${totalUtility.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

    // 4. Calcular Métricas Generales (Corrección)
    const totalLeads = myLeads.length;
    const totalClosed = myLeads.filter(l => l.status === 'ACTIVO').length;

    // Cierres del mes (Basado en fecha de vuelo)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyClosings = myFlights.filter(f => {
        let d;
        if (f.flight_date) {
            // Treat YYYY-MM-DD as local date to avoid timezone shifts
            const [y, m, day] = f.flight_date.split('-').map(Number);
            d = new Date(y, m - 1, day);
        } else {
            d = new Date(f.created_at);
        }
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    // Conversión
    const conversion = totalLeads > 0 ? ((totalClosed / totalLeads) * 100).toFixed(1) : 0;

    // Renderizar Métricas
    const totalLeadsEl = document.getElementById('stat-total-leads');
    const monthlyClosingsEl = document.getElementById('stat-monthly-closings');
    const conversionEl = document.getElementById('stat-conversion');
    const conversionBar = document.getElementById('stat-conversion-bar');

    if (totalLeadsEl) totalLeadsEl.textContent = totalLeads;
    if (monthlyClosingsEl) monthlyClosingsEl.textContent = monthlyClosings;
    if (conversionEl) conversionEl.textContent = `${conversion}%`;
    if (conversionBar) conversionBar.style.width = `${conversion}%`;

    if (conversionBar) conversionBar.style.width = `${conversion}%`;

    // Renderizar Leads
    const leadsBody = document.getElementById('executive-leads-body');

    // Filter Logic
    const statusFilter = document.getElementById('exec-filter-status')?.value || '';
    const searchFilter = document.getElementById('exec-filter-search')?.value.toLowerCase() || '';

    const filteredLeads = myLeads.filter(l => {
        const matchesStatus = statusFilter ? l.status === statusFilter : true;
        const matchesSearch = searchFilter ? (
            (l.name && l.name.toLowerCase().includes(searchFilter)) ||
            (l.company && l.company.toLowerCase().includes(searchFilter))
        ) : true;
        return matchesStatus && matchesSearch;
    });

    if (leadsBody) {
        if (filteredLeads.length === 0) {
            leadsBody.innerHTML = '<tr><td colspan="5" class="px-8 py-6 text-center text-slate-500">No se encontraron prospectos con estos filtros.</td></tr>';
        } else {
            leadsBody.innerHTML = filteredLeads.map(lead => {
                const ref = myReferrers.find(r => r.id === lead.referrer_id);
                const leadFlights = state.flights.filter(f => Number(f.lead_id) === lead.id);
                const leadComm = leadFlights.reduce((sum, f) => sum + Number(f.amount), 0);

                return `
                <tr class="hover:bg-white/[0.03] transition-colors border-b border-white/5">
                    <td class="px-8 py-6">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-white/5">
                                ${ref ? ref.name[0] : '?'}
                            </div>
                            <div>
                                <p class="font-bold text-white text-xs">${ref ? ref.name : 'Desconocido'}</p>
                                <span class="text-[9px] text-aviation-purple uppercase font-bold tracking-tighter">${ref ? ref.tier : 'Platinum'}</span>
                            </div>
                        </div>
                    </td>
                    <td class="px-8 py-6">
                        <p class="font-bold text-white text-sm">${lead.name}</p>
                        <p class="text-xs text-slate-500">${lead.company || ''}</p>
                    </td>
                    <td class="px-8 py-6">
                            <select onchange="updateLeadStatus('${lead.id}', this.value)" 
                                    class="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold uppercase text-slate-300 focus:outline-none focus:border-aviation-purple cursor-pointer hover:bg-white/10 transition-colors">
                                    <option value="Pendiente" ${lead.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                                    <option value="Contactado" ${lead.status === 'Contactado' ? 'selected' : ''}>Contactado</option>
                                    <option value="En Negociación" ${lead.status === 'En Negociación' ? 'selected' : ''}>En Negociación</option>
                                    <option value="ACTIVO" ${lead.status === 'ACTIVO' ? 'selected' : ''}>ACTIVO</option>
                                </select>
                    </td>
                    <td class="px-8 py-6 text-right font-mono text-white text-sm font-bold">$${leadComm.toLocaleString()}</td>
                    <td class="px-8 py-6 text-right">
                        <div class="flex justify-end gap-2">
                            <button onclick="openHistoryModal(${lead.id})" class="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Ver Historial">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </button>
                            <button onclick="openFlightModal(${lead.id})" class="px-4 py-2 bg-aviation-purple/10 text-aviation-purple text-[10px] font-bold uppercase rounded-lg border border-aviation-purple/20 hover:bg-aviation-purple hover:text-white transition-all">
                                Vuelo
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            }).join('');
        }
    }

    // Renderizar Directorio de Socios (Referidores)
    const referrersList = document.getElementById('referrers-list-body');
    if (referrersList) {
        referrersList.innerHTML = myReferrers.map(ref => `
            <div class="p-8 hover:bg-white/[0.02] transition-all flex items-center justify-between group border-b border-white/5 last:border-0">
                <div class="flex items-center gap-5">
                    <div class="w-14 h-14 rounded-2xl bg-aviation-dark border border-white/10 flex items-center justify-center text-lg font-bold text-aviation-purple shadow-lg">
                        ${ref.name ? ref.name[0] : '?'}
                    </div>
                    <div>
                        <h4 class="text-base font-bold text-white group-hover:text-aviation-purple transition-colors">${ref.name}</h4>
                        <p class="text-xs text-slate-500">${ref.email || ''}</p>
                    </div>
                </div>
                <div class="flex items-center gap-8">
                    <span class="px-3 py-1 bg-aviation-purple/10 text-aviation-purple border border-aviation-purple/20 rounded-full text-[10px] font-bold uppercase">${ref.tier || 'Platinum'}</span>
                    <button class="text-slate-500 hover:text-white transition-colors" onclick="alert('Ver perfil detallado de ${ref.name}')">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Render Support Tickets (Executive View)
    renderExecutiveSupport();
}

async function updateLeadStatus(leadId, newStatus) {
    // 1. Optimistic Update (Immediate Feedback)
    const numericId = Number(leadId); // Ensure numeric ID
    const prevStatus = state.leads.find(l => l.id == numericId)?.status;
    const leadIndex = state.leads.findIndex(l => l.id == numericId);

    if (leadIndex !== -1) {
        state.leads[leadIndex].status = newStatus;
        renderExecutive(); // Re-render immediately
    }

    try {
        const { data, error } = await supabaseClient
            .from('leads')
            .update({ status: newStatus })
            .eq('id', numericId)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            console.warn('Update returned no data. ID mismatch?');
            // Revert might be needed if no row found
            throw new Error('No records updated.');
        }

        // Confirm persistence
        await loadInitialData();
        renderExecutive(); // Ensure UI syncs with DB State
    } catch (error) {
        console.error('Error updating status:', error);
        // alert('Error actualizando estatus. Se revertirán los cambios. Revisa la consola.'); // Less intrusive

        // Revert on error
        if (leadIndex !== -1 && prevStatus) {
            state.leads[leadIndex].status = prevStatus;
        }
        await loadInitialData(); // Revert UI
        renderExecutive();
    }
}

/**
 * METRICS DASHBOARD (EXECUTIVE)
 */
function renderExecutiveMetrics() {
    const execId = state.currentUser.id;

    // 1. Get Data Set
    const myReferrers = state.users.filter(u => u.role === 'referidor' && u.assigned_exec_id === execId);
    const myReferrerIds = myReferrers.map(r => r.id);
    const myLeads = state.leads.filter(l => myReferrerIds.includes(l.referrer_id));
    const myLeadIds = myLeads.map(l => l.id);
    // Be careful with ID types (string vs number)
    const myFlights = state.flights.filter(f => myLeadIds.includes(Number(f.lead_id)) || myLeadIds.includes(String(f.lead_id)));

    // 2. Calculate KPIs

    // Revenue YTD (Assuming all flights are this year for demo, or filter by year)
    const totalRevenue = myFlights.reduce((sum, f) => sum + Number(f.amount), 0);

    // Conversion Rate
    const closedLeads = myLeads.filter(l => l.status === 'Cerrado').length;
    const totalLeads = myLeads.length;
    const conversionRate = totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0;

    // Active Referrers (Those with at least 1 lead)
    const activeReferrersCount = myReferrers.filter(r =>
        myLeads.some(l => l.referrer_id === r.id)
    ).length;

    // 3. Render KPIs
    safeSetText('metric-total-revenue', `$${totalRevenue.toLocaleString()}`);
    safeSetText('metric-conversion-rate', `${conversionRate.toFixed(1)}%`);
    safeSetText('metric-active-referrers', activeReferrersCount);
    safeSetText('metric-total-referrers', myReferrers.length);

    const convBar = document.getElementById('metric-conversion-bar');
    if (convBar) convBar.style.width = `${conversionRate}%`;

    // 4. Render Chart (Last 6 Months)
    renderRevenueChart(myFlights);

    // 5. Render Top Referrers
    renderTopPerformers(myReferrers, myLeads, myFlights);

    // 6. Render Regional Breakdown
    renderRegionalBreakdown(myFlights);
}

function safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function renderRevenueChart(flights) {
    const container = document.getElementById('revenue-chart-container');
    if (!container) return;

    // Group by Month (Last 6 Months)
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        months.push({
            name: d.toLocaleString('es-ES', { month: 'short' }),
            monthIdx: d.getMonth(),
            year: d.getFullYear(),
            total: 0
        });
    }

    // Fill Data
    flights.forEach(f => {
        const d = new Date(f.flight_date || f.created_at);
        const m = months.find(m => m.monthIdx === d.getMonth() && m.year === d.getFullYear());
        if (m) m.total += Number(f.amount);
    });

    // Find Max for scaling
    const maxVal = Math.max(...months.map(m => m.total)) || 1;

    // Generate HTML
    container.innerHTML = months.map(m => {
        const heightPct = (m.total / maxVal) * 100;
        const isCurrent = new Date().getMonth() === m.monthIdx;
        const barColor = isCurrent ? 'bg-aviation-purple' : 'bg-white/10 group-hover:bg-white/20';

        return `
            <div class="h-full flex-1 flex flex-col justify-end items-center group relative">
                <div class="mb-2 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full text-[10px] font-bold text-white bg-aviation-dark px-2 py-1 rounded border border-white/10 pointer-events-none">
                    $${m.total.toLocaleString()}
                </div>
                <div class="w-full max-w-[40px] rounded-t-lg transition-all duration-1000 ${barColor}" style="height: ${Math.max(heightPct, 4)}%"></div>
                <span class="text-[10px] uppercase font-bold text-slate-500 mt-2">${m.name}</span>
            </div>
        `;
    }).join('');
}

function renderTopPerformers(referrers, leads, flights) {
    const list = document.getElementById('top-performers-list');
    if (!list) return;

    // Calculate revenue per referrer
    const ranked = referrers.map(r => {
        const rLeads = leads.filter(l => l.referrer_id === r.id);
        const rLeadIds = rLeads.map(l => l.id);
        const rRevenue = flights
            .filter(f => rLeadIds.includes(Number(f.lead_id)) || rLeadIds.includes(String(f.lead_id)))
            .reduce((sum, f) => sum + Number(f.amount), 0);
        return { ...r, revenue: rRevenue };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 3);

    list.innerHTML = ranked.map((r, i) => `
        <div class="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${i === 0 ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white'}">
                    ${i + 1}
                </div>
                <div>
                    <h4 class="text-sm font-bold text-white">${r.name}</h4>
                    <p class="text-[10px] text-slate-500 uppercase">${r.tier || 'Platinum'}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="text-xs font-bold text-aviation-purple">$${r.revenue.toLocaleString()}</p>
            </div>
        </div>
    `).join('');
}

function renderRegionalBreakdown(flights) {
    const tbody = document.getElementById('regional-breakdown-body');
    if (!tbody) return;

    const regions = {};
    flights.forEach(f => {
        const r = f.region || 'Desconocido';
        if (!regions[r]) regions[r] = { count: 0, total: 0 };
        regions[r].count++;
        regions[r].total += Number(f.amount);
    });

    const sortedRegions = Object.entries(regions).sort((a, b) => b[1].total - a[1].total);

    tbody.innerHTML = sortedRegions.map(([name, data]) => `
        <tr class="hover:bg-white/[0.02] transition-colors">
            <td class="px-6 py-4 text-white font-medium text-xs">${name}</td>
            <td class="px-6 py-4 text-center text-slate-400 text-xs">${data.count}</td>
            <td class="px-6 py-4 text-right text-white font-bold text-xs">$${data.total.toLocaleString()}</td>
        </tr>
    `).join('');
}

// FUNCIONES DE VUELOS
function openFlightModal(leadId) {
    const modal = document.getElementById('flight-modal');
    if (modal) {
        document.getElementById('flight-lead-id').value = leadId;
        document.getElementById('flight-date').value = new Date().toISOString().split('T')[0];
        document.getElementById('flight-region').value = "";
        document.getElementById('flight-amount').value = "";
        modal.classList.remove('hidden');
    }
}

function closeFlightModal() {
    const modal = document.getElementById('flight-modal');
    if (modal) modal.classList.add('hidden');
}

async function registerFlight(event) {
    event.preventDefault();
    const leadId = document.getElementById('flight-lead-id').value;
    const region = document.getElementById('flight-region').value;
    const date = document.getElementById('flight-date').value;
    const amountInput = document.getElementById('flight-amount').value;

    if (!date || !region || !amountInput) {
        alert('Por favor completa todos los campos del vuelo.');
        return;
    }

    const amount = parseFloat(amountInput);

    const newFlight = {
        lead_id: leadId,
        region: region,
        amount: amount,
        flight_date: date
    };

    try {
        // 1. Insertar Vuelo en Supabase
        const { error: flightError } = await supabaseClient.from('flights').insert([newFlight]);
        if (flightError) throw flightError;

        // 2. Actualizar estatus del Lead a 'Cerrado'
        const { error: leadError } = await supabaseClient
            .from('leads')
            .update({ status: 'Cerrado' })
            .eq('id', leadId);

        if (leadError) console.warn('Error actualizando estatus del lead, pero el vuelo se registró:', leadError);

        alert(`Éxito: Vuelo registrado en región ${region}. Comisión de $${amount.toLocaleString()} generada.`);
        closeFlightModal();

        // 3. Recargar datos y refrescar UI
        await loadInitialData();
        renderExecutive();

    } catch (error) {
        console.error('Error registrando vuelo:', error);
        alert('Error al registrar el vuelo en Supabase: ' + (error.message || error));
    }
}

function openHistoryModal(leadId) {
    const lead = state.leads.find(l => l.id === leadId);
    if (!lead) return;

    // Filter flights for this lead
    const flights = state.flights
        .filter(f => Number(f.lead_id) === leadId)
        .sort((a, b) => new Date(b.flight_date || b.created_at) - new Date(a.flight_date || a.created_at));

    // Update modal content
    const subtitle = document.getElementById('history-modal-subtitle');
    const tbody = document.getElementById('history-modal-body');
    const modal = document.getElementById('history-modal');

    if (subtitle) subtitle.textContent = `Detalle de transacciones para ${lead.name}`;

    if (tbody) {
        if (flights.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-slate-500">No hay vuelos registrados aún.</td></tr>';
        } else {
            tbody.innerHTML = flights.map(f => {
                const isPaid = f.payment_status === 'paid';
                return `
                <tr class="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td class="px-6 py-4 text-white font-mono text-xs">${f.flight_date || f.created_at?.split('T')[0] || '-'}</td>
                    <td class="px-6 py-4 text-slate-300 font-bold text-xs">${f.region || 'N/A'}</td>
                    <td class="px-6 py-4 text-right font-mono text-green-400 text-sm">$${Number(f.amount).toLocaleString()}</td>
                    <td class="px-6 py-4 text-right">
                        ${isPaid
                        ? `<span class="text-[10px] uppercase font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">Pagado</span>`
                        : `<button onclick="markFlightAsPaid(${f.id})" class="px-3 py-1 bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-bold uppercase rounded border border-white/10 transition-all hover:text-white hover:border-white/30">Marcar Pagado</button>`
                    }
                    </td>
                </tr>
            `}).join('');
        }
    }

    if (modal) modal.classList.remove('hidden');
}

async function markFlightAsPaid(flightId) {
    try {
        if (!confirm('¿Confirmas que esta comisión ya fue pagada al referidor?')) return;

        const { error } = await supabaseClient
            .from('flights')
            .update({ payment_status: 'paid' })
            .eq('id', flightId);

        if (error) throw error;

        // Refresh data and reopen modal for same lead to show updated status
        await loadInitialData();

        // Find lead ID from the flight to reopen modal
        const flight = state.flights.find(f => f.id == flightId);
        if (flight) {
            openHistoryModal(flight.lead_id);
        } else {
            renderExecutive(); // Generic refresh if flight ref lost
        }

    } catch (error) {
        console.error('Error marking paid:', error);
        alert('Error al actualizar estatus de pago.');
    }
}

function openVuelosModal(leadId) {
    const lead = state.leads.find(l => l.id == leadId);
    if (!lead) return;

    const modal = document.getElementById('vuelos-modal');
    const nameEl = document.getElementById('vuelos-modal-lead-name');
    const body = document.getElementById('vuelos-modal-body');

    if (modal && nameEl && body) {
        nameEl.textContent = `Detalle de viajes para: ${lead.name}`;
        const leadFlights = state.flights.filter(f => Number(f.lead_id) == leadId);

        if (leadFlights.length === 0) {
            body.innerHTML = '<tr><td colspan="3" class="px-6 py-8 text-center text-slate-500 italic">No hay vuelos registrados para este referido.</td></tr>';
        } else {
            // Sort by date descending
            leadFlights.sort((a, b) => new Date(b.flight_date) - new Date(a.flight_date));

            body.innerHTML = leadFlights.map(f => `
                <tr class="hover:bg-white/[0.02] transition-colors">
                    <td class="px-6 py-4 text-white font-medium">${f.flight_date ? new Date(f.flight_date).toLocaleDateString('es-ES') : '-'}</td>
                    <td class="px-6 py-4 text-slate-400 capitalize">${f.region}</td>
                    <td class="px-6 py-4 text-right text-aviation-purple font-bold">$${Number(f.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                </tr>
            `).join('');
        }

        modal.classList.remove('hidden');
    }
}

function closeVuelosModal() {
    const modal = document.getElementById('vuelos-modal');
    if (modal) modal.classList.add('hidden');
}

function calculateCommission() {
    const leadId = document.getElementById('flight-lead-id').value;
    const region = document.getElementById('flight-region').value;

    if (!leadId || !region) return;

    const lead = state.leads.find(l => l.id == leadId);
    if (!lead) return;

    const referrer = state.users.find(u => u.id === lead.referrer_id);
    // Default to Platinum for old data, but check logic
    const tier = referrer ? (referrer.tier || 'Platinum') : 'Platinum';
    const referrerCategory = referrer ? (referrer.referrer_category || 'standard') : 'standard';

    // Find rate in state.commissions
    const setting = state.commissions.find(c => c.tier === tier && c.region === region && c.category === referrerCategory);
    const suggestedAmount = setting ? setting.amount : 0;

    if (suggestedAmount) {
        document.getElementById('flight-amount').value = suggestedAmount;
    }
}

/**
 * PANEL ADMIN
 * VISTA GLOBAL: Gestiona asignaciones y ve "huérfanos".
 */
function renderAdmin() {
    console.log('Rendering Admin Global Hub');

    // Tabla General de Usuarios
    const usersBody = document.getElementById('admin-users-body');
    if (usersBody) {
        usersBody.innerHTML = state.users.map(u => {
            const exec = state.users.find(e => e.id === u.assigned_exec_id);
            return `
                <tr class="hover:bg-white/[0.03] transition-colors border-b border-white/5">
                    <td class="px-8 py-6">
                        <div>
                            <p class="font-bold text-white text-sm">${u.name}</p>
                            <p class="text-[10px] text-slate-500">${u.email || ''}</p>
                        </div>
                    </td>
                    <td class="px-8 py-6">
                         <span class="text-xs text-slate-300 font-mono">${u.phone || '-'}</span>
                    </td>
                    <td class="px-8 py-6">
                        <span class="text-[10px] font-bold uppercase tracking-widest ${u.role === 'admin' ? 'text-red-500' : u.role === 'ejecutivo' ? 'text-blue-400' : 'text-slate-400'}">
                            ${u.role}
                        </span>
                    </td>
                    <td class="px-8 py-6">
                        <span class="text-[10px] font-bold uppercase tracking-widest ${u.referrer_category === 'b2b' ? 'text-aviation-purple' : 'text-slate-500'}">
                            ${u.role === 'referidor' ? ((u.referrer_category === 'b2b' ? 'Empresarial' : 'Estándar')) : '-'}
                        </span>
                    </td>
                    <td class="px-8 py-6">
                        <div class="text-[10px] font-bold text-white">
                            ${u.role === 'referidor' ? (exec ? exec.name : '<span class="text-red-500 tracking-tighter uppercase italic">⚠️ Sin Asignar</span>') : '-'}
                        </div>
                    </td>
                    <td class="px-8 py-6 text-right">
                        <button class="text-slate-500 hover:text-white" onclick="openEditAsignationModal('${u.id}')"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Alerta de Huérfanos
    const orphans = state.users.filter(u => u.role === 'referidor' && !u.assigned_exec_id);
    const orphanCountEl = document.getElementById('orphan-alert-count');
    if (orphanCountEl) {
        orphanCountEl.textContent = orphans.length;
        document.getElementById('orphan-alert-box').style.display = orphans.length > 0 ? 'flex' : 'none';
    }

    // Poblar selects de traspaso
    populatePortfolioSelects();
}

function closeUserModal() {
    document.getElementById('user-modal').classList.add('hidden');
}

/**
 * ADMIN HELPERS
 */
function toggleExecSelector(role) {
    const container = document.getElementById('exec-selector-container');
    if (container) {
        container.style.display = role === 'referidor' ? 'block' : 'none';
        if (role === 'referidor') populateExecSelect();
    }

    // Toggle Referrer Category Selector
    const catSelector = document.getElementById('referrer-category-selector');
    if (catSelector) {
        catSelector.style.display = role === 'referidor' ? 'block' : 'none';
    }
}

function populateExecSelect() {
    const select = document.getElementById('assigned-exec-select');
    if (select) {
        const executives = state.users.filter(u => u.role === 'ejecutivo');
        select.innerHTML = '<option value="">Seleccionar Ejecutivo...</option>' +
            executives.map(e => `<option value="${e.id}">${e.name}</option>`).join('');
    }
}

function populatePortfolioSelects() {
    const fromSelect = document.getElementById('transfer-from');
    const toSelect = document.getElementById('transfer-to');
    const executives = state.users.filter(u => u.role === 'ejecutivo');

    if (fromSelect && toSelect) {
        const fromOptions = '<option value="">Seleccionar emisor...</option>' +
            executives.map(e => {
                const count = state.users.filter(u => u.assigned_exec_id === e.id).length;
                return `<option value="${e.id}">${e.name} (${count} referidores)</option>`;
            }).join('');

        const toOptions = '<option value="">Seleccionar receptor...</option>' +
            executives.map(e => `<option value="${e.id}">${e.name}</option>`).join('');

        fromSelect.innerHTML = fromOptions;
        toSelect.innerHTML = toOptions;
    }
}

function filterOrphans() {
    const usersBody = document.getElementById('admin-users-body');
    const orphans = state.users.filter(u => u.role === 'referidor' && !u.assigned_exec_id);
    if (usersBody) {
        usersBody.innerHTML = orphans.map(u => `
            <tr class="bg-red-500/5 hover:bg-red-500/10 transition-colors border-b border-white/5">
                <td class="px-8 py-6">
                    <div>
                        <p class="font-bold text-white text-sm">${u.name}</p>
                        <p class="text-[10px] text-slate-500">${u.email}</p>
                    </div>
                </td>
                <td class="px-8 py-6">
                    <span class="text-[10px] font-bold uppercase tracking-widest text-red-400 italic">Huérfano</span>
                </td>
                <td class="px-8 py-6">
                    <button class="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white hover:bg-red-600 transition-all" onclick="openEditAsignationModal('${u.id}')">Asignar Ahora</button>
                </td>
                <td class="px-8 py-6 text-right">
                    <button class="text-slate-500 hover:text-white" onclick="openEditAsignationModal('${u.id}')"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
                </td>
            </tr>
        `).join('');
    }
}

function openEditAsignationModal(userId) {
    const modal = document.getElementById('user-modal');
    const form = document.querySelector('#user-modal form');
    const titleEl = document.getElementById('user-modal-title');
    const submitBtn = document.getElementById('user-modal-submit-btn');

    if (modal && form) {
        if (userId) {
            // EDIT MODE
            const user = state.users.find(u => u.id === userId);
            if (user) {
                if (titleEl) titleEl.textContent = 'Editar Usuario';
                if (submitBtn) submitBtn.textContent = 'Guardar Cambios';

                form.querySelector('[name="id"]').value = user.id; // Set ID
                form.querySelector('[name="name"]').value = user.name || '';
                form.querySelector('[name="email"]').value = user.email || '';
                form.querySelector('[name="phone"]').value = user.phone || '';

                const roleRadio = form.querySelector(`input[name="role"][value="${user.role}"]`);
                if (roleRadio) roleRadio.checked = true;

                toggleExecSelector(user.role);

                // Set Referrer Category
                if (user.role === 'referidor') {
                    const catRadio = form.querySelector(`input[name="referrer_category"][value="${user.referrer_category || 'standard'}"]`);
                    if (catRadio) catRadio.checked = true;
                }

                if (user.role === 'referidor') {
                    setTimeout(() => {
                        const select = document.getElementById('assigned-exec-select');
                        if (select) select.value = user.assigned_exec_id || "";
                    }, 10);
                }
            }
        } else {
            // CREATE MODE
            if (titleEl) titleEl.textContent = 'Nuevo Usuario';
            if (submitBtn) submitBtn.textContent = 'Crear Usuario';

            form.reset(); // Reset form
            form.querySelector('[name="id"]').value = ''; // Clear ID

            // Set default role
            const refRole = form.querySelector('input[name="role"][value="referidor"]');
            if (refRole) refRole.checked = true;

            toggleExecSelector('referidor');
            // Default category
            const stdRadio = form.querySelector('input[name="referrer_category"][value="standard"]');
            if (stdRadio) stdRadio.checked = true;
            setTimeout(() => {
                const select = document.getElementById('assigned-exec-select');
                if (select) select.value = "";
            }, 10);
        }
        modal.classList.remove('hidden');
    }
}

async function saveUser(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const role = formData.get('role');
    const phone = formData.get('phone'); // Get phone
    const referrerCategory = formData.get('referrer_category') || 'standard'; // Get category

    // Si es referidor, asignar ejecutivo
    let assignedExec = null;
    if (role === 'referidor') {
        assignedExec = formData.get('assignedExecId');
    }

    // Nota: En una app real, aquí usaríamos supabase.auth.admin.createUser
    // Para esta demo/MVP, simularemos que el usuario existe en auth y crearemos/actualizaremos el perfil.

    const id = formData.get('id'); // Get ID from hidden field

    // Check if updating
    let userId = id;

    if (!userId) {
        // Create new ID if not present
        userId = self.crypto.randomUUID();
    }

    const userData = {
        id: userId,
        name: name,
        email: email,
        role: role,
        referrer_category: role === 'referidor' ? referrerCategory : 'standard',
        phone: phone, // Save phone
        assigned_exec_id: assignedExec,
        status: 'Activo'
    };

    try {
        const { error } = await supabaseClient.from('profiles').upsert(userData);
        if (error) throw error;

        await loadInitialData();
        renderAdmin();
        document.getElementById('user-modal').classList.add('hidden');
        alert(`Usuario ${name} guardado correctamente en la base de datos.`);
    } catch (error) {
        console.error('Error guardando usuario:', error);
        alert('Error al guardar el usuario en Supabase.');
    }
}

async function executeTransfer() {
    const fromId = document.getElementById('transfer-from').value;
    const toId = document.getElementById('transfer-to').value;

    if (!fromId || !toId) {
        alert('Selecciona ambos ejecutivos para el traspaso.');
        return;
    }

    if (fromId === toId) {
        alert('El ejecutivo de origen y destino deben ser diferentes.');
        return;
    }

    try {
        const { error } = await supabaseClient
            .from('profiles')
            .update({ assigned_exec_id: toId })
            .eq('assigned_exec_id', fromId);

        if (error) throw error;

        alert(`Éxito: Se han traspasado los referidores al nuevo ejecutivo.`);
        await loadInitialData();
        renderAdmin();
    } catch (err) {
        console.error('Error en traspaso:', err);
        alert('Error al ejecutar el traspaso en la base de datos.');
    }
}

async function registerProspect(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newLead = {
        referrer_id: state.currentUser.id,
        name: formData.get('nombre') + ' ' + formData.get('apellidos'),
        company: formData.get('empresa'),
        status: 'Pendiente',
        commission: 0
    };

    try {
        const { error } = await supabaseClient.from('leads').insert([newLead]);
        if (error) throw error;

        await loadInitialData();
        renderReferrerDashboard();
        document.getElementById('prospect-modal').classList.add('hidden');
        event.target.reset();
        alert('Prospecto registrado y enviado a tu ejecutivo.');
    } catch (error) {
        console.error('Error registrando prospecto:', error);
        alert('Error al registrar el prospecto.');
    }
}

async function handleCSV(event) {
    const file = event.target.files[0];
    if (file) {
        console.log('Procesando CSV:', file.name);
        const reader = new FileReader();

        reader.onload = async (e) => {
            const content = e.target.result;
            const lines = content.split('\n').filter(line => line.trim() !== '');
            const newLeads = [];

            // Formato esperado: Nombre, Empresa
            for (const line of lines) {
                const parts = line.split(',').map(p => p.trim());
                if (parts.length >= 2) {
                    newLeads.push({
                        referrer_id: state.currentUser.id,
                        name: parts[0],
                        company: parts[1],
                        status: 'Pendiente',
                        commission: 0
                    });
                }
            }

            if (newLeads.length > 0) {
                try {
                    const { error } = await supabaseClient.from('leads').insert(newLeads);
                    if (error) throw error;

                    alert(`Éxito: Se han cargado ${newLeads.length} nuevos prospectos.`);
                    await loadInitialData();
                    renderReferrerDashboard();
                } catch (err) {
                    console.error('Error en carga masiva:', err);
                    alert('Error al guardar los datos en el servidor.');
                }
            } else {
                alert('No se encontraron datos válidos en el CSV (Formato: Nombre, Empresa).');
            }
        };

        reader.readAsText(file);
    }
}

// Escuchar cambios en inputs de archivo
document.addEventListener('change', (e) => {
    if (e.target.type === 'file') handleCSV(e);
});

// Knowledge Hub State
let activeKnowledgeTab = 'faqs';

function switchKnowledgeTab(tab) {
    activeKnowledgeTab = tab;
    document.getElementById('ktab-faqs').className = tab === 'faqs' ? 'px-6 py-2 rounded-xl text-sm font-bold bg-aviation-purple text-white shadow-lg' : 'px-6 py-2 rounded-xl text-sm font-bold bg-white/5 text-slate-400 hover:bg-white/10 transition-all';
    document.getElementById('ktab-tips').className = tab === 'tips' ? 'px-6 py-2 rounded-xl text-sm font-bold bg-aviation-purple text-white shadow-lg' : 'px-6 py-2 rounded-xl text-sm font-bold bg-white/5 text-slate-400 hover:bg-white/10 transition-all';
    renderKnowledge();
}

function renderKnowledge(filter = '') {
    const container = document.getElementById('knowledge-content');
    if (!container) return;

    if (activeKnowledgeTab === 'faqs') {
        const filtered = state.faqs.filter(f => f.question.toLowerCase().includes(filter.toLowerCase()) || (f.category && f.category.toLowerCase().includes(filter.toLowerCase())));
        container.innerHTML = filtered.map(faq => `
            <div class="glass p-6 rounded-2xl border border-white/5 hover:border-aviation-purple/20 transition-all">
                <span class="text-[9px] font-bold uppercase tracking-widest text-aviation-purple mb-1 block">${faq.category || 'Varios'}</span>
                <h4 class="text-white font-bold mb-2">${faq.question}</h4>
                <p class="text-slate-400 text-sm leading-relaxed">${faq.answer}</p>
            </div>
        `).join('') || '<p class="text-slate-500 text-sm italic">No se encontraron preguntas frecuentes.</p>';
    } else {
        const filteredTips = state.tips.filter(t => t.title.toLowerCase().includes(filter.toLowerCase()) || t.content.toLowerCase().includes(filter.toLowerCase()));
        container.innerHTML = filteredTips.map(tip => `
            <div class="glass p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-aviation-purple/5 to-transparent">
                <h4 class="text-white font-bold mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-aviation-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    ${tip.title}
                </h4>
                <p class="text-slate-400 text-sm italic leading-relaxed">"${tip.content}"</p>
                <div class="mt-4 pt-4 border-t border-white/5 flex gap-4">
                    <button class="text-[10px] font-bold text-aviation-purple uppercase hover:underline">Descargar PDF</button>
                    <button class="text-[10px] font-bold text-slate-500 uppercase hover:underline">Ver Video</button>
                </div>
            </div>
        `).join('') || '<p class="text-slate-500 text-sm italic">No se encontraron tips de venta.</p>';
    }
}

function searchFAQ() {
    const query = document.getElementById('faq-search').value;
    renderKnowledge(query);
}

// Ticketing Logic
function renderTickets() {
    const list = document.getElementById('tickets-list');
    if (!list) return;

    const myTickets = state.tickets.filter(t => t.referrer_id === state.currentUser.id);
    list.innerHTML = myTickets.map(t => `
                <div onclick="openTicketDetail('${t.id}')" class="glass p-4 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/5 transition-all group">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-bold text-white group-hover:text-aviation-purple transition-colors">${t.subject}</h3>
                        <span class="px-2 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(t.status)}">${t.status}</span>
                    </div>
                    <p class="text-xs text-slate-400 line-clamp-2 mb-3">${t.description || 'Sin descripción'}</p>
                    <div class="flex justify-between items-center text-[10px] text-slate-500">
                        <span>${new Date(t.created_at).toLocaleDateString()}</span>
                        <span class="group-hover:translate-x-1 transition-transform">Ver conversación →</span>
                    </div>
                </div>
    `).join('') || '<p class="text-slate-500 text-xs italic text-center py-4">No tienes consultas activas.</p>';

    // Update lead selector in modal
    const leadSelect = document.getElementById('ticket-lead-ref');
    if (leadSelect) {
        const myLeads = state.leads; // Ya filtrados en loadInitialData
        leadSelect.innerHTML = '<option value="">Ninguno</option>' +
            myLeads.map(l => `<option value="${l.id}">${l.name} (${l.company})</option>`).join('');
    }
}

function openTicketModal() {
    document.getElementById('ticket-modal').classList.remove('hidden');
}

function closeTicketModal() {
    document.getElementById('ticket-modal').classList.add('hidden');
}

async function createNewTicket(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const currentUserProfile = state.users.find(u => u.id === state.currentUser.id);

    const ticketId = `tk-${Date.now()}`;
    const newTicket = {
        id: ticketId,
        referrer_id: state.currentUser.id,
        executive_id: currentUserProfile?.assigned_exec_id || null,
        lead_id: formData.get('leadId') || null,
        subject: formData.get('subject'),
        status: 'Abierto'
    };

    try {
        const { error: tError } = await supabaseClient.from('tickets').insert([newTicket]);
        if (tError) throw tError;

        const { error: mError } = await supabaseClient.from('messages').insert([{
            ticket_id: ticketId,
            sender_id: state.currentUser.id,
            text: formData.get('message')
        }]);
        if (mError) throw mError;

        alert('Consulta enviada exitosamente.');
        closeTicketModal();
        event.target.reset();
        await loadInitialData();
        renderReferrerDashboard();
    } catch (error) {
        console.error('Error creando ticket:', error);
        alert('Error al enviar la consulta.');
    }
}

// Update initialization to include new renders
const originalInit = document.addEventListener;
document.addEventListener('DOMContentLoaded', () => {
    // This is handled by the existing listener but let's ensure renders happen
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('Antigravity/')) {
        renderKnowledge();
        renderTickets();

        // Listener para Carga Masiva
        const bulkBtn = document.getElementById('bulk-upload-btn');
        const bulkInput = document.getElementById('bulk-upload-input');
        if (bulkBtn && bulkInput) {
            bulkBtn.onclick = () => bulkInput.click();
        }
    }
});

// Executive Support Logic
function renderExecutiveSupport() {
    const list = document.getElementById('exec-tickets-list');
    if (!list) return;

    const myReferrerIds = state.users.filter(u => u.role === 'referidor' && u.assigned_exec_id === state.currentUser.id).map(u => u.id);
    const myTickets = state.tickets.filter(t => myReferrerIds.includes(t.referrer_id));

    const pendingCount = myTickets.filter(t => t.status === 'Abierto').length;
    const countEl = document.getElementById('ticket-pending-count');
    if (countEl) countEl.textContent = `${pendingCount} Pendientes`;

    list.innerHTML = myTickets.map(t => {
        const ref = state.users.find(u => u.id === t.referrer_id);
        return `
            <div class="p-6 hover:bg-white/[0.02] transition-all flex items-center justify-between group border-b border-white/5 last:border-0 cursor-pointer" onclick="openTicketDetail('${t.id}')">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-full bg-aviation-purple/10 flex items-center justify-center text-aviation-purple font-bold">
                        ${ref ? ref.name[0] : '?'}
                    </div>
                    <div>
                        <h4 class="text-sm font-bold text-white">${t.subject}</h4>
                        <p class="text-[10px] text-slate-500">De: ${ref ? ref.name : 'Desconocido'} • ${new Date(t.last_update).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <span class="px-2 py-1 rounded-lg text-[9px] font-bold uppercase ${t.status === 'Abierto' ? 'bg-aviation-purple/20 text-aviation-purple' : 'bg-green-500/20 text-green-400'}">
                        ${t.status}
                    </span>
                    <button class="text-slate-500 hover:text-white transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                    </button>
                    ${t.status === 'Abierto' ? `<button onclick="event.stopPropagation(); closeTicket('${t.id}')" class="text-[9px] font-bold text-green-400 uppercase hover:underline">Cerrar</button>` : ''}
                </div>
            </div>
        `;
    }).join('') || '<p class="text-slate-500 text-sm italic text-center py-8">No hay consultas de tus socios.</p>';
}

async function closeTicket(id) {
    try {
        const { error } = await supabaseClient.from('tickets').update({ status: 'Resuelto', last_update: new Date() }).eq('id', id);
        if (error) throw error;

        await loadInitialData();
        renderExecutiveSupport();
        alert('Ticket marcado como resuelto.');
    } catch (error) {
        console.error('Error cerrando ticket:', error);
        alert('Error al cerrar el ticket.');
    }
}

// CMS Logic (Admin)
let activeCMSType = 'faq';

function initAdminCMS(type) {
    activeCMSType = type;

    // Update Toggle Buttons
    const btnFaq = document.getElementById('btn-cms-faq');
    const btnTips = document.getElementById('btn-cms-tips');
    const title = document.getElementById('cms-section-title');

    if (type === 'faq') {
        btnFaq.className = 'px-6 py-2 rounded-xl text-sm font-bold bg-white/10 text-white border border-white/10 shadow-lg';
        btnTips.className = 'px-6 py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-white border border-transparent transition-all';
        title.textContent = 'Preguntas Frecuentes (FAQ)';
    } else {
        btnTips.className = 'px-6 py-2 rounded-xl text-sm font-bold bg-white/10 text-white border border-white/10 shadow-lg';
        btnFaq.className = 'px-6 py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-white border border-transparent transition-all';
        title.textContent = 'Tips de Ventas (Sales Enablement)';
    }

    renderCMSItems();
}

function renderCMSItems() {
    const container = document.getElementById('cms-items-container');
    if (!container) return; // Guard clause if element doesn't exist (e.g. on executive page)

    const items = activeCMSType === 'faq' ? state.faqs : state.tips;

    container.innerHTML = items.map(item => `
        <div class="glass p-6 rounded-2xl border border-white/5 space-y-4 hover:bg-white/[0.02] transition-colors">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div class="md:col-span-4">
                    <label class="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">
                        ${activeCMSType === 'faq' ? 'Pregunta' : 'Título'}
                    </label>
                    <input type="text" value="${activeCMSType === 'faq' ? item.question : item.title}" 
                        onchange="updateCMSValue('${item.id}', 'title', this.value)" 
                        class="w-full bg-aviation-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-red-500 outline-none transition-all">
                </div>
                <div class="md:col-span-7">
                    <label class="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">
                        ${activeCMSType === 'faq' ? 'Respuesta' : 'Contenido'}
                    </label>
                    <textarea onchange="updateCMSValue('${item.id}', 'content', this.value)" 
                        class="w-full bg-aviation-dark border border-white/10 rounded-xl px-4 py-3 text-slate-400 text-sm focus:border-red-500 outline-none w-full h-full transition-all" rows="2">${activeCMSType === 'faq' ? item.answer : item.content}</textarea>
                </div>
                <div class="md:col-span-1 flex items-center justify-center">
                    <button onclick="deleteCMSItem('${item.id}')" 
                        class="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('') || '<p class="text-slate-500 text-center py-10 italic">No hay contenido registrado en esta categoría.</p>';
}

async function updateCMSValue(id, field, value) {
    try {
        const table = activeCMSType === 'faq' ? 'faqs' : 'tips';
        const updates = {};
        if (activeCMSType === 'faq') {
            if (field === 'title') updates.question = value;
            else updates.answer = value;
        } else {
            if (field === 'title') updates.title = value;
            else updates.content = value;
        }

        const { error } = await supabaseClient.from(table).update(updates).eq('id', id);
        if (error) throw error;

        await loadInitialData();
    } catch (error) {
        console.error('Error actualizando CMS:', error);
    }
}

// Commission Settings Logic
let activeCommissionCategory = 'standard';

function switchCommissionCategory(category) {
    activeCommissionCategory = category;

    // Visual Toggle
    // IDs of buttons
    const buttons = {
        'standard': document.getElementById('btn-fees-standard'),
        'b2b': document.getElementById('btn-fees-b2b'),
        'platform_standard': document.getElementById('btn-fees-platform_standard'),
        'platform_b2b': document.getElementById('btn-fees-platform_b2b')
    };

    // Reset all
    Object.values(buttons).forEach(btn => {
        if (btn) {
            btn.classList.remove('bg-aviation-purple', 'text-white', 'shadow-lg');
            btn.classList.add('text-slate-400', 'hover:text-white');
        }
    });

    // Activate selected
    // Activate selected
    if (buttons[category]) {
        buttons[category].classList.remove('text-slate-400', 'hover:text-white');
        buttons[category].classList.add('bg-aviation-purple', 'text-white', 'shadow-lg');
    }

    renderCommissionSettings();
}

function renderCommissionSettings() {
    const tbody = document.getElementById('commission-settings-body');
    if (!tbody) return;

    // Get unique regions
    const filteredCommissions = state.commissions.filter(c => c.category === activeCommissionCategory);
    const regions = [...new Set(state.commissions.map(c => c.region))]; // Keep all regions available even if no B2B rate yet? Better to ensure we iterate all regions.
    // Ideally we want all regions defined in the system. For now, let's use all regions found in ANY commission setting.

    tbody.innerHTML = regions.map(region => {
        const plat = filteredCommissions.find(c => c.region === region && c.tier === 'Platinum');
        const black = filteredCommissions.find(c => c.region === region && c.tier === 'Black');

        const platVal = plat ? plat.amount : 0;
        const blackVal = black ? black.amount : 0;
        const platId = plat ? plat.id : null;
        const blackId = black ? black.id : null;

        return `
            <tr class="hover:bg-white/[0.02] border-b border-white/5 data-row">
                <td class="px-6 py-4 font-bold text-white">${region}</td>
                <td class="px-6 py-4 text-center">
                    <input type="number" 
                        data-id="${platId}" 
                        data-region="${region}" 
                        data-tier="Platinum"
                        value="${platVal}" 
                        class="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-center text-aviation-purple font-bold w-32 focus:border-aviation-purple outline-none">
                </td>
                <td class="px-6 py-4 text-center">
                   <input type="number" 
                        data-id="${blackId}" 
                        data-region="${region}" 
                        data-tier="Black"
                        value="${blackVal}" 
                        class="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-center text-white font-bold w-32 focus:border-white/50 outline-none">
                </td>
                <td class="px-6 py-4 text-right">
                    <span class="text-[10px] text-slate-500 italic">Edita y guarda</span>
                </td>
            </tr>
        `;
    }).join('');
}

async function saveCommissionSettings() {
    const inputs = document.querySelectorAll('#commission-settings-body input');
    const updates = [];

    inputs.forEach(input => {
        const id = input.dataset.id;
        const region = input.dataset.region;
        const tier = input.dataset.tier;
        const val = parseFloat(input.value);

        // Always include all keys for the unique constraint (region, tier, category)
        // If ID exists, we can use it, but upsert on conflict key is safer/cleaner if ID is missing for new rows
        const payload = {
            region: region,
            tier: tier,
            amount: val,
            category: activeCommissionCategory
        };

        if (id && id !== "null") {
            payload.id = id;
        }

        updates.push(payload);
    });

    try {
        // En una app real haríamos batch update o Promise.all
        // Supabase JS upsert sopporta array
        const { error } = await supabaseClient.from('commission_settings').upsert(updates);
        if (error) throw error;

        alert('Comisiones actualizadas correctamente.');
        await loadInitialData();
        renderCommissionSettings();
    } catch (error) {
        console.error('Error guardando comisiones:', error);
        alert('Error al guardar configuración.');
    }
}

async function addNewCMSItem() {
    try {
        const table = activeCMSType === 'faq' ? 'faqs' : 'tips';
        const newItem = activeCMSType === 'faq' ? {
            category: 'Nuevo',
            question: 'Nueva Pregunta',
            answer: 'Responder aquí...'
        } : {
            title: 'Nuevo Tip',
            content: 'Escribir recomendación aquí...'
        };

        const { error } = await supabaseClient.from(table).insert([newItem]);
        if (error) throw error;

        await loadInitialData();
        renderCMSItems();
    } catch (error) {
        console.error('Error agregando CMS item:', error);
        alert('Error al agregar el elemento.');
    }
}

async function deleteCMSItem(id) {
    if (confirm('¿Seguro que deseas eliminar este elemento?')) {
        try {
            const table = activeCMSType === 'faq' ? 'faqs' : 'tips';
            const { error } = await supabaseClient.from(table).delete().eq('id', id);
            if (error) throw error;

            await loadInitialData();
            renderCMSItems();
        } catch (error) {
            console.error('Error eliminando CMS item:', error);
            alert('Error al eliminar el elemento.');
        }
    }
}

// Profile Management Logic
function openProfileModal() {
    const user = state.users.find(u => u.id === state.currentUser.id);
    if (!user) return;

    document.getElementById('profile-email').value = user.email || '';
    document.getElementById('profile-phone').value = user.phone || '';
    document.getElementById('profile-bank').value = user.bank || '';
    document.getElementById('profile-clabe').value = user.clabe || '';
    document.getElementById('profile-bank-holder').value = user.bank_holder || '';

    document.getElementById('profile-modal').classList.remove('hidden');
}

function closeProfileModal() {
    document.getElementById('profile-modal').classList.add('hidden');
}

async function saveProfile(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    const updates = {
        id: state.currentUser.id,
        phone: formData.get('phone'),
        bank: formData.get('bank'),
        clabe: formData.get('clabe'),
        bank_holder: formData.get('bankHolder'),
    };

    try {
        const { error } = await supabaseClient.from('profiles').upsert(updates);
        if (error) throw error;

        await loadInitialData();
        alert('Perfil actualizado correctamente.');
        closeProfileModal();
        renderReferrerDashboard();
    } catch (error) {
        console.error('Error actualizando perfil:', error);
        alert('Error al actualizar el perfil.');
    }
}

// Update DOM listener for Executive
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('ejecutivo.html')) {

        renderExecutiveSupport();
    }
});

// --- MESSAGING SYSTEM (TICKET CHAT) ---

// Global variables for messaging
let activeTicketId = null;

function openTicketDetail(ticketId) {
    const ticket = state.tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    activeTicketId = ticketId;
    const modal = document.getElementById('ticket-detail-modal');

    // Set Header Info
    document.getElementById('ticket-detail-subject').textContent = ticket.subject;
    document.getElementById('ticket-detail-id').textContent = ticket.id;

    // Status Badge
    const statusEl = document.getElementById('ticket-detail-status');
    statusEl.textContent = ticket.status;
    statusEl.className = `px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(ticket.status)}`;

    // Render Messages
    renderTicketMessages();

    // Show Modal
    modal.classList.remove('hidden');

    // Scroll to bottom
    setTimeout(() => {
        const container = document.getElementById('ticket-messages-container');
        if (container) container.scrollTop = container.scrollHeight;
    }, 100);
}

function closeTicketDetailModal() {
    document.getElementById('ticket-detail-modal').classList.add('hidden');
    activeTicketId = null;
}

function renderTicketMessages() {
    const container = document.getElementById('ticket-messages-container');
    if (!container || !activeTicketId) return;

    // Filter messages for this ticket
    const ticketMessages = (state.messages || [])
        .filter(m => m.ticket_id === activeTicketId)
        .sort((a, b) => new Date(a.created_at || a.timestamp) - new Date(b.created_at || b.timestamp)); // Sort by Date Ascending

    if (ticketMessages.length === 0) {
        container.innerHTML = '<p class="text-center text-slate-500 text-xs italic mt-10">No hay mensajes en esta conversación aún.</p>';
        return;
    }

    const currentUserId = state.currentUser.id;

    container.innerHTML = ticketMessages.map(msg => {
        const isMe = msg.sender_id === currentUserId;
        const time = new Date(msg.created_at || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return `
            <div class="flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in">
                <div class="max-w-[80%] ${isMe ? 'bg-aviation-purple text-white rounded-tr-none' : 'bg-white/10 text-slate-200 rounded-tl-none'} p-4 rounded-2xl shadow-md">
                    <p class="text-sm leading-relaxed">${msg.text}</p>
                    <div class="flex items-center justify-end gap-1 mt-1 opacity-60">
                         <span class="text-[10px]">${time}</span>
                         ${isMe ? '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>' : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function sendTicketReply(event) {
    event.preventDefault();
    if (!activeTicketId) return;

    const input = document.getElementById('ticket-reply-input');
    const text = input.value.trim();
    if (!text) return;

    input.value = ''; // Clear input immediately (Optimistic UI)

    // Create optimistic message
    const tempMsg = {
        id: 'temp-' + Date.now(),
        ticket_id: activeTicketId,
        sender_id: state.currentUser.id,
        text: text,
        created_at: new Date().toISOString()
    };

    // Add to local state and render immediately
    if (!state.messages) state.messages = [];
    state.messages.push(tempMsg);
    renderTicketMessages();

    // Scroll to bottom
    const container = document.getElementById('ticket-messages-container');
    if (container) container.scrollTop = container.scrollHeight;

    try {
        const { error } = await supabaseClient
            .from('messages')
            .insert([{
                ticket_id: activeTicketId,
                sender_id: state.currentUser.id,
                text: text
            }]);

        if (error) throw error;

        // Background Refresh to get real ID and timestamp
        await loadInitialData();
        renderTicketMessages(); // Re-render with confirmed data

    } catch (error) {
        console.error('Error sending reply:', error);
        alert('Error al enviar mensaje. ' + error.message);
        // Remove optimistic message on error? or show retry? Simple for now:
        state.messages = state.messages.filter(m => m.id !== tempMsg.id);
        renderTicketMessages();
    }
}

// Helper for status colors
function getStatusColor(status) {
    switch (status) {
        case 'Abierto': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        case 'En Proceso': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        case 'Resuelto': return 'bg-green-500/10 text-green-400 border-green-500/20';
        case 'Cerrado': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        default: return 'bg-white/10 text-white border-white/20';
    }
}

// --- ADMIN TRANSACTIONS LOGIC ---

function renderAdminTransactions() {
    const tbody = document.getElementById('admin-transactions-body');
    const searchVal = document.getElementById('transaction-search')?.value.toLowerCase() || '';

    if (!tbody) return;

    // Filter and Join Data
    let flights = state.flights.map(f => {
        const lead = state.leads.find(l => l.id == f.lead_id);
        const ref = lead ? state.users.find(u => u.id === lead.referrer_id) : null;
        const exec = ref ? state.users.find(u => u.id === ref.assigned_exec_id) : null;
        return { ...f, lead, ref, exec };
    });

    if (searchVal) {
        flights = flights.filter(f =>
            (f.lead?.name || '').toLowerCase().includes(searchVal) ||
            (f.region || '').toLowerCase().includes(searchVal)
        );
    }

    // Sort by Date Descending
    flights.sort((a, b) => new Date(b.flight_date || b.created_at) - new Date(a.flight_date || a.created_at));

    if (flights.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-12 text-center text-slate-500">No se encontraron transacciones.</td></tr>';
        return;
    }

    tbody.innerHTML = flights.map(f => {
        const isPaid = f.payment_status === 'paid';
        return `
            <tr class="hover:bg-white/[0.03] transition-colors border-b border-white/5">
                <td class="px-8 py-6 text-slate-300 font-mono text-xs">${f.flight_date || f.created_at?.split('T')[0]}</td>
                <td class="px-8 py-6 font-bold text-white">${f.lead?.name || 'Eliminado'}</td>
                <td class="px-8 py-6 text-slate-400 text-xs">${f.ref?.name || '-'}</td>
                <td class="px-8 py-6 text-slate-400 text-xs">${f.exec?.name || '-'}</td>
                <td class="px-8 py-6 text-right font-mono text-green-400 font-bold">$${Number(f.amount).toLocaleString()}</td>
                <td class="px-8 py-6 text-center">
                    <span class="px-2 py-1 rounded text-[10px] font-bold uppercase ${isPaid ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-500'}">
                        ${isPaid ? 'Pagado' : 'Pendiente'}
                    </span>
                </td>
                <td class="px-8 py-6 text-right">
                    <button onclick="openEditFlightModal(${f.id})" class="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-2 rounded-lg transition-all mr-2" title="Editar Vuelo">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button onclick="deleteFlight(${f.id})" class="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all" title="Eliminar Vuelo">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Global variable for current editing flight
let currentEditingFlightId = null;

function openEditFlightModal(flightId) {
    const flight = state.flights.find(f => f.id == flightId);
    if (!flight) return;

    currentEditingFlightId = flightId;

    // Populate form
    document.getElementById('edit-flight-id').value = flightId;
    document.getElementById('edit-flight-date').value = flight.flight_date || flight.created_at?.split('T')[0];
    document.getElementById('edit-flight-region').value = flight.region;
    document.getElementById('edit-flight-amount').value = flight.amount;
    document.getElementById('edit-flight-status').value = flight.payment_status || 'pending';

    document.getElementById('edit-flight-modal').classList.remove('hidden');
}

function closeEditFlightModal() {
    document.getElementById('edit-flight-modal').classList.add('hidden');
    currentEditingFlightId = null;
}

async function updateFlight(event) {
    event.preventDefault();
    if (!currentEditingFlightId) return;

    const date = document.getElementById('edit-flight-date').value;
    const region = document.getElementById('edit-flight-region').value;
    const amount = document.getElementById('edit-flight-amount').value;
    const status = document.getElementById('edit-flight-status').value;

    try {
        const { error } = await supabaseClient
            .from('flights')
            .update({
                flight_date: date,
                region: region,
                amount: amount,
                payment_status: status
            })
            .eq('id', currentEditingFlightId);

        if (error) throw error;

        alert('Vuelo actualizado correctamente.');
        closeEditFlightModal();
        await loadInitialData();
        renderAdminTransactions();

    } catch (error) {
        console.error('Error updating flight:', error);
        alert('Error al actualizar vuelo: ' + error.message);
    }
}

async function deleteFlight(flightId) {
    if (!confirm('¿Estás seguro de ELIMINAR este vuelo permanentemente? Esta acción afectará las comisiones calculadas.')) return;

    try {
        const { error } = await supabaseClient
            .from('flights')
            .delete()
            .eq('id', flightId);

        if (error) throw error;

        alert('Vuelo eliminado correctamente.');
        await loadInitialData();
        renderAdminTransactions();
    } catch (error) {
        console.error('Error deleting flight:', error);
        alert('Error al eliminar vuelo: ' + error.message);
    }
}


// Logout Logic
async function logout() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) console.warn('Supabase SignOut Error:', error);

        localStorage.clear();
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout error:', error);
        localStorage.clear();
        window.location.href = 'login.html';
    }
}

// Bind Logout Button
// Bind Logout Button & other global listeners
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});

/**
 * REVENUE DASHBOARD LOGIC
 */
function renderRevenueDashboard() {
    const startInput = document.getElementById('revenue-start-date');
    const endInput = document.getElementById('revenue-end-date');

    // Default to current month if empty
    if (!startInput.value) {
        const date = new Date();
        startInput.value = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    }
    if (!endInput.value) {
        endInput.value = new Date().toISOString().split('T')[0];
    }

    const report = calculatePlatformRevenue(startInput.value, endInput.value);

    // Update KPIs
    const kpiStd = document.getElementById('kpi-revenue-standard');
    const kpiB2b = document.getElementById('kpi-revenue-b2b');
    const kpiTotal = document.getElementById('kpi-revenue-total');

    if (kpiStd) kpiStd.textContent = '$' + report.totalStandard.toLocaleString();
    if (kpiB2b) kpiB2b.textContent = '$' + report.totalB2B.toLocaleString();
    if (kpiTotal) kpiTotal.textContent = '$' + report.total.toLocaleString();

    // Render Table
    const tbody = document.getElementById('revenue-table-body');
    if (tbody) {
        tbody.innerHTML = report.transactions.map(t => `
            <tr class="hover:bg-white/[0.02] border-b border-white/5 text-[10px]">
                <td class="px-6 py-4 text-slate-300">${t.date}</td>
                <td class="px-6 py-4 font-bold text-white">${t.leadName}</td>
                <td class="px-6 py-4 text-slate-300">${t.referrerName} (${t.referrerCategory})</td>
                <td class="px-6 py-4 text-slate-300">${t.region} / ${t.tier}</td>
                <td class="px-6 py-4 font-bold text-aviation-purple">$${t.amount.toLocaleString()}</td>
            </tr>
        `).join('') || '<tr><td colspan="5" class="px-6 py-8 text-center text-slate-500 italic">No hay transacciones en este periodo.</td></tr>';
    }
}

function calculatePlatformRevenue(startStr, endStr) {
    const startDate = new Date(startStr);
    const endDate = new Date(endStr);
    // Fix timezone offset for inclusive comparison
    endDate.setHours(23, 59, 59, 999);

    const transactions = [];
    let totalStandard = 0;
    let totalB2B = 0;

    // Filter leads that are "won" or have flights
    console.log('[Revenue] Total Leads:', state.leads ? state.leads.length : 0);
    console.log('[Revenue] Total Commission Settings:', state.commissions ? state.commissions.length : 0);

    const wonLeads = (state.leads || []).filter(l => {
        // Debug status casing
        const status = (l.status || '').toLowerCase();
        // User Request: Consider ONLY 'ACTIVO' (DB values migrated to this)
        const isWon = status === 'activo';

        if (!isWon) return false;

        const d = new Date(l.created_at);
        return d >= startDate && d <= endDate;
    });

    console.log('[Revenue] Won Leads in Date Range:', wonLeads.length);


    wonLeads.forEach(lead => {
        const referrer = state.users.find(u => u.id === lead.referrer_id);
        const refCategory = referrer ? (referrer.referrer_category || 'standard') : 'standard';

        // Determine Platform Rate Category
        const platformCategory = refCategory === 'b2b' ? 'platform_b2b' : 'platform_standard';

        // Find Rate
        const tier = referrer ? (referrer.tier || 'Platinum') : 'Platinum';

        // Dynamic Region logic: try to match ANY region first since our demo might not have region data
        // If lead has region, use it. If not, use first available region in settings just to show data (Mock behavior)
        // In Prod: lead.region should be mandatory.
        let region = lead.region || 'Europa y Asia';

        // Debug matching
        // console.log(`[Revenue] Processing Lead: ${lead.name}, Ref: ${refCategory}, Tier: ${tier}, Region: ${region}`);

        let rateSetting = state.commissions.find(c => c.category === platformCategory && c.tier === tier && c.region === region);

        // FALLBACK FOR DEMO: If specific region not found, try to find ANY rate for this tier/category to avoid $0
        if (!rateSetting) {
            rateSetting = state.commissions.find(c => c.category === platformCategory && c.tier === tier);
            if (rateSetting) region = rateSetting.region; // Update region for display
        }

        const amount = rateSetting ? Number(rateSetting.amount) : 0;

        if (amount > 0) {
            if (refCategory === 'b2b') totalB2B += amount;
            else totalStandard += amount;

            transactions.push({
                date: new Date(lead.created_at).toLocaleDateString(),
                leadName: lead.name,
                referrerName: referrer ? referrer.name : 'Desconocido',
                referrerCategory: refCategory === 'b2b' ? 'B2B' : 'Standard',
                region: region,
                tier: tier,
                amount: amount
            });
        }
    });

    return {
        transactions,
        totalStandard,
        totalB2B,
        total: totalStandard + totalB2B
    };
}

function exportRevenueCSV() {
    const start = document.getElementById('revenue-start-date').value;
    const end = document.getElementById('revenue-end-date').value;
    const report = calculatePlatformRevenue(start, end);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Fecha,Vuelo,Referidor,Categoria,Region,Nivel,Monto Plataforma\n";

    report.transactions.forEach(t => {
        const row = `${t.date},"${t.leadName}","${t.referrerName}",${t.referrerCategory},"${t.region}",${t.tier},${t.amount}`;
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ingresos_plataforma_${start}_${end}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
