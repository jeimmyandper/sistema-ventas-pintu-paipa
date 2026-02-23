// ====== Elementos de la página ======
const tbody = document.getElementById("lista-productos");
const inputNombre = document.getElementById("nombre-producto");
const btnBuscar = document.getElementById("buscar");

const selCategoria = document.getElementById("categoria");
const selTamano = document.getElementById("tamano");
const selColor = document.getElementById("color");

const btnAgregar = document.getElementById("agregar-nuevo");

// ====== Modal ======
const modal = document.getElementById("modal-producto");
const modalTitulo = document.getElementById("modal-titulo");
const prodId = document.getElementById("prod-id");
const prodNombre = document.getElementById("prod-nombre");
const prodCategoria = document.getElementById("prod-categoria"); // select
const prodTamano = document.getElementById("prod-tamano");       // select dinámico
const prodColor = document.getElementById("prod-color");         // select
const prodPrecio = document.getElementById("prod-precio");
const prodStock = document.getElementById("prod-stock");
const btnCancelar = document.getElementById("btn-cancelar");
const btnGuardar = document.getElementById("btn-guardar");
const btnCerrarModal = document.getElementById("btn-cerrar-modal");

let cacheProductos = [];

// ====== Helpers ======
function money(v) {
  return Number(v || 0).toLocaleString("es-CO", { style: "currency", currency: "COP" });
}

function setOptions(select, options, keepValue = "") {
  const prev = keepValue || select.value;
  select.innerHTML =
    `<option value="">Seleccione</option>` +
    (options || []).map(v => `<option value="${v}">${v}</option>`).join("");

  if ([...select.options].some(o => o.value === prev)) {
    select.value = prev;
  }
}

// ✅ Helper para leer JSON sin romper si el backend devuelve HTML/errores
async function safeJSON(resp) {
  try { return await resp.json(); } catch (e) { return {}; }
}

function redirectLogin() {
  window.location.href = "/pintupaipa/Softwaredeventas/Inicio/index.html";
}

// ====== Tamaños por categoría (modal) ======
const TAMANOS_PINTURAS = [
  "Galón",
  "1/2 galón",
  "1/4 galón",
  "1/8 galón",
  "1/16 galón",
  "1/32 galón",
  "Cubeta",
  "Caneca",
  "No aplica"
];

const TAMANOS_SOLO_GALON = ["Galón", "No aplica"];
const TAMANOS_BROCHAS = ['1"', '1 1/2"', '2"', '3"', '4"', "No aplica"];
const TAMANOS_RODILLOS = ["Pequeño", "Mediano", "Grande", "No aplica"];
const TAMANOS_THINNER = ["1 botella", "2 botellas", "3 botellas", "4 botellas", "5 botellas", "No aplica"];
const TAMANOS_LIJAS = ["80", "100", "150", "220", "400", "No aplica"];
const TAMANOS_CINTA = ["Delgada", "Ancha", "No aplica"];
const TAMANOS_ESPATULAS = ["Pequeña", "Grande", "No aplica"];

function tamanosPorCategoria(cat) {
  if (!cat) return ["No aplica"];

  const pinturas = ["Vinilo Tipo 1","Vinilo Tipo 2","Vinilo Tipo 3","Laca","Esmalte","Barniz","Estuco"];
  if (pinturas.includes(cat)) return TAMANOS_PINTURAS;

  if (cat === "Anticorrosivo") return TAMANOS_SOLO_GALON;

  if (cat === "Brochas") return TAMANOS_BROCHAS;
  if (cat === "Rodillos") return TAMANOS_RODILLOS;
  if (cat === "Thinner") return TAMANOS_THINNER;
  if (cat === "Lijas") return TAMANOS_LIJAS;
  if (cat === "Cinta de enmascarar") return TAMANOS_CINTA;
  if (cat === "Espátulas") return TAMANOS_ESPATULAS;

  if (cat === "Spray") return ["No aplica"]; // spray se maneja por color
  return ["No aplica"];
}

// ====== Modal abrir/cerrar ======
function abrirModal(modo, producto = null) {
  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");
  modalTitulo.textContent = modo === "crear" ? "Agregar producto" : "Editar producto";

  prodId.value = producto?.id ?? "";
  prodNombre.value = producto?.nombre ?? "";

  // Categoría (select)
  prodCategoria.value = producto?.categoria ?? "";

  // Tamaño depende de categoría
  setOptions(prodTamano, tamanosPorCategoria(prodCategoria.value), producto?.tamano ?? "");

  // Color (select)
  prodColor.value = producto?.color ?? "No aplica";

  prodPrecio.value = producto?.precio ?? 0;
  prodStock.value = producto?.stock ?? 0;
}

function cerrarModal() {
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
}

// listeners modal (una sola vez)
btnCancelar.addEventListener("click", cerrarModal);
btnCerrarModal.addEventListener("click", cerrarModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) cerrarModal();
});

// cuando cambia la categoría del modal -> cambia tamaños
prodCategoria.addEventListener("change", () => {
  setOptions(prodTamano, tamanosPorCategoria(prodCategoria.value));
});

// ====== Render tabla ======
function render(productos) {
  tbody.innerHTML = "";

  if (!productos.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;">No hay productos</td></tr>`;
    return;
  }

  productos.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nombre}</td>
      <td>${p.categoria ?? ""}</td>
      <td>${p.tamano ?? ""}</td>
      <td>${p.color ?? ""}</td>
      <td>${money(p.precio ?? 0)}</td>
      <td>${p.stock ?? 0}</td>
      <td>
        <button class="btn btn-sm btn-light btn-editar" data-id="${p.id}">Editar</button>
        <button class="btn btn-sm btn-danger btn-eliminar" data-id="${p.id}">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ====== Filtros de arriba (se llenan desde BD) ======
async function cargarFiltros() {
  const r = await fetch("/pintupaipa/api/productos_filtros.php");

  if (r.status === 401) {
    redirectLogin();
    return;
  }

  const data = await safeJSON(r);
  if (!data.ok) return;

  function fill(select, arr) {
    const valActual = select.value;
    select.innerHTML = `<option value="">Todos</option>` + (arr || [])
      .map(v => `<option value="${v}">${v}</option>`).join("");

    if ([...select.options].some(o => o.value === valActual)) select.value = valActual;
  }

  fill(selCategoria, data.categorias);
  fill(selTamano, data.tamanos);
  fill(selColor, data.colores);
}

// ====== Cargar listado ======
async function cargar() {
  const params = new URLSearchParams();

  const nombre = inputNombre.value.trim();
  if (nombre) params.set("nombre", nombre);
  if (selCategoria.value) params.set("categoria", selCategoria.value);
  if (selTamano.value) params.set("tamano", selTamano.value);
  if (selColor.value) params.set("color", selColor.value);

  const r = await fetch(`/pintupaipa/api/productos_listar.php?${params.toString()}`);

  if (r.status === 401) {
    redirectLogin();
    return;
  }

  const data = await safeJSON(r);
  if (!r.ok || !data.ok) {
    alert(data.mensaje || `No se pudo cargar inventario (HTTP ${r.status})`);
    return;
  }

  cacheProductos = data.productos || [];
  render(cacheProductos);
  await cargarFiltros();
}

// listeners filtros arriba
btnBuscar.addEventListener("click", cargar);
inputNombre.addEventListener("keydown", (e) => { if (e.key === "Enter") cargar(); });
selCategoria.addEventListener("change", cargar);
selTamano.addEventListener("change", cargar);
selColor.addEventListener("change", cargar);

// ====== Agregar ======
btnAgregar.addEventListener("click", () => abrirModal("crear"));

// ====== Guardar (crear o actualizar) ======
btnGuardar.addEventListener("click", async () => {
  const payload = {
    nombre: prodNombre.value.trim(),
    categoria: prodCategoria.value,
    tamano: prodTamano.value,
    color: prodColor.value,
    precio: Number(prodPrecio.value) || 0,
    stock: Number(prodStock.value) || 0
  };

  const id = Number(prodId.value || 0);
  const url = id
    ? "/pintupaipa/api/productos_actualizar.php"
    : "/pintupaipa/api/productos_crear.php";

  if (id) payload.id = id;

  if (!payload.nombre) {
    alert("El nombre es obligatorio");
    return;
  }

  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await safeJSON(r);

  if (r.status === 401) {
    alert("Sesión vencida. Inicia sesión otra vez.");
    redirectLogin();
    return;
  }

  if (r.status === 403) {
    alert(data.mensaje || "No autorizado (403). Revisa permisos del rol.");
    return;
  }

  if (!r.ok || !data.ok) {
    alert(data.mensaje || `No se pudo guardar (HTTP ${r.status})`);
    return;
  }

  cerrarModal();
  await cargar();
});

// ====== Acciones tabla (editar/eliminar) ======
tbody.addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const id = Number(btn.dataset.id || 0);
  if (!id) return;

  if (btn.classList.contains("btn-editar")) {
    const producto = cacheProductos.find(p => p.id === id);
    abrirModal("editar", producto);
    return;
  }

  if (btn.classList.contains("btn-eliminar")) {
    if (!confirm("¿Eliminar este producto?")) return;

    const r = await fetch("/pintupaipa/api/productos_eliminar.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });

    const data = await safeJSON(r);

    if (r.status === 401) {
      alert("Sesión vencida. Inicia sesión otra vez.");
      redirectLogin();
      return;
    }

    if (r.status === 403) {
      alert(data.mensaje || "No autorizado (403).");
      return;
    }

    if (!r.ok || !data.ok) {
      alert(data.mensaje || `No se pudo eliminar (HTTP ${r.status})`);
      return;
    }

    await cargar();
  }
});

// Inicio
cargar();

