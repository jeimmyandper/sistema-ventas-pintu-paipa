console.log("✅ login.js cargado");

const form = document.getElementById("form-login");
const inputCedula = document.getElementById("usuario");      
const inputPass = document.getElementById("contrasena");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("✅ submit capturado");

  const cedula = inputCedula.value.trim();
  const password = inputPass.value;

  const r = await fetch("/pintupaipa/api/auth_login.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cedula, password })
  });

  const data = await r.json().catch(() => ({}));
  console.log("✅ respuesta login", data);

  if (!data.ok) {
    alert(data.mensaje || "No se pudo iniciar sesión");
    return;
  }
  window.location.href = "/pintupaipa/Softwaredeventas/Inventario/inventario.html";
});

