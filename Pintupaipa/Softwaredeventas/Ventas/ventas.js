const selCliente = document.getElementById("cliente_id");
const selProducto = document.getElementById("producto_id");
const inputCantidad = document.getElementById("cantidad");
const btnAgregar = document.getElementById("agregar-producto");
const tbodyCarrito = document.getElementById("lista-productos-venta");
const totalSpan = document.getElementById("total-a-pagar");
const btnConfirmar = document.getElementById("confirmar-venta");
const btnLimpiar = document.getElementById("limpiar");
const infoStock = document.getElementById("info-stock");

// Buscar (inputs + botones)
const inputBuscarCliente = document.getElementById("cliente_buscar");
const inputBuscarProducto = document.getElementById("producto_buscar");
const btnBuscarCliente = document.getElementById("btn-buscar-cliente");
const btnBuscarProducto = document.getElementById("btn-buscar-producto");
const clienteSelTxt = document.getElementById("cliente-seleccionado");
const productoSelTxt = document.getElementById("producto-seleccionado");

// Modal
const modalBuscar = document.getElementById("modal-buscar");
const modalTitulo = document.getElementById("modal-buscar-titulo");
const modalQuery = document.getElementById("modal-query");
const modalLista = document.getElementById("modal-lista");
const btnCerrarBuscar = document.getElementById("btn-cerrar-buscar");
const btnCancelarBuscar = document.getElementById("btn-cancelar-buscar");

let modoBuscar = "cliente"; // "cliente" | "producto"

// Consulta
const desde = document.getElementById("desde");
const hasta = document.getElementById("hasta");
const btnConsultar = document.getElementById("btn-consultar");
const tbodyVentas = document.getElementById("lista-ventas");
const totalPeriodo = document.getElementById("total-periodo");

let clientesCache = [];
let productosCache = [];
let carrito = []; // {producto_id, nombre, tamano, precio, cantidad, stock}

function money(v) {
  return Number(v || 0).toLocaleString("es-CO", { style: "currency", currency: "COP" });
}

/* ===== Modal buscar ===== */
function abrirModalBuscar(modo, queryInicial = "") {
  modoBuscar = modo;
  modalTitulo.textContent = modo === "cliente" ? "Buscar cliente" : "Buscar producto";
  modalBuscar.style.display = "flex";
  modalBuscar.setAttribute("aria-hidden", "false");

  modalQuery.value = queryInicial;
  renderModalLista();
  modalQuery.focus();
}

function cerrarModalBuscar() {
  modalBuscar.style.display = "none";
  modalBuscar.setAttribute("aria-hidden", "true");
}

btnCerrarBuscar.addEventListener("click", cerrarModalBuscar);
btnCancelarBuscar.addEventListener("click", cerrarModalBuscar);
modalBuscar.addEventListener("click", (e) => { if (e.target === modalBuscar) cerrarModalBuscar(); });
modalQuery.addEventListener("input", renderModalLista);

function renderModalLista() {
  const q = modalQuery.value.trim().toLowerCase();
  const base = (modoBuscar === "cliente") ? clientesCache : productosCache;

  const lista = base
    .filter(x => {
      const texto = (modoBuscar === "cliente")
        ? `${x.nombre} ${x.cedula}`
        : `${x.nombre} ${x.tamano || ""} ${x.color || ""}`;
      return texto.toLowerCase().includes(q);
    })
    .slice(0, 60);

  modalLista.innerHTML = "";

  if (!lista.length) {
    modalLista.innerHTML = `<li style="padding:10px;">No hay resultados</li>`;
    return;
  }

  lista.forEach(item => {
    const li = document.createElement("li");
    li.style.padding = "10px";
    li.style.cursor = "pointer";
    li.style.borderBottom = "1px solid rgba(0,0,0,.08)";

    if (modoBuscar === "cliente") {
      li.textContent = `${item.nombre} (${item.cedula})`;
      li.addEventListener("click", () => {
        selCliente.value = item.id;
        clienteSelTxt.textContent = `✅ Cliente: ${item.nombre} (${item.cedula})`;
        cerrarModalBuscar();
      });
    } else {
      const tam = item.tamano ? ` (${item.tamano})` : " (No aplica)";
      const col = item.color ? ` - ${item.color}` : "";
      li.textContent = `${item.nombre}${tam}${col} — ${money(item.precio)} (Stock: ${item.stock})`;
      li.addEventListener("click", () => {
        selProducto.value = item.id;
        productoSelTxt.textContent = `✅ Producto: ${item.nombre}${tam}${col}`;
        infoStock.textContent = `Stock disponible: ${item.stock}`;
        inputCantidad.value = 1;
        cerrarModalBuscar();
      });
    }

    modalLista.appendChild(li);
  });
}

btnBuscarCliente.addEventListener("click", () => abrirModalBuscar("cliente", inputBuscarCliente.value || ""));
btnBuscarProducto.addEventListener("click", () => abrirModalBuscar("producto", inputBuscarProducto.value || ""));

/* ===== Carrito ===== */
function renderCarrito() {
  tbodyCarrito.innerHTML = "";

  if (!carrito.length) {
    tbodyCarrito.innerHTML = `<tr><td colspan="5" style="text-align:center;">No hay productos agregados</td></tr>`;
    totalSpan.textContent = money(0);
    return;
  }

  let total = 0;

  carrito.forEach((it) => {
    const subtotal = it.precio * it.cantidad;
    total += subtotal;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        ${it.nombre}
        <br><small style="opacity:.8;">${it.tamano || "No aplica"}</small>
      </td>
      <td>${money(it.precio)}</td>
      <td>${it.cantidad}</td>
      <td>${money(subtotal)}</td>
      <td>
        <button class="btn btn-light" data-action="menos" data-id="${it.producto_id}">-</button>
        <button class="btn btn-light" data-action="mas" data-id="${it.producto_id}">+</button>
        <button class="btn btn-light" data-action="quitar" data-id="${it.producto_id}">Quitar</button>
      </td>
    `;
    tbodyCarrito.appendChild(tr);
  });

  totalSpan.textContent = money(total);
}

tbodyCarrito.addEventListener("click", (e) => {
  const btn = e.target;
  const action = btn.dataset.action;
  const id = Number(btn.dataset.id || 0);
  if (!action || !id) return;

  const it = carrito.find(x => x.producto_id === id);
  if (!it) return;

  const p = productosCache.find(x => x.id === id);
  const stock = p ? Number(p.stock) : it.stock;

  if (action === "menos") {
    it.cantidad -= 1;
    if (it.cantidad <= 0) carrito = carrito.filter(x => x.producto_id !== id);
  }

  if (action === "mas") {
    if (it.cantidad + 1 > stock) {
      alert(`Stock insuficiente. Disponible: ${stock}`);
      return;
    }
    it.cantidad += 1;
  }

  if (action === "quitar") {
    carrito = carrito.filter(x => x.producto_id !== id);
  }

  renderCarrito();
});

/* ===== Cargar combos (cache) ===== */
async function cargarClientes() {
  const r = await fetch("/pintupaipa/api/clientes_combo.php");
  if (r.status === 401) {
    window.location.href = "/pintupaipa/Softwaredeventas/Inicio/index.html";
    return;
  }
  const data = await r.json().catch(() => ({}));
  if (!data.ok) return;

  clientesCache = data.clientes || [];
  selCliente.innerHTML = `<option value="">Seleccione cliente</option>` +
    clientesCache.map(c => `<option value="${c.id}">${c.nombre} (${c.cedula})</option>`).join("");
}

async function cargarProductos() {
  const r = await fetch("/pintupaipa/api/productos_combo.php");
  if (r.status === 401) {
    window.location.href = "/pintupaipa/Softwaredeventas/Inicio/index.html";
    return;
  }
  const data = await r.json().catch(() => ({}));
  if (!data.ok) return;

  productosCache = data.productos || [];
  selProducto.innerHTML = `<option value="">Seleccione producto</option>` +
    productosCache.map(p => `<option value="${p.id}">${p.nombre}</option>`).join("");
}

/* ===== Agregar producto ===== */
btnAgregar.addEventListener("click", () => {
  const producto_id = Number(selProducto.value || 0);
  const cantidad = Number(inputCantidad.value || 0);

  if (!producto_id) { alert("Primero busca y selecciona un producto"); return; }
  if (cantidad <= 0) { alert("Cantidad inválida"); return; }

  const p = productosCache.find(x => x.id === producto_id);
  if (!p) { alert("Producto no encontrado"); return; }

  const enCarrito = carrito.find(x => x.producto_id === producto_id);
  const cantActual = enCarrito ? enCarrito.cantidad : 0;
  const cantNueva = cantActual + cantidad;

  if (cantNueva > p.stock) {
    alert(`Stock insuficiente. Disponible: ${p.stock}`);
    return;
  }

  if (enCarrito) {
    enCarrito.cantidad = cantNueva;
  } else {
    carrito.push({
      producto_id,
      nombre: p.nombre,
      tamano: p.tamano || "No aplica",
      precio: Number(p.precio),
      cantidad,
      stock: Number(p.stock),
    });
  }

  renderCarrito();
});

/* ===== Limpiar ===== */
btnLimpiar.addEventListener("click", () => {
  carrito = [];
  renderCarrito();
});

/* ===== Confirmar venta ===== */
btnConfirmar.addEventListener("click", async () => {
  const cliente_id = Number(selCliente.value || 0);
  if (!cliente_id) { alert("Primero busca y selecciona un cliente"); return; }
  if (!carrito.length) { alert("Agregue al menos un producto"); return; }

  const payload = {
    cliente_id,
    items: carrito.map(it => ({
      producto_id: it.producto_id,
      cantidad: it.cantidad
    }))
  };

  const r = await fetch("/pintupaipa/api/ventas_crear.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await r.json().catch(() => ({}));
  if (!data.ok) {
    alert(data.mensaje || "No se pudo registrar la venta");
    return;
  }

  alert(`✅ Venta registrada. ID: ${data.venta_id}\nTotal: ${money(data.total)}`);

  carrito = [];
  renderCarrito();
  await cargarProductos();
});

/* ===== Consulta por fechas ===== */
btnConsultar.addEventListener("click", async () => {
  const params = new URLSearchParams();
  if (desde.value) params.set("desde", desde.value);
  if (hasta.value) params.set("hasta", hasta.value);

  const r = await fetch(`/pintupaipa/api/ventas_listar.php?${params.toString()}`);
  if (r.status === 401) {
    window.location.href = "/pintupaipa/Softwaredeventas/Inicio/index.html";
    return;
  }
  const data = await r.json().catch(() => ({}));
  if (!data.ok) { alert("No se pudo consultar"); return; }

  const ventas = data.ventas || [];
  tbodyVentas.innerHTML = "";

  if (!ventas.length) {
    tbodyVentas.innerHTML = `<tr><td colspan="7" style="text-align:center;">No hay ventas en ese periodo</td></tr>`;
    totalPeriodo.textContent = money(0);
    return;
  }

ventas.forEach(v => {
  const tr = document.createElement("tr");

  const estado = (v.estado || "").toUpperCase();
  const esActiva = estado === "ACTIVA";

  tr.innerHTML = `
    <td>${v.id}</td>
    <td>${v.fecha}</td>
    <td>${v.cliente}</td>
    <td>${money(v.total)}</td>

    <td>
      <span class="${esActiva ? "tag-ok" : "tag-bad"}">
        ${estado || "—"}
      </span>
    </td>

    <td>
      <button class="btn btn-light" data-vdet="${v.id}">Ver</button>
      <div id="det-${v.id}" data-cargado="0" style="margin-top:8px;"></div>
    </td>

    <td>
      ${
        esActiva
          ? `<button class="btn btn-light" data-anular="${v.id}">Anular</button>`
          : `<span style="opacity:.6;">—</span>`
      }
    </td>
  `;

  tbodyVentas.appendChild(tr);
});

  totalPeriodo.textContent = money(data.totalGeneral || 0);
});

/* ===== Acciones en consulta: Ver detalle / Anular ===== */
tbodyVentas.addEventListener("click", async (e) => {
  const btn = e.target;
  const idVer = Number(btn.dataset.vdet || 0);
  const idAnular = Number(btn.dataset.anular || 0);

  // ===== ANULAR =====
  if (idAnular) {
    if (!confirm(`¿Seguro que deseas ANULAR la venta #${idAnular}?`)) return;

    const r = await fetch("/pintupaipa/api/ventas_anular.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: idAnular })
    });

    const data = await r.json().catch(() => ({}));
    if (!data.ok) {
      alert(data.mensaje || "No se pudo anular");
      return;
    }

    alert("✅ Venta anulada");
    btnConsultar.click(); // recarga la consulta para ver el estado actualizado
    return;
  }

  // ===== VER DETALLE =====
  if (idVer) {
    const box = document.getElementById(`det-${idVer}`);
    if (!box) return;

    // toggle (si ya está abierto, lo cierra)
    if (box.dataset.cargado === "1") {
      box.innerHTML = "";
      box.dataset.cargado = "0";
      return;
    }

    const r = await fetch(`/pintupaipa/api/ventas_detalle.php?venta_id=${idVer}`);
    const data = await r.json().catch(() => ({}));
    if (!data.ok) {
      alert(data.mensaje || "No se pudo cargar detalle");
      return;
    }

    const items = data.items || [];
    if (!items.length) {
      box.innerHTML = "<i>Sin productos</i>";
    } else {
      box.innerHTML = `
        <ul style="margin:0; padding-left:18px;">
          ${items.map(it =>
            `<li>${it.nombre} (${it.tamano || "No aplica"}) x${it.cantidad} — ${money(it.subtotal)}</li>`
          ).join("")}
        </ul>
      `;
    }

    box.dataset.cargado = "1";
    return;
  }
});

/* ===== Init ===== */
renderCarrito();
cargarClientes();
cargarProductos();
