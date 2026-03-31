const cargos = [
    "1.1 Exceso de Velocidad", 
    "1.2 Estacionamiento indebido", 
    "1.3 Carreras Ilegales",
    "1.4 Conducción Temeraria", 
    "1.5 Maniobrar sin las medidas de seguridad pertinentes",
    "1.6 Portar neones prendidos en circulación", 
    "1.7 Conducir sin licencia",
    "1.8 Conducir en dirección contraria"
];

let gtaVehicles = [
    "ADDER [ADDER]", "AKUMA [AKUMA]", "BANSHEE [BANSHEE]", "BATI 801 [BATI]", 
    "BUFFALO [BUFFALO]", "BUFFALO S [BUFFALO2]", "BUFFALO STX [BUFFALO4]", 
    "COMET [COMET]", "DOMINATOR [DOMINATOR]", "ELEGY RH8 [ELEGY2]", 
    "ENTITY XF [ENTITYXF]", "FUTO [FUTO]", "GRANGER [GRANGER]", 
    "INFERNUS [INFERNUS]", "KURUMA [KURUMA]", "ORACLE [ORACLE]", 
    "PENUMBRA [PENUMBRA]", "RUINER [RUINER]", "SULTAN [SULTAN]", 
    "TAILGATER [TAILGATER]", "V-STR [VSTR]", "ZENTORNO [ZENTORNO]"
];

let registros = [];
let sortColumn = '';
let sortDesc = false;
let idCambioPendiente = '';
let estadoCambioPendiente = '';

function mostrarToast(mensaje, tipo = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerText = mensaje;
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400); 
    }, 3500);
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
}

function getGMTDateString() {
    const now = new Date();
    const d = String(now.getUTCDate()).padStart(2, '0');
    const m = String(now.getUTCMonth() + 1).padStart(2, '0');
    const y = now.getUTCFullYear();
    const hh = String(now.getUTCHours()).padStart(2, '0');
    const mm = String(now.getUTCMinutes()).padStart(2, '0');
    return `${d}/${m}/${y}, ${hh}:${mm} GMT`;
}

async function descargarVehiculosGTA() {
    try {
        const response = await fetch('./vehicles.json');
        if(!response.ok) throw new Error("No se encontró el archivo vehicles.json");
        
        const data = await response.json();
        let vehiculosArray = [];
        
        if (Array.isArray(data)) vehiculosArray = data;
        else if (data.vehicles || data.data || data.cars) vehiculosArray = data.vehicles || data.data || data.cars;
        else vehiculosArray = Object.values(data);

        let nombresSet = new Set();
        
        vehiculosArray.forEach(v => {
            if (!v) return;
            if (typeof v === 'string') { nombresSet.add(v.toUpperCase()); return; }
            
            let namePart = "";
            
            if (v.DisplayName && typeof v.DisplayName === 'object') {
                namePart = v.DisplayName.Spanish || v.DisplayName.English || "";
            } else if (typeof v.DisplayName === 'string') {
                namePart = v.DisplayName;
            } else {
                namePart = v.localizedName || v.LocalizedName || v.displayName || v.title || v.name || v.Name || "";
            }
            
            let modelPart = v.Name || v.name || v.model || v.modelName || v.spawnName || v.SpawnName || "";
            
            if (!namePart && modelPart) namePart = modelPart;
            
            namePart = String(namePart).trim();
            modelPart = String(modelPart).trim();

            if (namePart && modelPart && namePart.toLowerCase() !== modelPart.toLowerCase()) {
                nombresSet.add(`${namePart} [${modelPart}]`.toUpperCase());
            } else if (namePart) {
                nombresSet.add(namePart.toUpperCase());
            } else if (modelPart) {
                nombresSet.add(modelPart.toUpperCase());
            }
        });
        
        const extraidos = [...nombresSet].filter(Boolean);
        if(extraidos.length > 0) {
            gtaVehicles = extraidos.sort();
            console.log(`Base de datos local cargada. Vehículos listos: ${gtaVehicles.length}`);
        }
        
    } catch (error) {
        console.warn("Fallo al leer vehicles.json local. Usando respaldo interno.", error);
    }
}

window.onload = function() {
    descargarVehiculosGTA();

    const vehInput = document.getElementById('veh_modelo');
    const vehList = document.getElementById('veh_modelo_list');

    vehInput.addEventListener('input', function() {
        let val = this.value;
        vehList.innerHTML = '';
        
        if (!val) {
            vehList.style.display = 'none';
            return false;
        }
        
        const normalizedInput = val.toLowerCase().replace(/[\s\-_]/g, '');
        const coincidencias = gtaVehicles.filter(v => {
            const normalizedV = v.toLowerCase().replace(/[\s\-_]/g, '');
            return normalizedV.includes(normalizedInput);
        });
        
        if(coincidencias.length > 0) {
            vehList.style.display = 'block';
            
            coincidencias.slice(0, 20).forEach(match => {
                let div = document.createElement('div');
                const regex = new RegExp(`(${escapeRegExp(val)})`, "gi");
                
                if (match.match(regex)) {
                    div.innerHTML = match.replace(regex, "<strong style='color:var(--danger)'>$1</strong>");
                } else {
                    div.innerHTML = match;
                }
                
                div.addEventListener('click', function() {
                    vehInput.value = match;
                    vehList.innerHTML = '';
                    vehList.style.display = 'none';
                });
                vehList.appendChild(div);
            });
        } else {
            vehList.style.display = 'none';
        }
    });

    document.addEventListener('click', function(e) {
        if (e.target !== vehInput) {
            vehList.innerHTML = '';
            vehList.style.display = 'none';
        }
    });

    const contenedorCargos = document.getElementById('listaCargos');
    cargos.forEach(cargo => {
        contenedorCargos.innerHTML += `<label style="cursor:pointer;"><input type="checkbox" value="${cargo}" class="cargo-chk" style="margin-right: 5px;"> ${cargo}</label>`;
    });

    const idsGuardados = ['of_callsign', 'of_nombre', 'of_serial', 'of_nombre2', 'of_serial2'];
    idsGuardados.forEach(id => {
        if(localStorage.getItem(id)) document.getElementById(id).value = localStorage.getItem(id);
        document.getElementById(id).addEventListener('input', (e) => {
            localStorage.setItem(id, e.target.value.toUpperCase());
        });
    });

    document.getElementById('of_tsd').checked = localStorage.getItem('of_tsd') === 'true';
    document.getElementById('of_tsd').addEventListener('change', (e) => localStorage.setItem('of_tsd', e.target.checked));
    document.getElementById('of_tsd2').checked = localStorage.getItem('of_tsd2') === 'true';
    document.getElementById('of_tsd2').addEventListener('change', (e) => localStorage.setItem('of_tsd2', e.target.checked));

    document.getElementById('chk_licencia').addEventListener('change', function() {
        if (document.getElementById('estado_final').value === 'Citado') actualizarCargoLicencia();
    });

    database.ref('registros').on('value', (snapshot) => {
        registros = [];
        snapshot.forEach((child) => {
            let data = child.val();
            data.id = child.key; 
            registros.push(data);
        });
        actualizarTablas();
        if(document.getElementById('dashboardSection').style.display === 'block') actualizarAdmin();
    });

    database.ref('operativo').on('value', (snapshot) => {
        const data = snapshot.val() || {};
        const ubi = data.ubicacion || 'No definida';
        const fec = data.fecha || 'No definida';
        const ran = data.rango || '';
        const enc = data.encargado || 'No definido';

        let encargadoTxt = enc;
        if (enc !== 'No definido' && ran !== '') encargadoTxt = `${ran}. ${enc}`;

        document.getElementById('lbl_op_ubicacion').innerText = ubi;
        document.getElementById('lbl_op_fecha').innerText = fec;
        document.getElementById('lbl_op_encargado').innerText = encargadoTxt;

        document.getElementById('cfg_ubicacion').value = ubi !== 'No definida' ? ubi : '';
        document.getElementById('cfg_fecha').value = fec !== 'No definida' ? fec : '';
        document.getElementById('cfg_rango').value = ran;
        document.getElementById('cfg_encargado').value = enc !== 'No definido' ? enc : '';

        document.getElementById('pdf_ubicacion').innerText = ubi;
        document.getElementById('pdf_fecha').innerText = fec;
        document.getElementById('pdf_encargado').innerText = encargadoTxt;
    });
};

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tabs button').forEach(el => el.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
    document.getElementById(`btn-${tab}`).classList.add('active');
    if(tab === 'admin' && document.getElementById('dashboardSection').style.display === 'block') {
        actualizarAdmin();
    }
}

function toggleCargos() {
    const estado = document.getElementById('estado_final').value;
    const container = document.getElementById('cargosContainer');
    if (estado === 'Citado') {
        container.style.display = 'block';
        actualizarCargoLicencia();
    } else {
        container.style.display = 'none';
        document.querySelectorAll('.cargo-chk').forEach(chk => {
            chk.checked = false;
            chk.disabled = false;
            chk.parentElement.style.opacity = '1';
            chk.parentElement.style.cursor = 'pointer';
        });
    }
}

function actualizarCargoLicencia() {
    const tieneLicencia = document.getElementById('chk_licencia').checked;
    const checkboxes = document.querySelectorAll('.cargo-chk');
    
    checkboxes.forEach(chk => {
        if(chk.value === "1.7 Conducir sin licencia") {
            chk.checked = !tieneLicencia;
            chk.disabled = true; 
            chk.parentElement.style.opacity = '0.6';
            chk.parentElement.style.cursor = 'not-allowed';
        }
    });
}

function guardarInfoOperativo() {
    const dataOperativo = {
        ubicacion: document.getElementById('cfg_ubicacion').value.toUpperCase(),
        fecha: document.getElementById('cfg_fecha').value,
        rango: document.getElementById('cfg_rango').value,
        encargado: document.getElementById('cfg_encargado').value.toUpperCase()
    };
    
    database.ref('operativo').set(dataOperativo).then(() => {
        mostrarToast("Información del operativo actualizada exitosamente.");
    }).catch(() => {
        mostrarToast("Error de conexión con la central.", "error");
    });
}

document.getElementById('controlForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const btnSubmit = document.getElementById('btnSubmit');
    btnSubmit.innerText = "ENVIANDO A CENTRAL...";
    btnSubmit.disabled = true;

    let cargosSeleccionados = [];
    if (document.getElementById('estado_final').value === 'Citado') {
        document.querySelectorAll('.cargo-chk').forEach(chk => {
            if(chk.checked || chk.disabled) cargosSeleccionados.push(chk.value);
        });
    }

    const nuevoRegistro = {
        fecha: getGMTDateString(),
        of_callsign: document.getElementById('of_callsign').value.toUpperCase(),
        of_nombre: document.getElementById('of_nombre').value.toUpperCase(),
        of_serial: document.getElementById('of_serial').value.replace('#', ''), 
        of_tsd: document.getElementById('of_tsd').checked,
        of_nombre2: document.getElementById('of_nombre2').value.toUpperCase(),
        of_serial2: document.getElementById('of_serial2').value.replace('#', ''),
        of_tsd2: document.getElementById('of_tsd2').checked,
        
        suj_hash: document.getElementById('suj_hash').value.toUpperCase().replace('#', ''),
        suj_nombre: document.getElementById('suj_nombre').value.toUpperCase(),
        suj_apellido: document.getElementById('suj_apellido').value.toUpperCase(),
        veh_modelo: document.getElementById('veh_modelo').value.toUpperCase(),
        veh_matricula: document.getElementById('veh_matricula').value.toUpperCase(),
        licencia: document.getElementById('chk_licencia').checked,
        estado: document.getElementById('estado_final').value,
        cargos: cargosSeleccionados
    };

    database.ref('registros').push(nuevoRegistro).then(() => {
        document.getElementById('suj_hash').value = '';
        document.getElementById('suj_nombre').value = '';
        document.getElementById('suj_apellido').value = '';
        document.getElementById('veh_modelo').value = '';
        document.getElementById('veh_matricula').value = '';
        document.getElementById('chk_licencia').checked = false;
        document.getElementById('estado_final').value = '';
        toggleCargos();
        
        mostrarToast("Control de tráfico registrado exitosamente.");
    }).catch(() => {
        mostrarToast("Error al conectar con la base de datos.", "error");
    }).finally(() => {
        btnSubmit.innerText = "Enviar Registro";
        btnSubmit.disabled = false;
    });
});

function formatearEstado(r) {
    let html = `<strong>${r.estado}</strong>`;
    if (r.estado === 'Citado' && r.cargos && r.cargos.length > 0) {
        html += `<ul class="cargos-list">`;
        r.cargos.forEach(c => html += `<li>${c}</li>`);
        html += `</ul>`;
    }
    return html;
}

function generarCeldaUnidad(r) {
    let html = `<div style="font-weight:bold; color:var(--lssd-olive-main); font-size:1.05rem;">${r.of_callsign}</div>`;
    html += `<div style="color:var(--text-main); font-size:0.85rem; margin-top:4px;">${r.of_nombre}</div>`;
    if(r.of_nombre2) {
        html += `<div style="color:var(--text-main); font-size:0.85rem;">${r.of_nombre2}</div>`;
    }
    return html;
}

function abrirModalCambioEstado(id, nuevoEstado) {
    idCambioPendiente = id;
    estadoCambioPendiente = nuevoEstado;
    const modal = document.getElementById('modalOverlay');
    const msj = document.getElementById('modalMessage');
    
    if (nuevoEstado === 'Arrestado') {
        msj.innerHTML = `¿Confirmas que deseas cambiar el estado de este control de <strong style="color:var(--danger)">Huída</strong> a <strong style="color:var(--lssd-olive-dark)">Arrestado</strong>?`;
    } else {
        msj.innerHTML = `¿Confirmas que deseas <strong>revertir</strong> el estado de este control a <strong style="color:var(--danger)">Huída</strong>?`;
    }
    modal.style.display = 'flex';
}

function cerrarModalCambioEstado() {
    document.getElementById('modalOverlay').style.display = 'none';
    idCambioPendiente = '';
    estadoCambioPendiente = '';
}

function confirmarCambioEstado() {
    if (idCambioPendiente !== '') {
        if (estadoCambioPendiente === 'Arrestado') {
            database.ref('registros/' + idCambioPendiente).update({
                estado: 'Arrestado',
                prevEstado: 'Huída'
            }).then(() => mostrarToast("Estado actualizado en la central."));
        } else {
            database.ref('registros/' + idCambioPendiente).update({
                estado: 'Huída',
                prevEstado: null
            }).then(() => mostrarToast("Estado revertido en la central."));
        }
    }
    cerrarModalCambioEstado();
}

function actualizarTablas() {
    const tbodyResumen = document.querySelector('#tablaResumen tbody');
    tbodyResumen.innerHTML = '';
    const recientes = registros.slice(-10).reverse();
    recientes.forEach(r => {
        let vehiculoLimpio = r.veh_modelo.split(' [')[0];
        tbodyResumen.innerHTML += `
            <tr>
                <td>${generarCeldaUnidad(r)}</td>
                <td>${r.suj_nombre} ${r.suj_apellido} <strong style="color:var(--lssd-olive-main);">#${r.suj_hash}</strong></td>
                <td>${vehiculoLimpio}</td>
                <td>${r.veh_matricula}</td>
                <td>${formatearEstado(r)}</td>
            </tr>
        `;
    });
}

function verificarAdmin() {
    if (btoa(document.getElementById('adminPass').value) === 'VFNEMjAyNg==') {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'block';
        actualizarAdmin();
        mostrarToast("Sesión iniciada correctamente.");
    } else {
        document.getElementById('errorMsg').style.display = 'block';
    }
}

function sortDeputies(col) {
    if (sortColumn === col) sortDesc = !sortDesc;
    else { sortColumn = col; sortDesc = false; }
    actualizarAdmin();
}

function actualizarAdmin() {
    document.getElementById('stat_total').innerText = registros.length;
    document.getElementById('stat_citados').innerText = registros.filter(r => r.estado === 'Citado').length;
    document.getElementById('stat_huidas').innerText = registros.filter(r => r.estado === 'Huída').length;
    document.getElementById('stat_arrestos').innerText = registros.filter(r => r.estado === 'Arrestado').length;

    const deputiesMap = {};
    registros.forEach(r => {
        if(r.of_serial) {
            if(!deputiesMap[r.of_serial]) deputiesMap[r.of_serial] = { callsign: r.of_callsign, nombre: `${r.of_nombre}, #${r.of_serial}`, isTSD: r.of_tsd, controles: 0 };
            deputiesMap[r.of_serial].controles++;
            deputiesMap[r.of_serial].callsign = r.of_callsign;
        }
        if(r.of_serial2 && r.of_nombre2) {
            if(!deputiesMap[r.of_serial2]) deputiesMap[r.of_serial2] = { callsign: r.of_callsign, nombre: `${r.of_nombre2}, #${r.of_serial2}`, isTSD: r.of_tsd2, controles: 0 };
            deputiesMap[r.of_serial2].controles++;
            deputiesMap[r.of_serial2].callsign = r.of_callsign;
        }
    });

    let deputiesArray = Object.values(deputiesMap);
    
    if(sortColumn === 'NOMBRE') {
        deputiesArray.sort((a,b) => a.nombre.localeCompare(b.nombre) * (sortDesc ? -1 : 1));
    } else if (sortColumn === 'TSD') {
        deputiesArray.sort((a,b) => (a.isTSD === b.isTSD ? 0 : a.isTSD ? -1 : 1) * (sortDesc ? -1 : 1));
    } else if (sortColumn === 'UNIDAD') {
        deputiesArray.sort((a,b) => a.callsign.localeCompare(b.callsign) * (sortDesc ? -1 : 1));
    } else if (sortColumn === 'CONTROLES') {
        deputiesArray.sort((a,b) => (a.controles - b.controles) * (sortDesc ? -1 : 1));
    }

    const tbodyDep = document.getElementById('tablaDeputies');
    tbodyDep.innerHTML = '';
    deputiesArray.forEach(d => {
        const isTSDstr = d.isTSD ? '<strong style="color:var(--lssd-olive-dark);">Sí</strong>' : 'No';
        tbodyDep.innerHTML += `<tr>
            <td style="font-weight:bold; color:var(--lssd-olive-main); text-align:center;">${d.callsign}</td>
            <td>${d.nombre}</td>
            <td style="text-align:center;">${isTSDstr}</td>
            <td style="text-align:center;">${d.controles}</td>
        </tr>`;
    });

    const tbodyHist = document.getElementById('tablaHistorial');
    tbodyHist.innerHTML = '';
    
    [...registros].reverse().forEach(r => {
        let estadoHTML = formatearEstado(r);
        
        if (r.estado === 'Huída') {
            estadoHTML += `<br><button class="btn-action-small no-export" onclick="abrirModalCambioEstado('${r.id}', 'Arrestado')">➜ Cambiar a Arrestado</button>`;
        } else if (r.estado === 'Arrestado' && r.prevEstado === 'Huída') {
            estadoHTML += `<br><button class="btn-action-small no-export" style="color:var(--lssd-olive-dark); border-color:var(--lssd-olive-dark);" onclick="abrirModalCambioEstado('${r.id}', 'Huída')">↺ Revertir a Huída</button>`;
        }

        let vehiculoLimpio = r.veh_modelo.split(' [')[0];

        tbodyHist.innerHTML += `
            <tr>
                <td style="font-size:0.85rem;">${r.fecha.split(',')[0]}<br>${r.fecha.split(',')[1]}</td>
                <td style="font-weight:bold; color:var(--lssd-olive-main); text-align:left;">${r.of_callsign}</td>
                <td>${r.suj_nombre} ${r.suj_apellido} <strong style="color:var(--lssd-olive-main);">#${r.suj_hash}</strong></td>
                <td>${vehiculoLimpio}</td>
                <td>${r.veh_matricula}</td>
                <td>${estadoHTML}</td>
            </tr>
        `;
    });
}

function ocultarBotonesExport(ocultar) {
    document.querySelectorAll('.no-export').forEach(el => {
        el.style.display = ocultar ? 'none' : 'inline-block';
    });
}

function exportarPDF() {
    try {
        window.scrollTo(0,0);
        ocultarBotonesExport(true);
        mostrarToast("Generando archivo PDF...");
        
        const elemento = document.getElementById('pdfArea');
        const opt = { 
            margin: 10, 
            filename: 'TSD_Reporte.pdf', 
            image: { type: 'jpeg', quality: 0.98 }, 
            html2canvas: { scale: 2, useCORS: true }, 
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' } 
        };
        
        html2pdf().set(opt).from(elemento).save().then(() => {
            ocultarBotonesExport(false);
            mostrarToast("PDF descargado con éxito.");
        });
    } catch (error) {
        ocultarBotonesExport(false);
        mostrarToast("Error al generar PDF.", "error");
    }
}

function exportarHTML() {
    ocultarBotonesExport(true);
    const contenido = document.getElementById('pdfArea').innerHTML;
    ocultarBotonesExport(false);

    const tagS = '<' + 'style' + '>'; const tagSc = '<' + '/' + 'style' + '>';
    const docHead = '<!DOCTYPE html>\n<html lang="es">\n<head>\n<meta charset="UTF-8">\n<title>Reporte TSD</title>\n';
    const docBody = '\n<' + '/' + 'head>\n<body>\n<div class="report-container">\n';
    const docClose = '\n<' + '/' + 'div>\n<' + '/' + 'body>\n<' + '/' + 'html>';
    
    const estilos = tagS + "body{font-family:'Helvetica Neue',Arial,sans-serif;background-color:#ece7e0;color:#2b2b2b;padding:30px;}.report-container{max-width:1000px;margin:auto;background:#fff;padding:40px;border-radius:8px;box-shadow:0 5px 15px rgba(0,0,0,0.1);border-top:5px solid #4f5a48;}table{width:100%;border-collapse:collapse;margin-top:25px;font-size:0.9rem;}th,td{border:1px solid #d4c4b3;padding:12px;text-align:left;vertical-align:middle;}th{background-color:#3b4436;color:#d4c4b3;text-transform:uppercase;border-bottom:2px solid #c5a059;}tr:nth-child(even){background-color:#f9f8f6;}.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:30px;}.stat-card{background:#f9f8f6;border:1px solid #d4c4b3;padding:20px;text-align:center;border-radius:8px;border-top:5px solid #c5a059;}.stat-card h3{margin:0;color:#3b4436;font-size:2.5rem;}.stat-card p{margin:10px 0 0;font-weight:bold;font-size:0.85rem;text-transform:uppercase;color:#4f5a48;}.cargos-list{margin:8px 0 0 0;padding-left:20px;color:#b30000;font-size:0.95rem;font-weight:bold;}" + tagSc;
    
    const htmlCompleto = docHead + estilos + docBody + contenido + docClose;
    const blob = new Blob([htmlCompleto], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TSD_Reporte.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    mostrarToast("Archivo HTML descargado con éxito.");
}

function exportarCSV() {
    if (registros.length === 0) {
        mostrarToast("No hay registros para exportar.", "error");
        return;
    }

    let csvContent = "Fecha,Callsign Unidad,Encargado 1,Serial 1,TSD 1,Encargado 2,Serial 2,TSD 2,#HASH,Nombre Sujeto,Apellido Sujeto,Vehículo,Matrícula,Licencia,Estado Final,Cargos Imputados\n";

    registros.forEach(r => {
        let cargosStr = r.cargos ? r.cargos.join(" / ") : "";
        let vehiculoLimpio = r.veh_modelo.split(' [')[0];
        
        let row = [
            `"${r.fecha}"`, `"${r.of_callsign}"`, `"${r.of_nombre}"`, `"${r.of_serial}"`, `"${r.of_tsd ? 'Si' : 'No'}"`,
            `"${r.of_nombre2 || ''}"`, `"${r.of_serial2 || ''}"`, `"${r.of_tsd2 ? 'Si' : 'No'}"`, `"#${r.suj_hash}"`,
            `"${r.suj_nombre}"`, `"${r.suj_apellido}"`, `"${vehiculoLimpio}"`, `"${r.veh_matricula}"`,
            `"${r.licencia ? 'Vigente' : 'No Vigente'}"`, `"${r.estado}"`, `"${cargosStr}"`
        ];
        csvContent += row.join(",") + "\n";
    });

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "TSD_Reporte_Excel.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    mostrarToast("Documento Excel generado correctamente.");
}

function toggleResetUI() {
    const container = document.getElementById('resetFormContainer');
    const btn = document.getElementById('btnShowReset');
    
    if (container.style.display === 'none' || container.style.display === '') {
        container.style.display = 'flex';
        btn.style.display = 'none';
        document.getElementById('resetPassVerify').value = '';
    } else {
        container.style.display = 'none';
        btn.style.display = 'block';
    }
}

function ejecutarResetTotal() {
    const pass = document.getElementById('resetPassVerify').value;
    
    if (btoa(pass) === 'cDkxO1o6M3ZqQ0Je') {
        database.ref('registros').remove();
        database.ref('operativo').remove();
        
        toggleResetUI();
        mostrarToast("Base de datos y ajustes eliminados globalmente.");
    } else {
        mostrarToast("Contraseña de supervisor incorrecta.", "error");
    }
}
