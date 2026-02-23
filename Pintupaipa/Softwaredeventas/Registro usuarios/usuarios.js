const inputNombre = document.getElementById("nombre");
const inputCedula = document.getElementById("cedula");
const inputRol = document.getElementById("rol");
const inputPassword = document.getElementById("password");
const btnGuardar = document.getElementById("btn-guardar");
const btnLimpiar = document.getElementById("btn-limpiar");
const tbody = document.getElementById("lista-usuarios");

function limpiar() {
  inputNombre.value = "";
  inputCedula.value = "";
  inputRol.value = "EMPLEADO";
  inputPassword.value = "";
  inputNombre.focus();
}

function rowUsuario(u) {
  const activo = Number(u.activo) === 1;
  const estadoHtml = activo
    ? `<span class="tag tag-ok">ACTIVO</span>`
    : `<span class="tag tag-bad">INACTIVO</span>`;

  const accionHtml = activo
    ? `<button class="btn btn-light" data-toggle="${u.id}" data-next="0">Desactivar</button>`
    : `<button class="btn btn-light" data-toggle="${u.id}" data-next="1">Activar</button>`;

  return `
    <tr>
      <td>${u.id}</td>
      <td>${u.nombre}</td>
      <td>${u.cedula}</td>
      <td>${u.rol}</td>
      <td>${estadoHtml}</td>
      <td>${accionHtml}</td>
    </tr>
  `;
}

async function cargarUsuarios() {
  const r = await fetch("/pintupaipa/api/usuarios_listar.php");
  if (r.status === 401) {
    window.location.href = "/pintupaipa/Softwaredeventas/Inicio/index.html";
    return;
  }
  const data = await r.json().catch(() => ({}));
  if (!data.ok) {
    alert(data.mensaje || "No se pudo cargar usuarios");
    return;
  }

  const lista = data.usuarios || [];
  if (!lista.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No hay usuarios</td></tr>`;
    return;
  }

  tbody.innerHTML = lista.map(rowUsuario).join("");
}

btnLimpiar.addEventListener("click", limpiar);

btnGuardar.addEventListener("click", async () => {
  const nombre = inputNombre.value.trim();
  const cedula = inputCedula.value.trim();
  const rol = inputRol.value;
  const password = inputPassword.value;

  if (!nombre || !cedula || !password) {
    alert("Completa nombre, cédula y contraseña");
    return;
  }
  if (password.length < 6) {
    alert("La contraseña debe tener mínimo 6 caracteres");
    return;
  }

  const r = await fetch("/pintupaipa/api/usuarios_crear.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, cedula, rol, password })
  });

  const data = await r.json().catch(() => ({}));
  if (!data.ok) {
    alert(data.mensaje || "No se pudo crear el usuario");
    return;
  }

  alert("✅ Usuario creado");
  limpiar();
  cargarUsuarios();
});

tbody.addEventListener("click", async (e) => {
  const btn = e.target;
  const id = Number(btn.dataset.toggle || 0);
  const next = btn.dataset.next;

  if (!id || (next !== "0" && next !== "1")) return;

  const r = await fetch("/pintupaipa/api/usuarios_toggle_activo.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, activo: Number(next) })
  });

  const data = await r.json().catch(() => ({}));
  if (!data.ok) {
    alert(data.mensaje || "No se pudo cambiar estado");
    return;
  }

  cargarUsuarios();
});

cargarUsuarios();
