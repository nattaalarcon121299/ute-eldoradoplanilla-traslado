document.addEventListener('DOMContentLoaded', () => {
  // 1. CONTROL DE ACCESO (AUTENTICACIÓN)
  verificarAcceso();
});

function verificarAcceso() {
  // Definimos las credenciales del jefe (puedes cambiarlas aquí)
  const USUARIO_JEFE = "danielalarcon";
  const PASSWORD_JEFE = "JefeUTE";

  // Verificamos si ya inició sesión en esta pestaña
  let sesionIniciada = sessionStorage.getItem("accesoAutorizado");

  if (sesionIniciada !== "true") {
    // Pedimos las credenciales mediante ventanas emergentes simples del navegador
    let usuarioIngresado = prompt("Panel Restringido - UTE Eldorado\nIngrese su usuario:");
    
    if (usuarioIngresado === null) {
      mostrarAccesoDenegado();
      return;
    }

    let passwordIngresada = prompt("Ingrese su contraseña:");

    if (usuarioIngresado === USUARIO_JEFE && passwordIngresada === PASSWORD_JEFE) {
      // Credenciales correctas: guardamos la sesión y permitimos el acceso
      sessionStorage.setItem("accesoAutorizado", "true");
      iniciarDashboard();
    } else {
      // Credenciales incorrectas
      alert("Usuario o contraseña incorrectos.");
      mostrarAccesoDenegado();
    }
  } else {
    // Si ya había iniciado sesión antes, cargamos directamente
    iniciarDashboard();
  }
}

function mostrarAccesoDenegado() {
  // Reemplazamos todo el contenido del body por una pantalla de bloqueo
  document.body.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-color: #f3f4f6; font-family: sans-serif; text-align: center; padding: 20px;">
      <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px; width: 100%;">
        <h2 style="color: #dc2626; font-size: 24px; font-weight: bold; margin-bottom: 10px;">Acceso Denegado</h2>
        <p style="color: #4b5563; font-size: 14px; margin-bottom: 20px;">No tiene permisos para visualizar el Panel de Control Institucional de la UTE Eldorado.</p>
        <button onclick="location.reload()" style="background-color: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer;">Intentar nuevamente</button>
      </div>
    </div>
  `;
}

function iniciarDashboard() {
  // Mostrar el contenedor principal de la aplicación que estaba oculto
  const contenedorApp = document.getElementById('appContainer');
  if (contenedorApp) {
    contenedorApp.style.display = 'block';
  }

  // Mostrar Fecha Actual
  const elementoFecha = document.getElementById('fechaActual');
  if (elementoFecha) {
    elementoFecha.innerText = new Date().toLocaleDateString('es-AR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  // Inicializar Gráficos y Mapa vacíos
  initChartTraslados();
  initChartDiagnosticos();
  initChartFlota();
  initMapaSiniestralidad();
}

// 1. GRÁFICO DE TRASLADOS (Día / Semana / Mes)
let chartTrasladosInstance;
function initChartTraslados() {
  const canvasElement = document.getElementById('chartTraslados');
  if (!canvasElement) return;
  const ctx = canvasElement.getContext('2d');
  
  const dataDia = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [{
      label: 'Cantidad de Auxilios',
      data: [0, 0, 0, 0, 0, 0, 0],
      backgroundColor: 'rgba(37, 99, 235, 0.6)',
      borderColor: 'rgba(37, 99, 235, 1)',
      borderWidth: 2,
      borderRadius: 4
    }]
  };

  chartTrasladosInstance = new Chart(ctx, {
    type: 'bar',
    data: dataDia,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, suggestedMax: 10 } }
    }
  });

  const filtroPeriodo = document.getElementById('filtroPeriodo');
  if (filtroPeriodo) {
    filtroPeriodo.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'dia') {
        chartTrasladosInstance.data.labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        chartTrasladosInstance.data.datasets[0].data = [0, 0, 0, 0, 0, 0, 0];
      } else if (val === 'semana') {
        chartTrasladosInstance.data.labels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
        chartTrasladosInstance.data.datasets[0].data = [0, 0, 0, 0];
      } else if (val === 'mes') {
        chartTrasladosInstance.data.labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
        chartTrasladosInstance.data.datasets[0].data = [0, 0, 0, 0, 0, 0];
      }
      chartTrasladosInstance.update();
    });
  }
}

// 2. GRÁFICO DE DIAGNÓSTICOS PRESUNTIVOS
function initChartDiagnosticos() {
  const canvasElement = document.getElementById('chartDiagnosticos');
  if (!canvasElement) return;
  const ctx = canvasElement.getContext('2d');
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Sin datos registrados'],
      datasets: [{
        data: [1],
        backgroundColor: ['#e5e7eb']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } }
      }
    }
  });
}

// 3. MAPA DE SINIESTRALIDAD (Eldorado, Misiones)
function initMapaSiniestralidad() {
  const mapaContainer = document.getElementById('mapaSiniestros');
  if (!mapaContainer) return;

  const eldoradoCoords = [-26.407, -54.615];
  const map = L.map('mapaSiniestros').setView(eldoradoCoords, 13);

  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
  }).addTo(map);
}

// 4. CONTROL DE KILOMETRAJE Y COMBUSTIBLE POR UNIDAD
function initChartFlota() {
  const canvasElement = document.getElementById('chartFlota');
  if (!canvasElement) return;
  const ctx = canvasElement.getContext('2d');
  
  const moviles = [];
  const km = [];
  const combustible = [];

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: moviles,
      datasets: [
        { label: 'Kilómetros Recorridos', data: km, backgroundColor: '#3b82f6', yAxisID: 'y' },
        { label: 'Litros Combustible', data: combustible, backgroundColor: '#f59e0b', yAxisID: 'y1' }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { type: 'linear', position: 'left', title: { display: true, text: 'Kilómetros' }, suggestedMax: 100 },
        y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Litros' }, suggestedMax: 100 }
      }
    }
  });

  const tbody = document.getElementById('tablaFlotaBody');
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="py-4 text-center text-gray-400">No hay móviles o consumos registrados aún</td>
      </tr>
    `;
  }
}