// Availability Checking Demo
// This file demonstrates how the availability checking system works

class AvailabilityDemo {
    constructor() {
        this.apiBase = 'http://localhost:3000/api';
        this.demoResults = [];
    }

    // Demo 1: Basic availability check
    async demoBasicAvailability() {
        console.log('=== Demo 1: Basic Availability Check ===');
        
        const tentId = 'triveni-1';
        const checkIn = '2025-01-15';
        const checkOut = '2025-01-17';
        
        try {
            const response = await fetch(`${this.apiBase}/availability?check_in=${checkIn}&check_out=${checkOut}`);
            const bookedDates = await response.json();
            
            const isAvailable = !bookedDates[tentId] || bookedDates[tentId].length === 0;
            
            console.log('Tent ID:', tentId);
            console.log('Check-in:', checkIn);
            console.log('Check-out:', checkOut);
            console.log('Booked dates for this tent:', bookedDates[tentId] || 'None');
            console.log('Is Available:', isAvailable);
            
            this.demoResults.push({
                demo: 'Basic Availability Check',
                tentId,
                checkIn,
                checkOut,
                isAvailable,
                bookedDates: bookedDates[tentId] || []
            });
            
        } catch (error) {
            console.error('Error in basic availability check:', error);
        }
    }

    // Demo 2: Get all available tents for dates
    async demoGetAvailableTents() {
        console.log('\n=== Demo 2: Get All Available Tents ===');
        
        const checkIn = '2025-01-20';
        const checkOut = '2025-01-22';
        
        try {
            const response = await fetch(`${this.apiBase}/availability?check_in=${checkIn}&check_out=${checkOut}`);
            const bookedDates = await response.json();
            
            // Get all tents from the API
            const tentsResponse = await fetch(`${this.apiBase}/tents`);
            const tents = await tentsResponse.json();
            
            const availableTents = [];
            const unavailableTents = [];
            
            tents.forEach(tent => {
                const isBooked = bookedDates[tent.id] && bookedDates[tent.id].length > 0;
                if (isBooked) {
                    unavailableTents.push({
                        id: tent.id,
                        name: tent.name,
                        conflictingBookings: bookedDates[tent.id]
                    });
                } else {
                    availableTents.push({
                        id: tent.id,
                        name: tent.name,
                        price: tent.price
                    });
                }
            });
            
            console.log('Check-in:', checkIn);
            console.log('Check-out:', checkOut);
            console.log('Available Tents:', availableTents);
            console.log('Unavailable Tents:', unavailableTents);
            
            this.demoResults.push({
                demo: 'Get All Available Tents',
                checkIn,
                checkOut,
                availableTents,
                unavailableTents
            });
            
        } catch (error) {
            console.error('Error in get available tents:', error);
        }
    }

    // Demo 3: Real-time availability check (simulating frontend usage)
    async demoRealTimeCheck() {
        console.log('\n=== Demo 3: Real-time Availability Check ===');
        
        const scenarios = [
            { tentId: 'triveni-1', checkIn: '2025-01-15', checkOut: '2025-01-17' },
            { tentId: 'panchvati-1', checkIn: '2025-01-20', checkOut: '2025-01-22' },
            { tentId: 'triveni-2', checkIn: '2025-01-25', checkOut: '2025-01-27' }
        ];
        
        for (const scenario of scenarios) {
            try {
                const response = await fetch(`${this.apiBase}/availability?check_in=${scenario.checkIn}&check_out=${scenario.checkOut}`);
                const bookedDates = await response.json();
                
                const isAvailable = !bookedDates[scenario.tentId] || bookedDates[scenario.tentId].length === 0;
                
                console.log(`\nScenario: ${scenario.tentId} for ${scenario.checkIn} to ${scenario.checkOut}`);
                console.log('Status:', isAvailable ? '✅ Available' : '❌ Not Available');
                
                if (!isAvailable) {
                    console.log('Conflicting bookings:', bookedDates[scenario.tentId]);
                }
                
                // Simulate UI update
                this.simulateUIUpdate(scenario.tentId, isAvailable);
                
            } catch (error) {
                console.error(`Error checking ${scenario.tentId}:`, error);
            }
        }
    }

    // Simulate UI update based on availability
    simulateUIUpdate(tentId, isAvailable) {
        const status = isAvailable ? 'Available' : 'Not Available';
        const color = isAvailable ? 'green' : 'red';
        const icon = isAvailable ? '✅' : '❌';
        
        console.log(`UI Update: ${icon} ${tentId} - ${status} (${color})`);
        
        // In real implementation, this would update the DOM
        // document.querySelector(`[data-tent="${tentId}"] .status`).textContent = status;
        // document.querySelector(`[data-tent="${tentId}"] .status`).className = `status ${color}`;
    }

    // Demo 4: Availability with booking creation
    async demoAvailabilityWithBooking() {
        console.log('\n=== Demo 4: Availability with Booking Creation ===');
        
        const tentId = 'triveni-1';
        const checkIn = '2025-02-01';
        const checkOut = '2025-02-03';
        
        try {
            // Step 1: Check initial availability
            console.log('Step 1: Checking initial availability...');
            const initialResponse = await fetch(`${this.apiBase}/availability?check_in=${checkIn}&check_out=${checkOut}`);
            const initialBookedDates = await initialResponse.json();
            const initiallyAvailable = !initialBookedDates[tentId] || initialBookedDates[tentId].length === 0;
            
            console.log('Initially available:', initiallyAvailable);
            
            if (initiallyAvailable) {
                // Step 2: Create a booking
                console.log('Step 2: Creating booking...');
                const bookingData = {
                    id: 'DEMO_' + Date.now(),
                    tent_id: tentId,
                    tent_name: 'Triveni Tent 1',
                    check_in: checkIn,
                    check_out: checkOut,
                    guests: 2,
                    customer_name: 'Demo Customer',
                    customer_phone: '+919999999999',
                    customer_email: 'demo@example.com',
                    customer_address: 'Demo Address',
                    special_requests: 'Demo booking',
                    total_amount: 298,
                    advance_amount: 89,
                    payment_id: 'DEMO_PAYMENT_' + Date.now()
                };
                
                const createResponse = await fetch(`${this.apiBase}/bookings`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(bookingData)
                });
                
                if (createResponse.ok) {
                    console.log('Booking created successfully');
                    
                    // Step 3: Check availability again
                    console.log('Step 3: Checking availability after booking...');
                    const finalResponse = await fetch(`${this.apiBase}/availability?check_in=${checkIn}&check_out=${checkOut}`);
                    const finalBookedDates = await finalResponse.json();
                    const finallyAvailable = !finalBookedDates[tentId] || finalBookedDates[tentId].length === 0;
                    
                    console.log('Finally available:', finallyAvailable);
                    console.log('Booked dates after booking:', finalBookedDates[tentId]);
                    
                    this.demoResults.push({
                        demo: 'Availability with Booking Creation',
                        tentId,
                        checkIn,
                        checkOut,
                        initiallyAvailable,
                        finallyAvailable,
                        bookingCreated: true
                    });
                }
            }
            
        } catch (error) {
            console.error('Error in availability with booking demo:', error);
        }
    }

    // Run all demos
    async runAllDemos() {
        console.log('🚀 Starting Availability Checking Demos...\n');
        
        await this.demoBasicAvailability();
        await this.demoGetAvailableTents();
        await this.demoRealTimeCheck();
        await this.demoAvailabilityWithBooking();
        
        console.log('\n📊 Demo Results Summary:');
        console.log(JSON.stringify(this.demoResults, null, 2));
        
        console.log('\n✅ All demos completed!');
    }
}

// Frontend Integration Example
class FrontendAvailabilityIntegration {
    constructor() {
        this.apiBase = 'http://localhost:3000/api';
    }

    // Check availability when user selects dates
    async checkAvailabilityOnDateSelection(checkIn, checkOut) {
        console.log('Frontend: Checking availability for dates:', { checkIn, checkOut });
        
        try {
            const response = await fetch(`${this.apiBase}/availability?check_in=${checkIn}&check_out=${checkOut}`);
            const bookedDates = await response.json();
            
            // Update tent cards in the UI
            this.updateTentCards(bookedDates);
            
            return bookedDates;
        } catch (error) {
            console.error('Frontend: Error checking availability:', error);
            return {};
        }
    }

    // Update tent cards based on availability
    updateTentCards(bookedDates) {
        const tentCards = document.querySelectorAll('.tent-card');
        
        tentCards.forEach(card => {
            const tentName = card.querySelector('h4').textContent;
            const statusSpan = card.querySelector('span[class*="bg-"]');
            
            // Map tent names to IDs
            const tentIdMap = {
                'Triveni Tent 1': 'triveni-1',
                'Triveni Tent 2': 'triveni-2',
                'Triveni Tent 3': 'triveni-3',
                'Panchvati Tent 1': 'panchvati-1',
                'Panchvati Tent 2': 'panchvati-2',
                'Panchvati Tent 3': 'panchvati-3',
                'Panchvati Tent 4': 'panchvati-4',
                'Panchvati Tent 5': 'panchvati-5'
            };
            
            const tentId = tentIdMap[tentName];
            if (tentId && statusSpan) {
                const isBooked = bookedDates[tentId] && bookedDates[tentId].length > 0;
                
                if (isBooked) {
                    statusSpan.className = 'bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full';
                    statusSpan.textContent = 'Booked';
                } else {
                    statusSpan.className = 'bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full';
                    statusSpan.textContent = 'Available';
                }
            }
        });
    }

    // Check specific tent availability
    async checkSpecificTentAvailability(tentId, checkIn, checkOut) {
        try {
            const response = await fetch(`${this.apiBase}/availability?check_in=${checkIn}&check_out=${checkOut}`);
            const bookedDates = await response.json();
            
            const isAvailable = !bookedDates[tentId] || bookedDates[tentId].length === 0;
            
            return {
                isAvailable,
                tentId,
                checkIn,
                checkOut,
                conflictingBookings: bookedDates[tentId] || []
            };
        } catch (error) {
            console.error('Frontend: Error checking specific tent availability:', error);
            return {
                isAvailable: false,
                tentId,
                checkIn,
                checkOut,
                conflictingBookings: [],
                error: error.message
            };
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AvailabilityDemo, FrontendAvailabilityIntegration };
} else {
    window.AvailabilityDemo = AvailabilityDemo;
    window.FrontendAvailabilityIntegration = FrontendAvailabilityIntegration;
} 