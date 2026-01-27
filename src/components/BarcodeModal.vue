<template>
    <Teleport to="body">
        <Transition name="barcode-fade">
            <div v-if="visible" class="barcode-modal-overlay" @click.self="close">
                <div class="barcode-modal" tabindex="0" role="dialog" aria-modal="true">
                    <button class="barcode-modal-close-icon" @click="close" aria-label="Cerrar">✕</button>
                    <div class="barcode-modal-header">
                        <div class="barcode-modal-title">Código de Barras</div>
                        <div class="barcode-modal-subtitle">Inventario: <span>{{ displayCode }}</span></div>
                    </div>
                    <div class="barcode-info">
                        <div class="info-row"><span>Equipo:</span> {{ item?.['EQUIPO MEDICO'] || 'N/A' }}</div>
                        <div class="info-row"><span>Marca:</span> {{ item?.['MARCA'] || 'N/A' }}</div>
                        <div class="info-row"><span>Modelo:</span> {{ item?.['MODELO'] || 'N/A' }}</div>
                        <div class="info-row"><span>No. Serie:</span> {{ item?.['NUMERO DE SERIE'] || 'N/A' }}</div>
                    </div>
                    <div class="preview-panel">
                        <div class="preview-toggle">
                            <button :class="{ active: previewMode === 'barcode' }"
                                @click="previewMode = 'barcode'">Barcode</button>
                            <button :class="{ active: previewMode === 'qr' }" @click="previewMode = 'qr'">QR</button>
                        </div>
                    </div>

                    <div class="barcode-svg-wrapper">
                        <div v-if="loading" :class="['barcode-skeleton', { 'skeleton-error': previewError }]">
                            <div v-if="previewError" class="skeleton-error-icon">✕</div>
                        </div>

                        <!-- Barcode canvas/SVG preview -->
                        <svg v-show="!loading && !bwipActive && previewMode === 'barcode'" ref="barcodeSvg"
                            class="barcode-svg"></svg>
                        <canvas v-show="!loading && bwipActive && previewMode === 'barcode'" ref="barcodeCanvas"
                            class="barcode-canvas"></canvas>

                        <!-- QR preview -->
                        <img v-if="!loading && previewMode === 'qr' && qrDataUrl && !previewError" :src="qrDataUrl"
                            class="qr-preview" />

                        <div v-if="!displayCode" class="barcode-empty">Sin código disponible</div>
                    </div>

                    <div class="barcode-caption">Código para: {{ equipmentLabel }}</div>
                    <div class="barcode-modal-actions">
                        <button class="barcode-modal-download" @click="downloadBarcodePng" :disabled="!displayCode"
                            aria-label="Descargar código de barras como PNG">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Descargar Barcode
                        </button>
                        <button class="barcode-modal-download" @click="downloadQrCode" :disabled="!displayCode"
                            aria-label="Descargar QR como PNG">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Descargar QR
                        </button>
                        <button class="barcode-modal-close" @click="close">Cerrar</button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import Swal from 'sweetalert2';

const props = defineProps({
    modelValue: Boolean,
    code: {
        type: String,
        required: true
    },
    item: {
        type: Object,
        default: null
    }
});
const emit = defineEmits(['update:modelValue', 'requestStartMaintenance']);

const visible = ref(props.modelValue);
const barcodeSvg = ref(null);
const loading = ref(false);
const lineWidth = ref(4); // default to 'Grueso'
const bwipActive = ref(false);
const barcodeCanvas = ref(null);
const previewMode = ref('barcode'); // 'barcode' | 'qr'
const qrDataUrl = ref('');
const previewError = ref(false);
const exportScale = 3; // high-res export scale for crisp printing

const displayCode = computed(() => String(props.code || '').trim());

const equipmentLabel = computed(() => {
    const code = displayCode.value || '';
    const equipo = (props.item && (props.item['EQUIPO MEDICO'] || props.item['EQUIPO'] || '')) || '';
    const marca = (props.item && (props.item['MARCA'] || props.item['BRAND'] || '')) || '';
    const right = [equipo, marca].filter(Boolean).join(' ').trim();
    const parts = [];
    if (code) parts.push(code);
    if (right) parts.push(right);
    let label = parts.join(' — ');
    if (!label) label = 'Equipo desconocido';
    // Truncate to reasonable length to avoid overflow in canvas/SVG
    if (label.length > 64) label = label.slice(0, 61) + '...';
    return label;
});

// Split label into up to two lines intelligently (preserve words)
function wrapLabelLines(text, maxChars = 36, maxLines = 2) {
    if (!text) return [''];
    const words = String(text).split(/\s+/);
    const lines = [''];
    for (const w of words) {
        const cur = lines[lines.length - 1];
        if ((cur + ' ' + w).trim().length <= maxChars) {
            lines[lines.length - 1] = (cur + ' ' + w).trim();
        } else if (lines.length < maxLines) {
            lines.push(w);
        } else {
            // append to last line truncated if necessary
            lines[lines.length - 1] = (lines[lines.length - 1] + ' ' + w).trim();
        }
    }
    return lines.map(l => l.trim());
}

// Build lines preferring first line as inventory code, then wrap the rest (equipo + marca)
function buildLabelLines(maxChars = 36, maxLines = 3) {
    const full = equipmentLabel.value || '';
    const parts = full.split('—');
    const first = (parts[0] || '').trim();
    const rest = parts.slice(1).join('—').trim();
    const lines = [];
    if (first) lines.push(first);
    if (rest && lines.length < maxLines) {
        const remain = maxLines - lines.length;
        const restLines = wrapLabelLines(rest, maxChars, remain);
        lines.push(...restLines);
    }
    return lines.filter(Boolean);
}

watch(() => props.modelValue, (val) => {
    visible.value = val;
});

watch(() => props.code, (val) => {
    if (visible.value) {
        // Re-render current preview when code changes
        if (previewMode.value === 'barcode') renderBarcode();
        else generateQrPreview();
    }
});

watch(visible, (val) => {
    emit('update:modelValue', val);
    if (val) {
        if (previewMode.value === 'barcode') renderBarcode();
        else generateQrPreview();
    }
});

async function close() {
    const result = await Swal.fire({
        title: '¿Cerrar visualización?',
        text: '¿Estás seguro de que quieres cerrar la visualización del código?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar',
        cancelButtonText: 'Cancelar',
        background: 'rgba(13, 20, 35, 0.98)',
        color: 'rgba(255, 255, 255, 0.95)',
        backdrop: 'rgba(2, 8, 18, 0.7)',
        confirmButtonColor: '#ff6b6b',
        cancelButtonColor: 'rgba(255, 255, 255, 0.08)',
        customClass: {
            container: 'swal-high-z-index'
        }
    })

    if (result.isConfirmed) {
        visible.value = false;
    }
}

function renderBarcode() {
    if (previewMode.value !== 'barcode') return;
    const code = displayCode.value;
    previewError.value = false;
    if (barcodeSvg.value && code) {
        loading.value = true;
        // Try bwip-js first for a crisp bitmap; fall back to JsBarcode SVG if unavailable
        renderBarcodeWithBwip().then((canvas) => {
            if (!canvas) {
                // bwip failed -> ensure SVG is visible
                bwipActive.value = false;

                // Render SVG via JsBarcode
                try {
                    JsBarcode(barcodeSvg.value, code, {
                        format: 'CODE128',
                        lineColor: '#222',
                        width: Number(lineWidth.value) || 4,
                        height: 110,
                        displayValue: true,
                        fontSize: 16,
                        textMargin: 4,
                        margin: 12
                    });
                    if (barcodeSvg.value && barcodeSvg.value.setAttribute) {
                        barcodeSvg.value.setAttribute('shape-rendering', 'crispEdges');
                        barcodeSvg.value.style.imageRendering = 'pixelated';
                    }
                    // Add equipment label into the SVG below the barcode so exported raster includes it
                    try {
                        const svgEl = barcodeSvg.value;
                        const baseH = parseInt(svgEl.getAttribute('height')) || 110;
                        // Create wrapped lines: first line code, then wrap rest
                        const lines = buildLabelLines(34, 3);
                        const xmlns = 'http://www.w3.org/2000/svg';
                        // Measure and fit font using an offscreen canvas for accuracy
                        const measureCanvas = document.createElement('canvas');
                        const mctx = measureCanvas.getContext('2d');
                        const paddingX = Math.max(12, Math.round((parseInt(svgEl.getAttribute('width') || '360')) * 0.03));
                        const svgWidth = parseInt(svgEl.getAttribute('width')) || 360;
                        const maxTextWidth = svgWidth - paddingX * 2;
                        let fontSize = 16;
                        const minFont = 10;
                        if (mctx) {
                            while (fontSize >= minFont) {
                                mctx.font = `bold ${fontSize}px monospace`;
                                const tooWide = lines.some(l => mctx.measureText(l).width > maxTextWidth);
                                if (!tooWide) break;
                                fontSize -= 1;
                            }
                        }
                        const lineHeight = Math.round(fontSize * 1.15);
                        const extra = lineHeight * lines.length + 10;
                        const newH = baseH + extra;
                        svgEl.setAttribute('height', String(newH));
                        // Remove previous caption(s) if present
                        const prevs = svgEl.querySelectorAll('.barcode-caption-svg');
                        prevs.forEach(n => n.remove());
                        for (let i = 0; i < lines.length; i++) {
                            const text = document.createElementNS(xmlns, 'text');
                            text.setAttribute('class', 'barcode-caption-svg');
                            text.setAttribute('x', '50%');
                            const y = baseH + (i + 1) * lineHeight;
                            text.setAttribute('y', String(y));
                            text.setAttribute('text-anchor', 'middle');
                            text.setAttribute('fill', '#111111');
                            text.setAttribute('font-size', String(fontSize));
                            text.setAttribute('font-family', 'monospace');
                            text.textContent = lines[i];
                            svgEl.appendChild(text);
                        }
                    } catch (e) { /* ignore svg caption errors */ }
                } catch (e) {
                    previewError.value = true;
                }
            }
            setTimeout(() => { loading.value = false; }, 250);
        }).catch(() => { loading.value = false; previewError.value = true; });
    }
}

function downloadBarcodePng() {
    // If bwip rendered canvas is active, export that canvas directly
    if (bwipActive.value && barcodeCanvas.value) {
        try {
            const canvas = barcodeCanvas.value;
            // create a high-res export canvas
            const out = document.createElement('canvas');
            out.width = Math.max(1, canvas.width * exportScale);
            out.height = Math.max(1, canvas.height * exportScale);
            const octx = out.getContext('2d');
            if (octx) {
                octx.fillStyle = '#ffffff';
                octx.fillRect(0, 0, out.width, out.height);
                octx.imageSmoothingEnabled = false;
                octx.drawImage(canvas, 0, 0, out.width, out.height);
            }
            const pngUrl = out.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = pngUrl;
            link.download = `barcode-${displayCode.value}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        } catch (e) {
            console.warn('Could not export bwip canvas', e && e.message);
            // fallback to SVG export below
        }
    }

    const svgEl = barcodeSvg.value;
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgEl);
    if (!svgString.includes('xmlns=')) {
        svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    // Ensure the SVG has explicit width/height so rasterization works reliably
    if (!/width=/.test(svgString)) svgString = svgString.replace('<svg', '<svg width="360"');
    if (!/height=/.test(svgString)) svgString = svgString.replace('<svg', '<svg height="110"');
    const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
    const img = new Image();
    img.onload = () => {
        // Increase exported PNG resolution to improve camera scanning on low-quality cameras
        const scale = exportScale; // high-res
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `barcode-${displayCode.value}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    img.src = svgDataUrl;
}

// New: render with bwip-js onto canvas for higher-quality bitmaps (fallback to JsBarcode if missing)
async function renderBarcodeWithBwip() {
    const canvas = document.createElement('canvas');
    const code = displayCode.value;
    if (!code) return null;
    try {
        // Load bwip-js dynamically from CDN if not available to avoid Vite import resolution issues
        let bwip = null;
        if (typeof window !== 'undefined' && (window.bwipjs || window.BWIPJS)) {
            bwip = window.bwipjs || window.BWIPJS;
        } else {
            // Inject CDN script for browser bundle
            const scriptUrl = 'https://cdn.jsdelivr.net/npm/bwip-js/dist/bwip-js-min.js';
            bwip = await new Promise((resolve) => {
                const existing = document.querySelector(`script[src="${scriptUrl}"]`);
                if (existing) {
                    existing.addEventListener('load', () => resolve(window.bwipjs || window.BWIPJS || null));
                    existing.addEventListener('error', () => resolve(null));
                    return;
                }
                const s = document.createElement('script');
                s.src = scriptUrl;
                s.onload = () => resolve(window.bwipjs || window.BWIPJS || null);
                s.onerror = () => resolve(null);
                document.head.appendChild(s);
            });
        }
        if (!bwip || !bwip.toCanvas) {
            // Not available in this environment
            return null;
        }

        // Render with bwip-js to canvas
        // Use the Vue-controlled canvas element to avoid manual DOM manipulation
        const targetCanvas = barcodeCanvas.value || canvas;
        await bwip.toCanvas(targetCanvas, {
            bcid: 'code128',
            text: code,
            scale: Number(lineWidth.value) || 4, // use default 'grueso' mapping
            height: 36,
            includetext: false,
            paddingwidth: 12,
            paddingheight: 12,
            backgroundcolor: 'FFFFFF',
            barcolor: '000000'
        });
        // If we have an equipment label, compose it into the bitmap by extending canvas height
        const label = equipmentLabel.value || '';
        if (label) {
            try {
                const src = targetCanvas;
                const srcW = src.width;
                const srcH = src.height;
                // Determine wrapped lines (up to 3): first line is inventory, next lines wrap equipo+marca
                const approxChars = Math.max(24, Math.floor(srcW / 11));
                const lines = buildLabelLines(approxChars, 3);
                // Choose font size so that lines fit within canvas width with padding
                const baseFont = Math.max(13, Math.round(srcW * 0.045));
                const minFont = 10;
                const paddingX = Math.max(12, Math.round(srcW * 0.03));
                const maxTextWidth = srcW - paddingX * 2;
                let fontSize = baseFont;
                const composed = document.createElement('canvas');
                const ctx = composed.getContext('2d');
                // Pre-calc line height after choosing font that fits
                if (ctx) {
                    while (fontSize >= minFont) {
                        ctx.font = `bold ${fontSize}px monospace`;
                        const tooWide = lines.some(l => ctx.measureText(l).width > maxTextWidth);
                        if (!tooWide) break;
                        fontSize -= 1;
                    }
                    const lineHeight = Math.round(fontSize * 1.2);
                    const extraH = Math.max((lineHeight * lines.length) + 12, Math.round(srcH * 0.22));
                    composed.width = srcW;
                    composed.height = srcH + extraH;

                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, composed.width, composed.height);
                    ctx.drawImage(src, 0, 0);
                    ctx.fillStyle = '#111111';
                    ctx.textAlign = 'center';
                    ctx.font = `bold ${fontSize}px monospace`;
                    // Draw each wrapped line centered, leaving some padding from the barcode
                    const topOffset = srcH + Math.round((extraH - (lineHeight * lines.length)) / 2) + Math.round(lineHeight * 0.2);
                    for (let i = 0; i < lines.length; i++) {
                        const ln = lines[i];
                        const y = topOffset + i * lineHeight + Math.round(lineHeight * 0.75);
                        ctx.fillText(ln, composed.width / 2, y);
                    }
                }
                // Copy composed back into the targetCanvas (this may be the DOM canvas)
                targetCanvas.width = composed.width;
                targetCanvas.height = composed.height;
                const outCtx = targetCanvas.getContext('2d');
                if (outCtx) outCtx.drawImage(composed, 0, 0);
            } catch (e) {
                console.warn('Could not compose label into canvas', e && e.message);
            }
        }
        // Mark bwip canvas as active so template shows it instead of the SVG
        bwipActive.value = true;
        return targetCanvas;
    } catch (e) {
        console.warn('bwip-js render failed, falling back to JsBarcode', e && e.message);
        return null;
    }
}

function setLineWidth(w) {
    lineWidth.value = Number(w) || 3;
    // Re-render barcode with new thickness
    renderBarcode();
}

async function copyCodeToClipboard() {
    try {
        await navigator.clipboard.writeText(displayCode.value || '');
        // brief visual feedback could be added later
    } catch (_) { }
}

function printBarcode() {
    try {
        let dataUrl = '';
        if (bwipActive.value && barcodeCanvas.value) {
            const src = barcodeCanvas.value;
            const out = document.createElement('canvas');
            out.width = Math.max(1, src.width * exportScale);
            out.height = Math.max(1, src.height * exportScale);
            const octx = out.getContext('2d');
            if (octx) {
                octx.fillStyle = '#ffffff';
                octx.fillRect(0, 0, out.width, out.height);
                octx.imageSmoothingEnabled = false;
                octx.drawImage(src, 0, 0, out.width, out.height);
            }
            dataUrl = out.toDataURL('image/png');
        } else if (barcodeSvg.value) {
            const serializer = new XMLSerializer();
            let svgString = serializer.serializeToString(barcodeSvg.value);
            if (!svgString.includes('xmlns=')) {
                svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
            }
            if (!/width=/.test(svgString)) svgString = svgString.replace('<svg', '<svg width="360"');
            if (!/height=/.test(svgString)) svgString = svgString.replace('<svg', '<svg height="110"');
            const img = new Image();
            img.onload = () => {
                const scale = exportScale;
                const c = document.createElement('canvas');
                c.width = Math.max(1, Math.round(img.width * scale));
                c.height = Math.max(1, Math.round(img.height * scale));
                const ctx = c.getContext('2d');
                if (!ctx) return;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, c.width, c.height);
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(img, 0, 0, c.width, c.height);
                const url = c.toDataURL('image/png');
                openPrintWindow(url);
            };
            img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
            return;
        }
        if (dataUrl) openPrintWindow(dataUrl);
    } catch (e) { /* ignore */ }
}

function openPrintWindow(pngUrl) {
    const win = window.open('', '_blank');
    if (!win) return;
    const html = `<!doctype html><html><head><title>Imprimir etiqueta</title>
    <meta charset="utf-8" />
    <style>
      body{margin:0; padding:20px; background:#fff}
      img{max-width:100%; display:block; margin:0 auto}
      @media print { body{padding:0} }
    </style>
  </head><body>
    <img src="${pngUrl}" alt="Etiqueta" />
  </body></html>`;
    win.document.open();
    win.document.write(html);
    win.document.close();
    setTimeout(() => { try { win.focus(); win.print(); } catch (_) { } }, 100);
}

async function generateQrPreview() {
    previewError.value = false;
    loading.value = true;
    qrDataUrl.value = '';
    try {
        const code = displayCode.value;
        if (!code) throw new Error('No code');
        // PRIORITY 1: Use local network addresses FIRST (not Cloudflare)
        let publicBase = null

        // Try local network addresses first
        try {
            let hosts = null

            // Try to refresh network addresses from server first
            try {
                const refreshResp = await fetch('/refresh-hosts', { method: 'GET', cache: 'no-store' })
                if (refreshResp && refreshResp.ok) {
                    const refreshData = await refreshResp.json()
                    if (refreshData && refreshData.hosts) {
                        hosts = refreshData.hosts
                        console.log('[QR Modal] ✅ Refreshed NETWORK addresses (priority):', hosts)
                    }
                }
            } catch (refreshError) {
                // Fallback to file with cache-busting
                const devResp = await fetch('/dev-hosts.json?t=' + Date.now(), { cache: 'no-store' })
                if (devResp && devResp.ok) {
                    const devJson = await devResp.json()
                    hosts = devJson && devJson.hosts ? devJson.hosts : null
                    console.log('[QR Modal] 📄 Fallback network addresses:', hosts)
                }
            }

            if (Array.isArray(hosts) && hosts.length > 0) {
                const currentHost = window.location.hostname
                const currentProtocol = window.location.protocol
                const currentPort = window.location.port

                let targetHost = currentHost

                // If accessing from localhost, prefer CURRENT network address (dynamic)
                if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
                    const networkHosts = hosts.filter(host =>
                        host !== 'localhost' &&
                        host !== '127.0.0.1' &&
                        !host.includes('172.') && // Skip Docker/VM networks
                        !host.includes('192.168.56.') && // Skip VirtualBox networks
                        !host.includes('10.0.') // Skip some VPN networks
                    )
                    if (networkHosts.length > 0) {
                        // Always use the LAST network address (most current)
                        targetHost = networkHosts[networkHosts.length - 1]
                        publicBase = `${currentProtocol}//${targetHost}:${currentPort || '5173'}`
                        console.log('[QR Modal] 🏠→📱 NETWORK address priority:', targetHost)
                    }
                } else {
                    // If already on network, verify current host is still valid
                    const isCurrentHostValid = hosts.includes(currentHost)
                    if (isCurrentHostValid) {
                        targetHost = currentHost
                        publicBase = `${currentProtocol}//${targetHost}:${currentPort || '5173'}`
                        console.log('[QR Modal] 📱→📱 Same network address:', targetHost)
                    } else {
                        // Network changed, use best available
                        const networkHosts = hosts.filter(host =>
                            host !== 'localhost' &&
                            host !== '127.0.0.1' &&
                            !host.includes('172.') &&
                            !host.includes('192.168.56.') &&
                            !host.includes('10.0.')
                        )
                        if (networkHosts.length > 0) {
                            targetHost = networkHosts[networkHosts.length - 1]
                            publicBase = `${currentProtocol}//${targetHost}:${currentPort || '5173'}`
                            console.log('[QR Modal] 🔄 Network changed → DYNAMIC address:', targetHost)
                        }
                    }
                }
            }
        } catch (e) {
            console.warn('[QR Modal] Network address detection failed:', e.message)
        }

        // PRIORITY 2: Fallback to Cloudflare only if no network found
        if (!publicBase) {
            console.log('[QR Modal] No network found, trying Cloudflare fallback...')
            try {
                const cfResp = await fetch('/cloudflare-url.json', { cache: 'no-store' })
                if (cfResp && cfResp.ok) {
                    const cfJson = await cfResp.json()
                    if (cfJson && cfJson.url && String(cfJson.url).startsWith('https://')) {
                        publicBase = String(cfJson.url).replace(/\/$/, '')
                        console.log('[QR Modal] Using Cloudflare fallback:', publicBase)
                    }
                }
            } catch (e) { /* ignore */ }
        }

        if (!publicBase) {
            alert('Necesitas una conexión HTTPS accesible. Ejecuta "npm run dev" para HTTPS local o "npm run dev:cloudflare" para túnel público.')
            loading.value = false
            return
        }

        const fullUrl = `${publicBase}/op/inventario-biomedica?scan=${encodeURIComponent(code)}`
        const dataUrl = await QRCode.toDataURL(fullUrl, {
            width: 360,
            margin: 1,
            errorCorrectionLevel: 'M',
            color: { dark: '#111111', light: '#ffffff' }
        });
        qrDataUrl.value = dataUrl;
        setTimeout(() => { loading.value = false; }, 120);
    } catch (e) {
        previewError.value = true;
        loading.value = false;
    }
}

async function downloadBarcodeWithUrl() {
    const code = displayCode.value
    if (!code) return
    // If QR preview already generated, prefer that PNG
    if (previewMode.value === 'qr' && qrDataUrl.value) {
        const link = document.createElement('a')
        link.href = qrDataUrl.value
        link.download = `qr-url-${code}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        return
    }
    const envBase = (import.meta.env && import.meta.env.VITE_PUBLIC_BASE_URL) ? String(import.meta.env.VITE_PUBLIC_BASE_URL).trim() : ''
    const baseUrl = envBase || location.origin
    const fullUrl = `${baseUrl}/op/inventario-biomedica?scan=${encodeURIComponent(code)}`
    const fallbackShortUrl = `${baseUrl}/s/${encodeURIComponent(code)}`

    // Ask backend to create a short link; fall back to short path if it fails
    let shortUrl = null
    try {
        const resp = await fetch('/api/ops/short-links', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target: fullUrl })
        })
        if (resp && resp.ok) {
            const json = await resp.json()
            shortUrl = json && json.shortUrl ? json.shortUrl : null
        }
    } catch (e) {
        // ignore and fallback
        console.warn('Could not create short link', e && e.message)
    }

    // Try to prefer a public HTTPS base (Cloudflare quick tunnel -> dev-hosts), to ensure mobile cameras open HTTPS links
    let publicBase = null
    try {
        const cfResp = await fetch('/cloudflare-url.json', { cache: 'no-store' })
        if (cfResp && cfResp.ok) {
            const cfJson = await cfResp.json()
            if (cfJson && cfJson.url && String(cfJson.url).startsWith('https://')) {
                publicBase = String(cfJson.url).replace(/\/$/, '')
            }
        }
    } catch (e) { /* ignore */ }

    if (!publicBase) {
        try {
            const devResp = await fetch('/dev-hosts.json', { cache: 'no-store' })
            if (devResp && devResp.ok) {
                const devJson = await devResp.json()
                const hosts = devJson && (devJson.hosts || devJson.host) ? (devJson.hosts || devJson.host) : null
                if (Array.isArray(hosts)) {
                    const httpsHost = hosts.find(h => String(h).startsWith('https://'))
                    if (httpsHost) publicBase = String(httpsHost).replace(/\/$/, '')
                } else if (typeof hosts === 'string' && String(hosts).startsWith('https://')) {
                    publicBase = String(hosts).replace(/\/$/, '')
                }
            }
        } catch (e) { /* ignore */ }
    }

    // Build the final URL using publicBase if available; otherwise force https on the chosen URL
    let url = shortUrl || fallbackShortUrl
    try {
        if (publicBase) {
            const tmp = new URL(url, baseUrl)
            const path = tmp.pathname + tmp.search + tmp.hash
            url = new URL(path, publicBase).toString()
        } else {
            if (url.startsWith('http://')) url = url.replace(/^http:\/\//i, 'https://')
        }
    } catch (e) {
        try { if (url.startsWith('http://')) url = url.replace(/^http:\/\//i, 'https://') } catch (e2) { }
    }

    // Only generate QR if we have a public HTTPS base (tunnel)
    if (!publicBase) {
        alert('Necesitas iniciar el túnel Cloudflare para generar códigos QR con URL pública. Ejecuta "npm run dev:cloudflare" primero.')
        return
    }

    // Generate QR code PNG directly (encodes an HTTPS URL when possible)
    try {
        const pngUrl = await QRCode.toDataURL(url, {
            width: 512,
            margin: 1,
            errorCorrectionLevel: 'M',
            color: { dark: '#111111', light: '#ffffff' }
        })
        const link = document.createElement('a')
        link.href = pngUrl
        link.download = `qr-url-${code}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    } catch (e) {
        console.warn('Could not generate QR', e && e.message)
    }
}

function downloadQrCode() {
    const code = displayCode.value
    if (!code) return

    // If QR preview already generated, download that
    if (qrDataUrl.value) {
        const link = document.createElement('a')
        link.href = qrDataUrl.value
        link.download = `qr-${code}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        return
    }

    // Generate QR code from the inventory code directly
    try {
        QRCode.toDataURL(code, {
            width: 512,
            margin: 1,
            errorCorrectionLevel: 'M',
            color: { dark: '#111111', light: '#ffffff' }
        }).then((pngUrl) => {
            const link = document.createElement('a')
            link.href = pngUrl
            link.download = `qr-${code}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }).catch((e) => {
            console.warn('Could not generate QR', e && e.message)
        })
    } catch (e) {
        console.warn('Could not generate QR', e && e.message)
    }
}

function requestStartMaintenance() {
    emit('request-start-maintenance', { code: displayCode.value, item: props.item })
}

onMounted(() => {
    watch(
        () => visible.value,
        (val) => {
            if (val) {
                setTimeout(() => renderBarcode(), 50);
            }
        },
        { immediate: true }
    );
});

// Manage body scroll lock and Escape key handling
let escHandler = (e) => { if (e.key === 'Escape' && visible.value) close(); };
watch(visible, (val) => {
    try {
        if (val) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', escHandler);
            // focus modal for immediate keyboard interaction
            setTimeout(() => { try { const el = document.querySelector('.barcode-modal'); el && el.focus && el.focus(); } catch (_) { } }, 0);
        } else {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', escHandler);
        }
    } catch (_) { }
});

// react to preview mode changes
watch(previewMode, (m) => {
    if (!visible.value) return;
    if (m === 'barcode') renderBarcode();
    else generateQrPreview();
});
</script>

<style scoped>
.barcode-modal-overlay {
    position: fixed;
    inset: 0;
    background: radial-gradient(1200px 600px at 20% 10%, rgba(24, 48, 96, 0.65), rgba(3, 8, 20, 0.65));
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(8px) saturate(1.1);
    overflow: auto;
}

.barcode-modal {
    background: linear-gradient(180deg, rgba(10, 20, 40, 0.85), rgba(6, 14, 28, 0.88));
    border: 1px solid rgba(99, 160, 255, 0.35);
    border-radius: 20px;
    padding: 28px 28px 22px 28px;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(99, 160, 255, 0.18) inset;
    min-width: 440px;
    max-width: 92vw;
    max-height: 82vh;
    overflow: auto;
    text-align: center;
    position: relative;
    animation: modal-pop 0.32s cubic-bezier(.22, 1, .36, 1);
}

.barcode-modal::before {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    background: radial-gradient(800px 300px at 10% 0%, rgba(99, 160, 255, 0.18), transparent 40%),
        radial-gradient(800px 300px at 90% 100%, rgba(99, 160, 255, 0.14), transparent 40%);
    pointer-events: none;
}

.barcode-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 14px;
    margin: 12px 0 6px 0;
    text-align: left;
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.9rem;
}

.info-row span {
    color: rgba(125, 211, 252, 0.9);
    font-weight: 600;
    margin-right: 4px;
}

.barcode-modal-header {
    margin-bottom: 16px;
}

.barcode-modal-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #e5f0ff;
    letter-spacing: 0.4px;
}

.barcode-modal-subtitle {
    margin-top: 6px;
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.75);
}

.barcode-modal-subtitle span {
    color: #7dd3fc;
    font-weight: 600;
}

.barcode-modal-close-icon {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(239, 68, 68, 0.12);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.35);
    border-radius: 50%;
    width: 34px;
    height: 34px;
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    transition: transform .12s ease, box-shadow .12s ease;
}

.barcode-modal-close-icon:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(239, 68, 68, 0.25);
}

/* Tiny viewport: scale modal for very small phones */
@media (max-width: 350px) and (max-height: 600px) {
    .barcode-modal {
        transform: scale(0.9);
        transform-origin: top center;
        min-width: 300px;
        max-width: 96vw;
        padding: 18px;
    }
    .barcode-modal-overlay {
        padding: 8px 6px;
        align-items: flex-start;
    }
    .barcode-svg, .barcode-canvas {
        width: 320px;
        height: 120px;
        max-width: 92vw;
    }
}

.barcode-svg-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 18px 0 10px 0;
    min-height: 140px;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 12px;
    padding: 14px;
    border: 1px dashed rgba(125, 211, 252, 0.35);
}

.barcode-svg {
    width: 520px;
    height: 160px;
    max-width: 86vw;
    background: #f8fafc;
    border-radius: 8px;
    shape-rendering: crispEdges;
    image-rendering: pixelated;
}

.barcode-canvas {
    width: 520px;
    height: 160px;
    max-width: 86vw;
    background: #f8fafc;
    border-radius: 8px;
    image-rendering: pixelated;
}

.barcode-svg-wrapper svg,
.barcode-svg-wrapper canvas {
    display: block
}

.barcode-skeleton {
    width: 520px;
    height: 160px;
    max-width: 86vw;
    border-radius: 8px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.06));
    background-size: 200% 100%;
    animation: shimmer 1.2s infinite;
}

.barcode-modal-download {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: rgba(34, 197, 94, 0.12);
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.5);
    border-radius: 10px;
    padding: 8px 16px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    margin-right: 10px;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.barcode-modal-download:hover:not(:disabled) {
    background: rgba(34, 197, 94, 0.25);
    border-color: rgba(34, 197, 94, 0.8);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
}

.barcode-modal-download svg {
    flex-shrink: 0;
}

.barcode-modal-download:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.barcode-modal-secondary {
    background: rgba(59, 130, 246, 0.12);
    color: #60a5fa;
    border: 1px solid rgba(59, 130, 246, 0.45);
    border-radius: 10px;
    padding: 8px 18px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    margin-right: 10px;
}

.barcode-modal-secondary:disabled {
    opacity: .4;
    cursor: not-allowed
}

.barcode-empty {
    position: absolute;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.95rem;
}

.barcode-modal-actions {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    flex-wrap: wrap;
}

.barcode-modal-close {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: #fff;
    border: 1px solid rgba(59, 130, 246, 0.6);
    border-radius: 10px;
    padding: 8px 20px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    margin-left: auto;
}

.barcode-modal-close:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
    background: linear-gradient(135deg, #3b82f6, #2563eb);
}

@keyframes modal-pop {
    0% {
        transform: scale(0.85) translateY(40px);
        opacity: 0;
    }

    100% {
        transform: scale(1) translateY(0);
        opacity: 1;
    }
}

@keyframes shimmer {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}

.barcode-fade-enter-active,
.barcode-fade-leave-active {
    transition: opacity 0.25s;
}

.barcode-fade-enter-from,
.barcode-fade-leave-to {
    opacity: 0;
}

.barcode-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 8px;
}

.barcode-thickness-label {
    color: rgba(255, 255, 255, 0.75);
    font-weight: 600
}

.barcode-thickness-options {
    display: flex;
    gap: 8px
}

.thick-btn {
    background: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.04);
    padding: 6px 10px;
    border-radius: 8px;
    cursor: pointer
}

.thick-btn.active {
    background: linear-gradient(135deg, #60a5fa, #3b82f6);
    color: #fff;
    border-color: rgba(59, 130, 246, 0.6)
}

/* Preview toggle */
.preview-toggle {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-bottom: 8px
}

.preview-toggle button {
    padding: 6px 12px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.03);
    color: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.04);
    cursor: pointer
}

.preview-toggle button.active {
    background: linear-gradient(135deg, #60a5fa, #3b82f6);
    color: #fff;
    border-color: rgba(59, 130, 246, 0.6)
}

.qr-preview {
    width: 200px;
    height: 200px;
    object-fit: contain;
    background: #fff;
    border-radius: 8px;
}

.barcode-caption {
    color: rgba(255, 255, 255, 0.85);
    font-weight: 600;
    margin-top: 8px
}

.skeleton-error {
    position: relative;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
}

.skeleton-error-icon {
    position: absolute;
    right: 8px;
    top: 8px;
    background: rgba(239, 68, 68, 0.12);
    color: #f87171;
    border-radius: 50%;
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700
}

@media (max-width: 560px) {
    .barcode-modal {
        min-width: auto;
        width: 96vw;
        max-height: 88vh;
    }

    .barcode-info {
        grid-template-columns: 1fr;
    }

    .barcode-modal-actions {
        flex-direction: column;
        gap: 8px;
        width: 100%;
    }

    .barcode-modal-download,
    .barcode-modal-close {
        width: 100%;
        margin-right: 0;
        margin-left: 0;
    }

    .barcode-modal-download span {
        display: none;
    }

    .barcode-modal-download {
        padding: 8px 12px;
    }

    .qr-preview {
        width: 240px;
        height: 240px;
    }
}

/* SweetAlert2 high z-index override */
:global(.swal-high-z-index) {
    z-index: 200000 !important;
}
</style>
