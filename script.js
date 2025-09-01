




document.addEventListener('DOMContentLoaded', () => {

    const tabla1 = document.getElementById('tabla-surtidores-1');
    const tabla2 = document.getElementById('tabla-glp');
    const tabla3 = document.getElementById('tabla-surtidores-3');
    const efectivoInput = document.getElementById('efectivo');
    const valesInput = document.getElementById('vales');
    const aceitesInput = document.getElementById('aceites');
    
    // Nuevos elementos para guardar/cargar
    const guardarIngresoBtn = document.getElementById('guardar-ingreso-btn');
    const cargarIngresoBtn = document.getElementById('cargar-ingreso-btn');
    const cargarIngresoFile = document.getElementById('cargar-ingreso-file');

    // Función para convertir una entrada con coma a un número de coma flotante
    function parseInput(input) {
        if (!input) return 0;
        const cleanedValue = input.replace(',', '.');
        return parseFloat(cleanedValue) || 0;
    }

    // Función para truncar a 2 decimales sin redondear (para el dinero)
    function truncaA2Decimales(numero) {
        return Math.floor(numero * 100) / 100;
    }

    // Función para truncar a 3 decimales sin redondear (para los litros)
    function truncaA3Decimales(numero) {
        return Math.floor(numero * 1000) / 1000;
    }

    function calcularTotalTabla(tbody, totalElementId) {
        let totalVentaTabla = 0;
        const rows = tbody.querySelectorAll('tr');

        rows.forEach(row => {
            const ingreso = parseInput(row.querySelector('.ingreso').value);
            const salida = parseInput(row.querySelector('.salida').value);
            const precio = parseFloat(row.dataset.precio);
            const combustible = row.dataset.combustible;

            const totalLitros = (Math.round(salida * 1000) - Math.round(ingreso * 1000)) / 1000;

            let totalVenta = 0;
            if (combustible === 'glp') {
                totalVenta = totalLitros;
            } else {
                totalVenta = truncaA2Decimales(totalLitros * precio);
            }

            row.querySelector('.total-litros').textContent = totalLitros.toFixed(3);
            row.querySelector('.total-venta').textContent = totalVenta.toFixed(2);

            totalVentaTabla += totalVenta;
        });

        document.getElementById(totalElementId).textContent = totalVentaTabla.toFixed(2);
        return totalVentaTabla;
    }

    function calcularVentas() {
        const totalCuadro1 = calcularTotalTabla(tabla1, 'total-cuadro-1');
        const totalCuadro2 = calcularTotalTabla(tabla2, 'total-cuadro-2');
        const totalCuadro3 = calcularTotalTabla(tabla3, 'total-cuadro-3');
        const ventaAceites = parseInput(aceitesInput.value);

        const granTotalVentas = totalCuadro1 + totalCuadro2 + totalCuadro3 + ventaAceites;
        document.getElementById('gran-total-ventas').textContent = granTotalVentas.toFixed(2);
        return granTotalVentas;
    }

    function calcularRecaudacion() {
        const efectivo = parseInput(efectivoInput.value);
        const vales = parseInput(valesInput.value);
        const totalRecaudacion = efectivo + vales;
        document.getElementById('total-recaudacion').textContent = totalRecaudacion.toFixed(2);
        return totalRecaudacion;
    }

    function realizarCuadre() {
        const totalVentas = calcularVentas();
        const totalRecaudacion = calcularRecaudacion();
        const resultadoElement = document.getElementById('resultado-cuadre');
        
        const diferencia = (Math.round(totalRecaudacion * 100) - Math.round(totalVentas * 100)) / 100;

        resultadoElement.innerHTML = '';
        resultadoElement.className = 'resultado-cuadre';

        if (Math.abs(diferencia) < 0.01) {
            resultadoElement.classList.add('cuadre-ok');
            resultadoElement.innerHTML = `<p>¡Cuadre perfecto!</p><p>Diferencia: S/ ${diferencia.toFixed(2)}</p>`;
        } else if (diferencia > 0) {
            resultadoElement.classList.add('sobra-dinero');
            resultadoElement.innerHTML = `<p>Te sobran: S/ ${diferencia.toFixed(2)}</p>`;
        } else {
            resultadoElement.classList.add('falta-dinero');
            resultadoElement.innerHTML = `<p>Te faltan: S/ ${Math.abs(diferencia).toFixed(2)}</p>`;
        }
    }

    // Funciones de guardar y cargar
    function guardarLecturas() {
        const data = {};
        document.querySelectorAll('.ingreso').forEach((input, index) => {
            data[`ingreso-${index}`] = input.value;
        });
        const jsonData = JSON.stringify(data);
        
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fecha = new Date().toLocaleDateString().replace(/\//g, '-');
        a.download = `lecturas_ingreso_${fecha}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        alert('Lecturas de ingreso guardadas. Puedes encontrarlas en tu carpeta de descargas.');
    }

    function cargarLecturas(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                document.querySelectorAll('.ingreso').forEach((input, index) => {
                    if (data[`ingreso-${index}`]) {
                        input.value = data[`ingreso-${index}`];
                    }
                });
                realizarCuadre();
                alert('Lecturas de ingreso cargadas exitosamente.');
            } catch (error) {
                alert('Error al cargar el archivo. Asegúrate de que el archivo sea el correcto.');
            }
        };
        reader.readAsText(file);
    }

    // Event Listeners
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', realizarCuadre);
    });

    guardarIngresoBtn.addEventListener('click', guardarLecturas);
    cargarIngresoBtn.addEventListener('click', () => {
        cargarIngresoFile.click();
    });
    cargarIngresoFile.addEventListener('change', cargarLecturas);

    realizarCuadre();
});