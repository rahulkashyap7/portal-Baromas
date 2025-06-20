// Admin Panel with API Integration
class AdminPanelAPI {
    constructor() {
        this.apiBase = 'http://localhost:3000/api';
        this.bookings = [];
        this.stats = {};
        this.init();
    }

    async init() {
        await this.loadStats();
        await this.loadBookings();
        this.setupEventListeners();
        this.updateUI();
    }

    async loadStats() {
        try {
            const response = await fetch(`${this.apiBase}/stats`);
            if (response.ok) {
                this.stats = await response.json();
            }
        } catch (error) {
            console.error('Error loading stats:', error);
            this.stats = {
                total_bookings: 0,
                confirmed_bookings: 0,
                pending_bookings: 0,
                total_revenue: 0
            };
        }
    }

    async loadBookings(filters = {}) {
        try {
            const params = new URLSearchParams(filters);
            const response = await fetch(`${this.apiBase}/bookings?${params}`);
            if (response.ok) {
                this.bookings = await response.json();
            } else {
                this.bookings = [];
            }
        } catch (error) {
            console.error('Error loading bookings:', error);
            this.bookings = [];
        }
    }

    setupEventListeners() {
        // Apply filters button
        document.getElementById('apply-filters').addEventListener('click', () => {
            this.applyFilters();
        });

        // Clear filters button
        document.getElementById('clear-filters').addEventListener('click', () => {
            this.clearFilters();
        });

        // Export CSV button
        document.getElementById('export-bookings').addEventListener('click', () => {
            this.exportBookings();
        });

        // Close modal
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeModal();
        });

        // Modal overlay
        document.getElementById('modal-overlay').addEventListener('click', () => {
            this.closeModal();
        });

        // Delete all bookings button
        document.getElementById('delete-all-bookings').addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete ALL bookings? This action cannot be undone.')) {
                try {
                    const response = await fetch(`${this.apiBase}/bookings`, { method: 'DELETE' });
                    if (response.ok) {
                        alert('All bookings deleted successfully.');
                        await this.loadStats();
                        await this.loadBookings();
                        this.updateUI();
                    } else {
                        alert('Failed to delete bookings.');
                    }
                } catch (error) {
                    alert('Error deleting bookings.');
                }
            }
        });
    }

    async applyFilters() {
        const status = document.getElementById('status-filter').value;
        const tent = document.getElementById('tent-filter').value;
        const fromDate = document.getElementById('from-date').value;
        const toDate = document.getElementById('to-date').value;

        const filters = {};
        if (status) filters.status = status;
        if (tent) filters.tent_id = tent;
        if (fromDate) filters.from_date = fromDate;
        if (toDate) filters.to_date = toDate;

        await this.loadBookings(filters);
        this.updateBookingsTable();
    }

    clearFilters() {
        document.getElementById('status-filter').value = '';
        document.getElementById('tent-filter').value = '';
        document.getElementById('from-date').value = '';
        document.getElementById('to-date').value = '';

        this.loadBookings();
        this.updateBookingsTable();
    }

    async exportBookings() {
        const status = document.getElementById('status-filter').value;
        const fromDate = document.getElementById('from-date').value;
        const toDate = document.getElementById('to-date').value;

        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (fromDate) params.append('from_date', fromDate);
        if (toDate) params.append('to_date', toDate);

        try {
            const response = await fetch(`${this.apiBase}/bookings/export?${params}`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'bookings.csv';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error('Error exporting bookings:', error);
            alert('Failed to export bookings');
        }
    }

    updateUI() {
        // Update stats
        document.getElementById('total-bookings').textContent = this.stats.total_bookings || 0;
        document.getElementById('confirmed-bookings').textContent = this.stats.confirmed_bookings || 0;
        document.getElementById('pending-bookings').textContent = this.stats.pending_bookings || 0;
        document.getElementById('total-revenue').textContent = `₹${this.stats.total_revenue || 0}`;

        // Update bookings table
        this.updateBookingsTable();
    }

    updateBookingsTable() {
        const tbody = document.getElementById('bookings-table-body');
        const noBookings = document.getElementById('no-bookings');

        if (this.bookings.length === 0) {
            tbody.innerHTML = '';
            noBookings.classList.remove('hidden');
            return;
        }

        noBookings.classList.add('hidden');
        tbody.innerHTML = this.bookings.map(booking => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${booking.id}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                        <div class="font-medium">${booking.customer_name}</div>
                        <div class="text-gray-500">${booking.customer_phone}</div>
                        <div class="text-gray-500">${booking.customer_email}</div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${booking.tent_name}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                        <div>Check-in: ${new Date(booking.check_in).toLocaleDateString('en-IN')}</div>
                        <div>Check-out: ${new Date(booking.check_out).toLocaleDateString('en-IN')}</div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${booking.guests} guests
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                        <div class="font-medium">₹${booking.total_amount}</div>
                        <div class="text-green-600">Advance: ₹${booking.advance_amount}</div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }">
                        ${booking.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                        <button onclick="adminPanel.viewBooking('${booking.id}')" 
                                class="text-primary hover:text-blue-600 transition-colors">
                            <i class="ri-eye-line"></i> View
                        </button>
                        <a href="tel:${booking.customer_phone}" 
                           class="text-green-600 hover:text-green-700 transition-colors">
                            <i class="ri-phone-line"></i> Call
                        </a>
                        <a href="https://wa.me/91${booking.customer_phone.replace(/\D/g, '')}?text=Hi ${booking.customer_name}, regarding your booking ${booking.id}" 
                           target="_blank"
                           class="text-green-600 hover:text-green-700 transition-colors">
                            <i class="ri-whatsapp-line"></i> WhatsApp
                        </a>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async viewBooking(bookingId) {
        try {
            const response = await fetch(`${this.apiBase}/bookings/${bookingId}`);
            if (response.ok) {
                const booking = await response.json();
                this.showBookingDetails(booking);
            } else {
                alert('Booking not found');
            }
        } catch (error) {
            console.error('Error fetching booking details:', error);
            alert('Failed to load booking details');
        }
    }

    showBookingDetails(booking) {
        const modal = document.getElementById('booking-details-modal');
        const content = document.getElementById('modal-content');

        content.innerHTML = `
            <div class="space-y-6">
                <div class="flex justify-between items-start">
                    <h3 class="text-2xl font-bold">Booking Details</h3>
                    <div class="text-right">
                        <div class="text-sm text-gray-500">Booking ID</div>
                        <div class="font-mono text-lg">${booking.id}</div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="text-lg font-semibold mb-3">Customer Information</h4>
                        <div class="space-y-2">
                            <div><span class="font-medium">Name:</span> ${booking.customer_name}</div>
                            <div><span class="font-medium">Phone:</span> 
                                <a href="tel:${booking.customer_phone}" class="text-primary hover:underline">
                                    ${booking.customer_phone}
                                </a>
                            </div>
                            <div><span class="font-medium">Email:</span> 
                                <a href="mailto:${booking.customer_email}" class="text-primary hover:underline">
                                    ${booking.customer_email}
                                </a>
                            </div>
                            ${booking.customer_address ? `<div><span class="font-medium">Address:</span> ${booking.customer_address}</div>` : ''}
                            ${booking.special_requests ? `<div><span class="font-medium">Special Requests:</span> ${booking.special_requests}</div>` : ''}
                        </div>
                    </div>

                    <div>
                        <h4 class="text-lg font-semibold mb-3">Booking Information</h4>
                        <div class="space-y-2">
                            <div><span class="font-medium">Tent:</span> ${booking.tent_name}</div>
                            <div><span class="font-medium">Check-in:</span> ${new Date(booking.check_in).toLocaleDateString('en-IN')}</div>
                            <div><span class="font-medium">Check-out:</span> ${new Date(booking.check_out).toLocaleDateString('en-IN')}</div>
                            <div><span class="font-medium">Guests:</span> ${booking.guests}</div>
                            <div><span class="font-medium">Status:</span> 
                                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }">
                                    ${booking.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 class="text-lg font-semibold mb-3">Payment Information</h4>
                    <div class="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div class="flex justify-between">
                            <span>Total Amount:</span>
                            <span class="font-bold">₹${booking.total_amount}</span>
                        </div>
                        <div class="flex justify-between text-green-600">
                            <span>Advance Paid:</span>
                            <span class="font-bold">₹${booking.advance_amount}</span>
                        </div>
                        <div class="flex justify-between text-gray-600">
                            <span>Remaining at Resort:</span>
                            <span>₹${booking.total_amount - booking.advance_amount}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span>Payment ID:</span>
                            <span class="font-mono">${booking.payment_id}</span>
                        </div>
                    </div>
                </div>

                <div class="flex justify-between items-center pt-4 border-t">
                    <div class="text-sm text-gray-500">
                        Created: ${new Date(booking.created_at).toLocaleString('en-IN')}
                    </div>
                    <div class="flex space-x-3">
                        <a href="tel:${booking.customer_phone}" 
                           class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-button transition-colors">
                            <i class="ri-phone-line mr-2"></i>Call Customer
                        </a>
                        <a href="https://wa.me/91${booking.customer_phone.replace(/\D/g, '')}?text=Hi ${booking.customer_name}, regarding your booking ${booking.id}" 
                           target="_blank"
                           class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-button transition-colors">
                            <i class="ri-whatsapp-line mr-2"></i>WhatsApp
                        </a>
                        ${booking.status === 'confirmed' ? `
                            <button onclick="adminPanel.cancelBooking('${booking.id}')" 
                                    class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-button transition-colors">
                                <i class="ri-close-line mr-2"></i>Cancel Booking
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
    }

    async cancelBooking(bookingId) {
        if (!confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/bookings/${bookingId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'cancelled' })
            });

            if (response.ok) {
                alert('Booking cancelled successfully');
                this.closeModal();
                await this.loadStats();
                await this.loadBookings();
                this.updateUI();
            } else {
                alert('Failed to cancel booking');
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('Failed to cancel booking');
        }
    }

    closeModal() {
        document.getElementById('booking-details-modal').classList.add('hidden');
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.adminPanel = new AdminPanelAPI();
}); 