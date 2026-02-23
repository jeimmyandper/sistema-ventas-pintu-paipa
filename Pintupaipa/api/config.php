<?php
session_start();

header("Content-Type: application/json; charset=UTF-8");

$host = "localhost";
$user = "root";
$pass = "";   
$db   = "pintupaipa";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["ok"=>false,"error"=>"Error de conexión"]);
    exit;
}

$conn->set_charset("utf8mb4");

function leerJSON() {
    $data = json_decode(file_get_contents("php://input"), true);
    return $data ? $data : [];
}

function exigirLogin() {
    if(!isset($_SESSION["usuario"])) {
        http_response_code(401);
        echo json_encode(["ok"=>false,"mensaje"=>"No autenticado"]);
        exit;
    }
    return $_SESSION["usuario"];
}

function exigirAdmin() {
    $u = exigirLogin();

    $rol = strtoupper(trim((string)($u["rol"] ?? "")));

    if ($rol !== "ADMIN") {
        http_response_code(403);
        echo json_encode(["ok"=>false,"mensaje"=>"Solo administrador"]);
        exit;
    }

    return $u;
}

function exigirRol(string $rol) {
    $u = exigirLogin();

    $rolUser = strtoupper(trim((string)($u["rol"] ?? "")));
    $rolNeed = strtoupper(trim($rol));

    if ($rolUser !== $rolNeed) {
        http_response_code(403);
        echo json_encode(["ok"=>false, "mensaje"=>"No autorizado"]);
        exit;
    }

    return $u;
}

function exigirRoles(array $roles) {
  $u = exigirLogin();
  $rolUser = strtoupper((string)$u["rol"]);
  $roles = array_map(fn($r) => strtoupper((string)$r), $roles);

  if (!in_array($rolUser, $roles, true)) {
    http_response_code(403);
    echo json_encode(["ok"=>false, "mensaje"=>"No autorizado"]);
    exit;
  }
  return $u;
}

?>