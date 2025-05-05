// Configuration API
const API_BASE_URL = 'http://localhost:5000/api';

// Utilitaires pour les appels API
const api = {
    async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            if (!response.ok) throw new Error('Erreur réseau');
            return await response.json();
        } catch (error) {
            console.error('Erreur API:', error);
            throw error;
        }
    },

    async post(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Erreur réseau');
            return await response.json();
        } catch (error) {
            console.error('Erreur API:', error);
            throw error;
        }
    },

    async put(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Erreur réseau');
            return await response.json();
        } catch (error) {
            console.error('Erreur API:', error);
            throw error;
        }
    },

    async delete(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Erreur réseau');
            return await response.json();
        } catch (error) {
            console.error('Erreur API:', error);
            throw error;
        }
    }
};

// Gestionnaire de notifications
const notifications = {
    show(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
            type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
};

// Gestionnaire d'événements pour les actions rapides
document.addEventListener('DOMContentLoaded', () => {
    // Actions rapides
    const actionButtons = {
        'Nouveau Lotissement': () => window.location.href = '/pages/lotissements.html',
        'Nouveau Lot': () => window.location.href = '/pages/ilots-lots.html',
        'Nouvel Attributaire': () => window.location.href = '/pages/attributaires.html'
    };

    document.querySelectorAll('button').forEach(button => {
        const text = button.textContent.trim();
        if (actionButtons[text]) {
            button.addEventListener('click', actionButtons[text]);
        }
    });

    // Navigation
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = e.target.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                navigateTo(href);
            }
        });
    });
});

// Fonction de navigation
function navigateTo(path) {
    window.location.href = path;
}

// Fonctions utilitaires pour la validation des formulaires
const validators = {
    required: value => !!value || 'Ce champ est requis',
    email: value => {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !value || pattern.test(value) || 'Email invalide';
    },
    phone: value => {
        const pattern = /^\+225\s\d{2}\s\d{2}\s\d{2}\s\d{4}$/;
        return !value || pattern.test(value) || 'Format téléphone invalide (+225 XX XX XX XXXX)';
    },
    date: value => {
        const date = new Date(value);
        return !value || !isNaN(date.getTime()) || 'Date invalide';
    }
};

// Fonction pour formater les dates
function formatDate(dateString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
}

// Fonction pour formater les nombres
function formatNumber(number) {
    return new Intl.NumberFormat('fr-FR').format(number);
}

// Exportation des fonctionnalités
window.app = {
    api,
    notifications,
    validators,
    formatDate,
    formatNumber
};
