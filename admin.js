// Admin Panel for Baromas Resort Booking Management
class AdminPanel {
    constructor() {
        this.bookings = [];
        this.filteredBookings = [];
        this.init();
    }

    init() {
        this.loadBookings();
        this.attachEventListeners();
        this.updateStats();
        this.renderBookings();
    }

    loadBookings() {
        if (window.bookingSystem) {
            this.bookings = window.bookingSystem.bookings || [];
            this.filteredBookings = [...this.bookings];
        }
    }

    attachEventListeners() {
        // Filter controls
        document.getElementById('apply-filters').addEventListener('click', () => this.applyFilters());
        document.getElementById('clear-filters').addEventListener('click', () => this.clearFilters());
        document.getElementById('export-bookings').addEventListener('click', () => this.exportBookings());

        // Modal controls
        document.getElementById('close-modal').addEventListener('click', () => this.closeModal());
        document.getElementById('modal-overlay').addEventListener('click', () => this.closeModal());

        // Refresh data periodically
        setInterval(() => {
            this.loadBookings();
            this.updateStats();
            this.renderBookings();
        }, 30000); // Refresh every 30 seconds
    }

    updateStats() {
        const totalBookings = this.bookings.length;
        const confirmedBookings = this.bookings.filter(b => b.status === 'confirmed').length;
        const pendingBookings = this.bookings.filter(b => b.status === 'pending').length;
        const totalRevenue = this.bookings
            .filter(b => b.status === 'confirmed')
            .reduce((sum, b) => sum + b.totalAmount, 0);

        document.getElementById('total-bookings').textContent = totalBookings;
        document.getElementById('confirmed-bookings').textContent = confirmedBookings;
        document.getElementById('pending-bookings').textContent = pendingBookings;
        document.getElementById('total-revenue').textContent = `₹${totalRevenue.toLocaleString('en-IN')}`;
    }

    applyFilters() {
        const statusFilter = document.getElementById('status-filter').value;
        const tentFilter = document.getElementById('tent-filter').value;
        const fromDate = document.getElementById('from-date').value;
        const toDate = document.getElementById('to-date').value;

        this.filteredBookings = this.bookings.filter(booking => {
            // Status filter
            if (statusFilter && booking.status !== statusFilter) return false;

            // Tent filter
            if (tentFilter && booking.tentId !== tentFilter) return false;

            // Date range filter
            if (fromDate && booking.checkIn < fromDate) return false;
            if (toDate && booking.checkIn > toDate) return false;

            return true;
        });

        this.renderBookings();
    }

    clearFilters() {
        document.getElementById('status-filter').value = '';
        document.getElementById('tent-filter').value = '';
        document.getElementById('from-date').value = '';
        document.getElementById('to-date').value = '';

        this.filteredBookings = [...this.bookings];
        this.renderBookings();
    }

    renderBookings() {
        const tbody = document.getElementById('bookings-table-body');
        const noBookings = document.getElementById('no-bookings');

        if (this.filteredBookings.length === 0) {
            tbody.innerHTML = '';
            noBookings.classList.remove('hidden');
            return;
        }

        noBookings.classList.add('hidden');

        // Sort bookings by creation date (newest first)
        const sortedBookings = [...this.filteredBookings].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        tbody.innerHTML = sortedBookings.map(booking => {
            const checkInDate = new Date(booking.checkIn).toLocaleDateString('en-IN');
            const checkOutDate = new Date(booking.checkOut).toLocaleDateString('en-IN');
            const createdDate = new Date(booking.createdAt).toLocaleDateString('en-IN');

            return `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${booking.id}</div>
                        <div class="text-sm text-gray-500">${createdDate}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${booking.customerInfo.name}</div>
                        <div class="text-sm text-gray-500">${booking.customerInfo.phone}</div>
                        <div class="text-sm text-gray-500">${booking.customerInfo.email}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${booking.tentName}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">
                            <div><strong>In:</strong> ${checkInDate}</div>
                            <div><strong>Out:</strong> ${checkOutDate}</div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${booking.guests}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">
                            <div><strong>Total:</strong> ₹${booking.totalAmount}</div>
                            <div class="text-green-600"><strong>Paid:</strong> ₹${booking.advanceAmount}</div>
                            <div class="text-orange-600"><strong>Due:</strong> ₹${booking.totalAmount - booking.advanceAmount}</div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        ${this.getStatusBadge(booking.status)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="adminPanel.viewBookingDetails('${booking.id}')" 
                                class="text-primary hover:text-blue-600 mr-3">
                            <i class="ri-eye-line"></i> View
                        </button>
                        <button onclick="adminPanel.callCustomer('${booking.customerInfo.phone}')" 
                                class="text-green-600 hover:text-green-700 mr-3">
                            <i class="ri-phone-line"></i> Call
                        </button>
                        ${booking.status !== 'cancelled' ? 
                            `<button onclick="adminPanel.cancelBooking('${booking.id}')" 
                                     class="text-red-600 hover:text-red-700">
                                <i class="ri-close-line"></i> Cancel
                            </button>` : ''
                        }
                    </td>
                </tr>
            `;
        }).join('');
    }

    getStatusBadge(status) {
        const badges = {
            confirmed: '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Confirmed</span>',
            pending: '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>',
            cancelled: '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Cancelled</span>'
        };
        return badges[status] || badges.pending;
    }

    viewBookingDetails(bookingId) {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (!booking) return;

        const checkInDate = new Date(booking.checkIn).toLocaleDateString('en-IN');
        const checkOutDate = new Date(booking.checkOut).toLocaleDateString('en-IN');
        const createdDate = new Date(booking.createdAt).toLocaleDateString('en-IN');
        const nights = Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24));

        const modalContent = document.getElementById('modal-content');
        modalContent.innerHTML = `
            <div class="mb-6">
                <h3 class="text-2xl font-bold text-gray-900 mb-2">Booking Details</h3>
                <p class="text-gray-600">Booking ID: ${booking.id}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="font-semibold text-gray-900 mb-3">Customer Information</h4>
                    <div class="space-y-2">
                        <div><strong>Name:</strong> ${booking.customerInfo.name}</div>
                        <div><strong>Phone:</strong> 
                            <a href="tel:${booking.customerInfo.phone}" class="text-primary hover:underline">
                                ${booking.customerInfo.phone}
                            </a>
                        </div>
                        <div><strong>Email:</strong> 
                            <a href="mailto:${booking.customerInfo.email}" class="text-primary hover:underline">
                                ${booking.customerInfo.email}
                            </a>
                        </div>
                        ${booking.customerInfo.address ? `<div><strong>Address:</strong> ${booking.customerInfo.address}</div>` : ''}
                    </div>
                </div>

                <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="font-semibold text-gray-900 mb-3">Booking Information</h4>
                    <div class="space-y-2">
                        <div><strong>Tent:</strong> ${booking.tentName}</div>
                        <div><strong>Check-in:</strong> ${checkInDate}</div>
                        <div><strong>Check-out:</strong> ${checkOutDate}</div>
                        <div><strong>Nights:</strong> ${nights}</div>
                        <div><strong>Guests:</strong> ${booking.guests}</div>
                        <div><strong>Status:</strong> ${this.getStatusBadge(booking.status)}</div>
                    </div>
                </div>
            </div>

            <div class="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 class="font-semibold text-gray-900 mb-3">Payment Information</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <div class="text-sm text-gray-600">Total Amount</div>
                        <div class="text-lg font-bold">₹${booking.totalAmount}</div>
                    </div>
                    <div>
                        <div class="text-sm text-gray-600">Advance Paid</div>
                        <div class="text-lg font-bold text-green-600">₹${booking.advanceAmount}</div>
                    </div>
                    <div>
                        <div class="text-sm text-gray-600">Amount Due</div>
                        <div class="text-lg font-bold text-orange-600">₹${booking.totalAmount - booking.advanceAmount}</div>
                    </div>
                </div>
                ${booking.paymentId ? `<div class="mt-3 text-sm text-gray-600">Payment ID: ${booking.paymentId}</div>` : ''}
            </div>

            ${booking.customerInfo.specialRequests ? `
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <h4 class="font-semibold text-yellow-800 mb-2">Special Requests</h4>
                    <p class="text-yellow-700">${booking.customerInfo.specialRequests}</p>
                </div>
            ` : ''}

            <div class="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 class="font-semibold text-gray-900 mb-3">Booking Timeline</h4>
                <div class="space-y-2 text-sm">
                    <div><strong>Created:</strong> ${createdDate}</div>
                    ${booking.cancelledAt ? `<div><strong>Cancelled:</strong> ${new Date(booking.cancelledAt).toLocaleDateString('en-IN')}</div>` : ''}
                </div>
            </div>

            <div class="flex justify-end space-x-4">
                <button onclick="adminPanel.callCustomer('${booking.customerInfo.phone}')" 
                        class="bg-green-600 text-white px-4 py-2 rounded-button hover:bg-green-700 transition-colors">
                    <i class="ri-phone-line mr-2"></i>Call Customer
                </button>
                <button onclick="adminPanel.sendWhatsApp('${booking.customerInfo.phone}', '${booking.id}')" 
                        class="bg-green-500 text-white px-4 py-2 rounded-button hover:bg-green-600 transition-colors">
                    <i class="ri-whatsapp-line mr-2"></i>WhatsApp
                </button>
                ${booking.status !== 'cancelled' ? `
                    <button onclick="adminPanel.cancelBooking('${booking.id}')" 
                            class="bg-red-600 text-white px-4 py-2 rounded-button hover:bg-red-700 transition-colors">
                        <i class="ri-close-line mr-2"></i>Cancel Booking
                    </button>
                ` : ''}
            </div>
        `;

        document.getElementById('booking-details-modal').classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('booking-details-modal').classList.add('hidden');
    }

    callCustomer(phoneNumber) {
        // Open phone dialer
        window.open(`tel:${phoneNumber}`);
    }

    sendWhatsApp(phoneNumber, bookingId) {
        const message = `Hello! This is regarding your booking ${bookingId} at Baromas Resort. Our team will contact you shortly to confirm your booking details.`;
        const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    cancelBooking(bookingId) {
        if (confirm('Are you sure you want to cancel this booking?')) {
            if (window.bookingSystem && window.bookingSystem.cancelBooking(bookingId)) {
                alert('Booking cancelled successfully');
                this.loadBookings();
                this.updateStats();
                this.renderBookings();
                this.closeModal();
            } else {
                alert('Failed to cancel booking');
            }
        }
    }

    exportBookings() {
        if (this.filteredBookings.length === 0) {
            alert('No bookings to export');
            return;
        }

        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `baromas-bookings-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    generateCSV() {
        const headers = [
            'Booking ID', 'Customer Name', 'Phone', 'Email', 'Tent', 
            'Check-in', 'Check-out', 'Guests', 'Total Amount', 'Advance Paid', 
            'Amount Due', 'Status', 'Created Date', 'Payment ID'
        ];

        const rows = this.filteredBookings.map(booking => [
            booking.id,
            booking.customerInfo.name,
            booking.customerInfo.phone,
            booking.customerInfo.email,
            booking.tentName,
            booking.checkIn,
            booking.checkOut,
            booking.guests,
            booking.totalAmount,
            booking.advanceAmount,
            booking.totalAmount - booking.advanceAmount,
            booking.status,
            new Date(booking.createdAt).toLocaleDateString('en-IN'),
            booking.paymentId || ''
        ]);

        return [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait for booking system to be ready
    setTimeout(() => {
        window.adminPanel = new AdminPanel();
    }, 100);
});