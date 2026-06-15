(() => {
    // --- TREND OPTİK MERSİN AUTOMATION CONTROL MATRIX V5 ---
    const CURRENT_SITE_URL = window.location.href.replace('admin.html', 'index.html');

    const securePassField = document.getElementById('securePassField');
    const secureLoginBtn = document.getElementById('secureLoginBtn');
    const adminAuthScreen = document.getElementById('adminAuthScreen');
    const secureMainDashboard = document.getElementById('secureMainDashboard');
    const adminQuickExit = document.getElementById('adminQuickExit');

    const brandForm = document.getElementById('brandForm');
    const adminForm = document.getElementById('adminForm');
    const storeConfigForm = document.getElementById('storeConfigForm');
    const bulkDiscountForm = document.getElementById('bulkDiscountForm');
    
    const prodBrandSelect = document.getElementById('prodBrand');
    const bulkBrandTarget = document.getElementById('bulkBrandTarget');
    const fileInput = document.getElementById('prodFiles');
    const adminPreviewGrid = document.getElementById('adminPreviewGrid');
    const previewTitle = document.getElementById('previewTitle');
    const clearStorageBtn = document.getElementById('clearStorageBtn');
    const adminProductControlList = document.getElementById('adminProductControlList');
    const adminBrandsContainerList = document.getElementById('adminBrandsContainerList');

    const announcementInput = document.getElementById('announcementInput');
    const saveAnnouncementBtn = document.getElementById('saveAnnouncementBtn');
    const qrPrintIsolatedFrame = document.getElementById('qrPrintIsolatedFrame');

    const exportBackupBtn = document.getElementById('exportBackupBtn');
    const importBackupFile = document.getElementById('importBackupFile');

    let loadedBase64Images = [];
    let selectedCoverIndex = 0;

    // KALICI PANEL OTURUM SİGORTASI (Kapanana kadar panelden asla atmaz)
    if (localStorage.getItem('trendOptikAdminTokenV5') === 'secure_active') {
        if(adminAuthScreen && secureMainDashboard) {
            adminAuthScreen.style.display = "none"; secureMainDashboard.style.display = "block";
            initAdminDashboard();
        }
    }

    if (secureLoginBtn && securePassField) {
        secureLoginBtn.addEventListener('click', () => {
            if (securePassField.value === "123123123") {
                localStorage.setItem('trendOptikAdminTokenV5', 'secure_active');
                adminAuthScreen.style.display = "none"; secureMainDashboard.style.display = "block";
                initAdminDashboard();
            } else {
                alert("Hatalı Güvenlik Kimliği!"); securePassField.value = "";
            }
        });
    }

    if (adminQuickExit) {
        adminQuickExit.addEventListener('click', () => {
            localStorage.removeItem('trendOptikAdminTokenV5'); window.location.reload();
        });
    }

    if (saveAnnouncementBtn && announcementInput) {
        announcementInput.value = localStorage.getItem('trendOptikAnnouncementText') || "";
        saveAnnouncementBtn.addEventListener('click', () => {
            localStorage.setItem('trendOptikAnnouncementText', announcementInput.value.trim());
            alert("Üst duyuru bandı güncellendi!");
        });
    }

    if(storeConfigForm) {
        let currentInfo = JSON.parse(localStorage.getItem('trendOptikStoreInfo')) || {
            phone: "5309112568", address: "Merkez, Atatürk Caddesi No:123/A Yenişehir / Mersin", hours: "Pazartesi - Cumartesi: 09:00 - 20:00 / Pazar: 11:00 - 18:00", tourUrl: ""
        };
        document.getElementById('cfgStorePhone').value = currentInfo.phone;
        document.getElementById('cfgStoreAddress').value = currentInfo.address;
        document.getElementById('cfgStoreHours').value = currentInfo.hours;
        document.getElementById('cfgStoreTourUrl').value = currentInfo.tourUrl || "";

        storeConfigForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const configObj = {
                phone: document.getElementById('cfgStorePhone').value.trim(),
                address: document.getElementById('cfgStoreAddress').value.trim(),
                hours: document.getElementById('cfgStoreHours').value.trim(),
                tourUrl: document.getElementById('cfgStoreTourUrl').value.trim()
            };
            localStorage.setItem('trendOptikStoreInfo', JSON.stringify(configObj));
            alert("Mağaza rehberi ve 360° tur bağlantısı güncellendi!");
        });
    }

    const processAndCompressFile = (file, maxSize = 800) => {
        return new Promise((resolve) => {
            const reader = new FileReader(); reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image(); img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width; let height = img.height;
                    if (width > height) { if (width > maxSize) { height *= maxSize / width; width = maxSize; } }
                    else { if (height > maxSize) { width *= maxSize / height; height = maxSize; } }
                    canvas.width = width; canvas.height = height;
                    const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.65));
                };
            };
        });
    };

    if (brandForm) {
        brandForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const bName = document.getElementById('brandName').value.trim();
            const bLogoFile = document.getElementById('brandLogoFile').files[0];
            let compressedLogo = bLogoFile ? await processAndCompressFile(bLogoFile, 300) : "";
            const brandId = bName.toLowerCase().replace(/\s+/g, '');

            let currentBrands = JSON.parse(localStorage.getItem('trendOptikBrands')) || [];
            if(currentBrands.some(b => b.id === brandId)) { alert("Bu marka zaten tanımlı!"); return; }

            currentBrands.push({ id: brandId, name: bName, logo: compressedLogo });
            localStorage.setItem('trendOptikBrands', JSON.stringify(currentBrands));
            alert(`${bName} markası tanımlandı.`); window.location.reload();
        });
    }

    function renderAdminBrandsListTable() {
        if(!adminBrandsContainerList) return; adminBrandsContainerList.innerHTML = "";
        let currentBrands = JSON.parse(localStorage.getItem('trendOptikBrands')) || [];
        if(currentBrands.length === 0) { adminBrandsContainerList.innerHTML = `<p style="padding:10px; color:#444; font-size:10px;">Kayıtlı marka yok.</p>`; return; }

        currentBrands.forEach((b, idx) => {
            const div = document.createElement('div'); div.className = "admin-ctrl-item";
            div.style.cssText = "display:flex; flex-direction:row; justify-content:space-between; align-items:center; padding:6px; background:transparent; border-bottom:1px solid #111; margin:0;";
            div.innerHTML = `
                <span style="font-size:11px; color:#fff;">${b.name.toUpperCase()}</span>
                <button type="button" class="admin-mini-inline-btn del" data-bidx="${idx}" style="max-width:30px; margin:0; padding:2px;">×</button>
            `;
            adminBrandsContainerList.appendChild(div);
        });

        document.querySelectorAll('.admin-mini-inline-btn.del[data-bidx]').forEach(btn => {
            btn.addEventListener('click', () => {
                const bIdx = parseInt(btn.getAttribute('data-bidx'));
                if(confirm("Bu markayı silmek istiyor musunuz?")) {
                    let currentBrands = JSON.parse(localStorage.getItem('trendOptikBrands')) || [];
                    currentBrands.splice(bIdx, 1); localStorage.setItem('trendOptikBrands', JSON.stringify(currentBrands));
                    window.location.reload();
                }
            });
        });
    }

    function initAdminDashboard() {
        populateBrandSelect(); renderAdminBrandsListTable(); renderAdminProductControlTable();
    }

    function populateBrandSelect() {
        if(!prodBrandSelect || !bulkBrandTarget) return;
        prodBrandSelect.innerHTML = ""; bulkBrandTarget.innerHTML = "";
        let currentBrands = JSON.parse(localStorage.getItem('trendOptikBrands')) || [];
        if(currentBrands.length === 0) { prodBrandSelect.innerHTML = `<option value="">Önce Marka Ekleyin</option>`; return; }
        currentBrands.forEach(b => {
            const opt = document.createElement('option'); opt.value = b.id; opt.textContent = b.name.toUpperCase();
            prodBrandSelect.appendChild(opt.cloneNode(true)); bulkBrandTarget.appendChild(opt.cloneNode(true));
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            loadedBase64Images = []; selectedCoverIndex = 0; adminPreviewGrid.innerHTML = "";
            const files = e.target.files; if (files.length === 0) { previewTitle.style.display = "none"; return; }
            previewTitle.style.display = "block";

            for (let i = 0; i < files.length; i++) {
                const compressedB64 = await processAndCompressFile(files[i], 800); loadedBase64Images.push(compressedB64);
                const item = document.createElement('div'); item.className = 'admin-preview-item';
                if (i === 0) item.classList.add('is-cover');
                item.innerHTML = `<img src="${compressedB64}">`; item.setAttribute('data-idx', i);
                item.addEventListener('click', () => {
                    document.querySelectorAll('.admin-preview-item').forEach(el => el.classList.remove('is-cover'));
                    item.classList.add('is-cover'); selectedCoverIndex = parseInt(item.getAttribute('data-idx'));
                });
                adminPreviewGrid.appendChild(item);
            }
        });
    }

    if (adminForm) {
        adminForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const brand = prodBrandSelect.value;
            const advancedProduct = {
                brand, prodCategory: document.getElementById('prodCategory').value,
                prodFaceShape: document.getElementById('prodFaceShape').value, title: document.getElementById('prodTitle').value,
                label: document.getElementById('prodLabel').value, price: parseFloat(document.getElementById('prodPrice').value),
                discountPrice: document.getElementById('prodDiscountPrice').value ? parseFloat(document.getElementById('prodDiscountPrice').value) : "",
                prodColor: document.getElementById('prodColor').value, prodLens: document.getElementById('prodLens').value,
                prodMaterial: document.getElementById('prodMaterial').value, prodGender: document.getElementById('prodGender').value,
                prodEkartman: document.getElementById('prodEkartman').value, prodKopru: document.getElementById('prodKopru').value, prodSap: document.getElementById('prodSap').value,
                images: loadedBase64Images, coverIndex: selectedCoverIndex, featured: document.getElementById('prodFeatured').checked,
                analytics: { clicks: 0, leads: 0 }
            };
            let currentStore = JSON.parse(localStorage.getItem('trendOptikMatrixV5')) || [];
            currentStore.push(advancedProduct); localStorage.setItem('trendOptikMatrixV5', JSON.stringify(currentStore));
            alert("Gözlük reyonlara eklendi."); window.location.reload();
        });
    }

    if (bulkDiscountForm) {
        bulkDiscountForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const targetBrandId = bulkBrandTarget.value;
            const discountAmount = parseFloat(document.getElementById('bulkDiscountAmount').value);
            let currentStore = JSON.parse(localStorage.getItem('trendOptikMatrixV5')) || [];
            let updatedCount = 0;

            currentStore.forEach(prod => {
                if(prod.brand === targetBrandId) { prod.discountPrice = Math.max(0, prod.price - discountAmount); prod.label = "KAMPANYA ÖZEL"; updatedCount++; }
            });
            if (updatedCount === 0) { alert("Ürün bulunamadı."); return; }
            localStorage.setItem('trendOptikMatrixV5', JSON.stringify(currentStore));
            alert("Toplu indirim yansıtıldı!"); window.location.reload();
        });
    }

    function renderAdminProductControlTable() {
        if(!adminProductControlList) return; adminProductControlList.innerHTML = "";
        let currentStore = JSON.parse(localStorage.getItem('trendOptikMatrixV5')) || [];
        if(currentStore.length === 0) { adminProductControlList.innerHTML = `<p style="text-align:center; padding:15px; color:#444; font-size:11px;">Katalog boş.</p>`; return; }

        for(let i = currentStore.length - 1; i >= 0; i--) {
            const prod = currentStore[i];
            const targetUrl = `${CURRENT_SITE_URL}#prod-id-${i}`;
            const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(targetUrl)}`;
            const clicks = prod.analytics ? (prod.analytics.clicks || 0) : 0;
            const leads = prod.analytics ? (prod.analytics.leads || 0) : 0;

            const row = document.createElement('div'); row.className = 'admin-ctrl-item';
            row.innerHTML = `
                <div class="admin-ctrl-row-top">
                    <div class="admin-ctrl-info">
                        <h6>${prod.brand.toUpperCase()} - ${prod.title}</h6>
                        <p>Fiyat: ${prod.price} TL | İndirim: ${prod.discountPrice || 'Yok'} TL</p>
                        <p style="color:#888; font-size:9px; margin-top:2px;">📈 İncelenme: <b>${clicks}</b> | Sipariş Talebi: <b style="color:#128c7e;">${leads}</b></p>
                    </div>
                    <div class="admin-ctrl-qr-box"><img src="${qrApiUrl}" id="admin-qr-img-src-${i}"></div>
                </div>
                <div class="admin-ctrl-action-bar">
                    <button type="button" class="admin-mini-inline-btn edit-trigger" data-idx="${i}">✏ Düzenle</button>
                    <button type="button" class="admin-mini-inline-btn print print-trigger" data-idx="${i}">🖨 Etiket Bas</button>
                    <button type="button" class="admin-mini-inline-btn del del-trigger" data-idx="${i}">×</button>
                </div>
            `;
            adminProductControlList.appendChild(row);
        }

        document.querySelectorAll('.edit-trigger').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                let store = JSON.parse(localStorage.getItem('trendOptikMatrixV5')); const p = store[idx];
                const newTitle = prompt("Yeni Model İsmini Girin:", p.title); if(newTitle === null) return;
                const newPrice = prompt("Yeni Standart Fiyatı Girin:", p.price); if(newPrice === null) return;
                const newDiscPrice = prompt("Yeni İndirimli Fiyatı Girin:", p.discountPrice || "");

                store[idx].title = newTitle.trim(); store[idx].price = parseFloat(newPrice) || p.price;
                store[idx].discountPrice = newDiscPrice === "" ? "" : parseFloat(newDiscPrice);
                localStorage.setItem('trendOptikMatrixV5', JSON.stringify(store)); window.location.reload();
            });
        });

        document.querySelectorAll('.print-trigger').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = btn.getAttribute('data-idx');
                qrPrintIsolatedFrame.innerHTML = `<img src="${document.getElementById(`admin-qr-img-src-${idx}`).src}">`;
                window.print();
            });
        });

        document.querySelectorAll('.del-trigger').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                if(confirm("Bu modeli silmek istiyor musunuz?")) {
                    let store = JSON.parse(localStorage.getItem('trendOptikMatrixV5')) || [];
                    store.splice(idx, 1); localStorage.setItem('trendOptikMatrixV5', JSON.stringify(store));
                    window.location.reload();
                }
            });
        });
    }

    if (clearStorageBtn) {
        clearStorageBtn.addEventListener('click', () => {
            if (confirm("Sıfırlansın mı?")) { localStorage.clear(); sessionStorage.clear(); window.location.reload(); }
        });
    }

    if (exportBackupBtn) {
        exportBackupBtn.addEventListener('click', () => {
            const dataStore = { catalog: localStorage.getItem('trendOptikMatrixV5'), brands: localStorage.getItem('trendOptikBrands'), info: localStorage.getItem('trendOptikStoreInfo'), ann: localStorage.getItem('trendOptikAnnouncementText') };
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(JSON.stringify(dataStore));
            const linkElement = document.createElement('a'); linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', 'trend-optik-ultra-yedek.json'); linkElement.click();
        });
    }

    if (importBackupFile) {
        importBackupFile.addEventListener('change', (e) => {
            const file = e.target.files[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const parsedData = JSON.parse(event.target.result);
                    if (parsedData.catalog) localStorage.setItem('trendOptikMatrixV5', parsedData.catalog);
                    if (parsedData.brands) localStorage.setItem('trendOptikBrands', parsedData.brands);
                    if (parsedData.info) localStorage.setItem('trendOptikStoreInfo', parsedData.info);
                    if (parsedData.ann) localStorage.setItem('trendOptikAnnouncementText', parsedData.ann);
                    alert("Yedek başarıyla yüklendi!"); window.location.reload();
                } catch (err) { alert("Hata!"); }
            };
            reader.readAsText(file);
        });
    }
})();
