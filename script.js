document.addEventListener('DOMContentLoaded', () => {
    
    let STORE_INFO = JSON.parse(localStorage.getItem('trendOptikStoreInfo')) || {
        phone: "5309112568",
        address: "Merkez, Atatürk Caddesi No:123/A Yenişehir / Mersin",
        hours: "Pazartesi - Cumartesi: 09:00 - 20:00 / Pazar: 11:00 - 18:00",
        tourUrl: ""
    };

    const burgerMenu = document.getElementById('burgerMenu');
    const navMenu = document.getElementById('navMenu');
    const productGrid = document.getElementById('productGrid');
    const galleryStatus = document.getElementById('gallery-status');
    const showroomSearch = document.getElementById('showroomSearch');
    const showroomSort = document.getElementById('showroomSort');
    const dynamicNavMenu = document.getElementById('dynamicNavMenu');

    const productDetailModal = document.getElementById('productDetailModal');
    const closeDetailModal = document.getElementById('closeDetailModal');
    const modalDetailBody = document.getElementById('modalDetailBody');

    const storeTourModal = document.getElementById('storeTourModal');
    const closeTourModal = document.getElementById('closeTourModal');
    const tourModalCloseBtn = document.getElementById('tourModalCloseBtn');
    const triggerLiveStoreTourBtn = document.getElementById('triggerLiveStoreTourBtn');

    const liveStoreStatus = document.getElementById('liveStoreStatus');
    const floatingFavBasket = document.getElementById('floatingFavBasket');
    const favCountLabel = document.getElementById('favCountLabel');
    const announcementText = document.getElementById('announcementText');

    const audioToggleBtn = document.getElementById('audioToggleBtn');
    const langToggleBtn = document.getElementById('langToggleBtn');
    const bgMusic = document.getElementById('luxuryBackgroundMusic');

    let likedProductIds = [];
    let currentStoreData = []; 

    const savedTheme = localStorage.getItem('trendOptikTheme') || "luxury";
    document.body.setAttribute('data-theme', savedTheme);

    document.querySelectorAll('.theme-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            const selectedTheme = dot.getAttribute('data-theme');
            document.body.setAttribute('data-theme', selectedTheme);
            localStorage.setItem('trendOptikTheme', selectedTheme);
        });
    });

    if (triggerLiveStoreTourBtn) {
        triggerLiveStoreTourBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (STORE_INFO.tourUrl && STORE_INFO.tourUrl.trim() !== "") {
                window.open(STORE_INFO.tourUrl.trim(), '_blank');
            } else {
                if(storeTourModal) storeTourModal.style.display = "flex";
            }
        });
    }

    if(closeTourModal) closeTourModal.addEventListener('click', () => { storeTourModal.style.display = "none"; });
    if(tourModalCloseBtn) tourModalCloseBtn.addEventListener('click', () => { storeTourModal.style.display = "none"; });

    function applyLiveStoreConfig() {
        if(document.getElementById('liveLabelHours')) document.getElementById('liveLabelHours').textContent = STORE_INFO.hours;
        if(document.getElementById('liveLabelAddress')) document.getElementById('liveLabelAddress').textContent = STORE_INFO.address;
        if(document.getElementById('liveLabelPhone')) document.getElementById('liveLabelPhone').textContent = "Tel: +90 " + STORE_INFO.phone;
        if(document.getElementById('liveCallBtnHref')) document.getElementById('liveCallBtnHref').href = "tel:+90" + STORE_INFO.phone;
    }
    applyLiveStoreConfig();

    function loadLiveAnnouncement() {
        if(!announcementText) return;
        announcementText.textContent = localStorage.getItem('trendOptikAnnouncementText') || "TREND OPTİK MERSİN LÜKS SHOWROOM KATALOĞUNA HOŞ GELDİNİZ.";
    }
    loadLiveAnnouncement();

    if (burgerMenu && navMenu) {
        burgerMenu.addEventListener('click', () => {
            burgerMenu.classList.toggle('active'); navMenu.classList.toggle('active');
        });
    }

    if (audioToggleBtn && bgMusic) {
        audioToggleBtn.addEventListener('click', () => {
            if (bgMusic.paused) { bgMusic.play().then(() => { audioToggleBtn.textContent = "🔊"; }).catch(() => {}); } 
            else { bgMusic.pause(); audioToggleBtn.textContent = "🎵"; }
        });
    }

    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            const currentLang = langToggleBtn.getAttribute('data-lang');
            const newLang = currentLang === "tr" ? "en" : "tr";
            langToggleBtn.setAttribute('data-lang', newLang);
            langToggleBtn.textContent = newLang === "tr" ? "EN" : "TR";
            document.querySelectorAll('[data-tr]').forEach(el => { el.textContent = el.getAttribute(`data-${newLang}`); });
            document.querySelectorAll('[data-placeholder-tr]').forEach(el => { el.placeholder = el.getAttribute(`data-placeholder-${newLang}`); });
            renderShowroom();
        });
    }

    function checkLiveStoreStatus() {
        if(!liveStoreStatus) return;
        const now = new Date(); const day = now.getDay(); const hour = now.getHours();
        const currentLang = langToggleBtn ? langToggleBtn.getAttribute('data-lang') : "tr";
        let isOpen = (day === 0) ? (hour >= 11 && hour < 18) : (hour >= 9 && hour < 20);
        if(isOpen) {
            liveStoreStatus.className = "live-store-status open";
            liveStoreStatus.textContent = currentLang === "tr" ? "● SHOWROOM ŞU AN AÇIK" : "● SHOWROOM IS CURRENTLY OPEN";
        } else {
            liveStoreStatus.className = "live-store-status closed";
            liveStoreStatus.textContent = currentLang === "tr" ? "● SHOWROOM ŞU AN KAPALI" : "● SHOWROOM IS CLOSED";
        }
    }
    checkLiveStoreStatus();

    function renderDynamicBrandLogos() {
        let savedBrands = JSON.parse(localStorage.getItem('trendOptikBrands')) || [];
        savedBrands.forEach(b => {
            const li = document.createElement('li');
            if (b.logo && b.logo !== "") {
                li.innerHTML = `<a href="#" class="brand-link" data-filter="${b.id}"><img src="${b.logo}" class="menu-custom-logo-img"></a>`;
            } else {
                li.innerHTML = `<a href="#" class="brand-link menu-custom-text-logo" data-filter="${b.id}">${b.name.toUpperCase()}</a>`;
            }
            dynamicNavMenu.appendChild(li);
        });
    }
    renderDynamicBrandLogos();

    if(document.querySelectorAll('.faq-trigger')) {
        document.querySelectorAll('.faq-trigger').forEach(trigger => {
            trigger.addEventListener('click', () => { trigger.parentElement.classList.toggle('active'); });
        });
    }

    // TERTEMİZ REYON ÇİZİMİ
    function renderShowroom() {
        productGrid.innerHTML = "";
        const currentLang = langToggleBtn ? langToggleBtn.getAttribute('data-lang') : "tr";
        if (currentStoreData.length === 0) {
            productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:#444; font-size:12px; padding:40px 0;">Koleksiyon Boş...</p>`; return;
        }

        currentStoreData.forEach((prod) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.setAttribute('data-brand', prod.brand);
            card.setAttribute('data-category', prod.prodCategory || 'gunes');
            card.setAttribute('data-faceshape', prod.prodFaceShape || 'yuvarlak');
            card.id = `prod-id-${prod.originalId}`; 

            if (prod.featured) card.classList.add('lux-featured-item');

            const badgeHtml = prod.featured ? `<div class="featured-badge">★ FEATURED</div>` : '';
            const customLabelHtml = (prod.label && prod.label !== 'none') ? `<div class="custom-badge">${prod.label}</div>` : '';
            
            const safeCoverIndex = (prod.coverIndex !== undefined && prod.coverIndex !== null) ? prod.coverIndex : 0;
            const cardImageSrc = (prod.images && prod.images.length > 0) ? prod.images[safeCoverIndex] : "";

            let priceHtml = prod.discountPrice ? 
                `<div class="card-price-box"><span class="old-price">${prod.price} TL</span><span class="current-price discounted">${prod.discountPrice} TL</span></div>` : 
                `<div class="card-price-box"><span class="current-price">${prod.price} TL</span></div>`;

            const isLiked = likedProductIds.includes(prod.originalId);
            const labelBtnText = currentLang === "tr" ? "DETAYLARI İNCELE" : "VIEW DETAILS";

            card.innerHTML = `
                ${badgeHtml} ${customLabelHtml}
                <div class="img-container">
                    <img src="${cardImageSrc}" class="main-display-img">
                    <div class="card-fav-trigger ${isLiked ? 'liked' : ''}" data-prodid="${prod.originalId}">❤</div>
                </div>
                <div class="card-info">
                    <div class="card-brand">${prod.brand.toUpperCase()}</div>
                    <div class="card-title">${prod.title}</div>
                    ${priceHtml}
                </div>
                <div class="whatsapp-btn" style="background:#111; color:var(--gold-color); font-size:10px; border-top:1px solid #1c1c1c;">${labelBtnText}</div>
            `;

            card.addEventListener('click', (e) => {
                if(e.target.classList.contains('card-fav-trigger')) return;
                incrementProductAnalyticsCounter(prod.originalId, 'clicks');
                openLuxuryProductDetail(prod, prod.originalId);
            });
            productGrid.appendChild(card);
        });

        // Kalpleme
        document.querySelectorAll('.card-fav-trigger').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const pId = parseInt(btn.getAttribute('data-prodid'));
                if(likedProductIds.includes(pId)) {
                    likedProductIds = likedProductIds.filter(id => id !== pId); btn.classList.remove('liked');
                } else {
                    likedProductIds.push(pId); btn.classList.add('liked');
                }
                updateFloatingBasketUI();
            });
        });
    }

    function incrementProductAnalyticsCounter(idx, type) {
        let store = JSON.parse(localStorage.getItem('trendOptikMatrixV5')) || [];
        if(store[idx]) {
            if(!store[idx].analytics) store[idx].analytics = { clicks: 0, leads: 0 };
            store[idx].analytics[type] = (store[idx].analytics[type] || 0) + 1;
            localStorage.setItem('trendOptikMatrixV5', JSON.stringify(store));
        }
    }

    // TYPO VE CRASH SATIRI TAMAMEN KAZINDI %100 YÜKSEK KARARLILIK
    function updateFloatingBasketUI() {
        if(likedProductIds.length > 0) {
            favCountLabel.textContent = likedProductIds.length; 
            floatingFavBasket.style.display = "flex";
        } else {
            floatingFavBasket.style.display = "none";
        }
    }

    if (floatingFavBasket) {
        floatingFavBasket.addEventListener('click', () => {
            let store = JSON.parse(localStorage.getItem('trendOptikMatrixV5')) || [];
            let chosenText = "";
            likedProductIds.forEach(id => {
                const item = store[id]; const price = item.discountPrice ? item.discountPrice : item.price;
                chosenText += `- ${item.brand.toUpperCase()} ${item.title} (${price} TL)\n`;
                incrementProductAnalyticsCounter(id, 'leads');
            });
            const basketMsg = `Merhaba Trend Optik Mersin, seçtiğim şu lüks modeller hakkında bilgi almak istiyorum:\n\n${chosenText}`;
            window.open(`https://wa.me/90${STORE_INFO.phone}?text=${encodeURIComponent(basketMsg)}`, '_blank');
        });
    }

    // DETAY VE 2D SANAL AYNA MOTORU
    function openLuxuryProductDetail(prod, originalId) {
        const currentLang = langToggleBtn ? langToggleBtn.getAttribute('data-lang') : "tr";
        const safeCoverIdx = (prod.coverIndex !== undefined && prod.coverIndex !== null) ? prod.coverIndex : 0;
        const mainViewImgSrc = (prod.images && prod.images.length > 0) ? prod.images[safeCoverIdx] : "";

        let priceHtml = prod.discountPrice ? 
            `<div class="card-price-box" style="font-size:16px;"><span class="old-price">${prod.price} TL</span><span class="current-price discounted" style="font-size:18px; font-weight:700;">${prod.discountPrice} TL</span></div>` : 
            `<div class="card-price-box" style="font-size:18px; font-weight:700;"><span class="current-price">${prod.price} TL</span></div>`;

        let modalGalleryNodesHtml = `<div class="modal-gallery-strip">`;
        if (prod.images && prod.images.length > 0) {
            prod.images.forEach((imgSrc, imgIdx) => {
                modalGalleryNodesHtml += `<img src="${imgSrc}" class="modal-thumb-node ${imgIdx === safeCoverIdx ? 'active' : ''}" data-mid="${originalId}" data-midx="${imgIdx}">`;
            });
        }
        modalGalleryNodesHtml += `</div>`;

        const activePrice = prod.discountPrice ? prod.discountPrice : prod.price;
        const messageText = `Merhaba Trend Optik, vitrinde incelediğim ${prod.brand.toUpperCase()} - ${prod.title} (${activePrice} TL) modelini sipariş etmek istiyorum.`;
        const waLink = `https://wa.me/90${STORE_INFO.phone}?text=${encodeURIComponent(messageText)}`;
        const shareItemUrl = `${CURRENT_SITE_URL}#prod-id-${originalId}`;

        modalDetailBody.innerHTML = `
            <div class="modal-img-frame"><img src="${mainViewImgSrc}" id="modal-viewport-target-${originalId}"></div>
            ${modalGalleryNodesHtml}
            
            <div class="lux-mirror-box">
                <div class="lux-mirror-title">🕶 2D SANAL DENEME ODASI</div>
                <div class="mirror-work-bench" id="mirrorBench">
                    <p class="bench-empty-msg" id="benchEmptyMsg">Aynayı açmak için aşağıdan kendi selfie (özçekim) fotoğrafınızı yükleyin şef.</p>
                    <img class="mirror-user-selfie" id="mirrorSelfieView" style="display:none;">
                    <img src="${mainViewImgSrc}" class="mirror-overlay-glasses" id="mirrorGlassesOverlay" style="display:none;">
                </div>
                
                <div class="mirror-controls-pad">
                    <input type="file" id="mirrorSelfieInput" accept="image/*" style="display:none;">
                    <button type="button" class="admin-submit-btn-gold" id="triggerSelfieUploadBtn" style="font-size:10px; padding:8px; margin-bottom:10px;">📸 KENDİ SELFİENİ YÜKLE</button>
                    
                    <div id="mirrorSlidersGroup" style="display:none;">
                        <div class="slider-row">
                            <label>BOYUT</label>
                            <input type="range" id="sliderScale" class="mirror-slider" min="50" max="250" value="120">
                        </div>
                        <div class="slider-row">
                            <label>YUKARI/AŞAĞI</label>
                            <input type="range" id="sliderY" class="mirror-slider" min="-100" max="100" value="0">
                        </div>
                        <div class="slider-row">
                            <label>SAĞ/SOL</label>
                            <input type="range" id="sliderX" class="mirror-slider" min="-100" max="100" value="0">
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-info-box">
                <div class="modal-brand">${prod.brand.toUpperCase()}</div>
                <div class="modal-title">${prod.title}</div>
                <div class="modal-meta-row">
                    <div class="modal-meta-tag">${prod.prodCategory === 'optik' ? 'Optik' : 'Güneş'}</div>
                    <div class="modal-meta-tag">Size: ${prod.prodEkartman || '53'}□${prod.prodKopru || '18'} ${prod.prodSap || '140'}</div>
                    <div class="modal-meta-tag">Fit: ${prod.prodFaceShape || 'yuvarlak'}</div>
                    <div class="modal-meta-tag">Color: ${prod.prodColor || 'siyah'}</div>
                    <div class="modal-meta-tag">Lens: ${prod.prodLens || 'standart'}</div>
                </div>
                ${priceHtml}
                <button type="button" class="modal-share-btn" data-shareurl="${shareItemUrl}">🔗 Ürün Linkini Kopyala</button>
            </div>
            <a href="${waLink}" id="modalWaOrderBtnClick" target="_blank" class="whatsapp-btn" style="font-size:12px; padding:12px;">💬 WHATSAPP İLE SİPARİŞ VER</a>
        `;
        productDetailModal.style.display = "block";

        const selfieInput = document.getElementById('mirrorSelfieInput');
        const triggerSelfieBtn = document.getElementById('triggerSelfieUploadBtn');
        const selfieView = document.getElementById('mirrorSelfieView');
        const glassesOverlay = document.getElementById('mirrorGlassesOverlay');
        const benchMsg = document.getElementById('benchEmptyMsg');
        const slidersGroup = document.getElementById('mirrorSlidersGroup');

        const sScale = document.getElementById('sliderScale');
        const sY = document.getElementById('sliderY');
        const sX = document.getElementById('sliderX');

        if(triggerSelfieBtn && selfieInput) {
            triggerSelfieBtn.addEventListener('click', () => selfieInput.click());
            selfieInput.addEventListener('change', (e) => {
                const file = e.target.files[0]; if(!file) return;
                const r = new FileReader();
                r.onload = (event) => {
                    selfieView.src = event.target.result; selfieView.style.display = "block";
                    glassesOverlay.style.display = "block"; benchMsg.style.display = "none";
                    slidersGroup.style.display = "block"; triggerSelfieBtn.textContent = "🔄 RESMİ DEĞIŞTİR";
                };
                r.readAsDataURL(file);
            });
        }

        function update2DMirrorOverlayPosition() {
            if(!glassesOverlay) return;
            glassesOverlay.style.width = sScale.value + "px";
            glassesOverlay.style.top = `calc(50% + ${sY.value}px)`;
            glassesOverlay.style.left = `calc(50% + ${sX.value}px)`;
            glassesOverlay.style.transform = "translate(-50%, -50%)";
        }

        if(sScale) {
            sScale.addEventListener('input', update2DMirrorOverlayPosition);
            sY.addEventListener('input', update2DMirrorOverlayPosition);
            sX.addEventListener('input', update2DMirrorOverlayPosition);
        }

        document.getElementById('modalWaOrderBtnClick').addEventListener('click', () => { incrementProductAnalyticsCounter(originalId, 'leads'); });
        document.querySelector('.modal-share-btn').addEventListener('click', (e) => {
            navigator.clipboard.writeText(e.target.getAttribute('data-shareurl')); alert("Ürün linki kopyalandı!");
        });

        document.querySelectorAll('.modal-thumb-node').forEach(node => {
            node.addEventListener('click', () => {
                const mId = node.getAttribute('data-mid'); const mIdx = parseInt(node.getAttribute('data-midx'));
                const newImgSrc = prod.images[mIdx];
                document.getElementById(`modal-viewport-target-${mId}`).src = newImgSrc;
                if(glassesOverlay) glassesOverlay.src = newImgSrc; 
                document.querySelectorAll('.modal-thumb-node').forEach(el => el.classList.remove('active'));
                node.classList.add('active');
            });
        });
    }

    function loadAndInitStoreData() {
        let rawStore = JSON.parse(localStorage.getItem('trendOptikMatrixV5')) || [];
        currentStoreData = rawStore.map((item, idx) => ({ ...item, originalId: idx }));
        sortAndFilterEngine();
    }

    function sortAndFilterEngine() {
        const sortType = showroomSort ? showroomSort.value : "default";
        if (sortType === "price-asc") {
            currentStoreData.sort((a, b) => (a.discountPrice ? a.discountPrice : a.price) - (b.discountPrice ? b.discountPrice : b.price));
        } else if (sortType === "price-desc") {
            currentStoreData.sort((a, b) => (b.discountPrice ? b.discountPrice : b.price) - (a.discountPrice ? a.discountPrice : a.price));
        } else {
            currentStoreData.sort((a, b) => b.originalId - a.originalId);
        }
        renderShowroom();
    }

    if(showroomSort) { showroomSort.addEventListener('change', sortAndFilterEngine); }

    loadAndInitStoreData();

    if (window.location.hash) {
        setTimeout(() => {
            const targetCard = document.querySelector(window.location.hash);
            if (targetCard) {
                targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetCard.classList.add('scanned-highlight');
                setTimeout(() => { targetCard.classList.remove('scanned-highlight'); }, 4000);
            }
        }, 800);
    }

    if (showroomSearch) {
        showroomSearch.addEventListener('input', (e) => {
            const keyword = e.target.value.toLowerCase().trim();
            document.querySelectorAll('.card').forEach(card => {
                const brand = card.querySelector('.card-brand').textContent.toLowerCase();
                const title = card.querySelector('.card-title').textContent.toLowerCase();
                const face = card.getAttribute('data-faceshape').toLowerCase();
                if (brand.includes(keyword) || title.includes(keyword) || face.includes(keyword)) card.classList.remove('hidden');
                else card.classList.add('hidden');
            });
        });
    }

    // RESİMLİ LOGOLARDA TIKLAMA HEDEFİNİ ŞAŞIRMAYAN SEÇİCİ DETEKTÖRÜ (.closest ENTEGRESİ)
    document.addEventListener('click', (e) => {
        const brandLink = e.target.closest('.brand-link');
        if (!brandLink) return;
        e.preventDefault();
        
        const filter = brandLink.getAttribute('data-filter');
        if (burgerMenu && navMenu) { burgerMenu.classList.remove('active'); navMenu.classList.remove('active'); }

        if (filter === 'all') galleryStatus.textContent = "INTERAKTIF GÖZLÜK KATALOĞU";
        else if (filter === 'featured') galleryStatus.textContent = "★ ÖNE ÇIKAN ÖZEL MODELLER";
        else galleryStatus.textContent = `${filter.toUpperCase()} REYONU SEÇKİLERİ`;

        document.querySelectorAll('.card').forEach(card => {
            const isFeatured = card.getAttribute('data-featured') === 'true';
            const brand = card.getAttribute('data-brand'); const face = card.getAttribute('data-faceshape'); const cat = card.getAttribute('data-category');

            if (filter === 'all') card.classList.remove('hidden');
            else if (filter === 'featured') isFeatured ? card.classList.remove('hidden') : card.classList.add('hidden');
            else if (brandLink.classList.contains('category-link')) cat === filter ? card.classList.remove('hidden') : card.classList.add('hidden');
            else if (brandLink.classList.contains('face-link')) face === filter ? card.classList.remove('hidden') : card.classList.add('hidden');
            else brand === filter ? card.classList.remove('hidden') : card.classList.add('hidden');
        });
    });
});
