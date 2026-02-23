<?php
require __DIR__ . "/config.php";
exigirRol("ADMIN"); // ✅ SOLO ADMIN puede anular

$body = leerJSON();
$id = (int)($body["id"] ?? 0);

if ($id <= 0) {
  http_response_code(400);
  echo json_encode(["ok"=>false, "mensaje"=>"ID requerido"]);
  exit;
}

$conn->begin_transaction();

try {
  // 0) Verificar que exista y que no esté anulada
  $chk = $conn->prepare("SELECT estado FROM ventas WHERE id=? LIMIT 1");
  $chk->bind_param("i", $id);
  $chk->execute();
  $venta = $chk->get_result()->fetch_assoc();

  if (!$venta) {
    $conn->rollback();
    http_response_code(404);
    echo json_encode(["ok"=>false, "mensaje"=>"Venta no existe"]);
    exit;
  }

  if (strtoupper((string)($venta["estado"] ?? "")) === "ANULADA") {
    $conn->commit(); // ✅ no cambia nada, pero cerramos bien
    echo json_encode(["ok"=>true, "mensaje"=>"Ya estaba anulada"]);
    exit;
  }

  // 1) Devolver stock (tu tabla es venta_detalle ✅)
  $q = $conn->prepare("SELECT producto_id, cantidad FROM venta_detalle WHERE venta_id=?");
  $q->bind_param("i", $id);
  $q->execute();
  $res = $q->get_result();

  while ($row = $res->fetch_assoc()) {
    $pid  = (int)$row["producto_id"];
    $cant = (int)$row["cantidad"];

    $up = $conn->prepare("UPDATE productos SET stock = stock + ? WHERE id=?");
    $up->bind_param("ii", $cant, $pid);
    $up->execute();
  }

  // 2) Marcar venta como ANULADA
  $stmt = $conn->prepare("UPDATE ventas SET estado='ANULADA' WHERE id=?");
  $stmt->bind_param("i", $id);
  $stmt->execute();

  $conn->commit();
  echo json_encode(["ok"=>true, "mensaje"=>"Venta anulada"]);

} catch (Throwable $e) {
  $conn->rollback();
  http_response_code(500);
  echo json_encode(["ok"=>false, "mensaje"=>"Error anulando venta"]);
}
