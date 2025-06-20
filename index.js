      document.addEventListener("DOMContentLoaded", function () {
        const mobileMenuButton = document.getElementById("mobile-menu-button");
        const mobileMenu = document.getElementById("mobile-menu");

        mobileMenuButton.addEventListener("click", function () {
          mobileMenu.classList.toggle("hidden");
        });

        // Close menu when clicking on a link
        const mobileLinks = mobileMenu.querySelectorAll("a");
        mobileLinks.forEach((link) => {
          link.addEventListener("click", function () {
            mobileMenu.classList.add("hidden");
          });
        });
      });

      // I want to show current date in the Availability Calendar

      document.addEventListener("DOMContentLoaded", function () {

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        console.log(today);
        let currentMonth = today.getMonth();
        let currentYear = today.getFullYear();
        
        // Get booked dates from booking system
        function getBookedDates() {
          return window.bookingSystem ? window.bookingSystem.getBookedDates() : {};
        }

        // Selected dates
        let checkInDate = null;
        let checkOutDate = null;

        // Generate calendar
        function generateCalendar(month, year) {
          const calendarDays = document.getElementById("calendar-days");
          calendarDays.innerHTML = "";

          const firstDay = new Date(year, month, 1).getDay();
          const daysInMonth = new Date(year, month + 1, 0).getDate();

          // Add empty cells for days before the first day of the month
          for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement("div");
            emptyDay.classList.add("calendar-day");
            calendarDays.appendChild(emptyDay);
          }

          // Add cells for each day of the month
          for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement("div");
            dayCell.classList.add(
              "calendar-day",
              "flex",
              "items-center",
              "justify-center",
              "cursor-pointer",
              "rounded",
            );

            // Format date string for comparison
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

            // Check if the date is booked
            let isBooked = false;
            const bookedDates = getBookedDates();
            for (const tent in bookedDates) {
              if (bookedDates[tent].includes(dateStr)) {
                isBooked = true;
                break;
              }
            }

            // Set appropriate class based on availability
            // if (isBooked) {
            //   dayCell.classList.add("booked");
            // } else {
            //   dayCell.classList.add("available");
            // }

            // Check if this is one of the selected dates
            // if (checkInDate && dateStr === checkInDate) {
            //   dayCell.classList.remove("available");
            //   dayCell.classList.add("bg-primary", "text-white");
            // }

            if (checkOutDate && dateStr === checkOutDate) {
              dayCell.classList.remove("available");
              dayCell.classList.add("bg-primary", "text-white");
            }

            // Disable past dates
            const cellDate = new Date(year, month, day);
            if (cellDate < today) {
              dayCell.classList.remove("available", "booked");
              dayCell.classList.add("text-gray-300", "bg-gray-100", "disabled");
              dayCell.style.cursor = "default";
            }

            dayCell.textContent = day;
            dayCell.dataset.date = dateStr;

            // Add click event for date selection
            if (!dayCell.classList.contains("disabled")) {
              dayCell.addEventListener("click", function () {
                selectDate(dateStr);
              });
            }

            calendarDays.appendChild(dayCell);
          }
        }

        // Select a date
        function selectDate(dateStr) {
          if (!checkInDate) {
            // First click - set check-in date
            checkInDate = dateStr;
            document.getElementById("check-in-date").value =
              formatDateForDisplay(dateStr);

            // Update calendar UI
            const selectedCell = document.querySelector(
              `.calendar-day[data-date="${dateStr}"]`,
            );
            if (selectedCell) {
              selectedCell.classList.remove("available");
              selectedCell.classList.add("bg-primary", "text-white");
            }
          } else if (!checkOutDate && dateStr > checkInDate) {
            // Second click - set check-out date
            checkOutDate = dateStr;
            document.getElementById("check-out-date").value =
              formatDateForDisplay(dateStr);

            // Update calendar UI
            const selectedCell = document.querySelector(
              `.calendar-day[data-date="${dateStr}"]`,
            );
            if (selectedCell) {
              selectedCell.classList.remove("available");
              selectedCell.classList.add("bg-primary", "text-white");
            }

            // Calculate and update total price
            updateTotalPrice();
          } else {
            // Reset and start over
            resetDateSelection();
            selectDate(dateStr);
          }
        }

        // Format date for display
        function formatDateForDisplay(dateStr) {
          const date = new Date(dateStr);
          const options = {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          };
          return date.toLocaleDateString("en-US", options);
        }

        // Reset date selection
        function resetDateSelection() {
          checkInDate = null;
          checkOutDate = null;
          document.getElementById("check-in-date").value = "";
          document.getElementById("check-out-date").value = "";
          document.getElementById("total-price").textContent = "$0";

          // Reset calendar UI
          const selectedCells = document.querySelectorAll(".calendar-day.bg-primary");
          selectedCells.forEach((cell) => {
            cell.classList.remove("bg-primary", "text-white");
            if (!cell.classList.contains("booked")) {
              cell.classList.add("available");
            }
          });
        }

        // Update total price based on selected dates and tent
        function updateTotalPrice() {
          if (checkInDate && checkOutDate) {
            const tentType = document.getElementById("tent-type").value;
            if (tentType && window.bookingSystem) {
              const totalPrice = window.bookingSystem.calculatePrice(tentType, checkInDate, checkOutDate);
              document.getElementById("total-price").textContent = `₹${totalPrice}`;
              
              // Check availability for the selected tent and dates
              checkTentAvailability(tentType, checkInDate, checkOutDate);
            }
          }
        }

        // New function to check tent availability for specific dates
        async function checkTentAvailability(tentId, checkIn, checkOut) {
          if (!window.bookingSystem) {
            console.log('Booking system not initialized yet');
            return;
          }

          try {
            console.log('Checking availability for tent:', tentId, 'dates:', checkIn, 'to', checkOut);
            
            // Show loading state
            const tentSelect = document.getElementById("tent-type");
            const availabilityStatus = document.getElementById("availability-status");
            
            // Create availability status element if it doesn't exist
            if (!availabilityStatus) {
              const statusDiv = document.createElement('div');
              statusDiv.id = 'availability-status';
              statusDiv.className = 'mt-2 text-sm';
              tentSelect.parentNode.appendChild(statusDiv);
            }
            
            const statusElement = document.getElementById("availability-status");
            statusElement.innerHTML = '<div class="flex items-center text-blue-600"><i class="ri-loader-4-line animate-spin mr-2"></i>Checking availability...</div>';
            
            // Check availability using the booking system API
            const isAvailable = await window.bookingSystem.isAvailable(tentId, checkIn, checkOut);
            
            if (isAvailable) {
              statusElement.innerHTML = '<div class="flex items-center text-green-600"><i class="ri-check-line mr-2"></i>Available for selected dates</div>';
              
              // Enable the proceed button
              const proceedButton = document.querySelector('#booking-form button[type="submit"]');
              if (proceedButton) {
                proceedButton.disabled = false;
                proceedButton.className = 'w-full bg-primary hover:bg-blue-600 text-white py-3 rounded-button whitespace-nowrap transition-colors';
              }
            } else {
              statusElement.innerHTML = '<div class="flex items-center text-red-600"><i class="ri-close-line mr-2"></i>Not available for selected dates</div>';
              
              // Disable the proceed button
              const proceedButton = document.querySelector('#booking-form button[type="submit"]');
              if (proceedButton) {
                proceedButton.disabled = true;
                proceedButton.className = 'w-full bg-gray-300 cursor-not-allowed text-gray-500 py-3 rounded-button whitespace-nowrap';
              }
            }
            
          } catch (error) {
            console.error('Error checking tent availability:', error);
            const statusElement = document.getElementById("availability-status");
            if (statusElement) {
              statusElement.innerHTML = '<div class="flex items-center text-red-600"><i class="ri-error-warning-line mr-2"></i>Error checking availability</div>';
            }
          }
        }

        // Update tent availability status in the UI
        async function updateTentAvailabilityStatus() {
          // Always set all tent cards to Available
          document.querySelectorAll('.tent-card').forEach(card => {
            const statusSpan = card.querySelector('span[class*="bg-"]');
            if (statusSpan) {
              statusSpan.className = 'bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full';
              statusSpan.textContent = 'Available';
            }
            // Optionally, always enable Book Now button
            const bookButton = card.querySelector('.book-tent');
            if (bookButton) {
              bookButton.disabled = false;
              bookButton.className = 'book-tent bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-button whitespace-nowrap text-sm transition-colors';
            }
          });
        }

        // Initialize calendar
        generateCalendar(currentMonth, currentYear);
        
        // Update tent availability status when booking system is ready
        setTimeout(async () => {
          await updateTentAvailabilityStatus();
        }, 100);

        // Previous month button
        document.getElementById("prev-month").addEventListener("click", function () {
          if (currentMonth === 0) {
            currentMonth = 11;
            currentYear--;
          } else {
            currentMonth--;
          }
          generateCalendar(currentMonth, currentYear);

          // Update month display
          const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
          document.querySelector("h3.text-xl").textContent =
            `${monthNames[currentMonth]} ${currentYear}`;
        });

        // Next month button
        document.getElementById("next-month").addEventListener("click", function () {
          if (currentMonth === 11) {
            currentMonth = 0;
            currentYear++;
          } else {
            currentMonth++;
          }
          generateCalendar(currentMonth, currentYear);

          // Update month display
          const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
          document.querySelector("h3.text-xl").textContent =
            `${monthNames[currentMonth]} ${currentYear}`;
        });

        // Tent type change event
        document.getElementById("tent-type").addEventListener("change", function () {
          updateTotalPrice();
          
          // Check availability when tent is selected
          const tentType = this.value;
          if (tentType && checkInDate && checkOutDate) {
            checkTentAvailability(tentType, checkInDate, checkOutDate);
          }
        });

        // Guest counter buttons
        document
          .getElementById("decrease-guests")
          .addEventListener("click", function () {
            const guestsInput = document.getElementById("guests");
            if (parseInt(guestsInput.value) > 1) {
              guestsInput.value = parseInt(guestsInput.value) - 1;
            }
          });

        document
          .getElementById("increase-guests")
          .addEventListener("click", function () {
            const guestsInput = document.getElementById("guests");
            if (parseInt(guestsInput.value) < 4) {
              guestsInput.value = parseInt(guestsInput.value) + 1;
            }
          });

        // Add event listeners for date inputs to check availability
        document.addEventListener('DOMContentLoaded', function() {
          const checkInInput = document.getElementById('check-in-date');
          const checkOutInput = document.getElementById('check-out-date');
          
          if (checkInInput) {
            checkInInput.addEventListener('change', function() {
              const tentType = document.getElementById("tent-type").value;
              if (tentType && checkInDate && checkOutDate) {
                checkTentAvailability(tentType, checkInDate, checkOutDate);
              }
            });
          }
          
          if (checkOutInput) {
            checkOutInput.addEventListener('change', function() {
              const tentType = document.getElementById("tent-type").value;
              if (tentType && checkInDate && checkOutDate) {
                checkTentAvailability(tentType, checkInDate, checkOutDate);
              }
            });
          }
        });

        // Booking form submission - redirect to enhanced booking
        document
          .getElementById("booking-form")
          .addEventListener("submit", function (e) {
            e.preventDefault();

            // Open enhanced booking modal instead
            if (window.bookingForm) {
              window.bookingForm.openModal();
              // Pre-fill data from main form
              window.bookingForm.prefillFromMainForm();
            } else {
              alert("Booking system is loading. Please try again in a moment.");
            }
          });

        // Close success modal
        document
          .getElementById("close-success-modal")
          .addEventListener("click", function () {
            document.getElementById("booking-success-modal").classList.add("hidden");
            resetDateSelection();
            document.getElementById("tent-type").value = "";
            document.getElementById("guests").value = "2";
          });

        // Hero book now button
        document
          .getElementById("hero-book-now")
          .addEventListener("click", function () {
            // Open booking modal directly
            if (window.bookingForm) {
              window.bookingForm.openModal();
            } else {
              // Fallback to scrolling to availability section
              document
                .getElementById("availability")
                .scrollIntoView({ behavior: "smooth" });
            }
          });

        // Header Book Now buttons
        const headerBookButtons = document.querySelectorAll('header button');
        headerBookButtons.forEach(button => {
          if (button.textContent.trim() === 'Book Now') {
            button.addEventListener("click", function () {
              if (window.bookingForm) {
                window.bookingForm.openModal();
              } else {
                document
                  .getElementById("availability")
                  .scrollIntoView({ behavior: "smooth" });
              }
            });
          }
        });

        // Tent card Book Now buttons
        document.querySelectorAll('.book-tent').forEach(button => {
          button.addEventListener('click', function() {
            const tentId = this.getAttribute('data-tent');
            if (window.bookingForm) {
              window.bookingForm.openModal();
              // Pre-select the tent
              setTimeout(() => {
                const tentSelect = document.querySelector(`input[value="${tentId}"]`);
                if (tentSelect) {
                  tentSelect.checked = true;
                  window.bookingForm.selectTent(tentId);
                }
              }, 100);
            } else {
              document
                .getElementById("availability")
                .scrollIntoView({ behavior: "smooth" });
            }
          });
        });

        // View tent details buttons
        const viewDetailsButtons = document.querySelectorAll(
          ".view-tent-details",
        );
        viewDetailsButtons.forEach((button) => {
          button.addEventListener("click", function () {
            const tentName = this.dataset.tent;
            openTentDetailsModal(tentName);
          });
        });
      });

      document.addEventListener("DOMContentLoaded", function () {
        const modal = document.getElementById("tent-details-modal");
        const modalContent = document.getElementById("modal-content");
        const closeModal = document.getElementById("close-modal");
        const modalOverlay = document.getElementById("modal-overlay");

        // Tent details data
        const tentDetails = {
          "Triveni Tent 1": {
            name: "Triveni Tent 1",
            description:
              "Our flagship Triveni tent offers a luxurious glamping experience with panoramic mountain views. This spacious tent features a king-sized bed with premium linens, a private deck, and elegant furnishings that blend comfort with nature.",
            price: 149,
            capacity: 2,
            size: "400 sq ft",
            bedType: "King",
            image:
              "https://readdy.ai/api/search-image?query=Luxury%20safari%20tent%20interior%20with%20king-sized%20bed%2C%20elegant%20furnishings%2C%20warm%20lighting%2C%20wooden%20floors%2C%20rustic%20luxury%20decor%2C%20spacious%20interior%20with%20seating%20area%2C%20perfect%20for%20glamping%20experience&width=800&height=500&seq=tent1int&orientation=landscape",
            amenities: [
              "Private deck with mountain views",
              "En-suite bathroom with shower",
              "Organic toiletries",
              "Air conditioning and heating",
              "Mini refrigerator",
              "Coffee and tea station",
              "Wi-Fi access",
              "Daily housekeeping",
              "Bluetooth speaker",
              "Plush bathrobes and slippers",
            ],
          },
          "Triveni Tent 2": {
            name: "Triveni Tent 2",
            description:
              "Nestled among the trees, Triveni Tent 2 offers a serene forest retreat with a perfect balance of luxury and nature. The tent features a comfortable queen-sized bed, a cozy seating area, and a private deck where you can enjoy your morning coffee while listening to birdsong.",
            price: 139,
            capacity: 2,
            size: "375 sq ft",
            bedType: "Queen",
            image:
              "https://readdy.ai/api/search-image?query=Luxury%20safari%20tent%20interior%20with%20queen-sized%20bed%2C%20elegant%20furnishings%2C%20warm%20lighting%2C%20wooden%20floors%2C%20rustic%20luxury%20decor%2C%20cozy%20seating%20area%2C%20perfect%20for%20glamping%20experience&width=800&height=500&seq=tent2int&orientation=landscape",
            amenities: [
              "Private deck with forest views",
              "En-suite bathroom with shower",
              "Organic toiletries",
              "Air conditioning and heating",
              "Mini refrigerator",
              "Coffee and tea station",
              "Wi-Fi access",
              "Daily housekeeping",
              "Reading lamps",
              "Plush bathrobes and slippers",
            ],
          },
          "Triveni Tent 3": {
            name: "Triveni Tent 3",
            description:
              "Triveni Tent 3 offers a premium glamping experience with a king-sized bed and a private balcony that provides stunning lake views. This spacious tent features elegant furnishings and modern amenities, perfect for those seeking luxury in nature.",
            price: 159,
            capacity: 3,
            size: "425 sq ft",
            bedType: "King",
            image:
              "https://readdy.ai/api/search-image?query=Luxury%20safari%20tent%20interior%20with%20king-sized%20bed%2C%20elegant%20furnishings%2C%20warm%20lighting%2C%20wooden%20floors%2C%20rustic%20luxury%20decor%2C%20private%20balcony%20with%20lake%20view%2C%20perfect%20for%20glamping%20experience&width=800&height=500&seq=tent3int&orientation=landscape",
            amenities: [
              "Private balcony with lake views",
              "En-suite bathroom with shower",
              "Organic toiletries",
              "Air conditioning and heating",
              "Mini refrigerator",
              "Coffee and tea station",
              "Wi-Fi access",
              "Daily housekeeping",
              "Telescope for stargazing",
              "Plush bathrobes and slippers",
            ],
          },
          "Panchvati Tent 1": {
            name: "Panchvati Tent 1",
            description:
              "Perfect for families, Panchvati Tent 1 offers a spacious accommodation with two queen-sized beds and a garden view. The tent features a larger seating area, making it ideal for family gatherings and meals together in the midst of nature.",
            price: 179,
            capacity: 4,
            size: "500 sq ft",
            bedType: "2 Queen Beds",
            image:
              "https://readdy.ai/api/search-image?query=Luxury%20safari%20tent%20interior%20with%20two%20queen%20beds%2C%20elegant%20furnishings%2C%20warm%20lighting%2C%20wooden%20floors%2C%20rustic%20luxury%20decor%2C%20family-friendly%20seating%20area%2C%20perfect%20for%20family%20glamping%20experience&width=800&height=500&seq=tent4int&orientation=landscape",
            amenities: [
              "Private patio with garden views",
              "En-suite bathroom with shower",
              "Organic toiletries",
              "Air conditioning and heating",
              "Mini refrigerator",
              "Coffee and tea station",
              "Wi-Fi access",
              "Daily housekeeping",
              "Board games and books",
              "Extra storage space",
            ],
          },
          "Panchvati Tent 2": {
            name: "Panchvati Tent 2",
            description:
              "Panchvati Tent 2 offers a premium glamping experience with a king-sized bed and an outdoor seating area that provides stunning mountain views. The tent is decorated with locally crafted furnishings and artwork that reflect the region's cultural heritage.",
            price: 169,
            capacity: 2,
            size: "425 sq ft",
            bedType: "King",
            image:
              "https://readdy.ai/api/search-image?query=Luxury%20safari%20tent%20interior%20with%20king-sized%20bed%2C%20elegant%20furnishings%2C%20warm%20lighting%2C%20wooden%20floors%2C%20rustic%20luxury%20decor%20with%20local%20artwork%2C%20perfect%20for%20glamping%20experience&width=800&height=500&seq=tent5int&orientation=landscape",
            amenities: [
              "Private outdoor seating with mountain views",
              "En-suite bathroom with shower",
              "Organic toiletries",
              "Air conditioning and heating",
              "Mini refrigerator",
              "Coffee and tea station",
              "Wi-Fi access",
              "Daily housekeeping",
              "Binoculars for wildlife viewing",
              "Plush bathrobes and slippers",
            ],
          },
          "Panchvati Tent 3": {
            name: "Panchvati Tent 3",
            description:
              "Panchvati Tent 3 features a luxurious king-sized bed and a private terrace with panoramic valley views. This premium tent offers the perfect blend of comfort and natural beauty, with elegant furnishings and modern amenities.",
            price: 199,
            capacity: 2,
            size: "450 sq ft",
            bedType: "King",
            image:
              "https://readdy.ai/api/search-image?query=Luxury%20safari%20tent%20interior%20with%20king-sized%20bed%2C%20elegant%20furnishings%2C%20warm%20lighting%2C%20wooden%20floors%2C%20rustic%20luxury%20decor%2C%20panoramic%20valley%20view%2C%20perfect%20for%20glamping%20experience&width=800&height=500&seq=tent6int&orientation=landscape",
            amenities: [
              "Private terrace with panoramic valley views",
              "En-suite bathroom with shower",
              "Organic toiletries",
              "Air conditioning and heating",
              "Mini refrigerator",
              "Coffee and tea station",
              "Wi-Fi access",
              "Daily housekeeping",
              "Yoga mat and meditation cushion",
              "Plush bathrobes and slippers",
            ],
          },
          "Panchvati Tent 4": {
            name: "Panchvati Tent 4",
            description:
              "Panchvati Tent 4 features a cozy queen-sized bed and a private dining area with valley views, making it perfect for couples seeking a romantic getaway. The tent is designed with soft lighting and warm tones to create an intimate atmosphere.",
            price: 159,
            capacity: 2,
            size: "390 sq ft",
            bedType: "Queen",
            image:
              "https://readdy.ai/api/search-image?query=Luxury%20safari%20tent%20interior%20with%20queen-sized%20bed%2C%20elegant%20furnishings%2C%20warm%20lighting%2C%20wooden%20floors%2C%20rustic%20luxury%20decor%2C%20romantic%20setting%20with%20dining%20area%2C%20perfect%20for%20glamping%20experience&width=800&height=500&seq=tent7int&orientation=landscape",
            amenities: [
              "Private dining area with valley views",
              "En-suite bathroom with shower",
              "Organic toiletries",
              "Air conditioning and heating",
              "Mini refrigerator",
              "Wine glasses and bottle opener",
              "Coffee and tea station",
              "Wi-Fi access",
              "Daily housekeeping",
              "Plush bathrobes and slippers",
            ],
          },
          "Panchvati Tent 5": {
            name: "Panchvati Tent 5",
            description:
              "Our most unique accommodation, Panchvati Tent 5 features a king-sized bed and an outdoor shower that allows you to connect with nature while maintaining privacy. The tent offers river views and is situated in a secluded spot for maximum tranquility.",
            price: 189,
            capacity: 2,
            size: "450 sq ft",
            bedType: "King",
            image:
              "https://readdy.ai/api/search-image?query=Luxury%20safari%20tent%20interior%20with%20king-sized%20bed%2C%20elegant%20furnishings%2C%20warm%20lighting%2C%20wooden%20floors%2C%20rustic%20luxury%20decor%2C%20river%20view%2C%20perfect%20for%20glamping%20experience&width=800&height=500&seq=tent8int&orientation=landscape",
            amenities: [
              "Private deck with river views",
              "Outdoor shower experience",
              "Indoor en-suite bathroom",
              "Organic toiletries",
              "Air conditioning and heating",
              "Mini refrigerator",
              "Coffee and tea station",
              "Wi-Fi access",
              "Daily housekeeping",
              "Hammock for relaxation",
              "Plush bathrobes and slippers",
            ],
          },
        };

        // Open modal with tent details
        function openTentDetailsModal(tentName) {
          const tent = tentDetails[tentName];
          if (!tent) return;

          // Populate modal content
          modalContent.innerHTML = `
                          <div class="flex flex-col md:flex-row gap-6">
                              <div class="md:w-1/2">
                                  <img src="${tent.image}" alt="${tent.name}" class="w-full h-64 md:h-80 object-cover object-top rounded">
                              </div>
                              <div class="md:w-1/2">
                                  <h3 class="text-2xl font-bold mb-2">${tent.name}</h3>
                                  <p class="text-gray-600 mb-4">${tent.description}</p>

                                  <div class="grid grid-cols-2 gap-4 mb-4">
                                      <div class="flex items-center">
                                          <div class="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full text-primary mr-2">
                                              <i class="ri-user-line"></i>
                                          </div>
                                          <div>
                                              <p class="text-sm text-gray-500">Capacity</p>
                                              <p class="font-medium">${tent.capacity} Guests</p>
                                          </div>
                                      </div>
                                      <div class="flex items-center">
                                          <div class="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full text-primary mr-2">
                                              <i class="ri-hotel-bed-line"></i>
                                          </div>
                                          <div>
                                              <p class="text-sm text-gray-500">Bed Type</p>
                                              <p class="font-medium">${tent.bedType}</p>
                                          </div>
                                      </div>
                                      <div class="flex items-center">
                                          <div class="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full text-primary mr-2">
                                              <i class="ri-ruler-line"></i>
                                          </div>
                                          <div>
                                              <p class="text-sm text-gray-500">Size</p>
                                              <p class="font-medium">${tent.size}</p>
                                          </div>
                                      </div>
                                      <div class="flex items-center">
                                          <div class="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full text-primary mr-2">
                                              <i class="ri-money-dollar-circle-line"></i>
                                          </div>
                                          <div>
                                              <p class="text-sm text-gray-500">Price</p>
                                              <p class="font-medium">$${tent.price} / night</p>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <div class="mt-8">
                              <h4 class="text-lg font-semibold mb-3">Amenities</h4>
                              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  ${tent.amenities
                                    .map(
                                      (amenity) => `
                                      <div class="flex items-center">
                                          <i class="ri-check-line text-primary mr-2"></i>
                                          <span>${amenity}</span>
                                      </div>
                                  `,
                                    )
                                    .join("")}
                              </div>
                          </div>

                          <div class="mt-8">
                              <h4 class="text-lg font-semibold mb-3">Booking Policies</h4>
                              <div class="bg-gray-50 p-4 rounded">
                                  <div class="mb-2">
                                      <span class="font-medium">Check-in:</span> 2:00 PM - 8:00 PM
                                  </div>
                                  <div class="mb-2">
                                      <span class="font-medium">Check-out:</span> By 11:00 AM
                                  </div>
                                  <div class="mb-2">
                                      <span class="font-medium">Cancellation:</span> Free cancellation up to 7 days before check-in
                                  </div>
                                  <div>
                                      <span class="font-medium">Pets:</span> Not allowed
                                  </div>
                              </div>
                          </div>

                          <div class="mt-8 flex justify-end">
                              <button class="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-button whitespace-nowrap transition-colors book-from-modal" data-tent="${tent.name}">
                                  Book Now
                              </button>
                          </div>
                      `;

          // Show modal
          modal.classList.remove("hidden");

          // Add event listener to "Book Now" button in modal
          const bookFromModalBtn = modalContent.querySelector(".book-from-modal");
          bookFromModalBtn.addEventListener("click", function () {
            const tentName = this.dataset.tent;
            modal.classList.add("hidden");
            
            // Open booking modal directly
            if (window.bookingForm) {
              window.bookingForm.openModal();
              // Pre-select the tent based on tent name
              setTimeout(() => {
                const tentMapping = {
                  'Triveni Tent 1': 'triveni-1',
                  'Triveni Tent 2': 'triveni-2',
                  'Triveni Tent 3': 'triveni-3',
                  'Panchvati Tent 1': 'panchvati-1',
                  'Panchvati Tent 2': 'panchvati-2',
                  'Panchvati Tent 3': 'panchvati-3',
                  'Panchvati Tent 4': 'panchvati-4',
                  'Panchvati Tent 5': 'panchvati-5'
                };
                const tentId = tentMapping[tentName];
                if (tentId) {
                  const tentSelect = document.querySelector(`input[value="${tentId}"]`);
                  if (tentSelect) {
                    tentSelect.checked = true;
                    window.bookingForm.selectTent(tentId);
                  }
                }
              }, 100);
            } else {
              // Fallback to scrolling to availability section
              document
                .getElementById("availability")
                .scrollIntoView({ behavior: "smooth" });
            }
          });
        }

        // Close modal
        closeModal.addEventListener("click", function () {
          modal.classList.add("hidden");
        });

        modalOverlay.addEventListener("click", function () {
          modal.classList.add("hidden");
        });

        // Prevent click on modal content from closing the modal
        modalContent.addEventListener("click", function (e) {
          e.stopPropagation();
        });

        // Add event listeners to "View Details" buttons
        const viewDetailsButtons = document.querySelectorAll(
          ".view-tent-details",
        );
        viewDetailsButtons.forEach((button) => {
          button.addEventListener("click", function () {
            const tentName = this.dataset.tent;
            openTentDetailsModal(tentName);
          });
        });
      });