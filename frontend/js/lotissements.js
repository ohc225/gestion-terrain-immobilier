// État de la page
let state = {
    lotissements: [],
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    filters: {
        search: '',
        localite: '',
        type: ''
    }
};

// Éléments du DOM
const elements = {
    searchInput: document.getElementById('searchLotissement'),
    filterLocalite: document.getElementById('filterLocalite'),
    filterType: document.getElementById('filterType'),
    tableBody: document.getElementById('lotissementsTableBody'),
    prevPageBtn: document.getElementById('prevPage'),
    nextPageBtn: document.getElementById('nextPage'),
    startCount: document.getElementById('startCount'),
    endCount: document.getElementById('endCount'),
    totalCount: document.getElementById('totalCount'),
    modal: document.getElementById('lotissementModal'),
    modalForm: document.getElementById('lotissementForm')
};

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM Content Loaded');
    await loadLotissements();
    setupEventListeners();
    await loadFilters();
});

// Chargement des lotissements
async function loadLotissements() {
    try {
        const response = await window.app.api.get('/lotissements');
        state.lotissements = response;
        state.totalItems = response.length;
        updateTable();
        updatePagination();
    } catch (error) {
        window.app.notifications.show('Erreur lors du chargement des lotissements', 'error');
    }
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    console.log('Setting up event listeners');
    
    // Bouton Nouveau Lotissement
    const btnNewLotissement = document.getElementById('btnNewLotissement');
    if (btnNewLotissement) {
        console.log('Found New Lotissement button');
        btnNewLotissement.addEventListener('click', () => {
            console.log('Opening modal...');
            openLotissementModal();
        });
    } else {
        console.log('New Lotissement button not found');
    }

    // Recherche
    elements.searchInput?.addEventListener('input', e => {
        state.filters.search = e.target.value;
        state.currentPage = 1;
        updateTable();
        updatePagination();
    });

    // Filtres
    elements.filterLocalite?.addEventListener('change', e => {
        state.filters.localite = e.target.value;
        state.currentPage = 1;
        updateTable();
        updatePagination();
    });

    elements.filterType?.addEventListener('change', e => {
        state.filters.type = e.target.value;
        state.currentPage = 1;
        updateTable();
        updatePagination();
    });

    // Pagination
    elements.prevPageBtn?.addEventListener('click', () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            updateTable();
            updatePagination();
        }
    });

    elements.nextPageBtn?.addEventListener('click', () => {
        const totalPages = Math.ceil(filterLotissements().length / state.itemsPerPage);
        if (state.currentPage < totalPages) {
            state.currentPage++;
            updateTable();
            updatePagination();
        }
    });

    // Formulaire
    elements.modalForm?.addEventListener('submit', handleFormSubmit);
}

// Mise à jour du tableau
function updateTable() {
    if (!elements.tableBody) return;
    
    const start = (state.currentPage - 1) * state.itemsPerPage;
    const end = start + state.itemsPerPage;
    const filteredLotissements = filterLotissements();
    
    elements.tableBody.innerHTML = '';
    
    filteredLotissements.slice(start, end).forEach(lotissement => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${lotissement.nomLotissement}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">${lotissement.localite}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">${lotissement.typeLotissement}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">${window.app.formatNumber(lotissement.superficieEnHectare)}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">
                    ${lotissement.nombreIlotsTotal} ilots / ${lotissement.nombreLotsTotal} lots
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="editLotissement(${lotissement.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteLotissement(${lotissement.id})" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        elements.tableBody.appendChild(row);
    });
}

// Filtrage des lotissements
function filterLotissements() {
    return state.lotissements.filter(lotissement => {
        const matchSearch = lotissement.nomLotissement.toLowerCase().includes(state.filters.search.toLowerCase()) ||
                          lotissement.localite.toLowerCase().includes(state.filters.search.toLowerCase());
        const matchLocalite = !state.filters.localite || lotissement.localite === state.filters.localite;
        const matchType = !state.filters.type || lotissement.typeLotissement === state.filters.type;
        
        return matchSearch && matchLocalite && matchType;
    });
}

// Mise à jour de la pagination
function updatePagination() {
    if (!elements.startCount || !elements.endCount || !elements.totalCount) return;
    
    const filteredTotal = filterLotissements().length;
    const totalPages = Math.ceil(filteredTotal / state.itemsPerPage);
    const start = ((state.currentPage - 1) * state.itemsPerPage) + 1;
    const end = Math.min(start + state.itemsPerPage - 1, filteredTotal);

    elements.startCount.textContent = filteredTotal === 0 ? 0 : start;
    elements.endCount.textContent = end;
    elements.totalCount.textContent = filteredTotal;
    
    if (elements.prevPageBtn) {
        elements.prevPageBtn.disabled = state.currentPage === 1;
    }
    if (elements.nextPageBtn) {
        elements.nextPageBtn.disabled = state.currentPage === totalPages || totalPages === 0;
    }
}

// Chargement des filtres
async function loadFilters() {
    if (!elements.filterLocalite || !elements.filterType) return;
    
    const localites = [...new Set(state.lotissements.map(l => l.localite))];
    const types = [...new Set(state.lotissements.map(l => l.typeLotissement))];

    elements.filterLocalite.innerHTML = '<option value="">Toutes les localités</option>' +
        localites.map(l => `<option value="${l}">${l}</option>`).join('');
    
    elements.filterType.innerHTML = '<option value="">Tous les types</option>' +
        types.map(t => `<option value="${t}">${t}</option>`).join('');
}

// Gestion du formulaire
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const lotissement = Object.fromEntries(formData.entries());
    
    try {
        if (lotissement.id) {
            await window.app.api.put(`/lotissements/${lotissement.id}`, lotissement);
            window.app.notifications.show('Lotissement mis à jour avec succès');
        } else {
            await window.app.api.post('/lotissements', lotissement);
            window.app.notifications.show('Lotissement créé avec succès');
        }
        
        closeLotissementModal();
        await loadLotissements();
    } catch (error) {
        window.app.notifications.show('Erreur lors de l\'enregistrement', 'error');
    }
}

// Fonctions modales
function openLotissementModal(lotissement = null) {
    console.log('Opening modal function called');
    if (!elements.modal || !elements.modalForm) {
        console.error('Modal elements not found');
        return;
    }

    const form = elements.modalForm;
    form.reset();

    if (lotissement) {
        document.getElementById('modalTitle').textContent = 'Modifier le Lotissement';
        Object.entries(lotissement).forEach(([key, value]) => {
            const input = form.elements[key];
            if (input) {
                input.value = value;
            }
        });
    } else {
        document.getElementById('modalTitle').textContent = 'Nouveau Lotissement';
    }

    console.log('Showing modal');
    elements.modal.classList.remove('hidden');
    elements.modal.classList.add('flex');
}

function closeLotissementModal() {
    if (!elements.modal || !elements.modalForm) return;
    
    elements.modal.classList.add('hidden');
    elements.modal.classList.remove('flex');
    elements.modalForm.reset();
}

// Édition d'un lotissement
async function editLotissement(id) {
    try {
        const lotissement = await window.app.api.get(`/lotissements/${id}`);
        openLotissementModal(lotissement);
    } catch (error) {
        window.app.notifications.show('Erreur lors du chargement du lotissement', 'error');
    }
}

// Suppression d'un lotissement
async function deleteLotissement(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce lotissement ?')) {
        return;
    }

    try {
        await window.app.api.delete(`/lotissements/${id}`);
        window.app.notifications.show('Lotissement supprimé avec succès');
        await loadLotissements();
    } catch (error) {
        window.app.notifications.show('Erreur lors de la suppression', 'error');
    }
}

// Make functions globally available
window.openLotissementModal = openLotissementModal;
window.closeLotissementModal = closeLotissementModal;
window.editLotissement = editLotissement;
window.deleteLotissement = deleteLotissement;
