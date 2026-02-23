<?php
require __DIR__ . "/config.php";

$body = leerJSON();

$cedula = trim((string)($body["cedula"] ?? $body["usuario"] ?? ""));
$password = (string)($body["password"] ?? $body["contrasena"] ?? "");

if ($cedula === "" || $password === "") {
    http_response_code(400);
    echo json_encode(["ok"=>false, "mensaje"=>"Faltan datos"]);
    exit;
}

$stmt = $conn->prepare("SELECT id, nombre, cedula, password_hash, rol, activo FROM usuarios WHERE cedula=? LIMIT 1");
$stmt->bind_param("s", $cedula);
$stmt->execute();
$res = $stmt->get_result();
$user = $res->fetch_assoc();

if (!$user || (int)$user["activo"] !== 1 || !password_verify($password, $user["password_hash"])) {
    http_response_code(401);
    echo json_encode(["ok"=>false, "mensaje"=>"Cédula o contraseña incorrecta"]);
    exit;
}

$_SESSION["usuario"] = [
    "id" => (int)$user["id"],
    "nombre" => $user["nombre"],
    "cedula" => $user["cedula"],
    "rol" => $user["rol"]
];

echo json_encode(["ok"=>true, "usuario"=>$_SESSION["usuario"]]);
