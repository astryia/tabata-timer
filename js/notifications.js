/**
 * Custom Notification System
 * Replaces browser alert() and confirm() with custom modals
 */

class NotificationManager {
    constructor() {
        this.modal = null;
        this.message = null;
        this.confirmBtn = null;
        this.cancelBtn = null;
        this.resolveCallback = null;
    }

    init() {
        this.modal = document.getElementById('notification-modal');
        this.message = document.getElementById('notification-message');
        this.confirmBtn = document.getElementById('notification-confirm');
        this.cancelBtn = document.getElementById('notification-cancel');

        // Set up button handlers
        this.confirmBtn.addEventListener('click', () => this.handleConfirm());
        this.cancelBtn.addEventListener('click', () => this.handleCancel());

        // Close on background click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.handleCancel();
            }
        });
    }

    /**
     * Show alert (single button, OK only)
     */
    async alert(text) {
        return new Promise((resolve) => {
            this.message.textContent = text;
            this.modal.classList.remove('alert-only');
            this.modal.classList.remove('hidden');
            
            // Hide cancel button, show only confirm as OK
            this.cancelBtn.style.display = 'none';
            this.confirmBtn.textContent = 'OK';
            
            // Set up one-time handler
            const handleOK = () => {
                this.confirmBtn.removeEventListener('click', handleOK);
                this.cancelBtn.style.display = '';
                this.confirmBtn.textContent = 'OK';
                this.hide();
                resolve();
            };
            
            this.confirmBtn.addEventListener('click', handleOK);
        });
    }

    /**
     * Show confirm dialog (two buttons, OK and Cancel)
     */
    async confirm(text) {
        return new Promise((resolve) => {
            this.resolveCallback = resolve;
            this.message.textContent = text;
            this.modal.classList.remove('alert-only');
            this.modal.classList.remove('hidden');
            
            // Show both buttons with proper labels
            this.cancelBtn.style.display = '';
            this.confirmBtn.textContent = 'OK';
        });
    }

    handleConfirm() {
        this.hide();
        if (this.resolveCallback) {
            this.resolveCallback(true);
            this.resolveCallback = null;
        }
    }

    handleCancel() {
        this.hide();
        if (this.resolveCallback) {
            this.resolveCallback(false);
            this.resolveCallback = null;
        }
    }

    hide() {
        this.modal.classList.add('hidden');
        this.modal.classList.remove('alert-only');
        // Reset button states
        this.cancelBtn.style.display = '';
        this.confirmBtn.textContent = 'OK';
    }
}

// Export singleton instance
const notificationManager = new NotificationManager();
