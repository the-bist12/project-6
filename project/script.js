// Language translations
const translations = {
    en: {
        home: 'Home',
        weather: 'Weather',
        irrigation: 'Irrigation',
        crops: 'Crops',
        disease: 'Disease',
        market: 'Market',
        store: 'Store',
        welcome: 'Welcome to Smart Agriculture Assistant',
        subtitle: 'Revolutionizing farming with smart technology',
        explore: 'Explore Features'
    },
    ne: {
        home: 'गृह',
        weather: 'मौसम',
        irrigation: 'सिंचाई',
        crops: 'बाली',
        disease: 'रोग',
        market: 'बजार',
        store: 'पसल',
        welcome: 'स्मार्ट कृषि सहायकमा स्वागत छ',
        subtitle: 'स्मार्ट प्रविधिसँग खेती क्रान्ति',
        explore: 'सुविधाहरू अन्वेषण गर्नुहोस्'
    },
    hi: {
        home: 'होम',
        weather: 'मौसम',
        irrigation: 'सिंचाई',
        crops: 'फसल',
        disease: 'बीमारी',
        market: 'बाज़ार',
        store: 'स्टोर',
        welcome: 'स्मार्ट कृषि सहायक में आपका स्वागत है',
        subtitle: 'स्मार्ट तकनीक के साथ खेती में क्रांति',
        explore: 'सुविधाएं देखें'
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const links = document.querySelectorAll('.nav-link');
    const body = document.body;

    // Hamburger menu toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        body.style.overflow = body.style.overflow === 'hidden' ? '' : 'hidden';
    });

    // Close menu when clicking a link
    links.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            body.style.overflow = '';
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Add hover effect for desktop
    if (window.innerWidth > 1024) {
        links.forEach(link => {
            link.addEventListener('mouseenter', (e) => {
                const icon = e.currentTarget.querySelector('i');
                icon.style.transform = 'scale(1.2) rotate(360deg)';
            });

            link.addEventListener('mouseleave', (e) => {
                const icon = e.currentTarget.querySelector('i');
                icon.style.transform = 'scale(1) rotate(0)';
            });
        });
    }

    // Prevent scroll when mobile menu is open
    function toggleScroll(disable) {
        document.body.style.overflow = disable ? 'hidden' : '';
    }

    hamburger.addEventListener('click', () => {
        toggleScroll(hamburger.classList.contains('active'));
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            toggleScroll(false);
        });
    });

    // Language switcher functionality
    const languageBtn = document.querySelector('.language-btn');
    const languageDropdown = document.querySelector('.language-dropdown');
    const languageLinks = document.querySelectorAll('.language-dropdown a');
    const currentLang = languageBtn.querySelector('span');

    // Function to translate the page
    function translatePage(lang) {
        // Update navigation links
        document.querySelectorAll('[data-text]').forEach(element => {
            const key = element.getAttribute('data-text').toLowerCase();
            if (translations[lang] && translations[lang][key]) {
                element.querySelector('span').textContent = translations[lang][key];
            }
        });

        // Update main content
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const exploreBtn = document.querySelector('.cta-button');

        if (heroTitle) {
            heroTitle.textContent = translations[lang].welcome;
        }
        if (heroSubtitle) {
            heroSubtitle.textContent = translations[lang].subtitle;
        }
        if (exploreBtn) {
            exploreBtn.childNodes[0].textContent = translations[lang].explore + ' ';
        }

        // Update HTML lang attribute
        document.documentElement.lang = lang;
    }

    // Load saved language preference
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    translatePage(savedLang);
    currentLang.textContent = savedLang.toUpperCase();
    
    // Update active state in dropdown
    languageLinks.forEach(link => {
        if (link.getAttribute('data-lang') === savedLang) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Handle language selection
    languageLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = link.getAttribute('data-lang');
            
            // Update active state
            languageLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Update button text
            currentLang.textContent = lang.toUpperCase();
            
            // Store the language preference
            localStorage.setItem('preferredLanguage', lang);
            
            // Translate the page
            translatePage(lang);
        });
    });

    // Disease Detection Functionality
    const uploadArea = document.getElementById('uploadArea');
    const uploadPreview = document.getElementById('uploadPreview');
    const previewImage = document.getElementById('previewImage');
    const imageUpload = document.getElementById('imageUpload');
    const analysisResults = document.querySelector('.analysis-results');

    if (uploadArea) {
        uploadArea.addEventListener('click', () => {
            imageUpload.click();
        });

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                handleImageUpload(file);
            }
        });

        imageUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                handleImageUpload(file);
            }
        });
    }

    function handleImageUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            uploadArea.style.display = 'none';
            uploadPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    // Handle preview actions
    const tryAnotherBtn = uploadPreview?.querySelector('.action-btn:not(.primary)');
    const analyzeBtn = uploadPreview?.querySelector('.action-btn.primary');

    if (tryAnotherBtn) {
        tryAnotherBtn.addEventListener('click', () => {
            uploadArea.style.display = 'block';
            uploadPreview.style.display = 'none';
            analysisResults.style.display = 'none';
            imageUpload.value = '';
        });
    }

    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', () => {
            // Show loading state
            analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
            analyzeBtn.disabled = true;

            // Simulate analysis delay
            setTimeout(() => {
                analysisResults.style.display = 'block';
                analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analyze';
                analyzeBtn.disabled = false;

                // Scroll to results
                analysisResults.scrollIntoView({ behavior: 'smooth' });
            }, 2000);
        });
    }

    // Handle history view buttons
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const historyItem = btn.closest('.history-item');
            const diseaseInfo = {
                name: historyItem.querySelector('h4').textContent,
                date: historyItem.querySelector('p').textContent,
                status: historyItem.querySelector('.status').textContent,
                image: historyItem.querySelector('img').src
            };
            showHistoryDetails(diseaseInfo);
        });
    });

    function showHistoryDetails(info) {
        // Implement modal or detailed view of historical detection
        console.log('Showing details for:', info);
    }

    // Initialize market page if on market page
    if (window.location.pathname.includes('market.html')) {
        initializeMarketPage();
    }

    // Initialize store page if on store page
    if (window.location.pathname.includes('store.html')) {
        initializeStorePage();
    }
});

// Market Page Functionality
function initializeMarketPage() {
    const refreshBtn = document.querySelector('.refresh-btn');
    const marketSelect = document.querySelector('.market-select');
    const categorySelect = document.querySelector('.category-select');
    const searchInput = document.querySelector('.search-box input');

    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
            refreshBtn.disabled = true;

            // Simulate price update
            setTimeout(() => {
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Prices';
                refreshBtn.disabled = false;
                // Here you would typically fetch and update prices from an API
            }, 1500);
        });
    }

    // Market filters change handlers
    [marketSelect, categorySelect].forEach(select => {
        if (select) {
            select.addEventListener('change', updatePriceTable);
        }
    });

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('.price-table tbody tr');
            
            rows.forEach(row => {
                const product = row.querySelector('td').textContent.toLowerCase();
                row.style.display = product.includes(searchTerm) ? '' : 'none';
            });
        });
    }
}

function updatePriceTable() {
    // This would typically fetch data from an API based on selected filters
    console.log('Updating price table with new filters');
}

// Store Page Functionality
function initializeStorePage() {
    const categoryLinks = document.querySelectorAll('.category-list li');
    const priceRange = document.querySelector('.price-range');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const quantityButtons = document.querySelectorAll('.qty-btn');
    const removeButtons = document.querySelectorAll('.remove-item');
    const checkoutBtn = document.querySelector('.checkout-btn');
    const searchInput = document.querySelector('.search-input');
    const categoryFilter = document.querySelector('.category-filter');
    const sortFilter = document.querySelector('.sort-filter');

    // Category selection
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            categoryLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            filterProducts();
        });
    });

    // Price range filter
    if (priceRange) {
        priceRange.addEventListener('input', (e) => {
            const value = e.target.value;
            const rangeValues = document.querySelector('.range-values');
            if (rangeValues) {
                rangeValues.children[1].textContent = `Rs. ${value}`;
            }
            filterProducts();
        });
    }

    // Add to cart functionality
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const product = button.closest('.product-card');
            const productName = product.querySelector('h4').textContent;
            const price = product.querySelector('.price').textContent;
            
            addToCart({
                name: productName,
                price: price,
                quantity: 1
            });
        });
    });

    // Quantity adjustment
    quantityButtons.forEach(button => {
        button.addEventListener('click', () => {
            const input = button.parentElement.querySelector('input');
            const currentValue = parseInt(input.value);
            
            if (button.textContent === '+') {
                input.value = currentValue + 1;
            } else if (currentValue > 1) {
                input.value = currentValue - 1;
            }
            
            updateCartTotal();
        });
    });

    // Remove items from cart
    removeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const item = button.closest('.cart-item');
            item.remove();
            updateCartTotal();
            updateCartCount();
        });
    });

    // Checkout process
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            // Implement checkout process
            alert('Proceeding to checkout...');
        });
    }

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }

    // Category and sort filters
    [categoryFilter, sortFilter].forEach(filter => {
        if (filter) {
            filter.addEventListener('change', filterProducts);
        }
    });
}

function addToCart(product) {
    const cartItems = document.querySelector('.cart-items');
    if (!cartItems) return;

    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
        <img src="https://via.placeholder.com/50" alt="${product.name}">
        <div class="item-details">
            <h4>${product.name}</h4>
            <div class="item-price">${product.price}</div>
        </div>
        <div class="item-quantity">
            <button class="qty-btn">-</button>
            <input type="number" value="1" min="1">
            <button class="qty-btn">+</button>
        </div>
        <button class="remove-item"><i class="fas fa-trash"></i></button>
    `;

    cartItems.appendChild(cartItem);
    updateCartTotal();
    updateCartCount();

    // Add event listeners to new cart item
    const qtyBtns = cartItem.querySelectorAll('.qty-btn');
    const removeBtn = cartItem.querySelector('.remove-item');

    qtyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.parentElement.querySelector('input');
            const currentValue = parseInt(input.value);
            
            if (btn.textContent === '+') {
                input.value = currentValue + 1;
            } else if (currentValue > 1) {
                input.value = currentValue - 1;
            }
            
            updateCartTotal();
        });
    });

    removeBtn.addEventListener('click', () => {
        cartItem.remove();
        updateCartTotal();
        updateCartCount();
    });
}

function updateCartTotal() {
    const cartItems = document.querySelectorAll('.cart-item');
    let subtotal = 0;

    cartItems.forEach(item => {
        const price = parseFloat(item.querySelector('.item-price').textContent.replace('Rs. ', ''));
        const quantity = parseInt(item.querySelector('input').value);
        subtotal += price * quantity;
    });

    const shipping = 100; // Fixed shipping cost
    const total = subtotal + shipping;

    // Update summary
    const summaryRows = document.querySelectorAll('.summary-row');
    if (summaryRows.length >= 3) {
        summaryRows[0].querySelector('span:last-child').textContent = `Rs. ${subtotal}`;
        summaryRows[2].querySelector('span:last-child').textContent = `Rs. ${total}`;
    }
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    const itemCount = document.querySelectorAll('.cart-item').length;
    if (cartCount) {
        cartCount.textContent = `${itemCount} item${itemCount !== 1 ? 's' : ''}`;
    }
}

function filterProducts() {
    const searchTerm = document.querySelector('.search-input')?.value.toLowerCase() || '';
    const selectedCategory = document.querySelector('.category-filter')?.value || 'all';
    const sortBy = document.querySelector('.sort-filter')?.value || 'popular';
    const priceLimit = document.querySelector('.price-range')?.value || 10000;

    const products = document.querySelectorAll('.product-card');
    products.forEach(product => {
        const name = product.querySelector('h4').textContent.toLowerCase();
        const price = parseFloat(product.querySelector('.price').textContent.replace('Rs. ', ''));
        const category = product.getAttribute('data-category') || 'all';

        const matchesSearch = name.includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
        const matchesPrice = price <= priceLimit;

        product.style.display = matchesSearch && matchesCategory && matchesPrice ? '' : 'none';
    });

    // Sort products
    const productsGrid = document.querySelector('.products-grid');
    if (productsGrid) {
        const productsArray = Array.from(products);
        productsArray.sort((a, b) => {
            const priceA = parseFloat(a.querySelector('.price').textContent.replace('Rs. ', ''));
            const priceB = parseFloat(b.querySelector('.price').textContent.replace('Rs. ', ''));

            switch (sortBy) {
                case 'price-low':
                    return priceA - priceB;
                case 'price-high':
                    return priceB - priceA;
                case 'newest':
                    return b.dataset.date - a.dataset.date;
                default:
                    return 0;
            }
        });

        productsArray.forEach(product => {
            productsGrid.appendChild(product);
        });
    }
}

// Animate statistics numbers
function animateNumbers() {
    const numbers = document.querySelectorAll('.stat-number[data-target]');
    
    numbers.forEach(number => {
        const target = parseInt(number.getAttribute('data-target'));
        const increment = target / 100; // Will take 100 steps to reach target
        
        function updateNumber() {
            const current = parseInt(number.innerText);
            if (current < target) {
                number.innerText = Math.ceil(current + increment);
                setTimeout(updateNumber, 20);
            }
        }
        
        updateNumber();
    });
}

// Run animation when the element is in view
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateNumbers();
            observer.unobserve(entry.target);
        }
    });
});

const statsContainer = document.querySelector('.stats-container');
if (statsContainer) {
    observer.observe(statsContainer);
} 