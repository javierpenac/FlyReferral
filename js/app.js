// Supabase Configuration
const SUPABASE_URL = 'https://vbjuwbwwabctmyyzlzuu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_c8uJYXuq1clJ_LXS72ZkkA_GfLokXSI';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Estado Global Simulado (Ahora dinámico con Supabase)
 */
let state = {
    currentUser: {
        id: localStorage.getItem('user_id'),
        name: localStorage.getItem('user_name'),
        role: localStorage.getItem('user_role')
    },
    users: [],
    leads: [],
    faqs: [],
    tips: [],
    tickets: [],
    messages: []
};

// Cargar datos iniciales desde Supabase
async function loadInitialData() {
    try {
        const { data: faqs } = await supabaseClient.from('faqs').select('*');
        const { data: tips } = await supabaseClient.from('tips').select('*');
        if (faqs) state.faqs = faqs;
        if (tips) state.tips = tips;

        if (state.currentUser.id) {
            const { data: profiles } = await supabaseClient.from('profiles').select('*');
            if (profiles) state.users = profiles;

            // Cargar tickets y mensajes
            const { data: tickets } = await supabaseClient.from('tickets').select('*');
            const { data: messages } = await supabaseClient.from('messages').select('*');
            if (tickets) state.tickets = tickets;
            if (messages) state.messages = messages;

            // Cargar leads según rol
            if (state.currentUser.role === 'referidor') {
                const { data: leads } = await supabaseClient.from('leads').select('*').eq('referrer_id', state.currentUser.id);
                if (leads) state.leads = leads;
            } else if (state.currentUser.role === 'ejecutivo') {
                const { data: leads } = await supabaseClient.from('leads').select('*'); // RLS se encarga del filtro
                if (leads) state.leads = leads;
            } else {
                const { data: leads } = await supabaseClient.from('leads').select('*');
                if (leads) state.leads = leads;
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
 * DASHBOARD REFERIDOR
 * Solo ve sus propios leads y quién es su ejecutivo asignado.
 */
function renderReferrerDashboard() {
    const referrer = state.users.find(u => u.id === state.currentUser.id);
    if (!referrer) return;

    // Mostrar Ejecutivo Asignado
    const exec = state.users.find(u => u.id === referrer.assigned_exec_id);
    const supportInfo = document.getElementById('support-exec-info');
    if (supportInfo && exec) {
        supportInfo.innerHTML = `
            <div class="flex items-center gap-3 p-4 glass rounded-2xl border border-aviation-purple/20">
                <div class="w-10 h-10 rounded-full bg-aviation-purple/10 flex items-center justify-center text-aviation-purple font-bold border border-aviation-purple/30">
                    ${exec.name ? exec.name[0] : '?'}
                </div>
                <div>
                    <p class="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Ejecutivo Asignado</p>
                    <p class="text-xs font-bold text-white">${exec.name}</p>
                    <p class="text-[10px] text-aviation-purple">${exec.email || ''}</p>
                </div>
            </div>
        `;
    }

    // Filtrar Leads Propios
    const leadsBody = document.getElementById('leads-table-body');
    if (leadsBody) {
        if (state.leads.length === 0) {
            leadsBody.innerHTML = '<tr><td colspan="4" class="px-6 py-12 text-center text-slate-500">Aún no has registrado ningún referido.</td></tr>';
        } else {
            leadsBody.innerHTML = state.leads.map(lead => `
                <tr class="hover:bg-white/5 transition-colors border-b border-white/5">
                    <td class="px-6 py-4 font-semibold text-white">${lead.name}</td>
                    <td class="px-6 py-4 text-slate-400">${lead.company || ''}</td>
                    <td class="px-6 py-4">
                        <span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase ${lead.status === 'Cerrado' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}">
                            ${lead.status}
                        </span>
                    </td>
                    <td class="px-6 py-4 font-mono text-aviation-purple text-right">$${lead.commission || '0.00'}</td>
                </tr>
            `).join('');
        }
    }
}

/**
 * CONSOLA EJECUTIVO
 * SEGMENTACIÓN: Solo ve referidores que tiene asignados.
 */
function renderExecutive() {
    const execId = state.currentUser.id;

    // 1. Filtrar Referidores de este Ejecutivo
    const myReferrers = state.users.filter(u => u.role === 'referidor' && u.assigned_exec_id === execId);
    const myReferrerIds = myReferrers.map(r => r.id);

    // 2. Filtrar Leads de esos Referidores
    const myLeads = state.leads.filter(l => myReferrerIds.includes(l.referrer_id));

    // Renderizar Leads
    const leadsBody = document.getElementById('executive-leads-body');
    if (leadsBody) {
        leadsBody.innerHTML = myLeads.map(lead => {
            const ref = myReferrers.find(r => r.id === lead.referrer_id);
            return `
                <tr class="hover:bg-white/[0.03] transition-colors border-b border-white/5">
                    <td class="px-8 py-6">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-white/5">
                                ${ref ? ref.name[0] : '?'}
                            </div>
                            <div>
                                <p class="font-bold text-white text-xs">${ref ? ref.name : 'Desconocido'}</p>
                                <span class="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Nivel ${ref ? ref.tier : 'Bronce'}</span>
                            </div>
                        </div>
                    </td>
                    <td class="px-8 py-6">
                        <p class="font-bold text-white text-sm">${lead.name}</p>
                        <p class="text-xs text-slate-500">${lead.company || ''}</p>
                    </td>
                    <td class="px-8 py-6 text-right font-mono text-white text-sm font-bold">$${lead.commission || '0.00'}</td>
                </tr>
            `;
        }).join('');
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
                    <span class="px-3 py-1 bg-aviation-purple/10 text-aviation-purple border border-aviation-purple/20 rounded-full text-[10px] font-bold uppercase">${ref.tier || 'Bronce'}</span>
                    <button class="text-slate-500 hover:text-white transition-colors" onclick="alert('Ver perfil detallado de ${ref.name}')">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                    </button>
                </div>
            </div>
        `).join('');
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
                        <span class="text-[10px] font-bold uppercase tracking-widest ${u.role === 'admin' ? 'text-red-500' : u.role === 'ejecutivo' ? 'text-blue-400' : 'text-slate-400'}">
                            ${u.role}
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
    const orphans = state.users.filter(u => u.role === 'referidor' && !u.assignedExecId);
    const orphanCountEl = document.getElementById('orphan-alert-count');
    if (orphanCountEl) {
        orphanCountEl.textContent = orphans.length;
        document.getElementById('orphan-alert-box').style.display = orphans.length > 0 ? 'flex' : 'none';
    }
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
}

function populateExecSelect() {
    const select = document.getElementById('assigned-exec-select');
    if (select) {
        const executives = state.users.filter(u => u.role === 'ejecutivo');
        select.innerHTML = '<option value="">Seleccionar Ejecutivo...</option>' +
            executives.map(e => `<option value="${e.id}">${e.name}</option>`).join('');
    }
}

function filterOrphans() {
    const usersBody = document.getElementById('admin-users-body');
    const orphans = state.users.filter(u => u.role === 'referidor' && !u.assignedExecId);
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
    const user = state.users.find(u => u.id === userId);
    if (!user) return;

    document.getElementById('user-modal').classList.remove('hidden');
    const form = document.querySelector('#user-modal form');
    form.querySelector('[name="name"]').value = user.name || '';
    form.querySelector('[name="email"]').value = user.email || '';

    const roleRadio = form.querySelector(`input[name="role"][value="${user.role}"]`);
    if (roleRadio) roleRadio.checked = true;

    toggleExecSelector(user.role);

    if (user.role === 'referidor') {
        setTimeout(() => {
            const select = document.getElementById('assigned-exec-select');
            if (select) select.value = user.assignedExecId || "";
        }, 10);
    }
}

async function saveUser(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const role = formData.get('role');
    const email = formData.get('email');
    const name = formData.get('name');

    // Nota: En una app real, aquí usaríamos supabase.auth.admin.createUser
    // Para esta demo/MVP, simularemos que el usuario existe en auth y crearemos/actualizaremos el perfil.

    // Si es un nuevo usuario, generamos un UUID temporal (en prod lo daría Supabase Auth)
    let user = state.users.find(u => u.email === email);
    const userId = user ? user.id : self.crypto.randomUUID();

    const userData = {
        id: userId,
        name: name,
        email: email,
        role: role,
        assigned_exec_id: role === 'referidor' ? formData.get('assignedExecId') : null,
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

function executeTransfer() {
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

    const affectedReferrers = state.users.filter(u => u.assignedExecId === fromId);
    affectedReferrers.forEach(r => r.assignedExecId = toId);

    renderAdmin();
    alert(`Éxito: Se han traspasado ${affectedReferrers.length} referidores al nuevo ejecutivo.`);
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
        container.innerHTML = state.tips.map(tip => `
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
        <div class="glass p-4 rounded-xl border border-white/5 hover:bg-white/[0.02] cursor-pointer transition-all">
            <div class="flex justify-between items-start mb-1">
                <h4 class="text-white text-xs font-bold">${t.subject}</h4>
                <span class="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${t.status === 'Abierto' ? 'bg-aviation-purple/10 text-aviation-purple' : 'bg-green-500/10 text-green-400'}">
                    ${t.status}
                </span>
            </div>
            <p class="text-[10px] text-slate-500">Última actualización: ${new Date(t.last_update).toLocaleDateString()}</p>
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
            <div class="p-6 hover:bg-white/[0.02] transition-all flex items-center justify-between group border-b border-white/5 last:border-0">
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
                    <button class="text-slate-500 hover:text-white transition-colors" onclick="alert('Ver conversación completa (Simulación)')">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                    </button>
                    ${t.status === 'Abierto' ? `<button onclick="closeTicket('${t.id}')" class="text-[9px] font-bold text-green-400 uppercase hover:underline">Cerrar</button>` : ''}
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

// CMS Logic
let activeCMSType = 'faq';

function openExecCMSModal(type) {
    activeCMSType = type;
    document.getElementById('cms-modal').classList.remove('hidden');
    document.getElementById('cms-modal-title').textContent = type === 'faq' ? 'Gestión de FAQ' : 'Gestión de Sales Enablement';
    renderCMSItems();
}

function closeCMSModal() {
    document.getElementById('cms-modal').classList.add('hidden');
}

function renderCMSItems() {
    const list = document.getElementById('cms-items-list');
    const items = activeCMSType === 'faq' ? state.faqs : state.tips;

    list.innerHTML = items.map(item => `
        <div class="glass p-4 rounded-2xl border border-white/5 space-y-3">
            <input type="text" value="${activeCMSType === 'faq' ? item.question : item.title}" onchange="updateCMSValue('${item.id}', 'title', this.value)" 
                class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-bold text-sm focus:border-aviation-purple outline-none">
            <textarea onchange="updateCMSValue('${item.id}', 'content', this.value)" 
                class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-slate-400 text-xs focus:border-aviation-purple outline-none" rows="2">${activeCMSType === 'faq' ? item.answer : item.content}</textarea>
            <div class="flex justify-end">
                <button onclick="deleteCMSItem('${item.id}')" class="text-[9px] text-red-500 font-bold uppercase hover:underline">Eliminar</button>
            </div>
        </div>
    `).join('');
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
    document.getElementById('profile-bank-holder').value = user.bankHolder || '';

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
