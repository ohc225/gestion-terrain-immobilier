// État de la page
let state = {
    ilotsLots: [],
    lotissements: [],
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    filters: {
        search: '',
        lotissement: '',
        usage: ''
    }
};

// Éléments du DOM
const elements = {
    searchInput: document.getElementById('searchIlotLot'),
    filterLotissement: document.getElementById('filterLotissement'),
    filterUsage: document.getElementById('filterUsage'),
    tableBody: document.getElementById('ilotsLotsTableBody'),
    prevPageBtn: document.getElementById('prevPage'),
    nextPageBtn: document.getElementById('nextPage'),
    startCount: document.getElementById('startCount'),
    endCount: document.getElementById('endCount'),
    totalCount: document.getElementById('totalCount'),
    modal: document.getElementById('ilotLotModal'),
    modalForm: document.getElementById('ilotLotForm')
};

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    await loadLotissements();
    await loadIlotsLots();
    setupEventListeners();
    await loadFilters();
});

// Chargement des lotissements (pour le select)
async function loadLotissements() {
    try {
        const response = await window.app.api.get('/lotissements');
        state.lotissements = response;
        updateLotissementSelect();
    } catch (error) {
        window.app.notifications.show('Erreur lors du chargement des lotissements', 'error');
    }
}

// Mise à jour du select des lotissements
function updateLotissementSelect() {
    const lotissementSelects = [
        elements.filterLotissement,
        elements.modalForm.elements['lotissementId']
    ];

    const options = [
        '<option value="">Tous les lotissements</option>',
        ...state.lotissements.map(l => 
            `<option value="${l.id}">${l.nomLotissement} (${l.localite})</option>`
        )
    ];

    lotissementSelects.forEach(select => {
        if (select) select.innerHTML = options.join('');
    });
}

// Chargement des ilots/lots
async function loadIlotsLots() {
    try {
        const response = await window.app.api.get('/ilots-lots');
        state.ilotsLots = response;
        state.totalItems = response.length;
        updateTable();
        updatePagination();
    } catch (error) {
        window.app.notifications.show('Erreur lors du chargement des ilots/lots', 'error');
    }
}

// Mise à jour du tableau
function updateTable() {
    const start = (state.currentPage - 1) * state.itemsPerPage;
    const end = start + state.itemsPerPage;
    const filteredIlotsLots = filterIlotsLots();
    
    elements.tableBody.innerHTML = '';
    
    filteredIlotsLots.slice(start, end).forEach(ilotLot => {
        const lotissement = state.lotissements.find(l => l.id === ilotLot.lotissementId);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${lotissement ? lotissement.nomLotissement : 'N/A'}</div>
                <div class="text-xs text-gray-500">${lotissement ? lotissement.localite : ''}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${ilotLot.ilot}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${ilotLot.lot}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${ilotLot.idUFCI}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${window.app.formatNumber(ilotLot.superficieEnM2)}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${ilotLot.usage}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="editIlotLot(${ilotLot.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteIlotLot(${ilotLot.id})" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        elements.tableBody.appendChild(row);
    });
}

// Filtrage des ilots/lots
function filterIlotsLots() {
    return state.ilotsLots.filter(ilotLot => {
        const lotissement = state.lotissements.find(l => l.id === ilotLot.lotissementId);
        const searchText = `${ilotLot.ilot} ${ilotLot.lot} ${ilotLot.idUFCI} ${lotissement?.nomLotissement || ''}`.toLowerCase();
        
        const matchSearch = searchText.includes(state.filters.search.toLowerCase());
        const matchLotissement = !state.filters.lotissement || ilotLot.lotissementId.toString() === state.filters.lotissement;
        const matchUsage = !state.filters.usage || ilotLot.usage === state.filters.usage;
        
        return matchSearch && matchLotissement && matchUsage;
    });
}

// Mise à jour de la pagination
function updatePagination() {
    const filteredTotal = filterIlotsLots().length;
    const totalPages = Math.ceil(filteredTotal / state.itemsPerPage);
    const start = ((state.currentPage - 1) * state.itemsPerPage) + 1;
    const end = Math.min(start + state.itemsPerPage - 1, filteredTotal);

    elements.startCount.textContent = filteredTotal === 0 ? 0 : start;
    elements.endCount.textContent = end;
    elements.totalCount.textContent = filteredTotal;
    
    elements.prevPageBtn.disabled = state.currentPage === 1;
    elements.nextPageBtn.disabled = state.currentPage === totalPages || totalPages === 0;
}

// Chargement des filtres
async function loadFilters() {
    const usages = [...new Set(state.ilotsLots.map(il => il.usage))];
    
    elements.filterUsage.innerHTML = '<option value="">Tous les usages</option>' +
        usages.map(u => `<option value="${u}">${u}</option>`).join('');
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Recherche
    elements.searchInput.addEventListener('input', e => {
        state.filters.search = e.target.value;
        state.currentPage = 1;
        updateTable();
        updatePagination();
    });

    // Filtres
    elements.filterLotissement.addEventListener('change', e => {
        state.filters.lotissement = e.target.value;
        state.currentPage = 1;
        updateTable();
        updatePagination();
    });

    elements.filterUsage.addEventListener('change', e => {
        state.filters.usage = e.target.value;
        state.currentPage = 1;
        updateTable();
        updatePagination();
    });

    // Pagination
    elements.prevPageBtn.addEventListener('click', () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            updateTable();
            updatePagination();
        }
    });

    elements.nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filterIlotsLots().length / state.itemsPerPage);
        if (state.currentPage < totalPages) {
            state.currentPage++;
            updateTable();
            updatePagination();
        }
    });

    // Formulaire
    elements.modalForm.addEventListener('submit', handleFormSubmit);
}

// Gestion du formulaire
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const ilotLot = Object.fromEntries(formData.entries());
    
    try {
        if (ilotLot.id) {
            await window.app.api.put(`/ilots-lots/${ilotLot.id}`, ilotLot);
            window.app.notifications.show('Ilot/Lot mis à jour avec succès');
        } else {
            await window.app.api.post('/ilots-lots', ilotLot);
            window.app.notifications.show('Ilot/Lot créé avec succès');
        }
        
        closeIlotLotModal();
        await loadIlotsLots();
    } catch (error) {
        window.app.notifications.show('Erreur lors de l\'enregistrement', 'error');
    }
}

// Fonctions modales
function openIlotLotModal(ilotLot = null) {
    const form = elements.modalForm;
    form.reset();

    if (ilotLot) {
        document.getElementById('modalTitle').textContent = 'Modifier l\'Ilot/Lot';
        Object.entries(ilotLot).forEach(([key, value]) => {
            const input = form.elements[key];
            if (input) {
                input.value = value;
            }
        });
    } else {
        document.getElementById('modalTitle').textContent = 'Nouveau Ilot/Lot';
    }

    elements.modal.classList.remove('hidden');
}

function closeIlotLotModal() {
    elements.modal.classList.add('hidden');
    elements.modalForm.reset();
}

// Édition d'un ilot/lot
async function editIlotLot(id) {
    try {
        const ilotLot = await window.app.api.get(`/ilots-lots/${id}`);
        openIlotLotModal(ilotLot);
    } catch (error) {
        window.app.notifications.show('Erreur lors du chargement de l\'ilot/lot', 'error');
    }
}

// Suppression d'un ilot/lot
async function deleteIlotLot(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet ilot/lot ?')) {
        return;
    }

    try {
        await window.app.api.delete(`/ilots-lots/${id}`);
        window.app.notifications.show('Ilot/Lot supprimé avec succès');
        await loadIlotsLots();
    } catch (error) {
        window.app.notifications.show('Erreur lors de la suppression', 'error');
    }
}

// Bouton Nouveau Ilot/Lot
document.getElementById('btnNewIlotLot').addEventListener('click', () => {
    openIlotLotModal();
});
