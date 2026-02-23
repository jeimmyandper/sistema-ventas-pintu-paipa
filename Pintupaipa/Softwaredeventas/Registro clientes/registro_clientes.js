// ===== Elementos =====
const tbody = document.getElementById("lista-clientes");
const inputQ = document.getElementById("q");
const btnBuscar = document.getElementById("buscar");
const btnAgregar = document.getElementById("agregar-cliente");

// Modal
const modal = document.getElementById("modal-cliente");
const modalTitulo = document.getElementById("modal-titulo");
const cliId = document.getElementById("cli-id");
const cliNombre = document.getElementById("cli-nombre");
const cliCedula = document.getElementById("cli-cedula");
const cliTelefono = document.getElementById("cli-telefono");
const cliCorreo = document.getElementById("cli-correo");
const cliDireccion = document.getElementById("cli-direccion");

const btnCancelar = document.getElementById("btn-cancelar");
const btnGuardar = document.getElementById("btn-guardar");
const btnCerrarModal = document.getElementById("btn-cerrar-modal");

let cacheClientes = [];

// ===== Modal =====
function abrirModal(modo, cliente = null) {
  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");
  modalTitulo.textContent = modo === "crear" ? "Agregar cliente" : "Editar cliente";

  cliId.value = cliente?.id ?? "";
  cliNombre.value = cliente?.nombre ?? "";
  cliCedula.value = cliente?.cedula ?? "";
  cliTelefono.value = cliente?.telefono ?? "";
  cliCorreo.value = cliente?.correo ?? "";
  cliDireccion.value = cliente?.direccion ?? "";
}

function cerrarModal() {
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
}

btnCancelar.addEventListener("click", cerrarModal);
btnCerrarModal.addEventListener("click", cerrarModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) cerrarModal();
});

// ===== Render =====
function render(clientes) {
  tbody.innerHTML = "";

  if (!clientes.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;">No hay clientes</td>
      </tr>
    `;
    return;
  }

  clientes.forEach(c => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${c.id}</td>
      <td>${c.nombre}</td>
      <td>${c.cedula}</td>
      <td>${c.direccion ?? ""}</td>
      <td>${c.correo ?? ""}</td>
      <td>${c.telefono ?? ""}</td>
      <td>
        <button class="btn btn-sm btn-light btn-editar" data-id="${c.id}">Editar</button>
        <button class="btn btn-sm btn-danger btn-eliminar" data-id="${c.id}">Eliminar</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// ===== Cargar clientes =====
async function cargar() {
  const q = inputQ.value.trim();
  const params = new URLSearchParams();
  if (q) params.set("q", q);

  const r = await fetch(`/pintupaipa/api/clientes_listar.php?${params.toString()}`);

  if (r.status === 401) {
    window.location.href = "/pintupaipa/Softwaredeventas/Inicio/index.html";
    return;
  }

  const data = await r.json().catch(() => ({}));

  if (!data.ok) {
    alert("No se pudieron cargar clientes");
    return;
  }

  cacheClientes = data.clientes || [];
  render(cacheClientes);
}

// ===== Buscar =====
btnBuscar.addEventListener("click", cargar);
inputQ.addEventListener("keydown", (e) => {
  if (e.key === "Enter") cargar();
});

// ===== Agregar =====
btnAgregar.addEventListener("click", () => abrirModal("crear"));

// ===== Guardar =====
btnGuardar.addEventListener("click", async () => {
  const payload = {
    nombre: cliNombre.value.trim(),
    cedula: cliCedula.value.trim(),
    telefono: cliTelefono.value.trim(),
    correo: cliCorreo.value.trim(),
    direccion: cliDireccion.value.trim()
  };

  if (!payload.nombre || !payload.cedula) {
    alert("Nombre y cédula son obligatorios");
    return;
  }

  const id = Number(cliId.value || 0);
  const url = id
    ? "/pintupaipa/api/clientes_actualizar.php"
    : "/pintupaipa/api/clientes_crear.php";

  if (id) payload.id = id;

  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await r.json().catch(() => ({}));

  if (!data.ok) {
    alert(data.mensaje || "No se pudo guardar");
    return;
  }

  cerrarModal();
  await cargar();
});

// ===== Editar / Eliminar =====
tbody.addEventListener("click", async (e) => {
  const btn = e.target;
  const id = Number(btn.dataset.id || 0);
  if (!id) return;

  if (btn.classList.contains("btn-editar")) {
    const cliente = cacheClientes.find(c => c.id === id);
    abrirModal("editar", cliente);
  }

  if (btn.classList.contains("btn-eliminar")) {
    if (!confirm("¿Eliminar este cliente?")) return;

    const r = await fetch("/pintupaipa/api/clientes_eliminar.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });

    const data = await r.json().catch(() => ({}));

    if (!data.ok) {
      alert("No se pudo eliminar");
      return;
    }

    await cargar();
  }
});

// Inicio
cargar();
