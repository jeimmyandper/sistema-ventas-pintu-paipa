<?php
require __DIR__ . "/config.php";
exigirLogin();

$body = leerJSON();

$cliente_id = (int)($body["cliente_id"] ?? 0);
$items = $body["items"] ?? [];

// usuario logueado (ajústalo si en tu config.php lo guardas con otro nombre)
$usuario_id = (int)($_SESSION["usuario"]["id"] ?? 0);

if ($cliente_id <= 0 || $usuario_id <= 0 || !is_array($items) || count($items) === 0) {
  http_response_code(400);
  echo json_encode(["ok"=>false, "mensaje"=>"Seleccione cliente y agregue productos"]);
  exit;
}

$conn->begin_transaction();

try {
  // 1) Crear venta con total 0 (luego actualizamos)
  $stmt = $conn->prepare("INSERT INTO ventas (cliente_id, usuario_id, total) VALUES (?,?,0)");
  $stmt->bind_param("ii", $cliente_id, $usuario_id);
  $stmt->execute();
  $venta_id = $conn->insert_id;

  $total = 0;

  // 2) Preparar queries
  $stmtProd = $conn->prepare("SELECT precio, stock FROM productos WHERE id=? FOR UPDATE");
  $stmtDet  = $conn->prepare("INSERT INTO venta_detalle (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?,?,?,?,?)");
  $stmtUpd  = $conn->prepare("UPDATE productos SET stock = stock - ? WHERE id=?");

  foreach ($items as $it) {
    $producto_id = (int)($it["producto_id"] ?? 0);
    $cantidad = (int)($it["cantidad"] ?? 0);

    if ($producto_id <= 0 || $cantidad <= 0) {
      throw new Exception("Item inválido");
    }

    // traer precio/stock
    $stmtProd->bind_param("i", $producto_id);
    $stmtProd->execute();
    $res = $stmtProd->get_result();
    $p = $res->fetch_assoc();

    if (!$p) throw new Exception("Producto no existe");
    $precio = (float)$p["precio"];
    $stock = (int)$p["stock"];

    if ($cantidad > $stock) {
      throw new Exception("Stock insuficiente para el producto (ID $producto_id)");
    }

    $subtotal = $precio * $cantidad;
    $total += $subtotal;

    // detalle
    $stmtDet->bind_param("iiidd", $venta_id, $producto_id, $cantidad, $precio, $subtotal);
    $stmtDet->execute();

    // descontar stock
    $stmtUpd->bind_param("ii", $cantidad, $producto_id);
    $stmtUpd->execute();
  }

  // 3) actualizar total
  $stmt = $conn->prepare("UPDATE ventas SET total=? WHERE id=?");
  $stmt->bind_param("di", $total, $venta_id);
  $stmt->execute();

  $conn->commit();
  echo json_encode(["ok"=>true, "mensaje"=>"Venta registrada", "venta_id"=>$venta_id, "total"=>$total]);

} catch (Exception $e) {
  $conn->rollback();
  http_response_code(400);
  echo json_encode(["ok"=>false, "mensaje"=>$e->getMessage()]);
}
