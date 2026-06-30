// Set to keep track of currently active toast messages to prevent duplicates (spam prevention)
const activeToasts = new Set();

/**
 * Displays a beautiful Neo-Brutalism toast notification on the screen.
 * @param {string} message The message content to show.
 * @param {'error' | 'success' | 'warning' | 'info'} type The type of toast.
 * @param {number} duration Duration in milliseconds before it auto-dismisses.
 */
export function showToast(message, type = 'error', duration = 5000, title = '') {
    if (!message) return;

    // Check if a toast with this exact message is already active
    if (activeToasts.has(message)) {
        return;
    }

    // Add to active toasts
    activeToasts.add(message);

    // Get or create toast container
    let container = document.getElementById('neo-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'neo-toast-container';
        document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `neo-toast neo-toast-${type}`;

    // Select icon SVG based on toast type
    let iconSvg = '';
    let titleText = '';

    if (type === 'error') {
        const isConnectionError = message.includes('Mất kết nối');
        titleText = title || (isConnectionError ? 'MẤT KẾT NỐI SERVER' : 'LỖI');
        if (isConnectionError) {
            iconSvg = `
                <svg class="neo-toast-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.5M5 12.5a10.94 10.94 0 0 1 5.83-2.84M8.53 16.03a6.83 6.83 0 0 1 2-1.03M12 20h.01M16.29 16.29a6.8 6.8 0 0 1-4.29 1.21"></path>
                </svg>
            `;
        } else {
            iconSvg = `
                <svg class="neo-toast-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
            `;
        }
    } else if (type === 'warning') {
        titleText = title || 'CẢNH BÁO';
        iconSvg = `
            <svg class="neo-toast-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
        `;
    } else if (type === 'success') {
        titleText = title || 'THÀNH CÔNG';
        iconSvg = `
            <svg class="neo-toast-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        `;
    } else {
        titleText = title || 'THÔNG BÁO';
        iconSvg = `
            <svg class="neo-toast-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
        `;
    }

    // Set inner HTML of toast
    toast.innerHTML = `
        <div class="neo-toast-main">
            <div class="neo-toast-icon-wrapper">
                ${iconSvg}
            </div>
            <div class="neo-toast-content">
                <div class="neo-toast-title">${titleText}</div>
                <div class="neo-toast-message">${message}</div>
            </div>
            <button class="neo-toast-close" aria-label="Close message">✕</button>
        </div>
        <div class="neo-toast-progress">
            <div class="neo-toast-progress-fill" style="animation-duration: ${duration}ms;"></div>
        </div>
    `;

    // Append to container
    container.appendChild(toast);

    // Setup dismiss animations and removal
    let autoDismissTimer;
    
    const dismissToast = () => {
        if (autoDismissTimer) clearTimeout(autoDismissTimer);
        
        // Add slide-out class for animation
        toast.classList.add('neo-toast-leave');
        
        // Wait for exit animation to finish before removing from DOM
        toast.addEventListener('animationend', (e) => {
            if (e.animationName === 'neoToastSlideOut') {
                toast.remove();
                activeToasts.delete(message);
                
                // Clean up container if empty
                if (container.childNodes.length === 0) {
                    container.remove();
                }
            }
        });
    };

    // Close button handler
    const closeBtn = toast.querySelector('.neo-toast-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dismissToast();
        });
    }

    // Auto dismiss timer
    autoDismissTimer = setTimeout(() => {
        dismissToast();
    }, duration);
}
