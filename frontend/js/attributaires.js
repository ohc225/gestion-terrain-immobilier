// État de la page
let state = {
    attributaires: [],
    ilotsLots: [],
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    filters: {
        search: '',
        typePersonne: '',
        nationalite: ''
    }
};

// Éléments du DOM
const elements = {
    searchInput: document.getElementById('searchAttributaire'),
    filterTypePersonne: document.getElementById('filterTypePersonne'),
    filterNationalite: document.getElementById('filterNationalite'),
    tableBody: document.getElementById('attributairesTableBody'),
    prevPageBtn: document.getElementById('prevPage'),
    nextPageBtn: document.getElementById('nextPage'),
    startCount: document.getElementById('startCount'),
    endCount: document.getElementById('endCount'),
    totalCount: document.getElementById('totalCount'),
    modal: document.getElementById('attributaireModal'),
    modalForm: document.getElementById('attributaireForm')
};

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM Content Loaded - Attributaires');
    await loadIlotsLots();
    await loadAttributaires();
    setupEventListeners();
    await loadFilters();
    setupTypePersonneChange();
});

// Chargement des ilots/lots
async function loadIlotsLots() {
    try {
        const response = await window.app.api.get('/ilots-lots');
        state.ilotsLots = response;
        updateIlotsLotsSelect();
    } catch (error) {
        window.app.notifications.show('Erreur lors du chargement des ilots/lots', 'error');
    }
}

// Mise à jour du select des ilots/lots
function updateIlotsLotsSelect() {
    const ilotsLotsSelect = elements.modalForm.elements['ilotsLotsId'];
    const options = [
        '<option value="">Sélectionner un ilot/lot</option>',
        ...state.ilotsLots.map(il => 
            `<option value="${il.id}">${il.ilot} / ${il.lot} (${il.usage})</option>`
        )
    ];
    ilotsLotsSelect.innerHTML = options.join('');
}

// Chargement des attributaires
async function loadAttributaires() {
    try {
        const response = await window.app.api.get('/attributaires');
        state.attributaires = response;
        state.totalItems = response.length;
        updateTable();
        updatePagination();
    } catch (error) {
        window.app.notifications.show('Erreur lors du chargement des attributaires', 'error');
    }
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    console.log('Setting up event listeners - Attributaires');
    
    // Bouton Nouvel Attributaire
    const btnNewAttributaire = document.getElementById('btnNewAttributaire');
    if (btnNewAttributaire) {
        console.log('Found New Attributaire button');
        btnNewAttributaire.addEventListener('click', () => {
            console.log('Opening attributaire modal...');
            openAttributaireModal();
        });
    }

    // Type de personne change
    const typePersonneSelect = elements.modalForm?.elements['typePersonne'];
    if (typePersonneSelect) {
        typePersonneSelect.addEventListener('change', handleTypePersonneChange);
    }

    // Recherche et filtres
    elements.searchInput?.addEventListener('input', e => {
        state.filters.search = e.target.value;
        state.currentPage = 1;
        updateTable();
        updatePagination();
    });

    elements.filterTypePersonne?.addEventListener('change', e => {
        state.filters.typePersonne = e.target.value;
        state.currentPage = 1;
        updateTable();
        updatePagination();
    });

    elements.filterNationalite?.addEventListener('change', e => {
        state.filters.nationalite = e.target.value;
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
        const totalPages = Math.ceil(filterAttributaires().length / state.itemsPerPage);
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
    const filteredAttributaires = filterAttributaires();
    
    elements.tableBody.innerHTML = '';
    
    filteredAttributaires.slice(start, end).forEach(attributaire => {
        const ilotLot = state.ilotsLots.find(il => il.id === attributaire.ilotsLotsId);
        const nomComplet = attributaire.typePersonne === 'Morale' 
            ? attributaire.denomination 
            : `${attributaire.civilite || ''} ${attributaire.nom} ${attributaire.prenom || ''}`.trim();
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${nomComplet}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">${attributaire.typePersonne}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">
                    ${attributaire.telephoneMobile}<br>
                    ${attributaire.email || ''}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">
                    ${ilotLot ? `${ilotLot.ilot} / ${ilotLot.lot}` : 'N/A'}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">${attributaire.nationalite}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="editAttributaire(${attributaire.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteAttributaire(${attributaire.id})" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        elements.tableBody.appendChild(row);
    });
}

// Filtrage des attributaires
function filterAttributaires() {
    return state.attributaires.filter(attributaire => {
        const searchText = `${attributaire.nom} ${attributaire.prenom || ''} ${attributaire.denomination || ''} ${attributaire.telephoneMobile}`.toLowerCase();
        const matchSearch = searchText.includes(state.filters.search.toLowerCase());
        const matchType = !state.filters.typePersonne || attributaire.typePersonne === state.filters.typePersonne;
        const matchNationalite = !state.filters.nationalite || attributaire.nationalite === state.filters.nationalite;
        
        return matchSearch && matchType && matchNationalite;
    });
}

// Mise à jour de la pagination
function updatePagination() {
    if (!elements.startCount || !elements.endCount || !elements.totalCount) return;
    
    const filteredTotal = filterAttributaires().length;
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
    if (!elements.filterNationalite) return;
    
    const nationalites = [...new Set(state.attributaires.map(a => a.nationalite))];
    elements.filterNationalite.innerHTML = '<option value="">Toutes les nationalités</option>' +
        nationalites.map(n => `<option value="${n}">${n}</option>`).join('');
}

// Gestion du type de personne
function handleTypePersonneChange() {
    const typePersonne = elements.modalForm.elements['typePersonne'].value;
    const denominationField = document.querySelector('.denomination-field');
    const registreCommerceField = document.querySelector('.registre-commerce-field');
    const personnePhysiqueFields = document.querySelectorAll('.personne-physique-field');

    if (typePersonne === 'Morale') {
        denominationField?.classList.remove('hidden');
        registreCommerceField?.classList.remove('hidden');
        personnePhysiqueFields.forEach(el => el?.classList.add('hidden'));
    } else {
        denominationField?.classList.add('hidden');
        registreCommerceField?.classList.add('hidden');
        personnePhysiqueFields.forEach(el => el?.classList.remove('hidden'));
    }
}

// Initial setup for type personne fields
function setupTypePersonneChange() {
    handleTypePersonneChange();
}

// Gestion du formulaire
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const attributaire = Object.fromEntries(formData.entries());
    
    try {
        if (attributaire.id) {
            await window.app.api.put(`/attributaires/${attributaire.id}`, attributaire);
            window.app.notifications.show('Attributaire mis à jour avec succès');
        } else {
            await window.app.api.post('/attributaires', attributaire);
            window.app.notifications.show('Attributaire créé avec succès');
        }
        
        closeAttributaireModal();
        await loadAttributaires();
    } catch (error) {
        window.app.notifications.show('Erreur lors de l\'enregistrement', 'error');
    }
}

// Fonctions modales
function openAttributaireModal(attributaire = null) {
    console.log('Opening attributaire modal function called');
    if (!elements.modal || !elements.modalForm) {
        console.error('Modal elements not found');
        return;
    }

    const form = elements.modalForm;
    form.reset();

    if (attributaire) {
        document.getElementById('modalTitle').textContent = 'Modifier l\'Attributaire';
        Object.entries(attributaire).forEach(([key, value]) => {
            const input = form.elements[key];
            if (input) {
                input.value = value;
            }
        });
    } else {
        document.getElementById('modalTitle').textContent = 'Nouvel Attributaire';
    }

    console.log('Showing modal');
    requestAnimationFrame(() => {
        elements.modal.classList.remove('hidden');
        requestAnimationFrame(() => {
            elements.modal.style.display = 'flex';
            elements.modal.style.alignItems = 'center';
            elements.modal.style.justifyContent = 'center';
        });
    });
    handleTypePersonneChange();
}

function closeAttributaireModal() {
    if (!elements.modal || !elements.modalForm) return;
    
    elements.modal.style.display = 'none';
    elements.modal.classList.add('hidden');
    elements.modalForm.reset();
}

// Make functions globally available
window.openAttributaireModal = openAttributaireModal;
window.closeAttributaireModal = closeAttributaireModal;
window.editAttributaire = editAttributaire;
window.deleteAttributaire = deleteAttributaire;

// Édition d'un attributaire
async function editAttributaire(id) {
    try {
        const attributaire = await window.app.api.get(`/attributaires/${id}`);
        openAttributaireModal(attributaire);
    } catch (error) {
        window.app.notifications.show('Erreur lors du chargement de l\'attributaire', 'error');
    }
}

// Suppression d'un attributaire
async function deleteAttributaire(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet attributaire ?')) {
        return;
    }

    try {
        await window.app.api.delete(`/attributaires/${id}`);
        window.app.notifications.show('Attributaire supprimé avec succès');
        await loadAttributaires();
    } catch (error) {
        window.app.notifications.show('Erreur lors de la suppression', 'error');
    }
}
