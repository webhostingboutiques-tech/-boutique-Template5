document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Navbar
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Reveal Animations (Intersection Observer)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-up, .slide-in');
    animatedElements.forEach(el => observer.observe(el));

    // 3. Mobile Menu Toggle
    const menuBtn = document.getElementById('menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('open');
            navLinks.classList.toggle('active');
        });
    }

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            menuBtn.classList.remove('open');
            navLinks.classList.remove('active');
        });
    });

    // 4. Cart Logic
    let cart = [];
    const cartIcon = document.getElementById('cart-icon');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCartBtn = document.getElementById('close-cart');
    const cartCount = document.querySelector('.cart-count');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');

    function toggleCart() {
        cartSidebar.classList.toggle('open');
        cartOverlay.classList.toggle('active');
    }

    cartIcon.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);

    function updateCart() {
        cartCount.textContent = cart.length;
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align:center; color:#888; margin-top: 2rem;">Your cart is empty.</p>';
        } else {
            cart.forEach((item, index) => {
                total += parseFloat(item.price);
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <img src="${item.img}" alt="${item.name}">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        ${item.options ? `<p style="font-size: 0.75rem; color: #76736F; margin-bottom: 0.3rem;">${item.options}</p>` : ''}
                        <p style="font-weight: 500;">$${item.price.toFixed(2)}</p>
                        <button class="remove-item" data-index="${index}">Remove</button>
                    </div>
                `;
                cartItemsContainer.appendChild(itemEl);
            });
        }
        cartTotalPrice.textContent = `$${total.toFixed(2)}`;

        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                cart.splice(idx, 1);
                updateCart();
            });
        });
    }

    // 5. Quick View Modal
    const quickviewModal = document.getElementById('quickview-modal');
    const closeQuickviewBtn = document.getElementById('close-quickview');
    const qvImg = document.getElementById('qv-img');
    const qvTitle = document.getElementById('qv-title');
    const qvPrice = document.getElementById('qv-price');
    const qvAddCart = document.getElementById('qv-add-cart');
    
    let currentQvItem = null;

    document.querySelectorAll('.btn-quickview, .btn-add-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Find parent product card
            const card = e.target.closest('.product-card');
            const cartBtn = card.querySelector('.btn-add-cart');
            
            const id = cartBtn.getAttribute('data-id');
            const name = cartBtn.getAttribute('data-name');
            const basePrice = parseFloat(cartBtn.getAttribute('data-price'));
            const img = cartBtn.getAttribute('data-img');
            
            currentQvItem = { id, name, basePrice, img };
            
            // Populate Modal
            qvImg.src = img;
            qvTitle.textContent = name;
            
            const blouseSelect = document.getElementById('qv-blouse');
            const fallSelect = document.getElementById('qv-fall');
            blouseSelect.value = 'Unstitched';
            fallSelect.value = 'No';
            
            const updateQvPrice = () => {
                const bPrice = parseFloat(blouseSelect.options[blouseSelect.selectedIndex].getAttribute('data-price'));
                const fPrice = parseFloat(fallSelect.options[fallSelect.selectedIndex].getAttribute('data-price'));
                qvPrice.textContent = `$${(basePrice + bPrice + fPrice).toFixed(2)}`;
            };

            blouseSelect.addEventListener('change', updateQvPrice);
            fallSelect.addEventListener('change', updateQvPrice);
            
            updateQvPrice();
            quickviewModal.classList.add('active');
        });
    });

    closeQuickviewBtn.addEventListener('click', () => {
        quickviewModal.classList.remove('active');
    });

    const paymentModal = document.getElementById('payment-modal');

    // Close modlas on outside click
    window.addEventListener('click', (e) => {
        if(e.target === quickviewModal) quickviewModal.classList.remove('active');
        if(e.target === paymentModal) paymentModal.classList.remove('active');
    });

    qvAddCart.addEventListener('click', () => {
        if (currentQvItem) {
            const blouseSelect = document.getElementById('qv-blouse');
            const fallSelect = document.getElementById('qv-fall');
            
            const bPrice = parseFloat(blouseSelect.options[blouseSelect.selectedIndex].getAttribute('data-price'));
            const fPrice = parseFloat(fallSelect.options[fallSelect.selectedIndex].getAttribute('data-price'));
            const finalPrice = currentQvItem.basePrice + bPrice + fPrice;
            
            cart.push({
                id: currentQvItem.id,
                name: currentQvItem.name,
                img: currentQvItem.img,
                price: finalPrice,
                options: `${blouseSelect.options[blouseSelect.selectedIndex].text} | ${fallSelect.options[fallSelect.selectedIndex].text}`
            });
            
            updateCart();
            
            const originalText = qvAddCart.textContent;
            qvAddCart.textContent = 'Adding...';
            setTimeout(() => {
                qvAddCart.textContent = 'Added to Cart!';
                setTimeout(() => {
                    qvAddCart.textContent = originalText;
                    quickviewModal.classList.remove('active');
                    toggleCart();
                }, 800);
            }, 500);
        }
    });

    // 6. Checkout / Payment Modal
    const checkoutBtn = document.getElementById('checkout-btn');
    const closePaymentBtn = document.getElementById('close-payment');
    const processPayBtn = document.getElementById('process-pay-btn');
    const paymentBody = document.getElementById('payment-body');
    const paymentSuccess = document.getElementById('payment-success');
    const continueShoppingBtn = document.getElementById('continue-shopping');

    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert("Your cart is currently empty.");
            return;
        }
        toggleCart();
        paymentModal.classList.add('active');
    });

    closePaymentBtn.addEventListener('click', () => {
        paymentModal.classList.remove('active');
    });

    // Payment Tabs Toggling
    document.querySelectorAll('.pay-tab').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.pay-tab').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    processPayBtn.addEventListener('click', () => {
        // Basic validation
        const inputs = document.querySelectorAll('#payment-body .form-input[required]');
        let isValid = true;
        inputs.forEach(input => {
            if(!input.value.trim()) isValid = false;
        });
        
        if(!isValid) {
            alert("Please complete all required shipping details.");
            return;
        }

        const originalText = processPayBtn.textContent;
        processPayBtn.textContent = 'Processing securely...';
        processPayBtn.style.opacity = '0.7';
        processPayBtn.disabled = true;

        setTimeout(() => {
            paymentBody.style.display = 'none';
            paymentSuccess.style.display = 'block';
            
            // Empty Cart
            cart = [];
            updateCart();
        }, 1500);
    });

    continueShoppingBtn.addEventListener('click', () => {
        paymentModal.classList.remove('active');
        setTimeout(() => {
            paymentBody.style.display = 'block';
            paymentSuccess.style.display = 'none';
            processPayBtn.textContent = 'Complete Order';
            processPayBtn.style.opacity = '1';
            processPayBtn.disabled = false;
            document.querySelectorAll('.form-input').forEach(i => i.value = '');
        }, 500);
    });
});
