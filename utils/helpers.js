export async function loadComponent(name, placeholderId) {
    try {
        const response = await fetch(`/components/${name}.html`);
        const html = await response.text();
        document.getElementById(placeholderId).innerHTML = html;
        
        // Dispatch event that component is loaded
        window.dispatchEvent(new CustomEvent('componentLoaded', { detail: { name } }));
    } catch (error) {
        console.error(`Error loading component ${name}:`, error);
    }
}

export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

export function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

export function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

export function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white z-50 transition-opacity duration-300 ${
        type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
