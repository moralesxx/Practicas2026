let inicioTiempo = 0;
let intervalo;
let tiempoAcumulado = 0;

let tiempos = [];
let finalizados = [];
let primerLugar = null;
let totalCorredores = 0;
let carreraIniciada = false;

function limpiarTablero() {
    pausarCarrera();
    tiempoAcumulado = 0;
    totalCorredores = 0;
    tiempos = [];
    finalizados = [];
    primerLugar = null;
    document.getElementById("numCorredores").value = 0;
    document.getElementById("corredores").innerHTML = "";
    document.getElementById("panelBotones").innerHTML = `<p class="text-center small fw-bold text-muted mb-3">MARCAR META</p>`;
}

function agregarUnCorredor() {
    const input = document.getElementById("numCorredores");
    let actual = parseInt(input.value) || 0;
    input.value = actual + 1;
    crearCorredores();
}

function quitarUnCorredor() {
    const input = document.getElementById("numCorredores");
    let actual = parseInt(input.value) || 0;
    if (actual > 0) {
        input.value = actual - 1;
        crearCorredores();
    }
}

function crearCorredores() {
    const contenedor = document.getElementById("corredores");
    const panel = document.getElementById("panelBotones");

    contenedor.innerHTML = "";
    panel.innerHTML = `<p class="text-center small fw-bold text-muted mb-3">MARCAR META</p>`;

    totalCorredores = parseInt(document.getElementById("numCorredores").value);
    if (isNaN(totalCorredores) || totalCorredores <= 0) return;

    tiempos = new Array(totalCorredores).fill(0);
    finalizados = new Array(totalCorredores).fill(false);
    primerLugar = null;
    carreraIniciada = false;
    tiempoAcumulado = 0;

    clearInterval(intervalo);

    for (let i = 0; i < totalCorredores; i++) {
        const col = document.createElement("div");
        col.className = "col";
        col.innerHTML = `
            <div class="card corredor h-100 shadow-sm border-0">
                <div class="card-body p-4">
                    <p class="small text-muted mb-1 fw-bold text-uppercase">Corredor ${i + 1}</p>
                    <div class="tiempo mb-2" id="tiempo${i}">00:00.000</div>
                    <div id="dif${i}" class="diferencia-text text-muted fw-bold"></div>
                </div>
            </div>
        `;
        contenedor.appendChild(col);

        const boton = document.createElement("button");
        boton.innerText = "META " + (i + 1);
        boton.onclick = function () { detener(i); };
        panel.appendChild(boton);
    }
}

function iniciarCarrera() {
    if (totalCorredores === 0) return;
    
    if (!carreraIniciada && tiempoAcumulado === 0) {
        primerLugar = null;
        for (let i = 0; i < totalCorredores; i++) {
            finalizados[i] = false;
            tiempos[i] = 0;
            let tEl = document.getElementById("tiempo" + i);
            let dEl = document.getElementById("dif" + i);
            if (tEl) tEl.innerText = "00:00.000";
            if (dEl) {
                dEl.innerText = "";
                dEl.classList.remove("text-success");
                dEl.classList.add("text-muted");
            }
        }
    }

    inicioTiempo = Date.now() - tiempoAcumulado;
    carreraIniciada = true;
    clearInterval(intervalo);

    intervalo = setInterval(() => {
        let ahora = Date.now();
        tiempoAcumulado = ahora - inicioTiempo;

        for (let i = 0; i < totalCorredores; i++) {
            if (!finalizados[i]) {
                let elemento = document.getElementById("tiempo" + i);
                if (elemento) { // <--- CORREGIDO: era 'element'
                    elemento.innerText = formatearTiempo(tiempoAcumulado);
                }
            }
        }
    }, 10);
}

function pausarCarrera() {
    carreraIniciada = false;
    clearInterval(intervalo);
}

function resetearCarrera() {
    pausarCarrera();
    tiempoAcumulado = 0;
    crearCorredores();
}

function detener(i) {
    if (!carreraIniciada) return;
    if (finalizados[i]) return;

    const tiempoFinal = Date.now() - inicioTiempo;
    tiempos[i] = tiempoFinal;
    finalizados[i] = true;

    document.getElementById("tiempo" + i).innerText = formatearTiempo(tiempoFinal);

    if (primerLugar === null) {
        primerLugar = tiempoFinal;
        let dEl = document.getElementById("dif" + i);
        dEl.innerText = "GANADOR";
        dEl.classList.replace("text-muted", "text-success");
    } else {
        let dif = tiempoFinal - primerLugar;
        document.getElementById("dif" + i).innerText = "+" + formatearTiempo(dif);
    }
}

function formatearTiempo(ms) {
    let minutos = Math.floor(ms / 60000);
    let segundos = Math.floor((ms % 60000) / 1000);
    let miliseg = ms % 1000;
    return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}.${String(miliseg).padStart(3, '0')}`;
}

function exportarPDF() {
    const { jsPDF } = window.jspdf;
    let doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("REGISTRO DE CARRERA", 20, 20);
    doc.setFontSize(10);
    let y = 40;
    for (let i = 0; i < totalCorredores; i++) {
        let tiempo = formatearTiempo(tiempos[i]);
        let texto = `Corredor ${i + 1}: ${tiempos[i] === 0 ? "N/A" : tiempo}`;
        if (tiempos[i] === primerLugar && tiempos[i] !== 0) texto += " (Ganador)";
        doc.text(texto, 20, y);
        y += 8;
    }
    doc.save("carrera_reporte.pdf");
}