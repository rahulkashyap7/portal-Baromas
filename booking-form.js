// Enhanced Booking Form with Customer Details and Payment Integration
class BookingForm {
    constructor() {
        this.currentStep = 1;
        this.bookingData = {};
        this.init();
    }

    init() {
        this.createBookingModal();
        this.attachEventListeners();
    }

    createBookingModal() {
        // Create enhanced booking modal
        const modalHTML = `
            <div id="enhanced-booking-modal" class="fixed inset-0 z-50 flex items-center justify-center hidden">
                <div class="absolute inset-0 bg-black bg-opacity-50" id="booking-modal-overlay"></div>
                <div class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
                    <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10" id="close-booking-modal">
                        <i class="ri-close-line ri-lg"></i>
                    </button>

                    <div class="p-6">
                        <!-- Progress Steps -->
                        <div class="mb-8">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center step-indicator" data-step="1">
                                    <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">1</div>
                                    <span class="ml-2 text-sm font-medium text-primary">Booking Details</span>
                                </div>
                                <div class="flex-1 h-1 bg-gray-200 mx-4">
                                    <div class="h-1 bg-primary transition-all duration-300" id="progress-bar" style="width: 33%"></div>
                                </div>
                                <div class="flex items-center step-indicator" data-step="2">
                                    <div class="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-medium">2</div>
                                    <span class="ml-2 text-sm font-medium text-gray-600">Customer Info</span>
                                </div>
                                <div class="flex-1 h-1 bg-gray-200 mx-4"></div>
                                <div class="flex items-center step-indicator" data-step="3">
                                    <div class="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-medium">3</div>
                                    <span class="ml-2 text-sm font-medium text-gray-600">Payment</span>
                                </div>
                            </div>
                        </div>

                        <!-- Step 1: Booking Details -->
                        <div id="step-1" class="booking-step">
                            <h3 class="text-2xl font-bold mb-6">Booking Details</h3>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-gray-700 text-sm font-medium mb-2">Check-in Date</label>
                                    <input type="date" id="modal-checkin" class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required>
                                </div>
                                <div>
                                    <label class="block text-gray-700 text-sm font-medium mb-2">Check-out Date</label>
                                    <input type="date" id="modal-checkout" class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required>
                                </div>
                            </div>

                            <div class="mt-6">
                                <label class="block text-gray-700 text-sm font-medium mb-2">Select Tent</label>
                                <div id="available-tents" class="grid grid-cols-1 gap-4">
                                    <!-- Available tents will be populated here -->
                                </div>
                            </div>

                            <div class="mt-6">
                                <label class="block text-gray-700 text-sm font-medium mb-2">Number of Guests</label>
                                <div class="flex items-center">
                                    <button type="button" id="modal-decrease-guests" class="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-l text-gray-600 hover:bg-gray-100 transition-colors">
                                        <i class="ri-subtract-line"></i>
                                    </button>
                                    <input type="number" id="modal-guests" class="w-full h-10 px-4 py-2 border-t border-b border-gray-300 text-center focus:outline-none" value="2" min="1" max="4">
                                    <button type="button" id="modal-increase-guests" class="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-r text-gray-600 hover:bg-gray-100 transition-colors">
                                        <i class="ri-add-line"></i>
                                    </button>
                                </div>
                            </div>

                            <div class="mt-8 flex justify-between items-center">
                                <div>
                                    <div class="text-sm text-gray-600">Total Amount</div>
                                    <div class="text-2xl font-bold text-primary" id="modal-total-price">₹0</div>
                                    <div class="text-sm text-gray-600">Advance Payment (30%): <span id="modal-advance-price" class="font-medium">₹0</span></div>
                                </div>
                                <button type="button" id="next-step-1" class="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-button transition-colors" disabled>
                                    Next Step
                                </button>
                            </div>
                        </div>

                        <!-- Step 2: Customer Information -->
                        <div id="step-2" class="booking-step hidden">
                            <h3 class="text-2xl font-bold mb-6">Customer Information</h3>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-gray-700 text-sm font-medium mb-2">Full Name *</label>
                                    <input type="text" id="customer-name" class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required>
                                </div>
                                <div>
                                    <label class="block text-gray-700 text-sm font-medium mb-2">Phone Number *</label>
                                    <input type="tel" id="customer-phone" class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required>
                                </div>
                            </div>

                            <div class="mt-6">
                                <label class="block text-gray-700 text-sm font-medium mb-2">Email Address *</label>
                                <input type="email" id="customer-email" class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required>
                            </div>

                            <div class="mt-6">
                                <label class="block text-gray-700 text-sm font-medium mb-2">Address</label>
                                <textarea id="customer-address" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"></textarea>
                            </div>

                            <div class="mt-6">
                                <label class="block text-gray-700 text-sm font-medium mb-2">Special Requests</label>
                                <textarea id="special-requests" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Any special requirements or requests..."></textarea>
                            </div>

                            <div class="mt-8 flex justify-between">
                                <button type="button" id="prev-step-2" class="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-button transition-colors">
                                    Previous
                                </button>
                                <button type="button" id="next-step-2" class="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-button transition-colors" disabled>
                                    Next Step
                                </button>
                            </div>
                        </div>

                        <!-- Step 3: Payment Confirmation -->
                        <div id="step-3" class="booking-step hidden">
                            <h3 class="text-2xl font-bold mb-6">Booking Summary & Payment</h3>
                            
                            <div class="bg-gray-50 rounded-lg p-6 mb-6">
                                <h4 class="font-semibold mb-4">Booking Summary</h4>
                                <div id="booking-summary">
                                    <!-- Summary will be populated here -->
                                </div>
                            </div>

                            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <div class="flex items-start">
                                    <i class="ri-information-line text-blue-500 mt-1 mr-2"></i>
                                    <div class="text-sm text-blue-700">
                                        <p class="font-medium mb-1">Payment Information</p>
                                        <p>You will pay 30% advance amount now. The remaining amount will be collected at the resort during check-in.</p>
                                        <p class="mt-2">After successful payment, our team will contact you within 2 hours to confirm your booking.</p>
                                    </div>
                                </div>
                            </div>

                            <div class="mt-8 flex justify-between">
                                <button type="button" id="prev-step-3" class="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-button transition-colors">
                                    Previous
                                </button>
                                <button type="button" id="proceed-payment" class="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-button transition-colors font-medium">
                                    <i class="ri-secure-payment-line mr-2"></i>
                                    Pay Now & Confirm Booking
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    attachEventListeners() {
        // Modal controls
        document.getElementById('close-booking-modal').addEventListener('click', () => this.closeModal());
        document.getElementById('booking-modal-overlay').addEventListener('click', () => this.closeModal());

        // Step navigation
        document.getElementById('next-step-1').addEventListener('click', () => this.nextStep());
        document.getElementById('prev-step-2').addEventListener('click', () => this.prevStep());
        document.getElementById('next-step-2').addEventListener('click', () => this.nextStep());
        document.getElementById('prev-step-3').addEventListener('click', () => this.prevStep());

        // Guest counter
        document.getElementById('modal-decrease-guests').addEventListener('click', () => this.changeGuests(-1));
        document.getElementById('modal-increase-guests').addEventListener('click', () => this.changeGuests(1));

        // Date change listeners
        document.getElementById('modal-checkin').addEventListener('change', () => this.updateAvailableTents());
        document.getElementById('modal-checkout').addEventListener('change', () => this.updateAvailableTents());

        // Customer info validation
        ['customer-name', 'customer-phone', 'customer-email'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => this.validateStep2());
        });

        // Payment
        document.getElementById('proceed-payment').addEventListener('click', () => this.processPayment());

        // Replace existing booking buttons
        this.replaceBookingButtons();
    }

    replaceBookingButtons() {
        // Replace all "Book Now" buttons with enhanced booking
        const bookButtons = document.querySelectorAll('button');
        bookButtons.forEach(button => {
            if (button.textContent.includes('Book') || button.textContent.includes('Proceed')) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openModal();
                });
            }
        });

        // Also handle the main booking form
        const mainBookingForm = document.getElementById('booking-form');
        if (mainBookingForm) {
            mainBookingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.openModal();
                // Pre-fill data from main form if available
                setTimeout(() => this.prefillFromMainForm(), 100);
            });
        }
    }

    openModal() {
        document.getElementById('enhanced-booking-modal').classList.remove('hidden');
        this.setMinDates();
        this.resetForm();
        
        // Initialize available tents when modal opens
        setTimeout(() => {
            this.updateAvailableTents();
        }, 100);
    }

    closeModal() {
        document.getElementById('enhanced-booking-modal').classList.add('hidden');
        this.resetForm();
    }

    setMinDates() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Format dates for input fields
        const todayStr = today.toISOString().split('T')[0];
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        // Set min dates for inputs
        const checkInInput = document.getElementById('modal-checkin');
        const checkOutInput = document.getElementById('modal-checkout');
        
        checkInInput.min = todayStr;
        checkOutInput.min = tomorrowStr;
        
        // Add change event listeners for date validation
        checkInInput.addEventListener('change', () => {
            const checkInDate = new Date(checkInInput.value);
            const nextDay = new Date(checkInDate);
            nextDay.setDate(nextDay.getDate() + 1);
            
            // Update checkout min date to be the day after check-in
            checkOutInput.min = nextDay.toISOString().split('T')[0];
            
            // If checkout date is before or same as check-in, reset it
            if (checkOutInput.value && new Date(checkOutInput.value) <= checkInDate) {
                checkOutInput.value = '';
                this.bookingData.checkOut = null;
                this.updateAvailableTents();
            }
        });
        
        checkOutInput.addEventListener('change', () => {
            const checkInDate = new Date(checkInInput.value);
            const checkOutDate = new Date(checkOutInput.value);
            
            // If checkout date is before or same as check-in, show error
            if (checkOutDate <= checkInDate) {
                alert('Check-out date must be after check-in date');
                checkOutInput.value = '';
                this.bookingData.checkOut = null;
                this.updateAvailableTents();
            }
        });
    }

    prefillFromMainForm() {
        const checkIn = document.getElementById('check-in-date')?.value;
        const checkOut = document.getElementById('check-out-date')?.value;
        const guests = document.getElementById('guests')?.value;

        if (checkIn) {
            const checkInDate = new Date(checkIn).toISOString().split('T')[0];
            document.getElementById('modal-checkin').value = checkInDate;
        }
        if (checkOut) {
            const checkOutDate = new Date(checkOut).toISOString().split('T')[0];
            document.getElementById('modal-checkout').value = checkOutDate;
        }
        if (guests) {
            document.getElementById('modal-guests').value = guests;
        }

        this.updateAvailableTents();
    }

    async updateAvailableTents() {
        const checkIn = document.getElementById('modal-checkin').value;
        const checkOut = document.getElementById('modal-checkout').value;
        const container = document.getElementById('available-tents');
        
        console.log('Checking availability with dates:', { checkIn, checkOut });
        console.log('BookingSystem instance:', window.bookingSystem);
        
        // If no dates selected, show all tents with a message
        if (!checkIn || !checkOut) {
            console.log('No dates selected, showing all tents');
            const allTents = window.bookingSystem.tents;
            console.log('All tents:', allTents);
            
            container.innerHTML = Object.entries(allTents).map(([tentId, tent]) => `
                <div class="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-primary transition-colors tent-option" data-tent-id="${tentId}">
                    <div class="flex justify-between items-center">
                        <div>
                            <h4 class="font-semibold">${tent.name}</h4>
                            <p class="text-sm text-gray-600">Max ${tent.maxGuests} guests</p>
                        </div>
                        <div class="text-right">
                            <div class="text-lg font-bold text-primary">₹${tent.price}</div>
                            <div class="text-sm text-gray-600">per night</div>
                        </div>
                    </div>
                    <div class="mt-2 text-xs text-gray-500">
                        <i class="ri-information-line mr-1"></i>Select dates to check availability
                    </div>
                </div>
            `).join('');
            
            // Add click listeners to tent options
            container.querySelectorAll('.tent-option').forEach(option => {
                option.addEventListener('click', () => this.selectTent(option));
            });
            
            document.getElementById('next-step-1').disabled = true;
            return;
        }

        try {
            // Show loading state
            container.innerHTML = '<div class="text-center py-4"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div><p class="mt-2 text-gray-600">Checking availability...</p></div>';
            
            // Get available tents
            console.log('Calling getAvailableTents with dates:', { checkIn, checkOut });
            const availableTents = await window.bookingSystem.getAvailableTents(checkIn, checkOut);
            console.log('Available tents response:', availableTents);
            
            // Check if bookingSystem is working
            if (!window.bookingSystem) {
                console.error('BookingSystem not initialized');
                container.innerHTML = '<div class="text-center py-4"><p class="text-red-600">Error: Booking system not initialized. Please refresh the page.</p></div>';
                return;
            }
            
            // Check if tents exist
            if (!window.bookingSystem.tents) {
                console.error('No tents found in booking system');
                container.innerHTML = '<div class="text-center py-4"><p class="text-red-600">Error: No tents found. Please refresh the page.</p></div>';
                return;
            }
            
            if (!availableTents || Object.keys(availableTents).length === 0) {
                console.log('No tents available for selected dates');
                container.innerHTML = '<div class="text-center py-4"><p class="text-red-600">No tents available for selected dates. Please choose different dates.</p></div>';
                document.getElementById('next-step-1').disabled = true;
                return;
            }

            // Display available tents with availability status
            console.log('Displaying available tents:', availableTents);
            container.innerHTML = Object.entries(availableTents).map(([tentId, tent]) => `
                <div class="border border-green-200 bg-green-50 rounded-lg p-4 cursor-pointer hover:border-green-400 transition-colors tent-option" data-tent-id="${tentId}">
                    <div class="flex justify-between items-center">
                        <div>
                            <h4 class="font-semibold">${tent.name}</h4>
                            <p class="text-sm text-gray-600">Max ${tent.maxGuests} guests</p>
                        </div>
                        <div class="text-right">
                            <div class="text-lg font-bold text-primary">₹${tent.price}</div>
                            <div class="text-sm text-gray-600">per night</div>
                        </div>
                    </div>
                    <div class="mt-2 flex items-center text-green-600 text-sm">
                        <i class="ri-check-line mr-1"></i>Available for selected dates
                    </div>
                </div>
            `).join('');

            // Also show unavailable tents with different styling
            const allTents = window.bookingSystem.tents;
            const unavailableTents = Object.entries(allTents).filter(([tentId, tent]) => !availableTents[tentId]);
            
            if (unavailableTents.length > 0) {
                const unavailableHTML = unavailableTents.map(([tentId, tent]) => `
                    <div class="border border-red-200 bg-red-50 rounded-lg p-4 cursor-not-allowed tent-option-unavailable" data-tent-id="${tentId}">
                        <div class="flex justify-between items-center opacity-60">
                            <div>
                                <h4 class="font-semibold">${tent.name}</h4>
                                <p class="text-sm text-gray-600">Max ${tent.maxGuests} guests</p>
                            </div>
                            <div class="text-right">
                                <div class="text-lg font-bold text-gray-400">₹${tent.price}</div>
                                <div class="text-sm text-gray-500">per night</div>
                            </div>
                        </div>
                        <div class="mt-2 flex items-center text-red-600 text-sm">
                            <i class="ri-close-line mr-1"></i>Not available for selected dates
                        </div>
                    </div>
                `).join('');
                
                container.innerHTML += '<div class="mt-4"><h5 class="text-sm font-medium text-gray-700 mb-2">Unavailable Tents:</h5>' + unavailableHTML + '</div>';
            }

            // Add click listeners to tent options (only for available tents)
            container.querySelectorAll('.tent-option').forEach(option => {
                option.addEventListener('click', () => this.selectTent(option));
            });
            
            // Reset selection if previously selected tent is no longer available
            if (this.bookingData.tentId && !availableTents[this.bookingData.tentId]) {
                console.log('Previously selected tent no longer available');
                this.bookingData.tentId = null;
                this.updatePricing();
            }
            
            // If there was a previously selected tent that's still available, restore its selection
            if (this.bookingData.tentId && availableTents[this.bookingData.tentId]) {
                const selectedOption = container.querySelector(`[data-tent-id="${this.bookingData.tentId}"]`);
                if (selectedOption) {
                    this.selectTent(selectedOption);
                }
            }
            
            this.validateStep1();
        } catch (error) {
            console.error('Error updating available tents:', error);
            container.innerHTML = '<div class="text-center py-4"><p class="text-red-600">Error checking availability. Please try again.</p></div>';
            document.getElementById('next-step-1').disabled = true;
        }
    }

    selectTent(selectedOption) {
        // Remove previous selection from all tent options
        document.querySelectorAll('.tent-option').forEach(option => {
            // Remove blue selection styling
            option.classList.remove('border-primary', 'bg-blue-50');
            
            // Restore green styling for available tents
            if (option.classList.contains('border-green-200') && option.classList.contains('bg-green-50')) {
                option.classList.remove('border-green-400');
                option.classList.add('border-green-200');
            }
        });

        // Add selection styling to clicked option
        selectedOption.classList.add('border-primary', 'bg-blue-50');
        
        // Store the tent ID
        this.bookingData.tentId = selectedOption.dataset.tentId;
        
        // Update pricing and validation
        this.updatePricing();
        this.validateStep1();
        
        console.log('Tent selected:', this.bookingData.tentId);
    }

    updatePricing() {
        const checkIn = document.getElementById('modal-checkin').value;
        const checkOut = document.getElementById('modal-checkout').value;
        const tentId = this.bookingData.tentId;

        if (!checkIn || !checkOut || !tentId) {
            document.getElementById('modal-total-price').textContent = '₹0';
            document.getElementById('modal-advance-price').textContent = '₹0';
            return;
        }

        const totalAmount = window.bookingSystem.calculatePrice(tentId, checkIn, checkOut);
        const advanceAmount = Math.round(totalAmount * 0.3);

        document.getElementById('modal-total-price').textContent = `₹${totalAmount}`;
        document.getElementById('modal-advance-price').textContent = `₹${advanceAmount}`;

        this.bookingData.totalAmount = totalAmount;
        this.bookingData.advanceAmount = advanceAmount;
    }

    changeGuests(delta) {
        const guestsInput = document.getElementById('modal-guests');
        const currentGuests = parseInt(guestsInput.value);
        const newGuests = Math.max(1, Math.min(4, currentGuests + delta));
        guestsInput.value = newGuests;
    }

    validateStep1() {
        const checkIn = document.getElementById('modal-checkin').value;
        const checkOut = document.getElementById('modal-checkout').value;
        const tentSelected = this.bookingData.tentId;

        const isValid = checkIn && checkOut && tentSelected && new Date(checkOut) > new Date(checkIn);
        document.getElementById('next-step-1').disabled = !isValid;
    }

    validateStep2() {
        const name = document.getElementById('customer-name').value.trim();
        const phone = document.getElementById('customer-phone').value.trim();
        const email = document.getElementById('customer-email').value.trim();

        const isValid = name && phone && email && this.isValidEmail(email);
        document.getElementById('next-step-2').disabled = !isValid;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    nextStep() {
        if (this.currentStep === 1) {
            this.bookingData.checkIn = document.getElementById('modal-checkin').value;
            this.bookingData.checkOut = document.getElementById('modal-checkout').value;
            this.bookingData.guests = parseInt(document.getElementById('modal-guests').value);
        } else if (this.currentStep === 2) {
            this.bookingData.customerInfo = {
                name: document.getElementById('customer-name').value.trim(),
                phone: document.getElementById('customer-phone').value.trim(),
                email: document.getElementById('customer-email').value.trim(),
                address: document.getElementById('customer-address').value.trim(),
                specialRequests: document.getElementById('special-requests').value.trim()
            };
            this.updateBookingSummary();
        }

        this.currentStep++;
        this.updateStepDisplay();
    }

    prevStep() {
        this.currentStep--;
        this.updateStepDisplay();
    }

    updateStepDisplay() {
        // Hide all steps
        document.querySelectorAll('.booking-step').forEach(step => step.classList.add('hidden'));
        
        // Show current step
        document.getElementById(`step-${this.currentStep}`).classList.remove('hidden');

        // Update progress indicators
        document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
            const stepNum = index + 1;
            const circle = indicator.querySelector('div');
            const text = indicator.querySelector('span');

            if (stepNum <= this.currentStep) {
                circle.classList.remove('bg-gray-200', 'text-gray-600');
                circle.classList.add('bg-primary', 'text-white');
                text.classList.remove('text-gray-600');
                text.classList.add('text-primary');
            } else {
                circle.classList.remove('bg-primary', 'text-white');
                circle.classList.add('bg-gray-200', 'text-gray-600');
                text.classList.remove('text-primary');
                text.classList.add('text-gray-600');
            }
        });

        // Update progress bar
        const progressBar = document.getElementById('progress-bar');
        progressBar.style.width = `${(this.currentStep / 3) * 100}%`;
    }

    updateBookingSummary() {
        const tent = window.bookingSystem.tents[this.bookingData.tentId];
        const checkInDate = new Date(this.bookingData.checkIn).toLocaleDateString('en-IN');
        const checkOutDate = new Date(this.bookingData.checkOut).toLocaleDateString('en-IN');
        const nights = Math.ceil((new Date(this.bookingData.checkOut) - new Date(this.bookingData.checkIn)) / (1000 * 60 * 60 * 24));

        document.getElementById('booking-summary').innerHTML = `
            <div class="space-y-3">
                <div class="flex justify-between">
                    <span class="text-gray-600">Customer:</span>
                    <span class="font-medium">${this.bookingData.customerInfo.name}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Phone:</span>
                    <span class="font-medium">${this.bookingData.customerInfo.phone}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Email:</span>
                    <span class="font-medium">${this.bookingData.customerInfo.email}</span>
                </div>
                <hr class="my-3">
                <div class="flex justify-between">
                    <span class="text-gray-600">Tent:</span>
                    <span class="font-medium">${tent.name}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Check-in:</span>
                    <span class="font-medium">${checkInDate}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Check-out:</span>
                    <span class="font-medium">${checkOutDate}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Nights:</span>
                    <span class="font-medium">${nights}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Guests:</span>
                    <span class="font-medium">${this.bookingData.guests}</span>
                </div>
                <hr class="my-3">
                <div class="flex justify-between text-lg">
                    <span class="text-gray-600">Total Amount:</span>
                    <span class="font-bold">₹${this.bookingData.totalAmount}</span>
                </div>
                <div class="flex justify-between text-lg text-green-600">
                    <span>Advance Payment (30%):</span>
                    <span class="font-bold">₹${this.bookingData.advanceAmount}</span>
                </div>
                <div class="flex justify-between text-sm text-gray-600">
                    <span>Remaining at Resort:</span>
                    <span>₹${this.bookingData.totalAmount - this.bookingData.advanceAmount}</span>
                </div>
            </div>
        `;
    }

    async processPayment() {
        try {
            console.log('Starting payment process...');
            console.log('Booking data:', this.bookingData);
            
            document.getElementById('proceed-payment').disabled = true;
            document.getElementById('proceed-payment').innerHTML = '<i class="ri-loader-4-line animate-spin mr-2"></i>Processing...';

            console.log('Calling bookingSystem.processBooking...');
            const booking = await window.bookingSystem.processBooking(this.bookingData);
            console.log('Booking processed successfully:', booking);
            
            // Show success message
            this.showSuccessMessage(booking);
            this.closeModal();

        } catch (error) {
            console.error('Booking failed:', error);
            alert('Booking failed: ' + error.message);
        } finally {
            document.getElementById('proceed-payment').disabled = false;
            document.getElementById('proceed-payment').innerHTML = '<i class="ri-secure-payment-line mr-2"></i>Pay Now & Confirm Booking';
        }
    }

    showSuccessMessage(booking) {
        // Update the existing success modal with new booking details
        document.getElementById('booking-id').textContent = booking.id;
        document.getElementById('booking-tent').textContent = booking.tentName;
        document.getElementById('booking-checkin').textContent = new Date(booking.checkIn).toLocaleDateString('en-IN');
        document.getElementById('booking-checkout').textContent = new Date(booking.checkOut).toLocaleDateString('en-IN');
        
        document.getElementById('booking-success-modal').classList.remove('hidden');
    }

    resetForm() {
        this.currentStep = 1;
        this.bookingData = {};
        
        // Reset form fields
        document.getElementById('modal-checkin').value = '';
        document.getElementById('modal-checkout').value = '';
        document.getElementById('modal-guests').value = '2';
        document.getElementById('customer-name').value = '';
        document.getElementById('customer-phone').value = '';
        document.getElementById('customer-email').value = '';
        document.getElementById('customer-address').value = '';
        document.getElementById('special-requests').value = '';
        
        // Reset tent selection styling
        document.querySelectorAll('.tent-option').forEach(option => {
            // Remove blue selection styling
            option.classList.remove('border-primary', 'bg-blue-50');
            
            // Restore green styling for available tents
            if (option.classList.contains('border-green-200') && option.classList.contains('bg-green-50')) {
                option.classList.remove('border-green-400');
                option.classList.add('border-green-200');
            }
        });
        
        // Reset pricing
        document.getElementById('modal-total-price').textContent = '₹0';
        document.getElementById('modal-advance-price').textContent = '₹0';
        
        // Reset buttons
        document.getElementById('next-step-1').disabled = true;
        document.getElementById('next-step-2').disabled = true;
        
        // Reset step display
        this.updateStepDisplay();
    }
}

// Initialize enhanced booking form when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.bookingForm = new BookingForm();
});