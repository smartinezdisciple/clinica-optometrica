-- =============================================================================
-- BASE DE DATOS: SISTEMA WEB PARA CLÍNICA OPTOMÉTRICA
-- Versión: 2.0 (Corregida y mejorada)
-- Motor: PostgreSQL
-- =============================================================================
-- CONVENCIÓN (Sección 14 de requisitos):
--   Tablas   → snake_case, PLURAL
--   Columnas → snake_case
-- =============================================================================
-- RESUMEN DE CAMBIOS RESPECTO A LA VERSIÓN ORIGINAL:
--
-- ERRORES CRÍTICOS CORREGIDOS:
--  [1]  Sintaxis incorrecta en CHECK con IN: CHECK(col IN 'a','b') →
--         corregido a CHECK(col IN ('a','b'))
--  [2]  DEFAULT sin comillas: DEFAULT Chequeo → DEFAULT 'Chequeo general'
--  [3]  Paréntesis de cierre sobrantes en columnas INTEGER: "od_altura INTEGER)"
--  [4]  CHECK en columnas NUMERIC comparando con '': CHECK(od_esf <> '')
--         NUMERIC no puede compararse con texto vacío; eliminado.
--  [5]  CHECK referenciando columnas con alias incorrectos (od_esf vs od_esfera)
--  [6]  paciente y empresa sin PRIMARY KEY → corregido con id_cliente como PK
--  [7]  historia_visual referenciaba id_consulta (referencia circular) → eliminado
--  [8]  lensometria_clinica → debía referenciar consultas, no historia_visual
--  [9]  lente_clinico referenciaba material(id_material) → tabla correcta:
--         materiales_lente
--  [10] lente_clinico referenciaba filtro_lente(id_filtro_lente_clinico) →
--         tabla/columna incorrecta; rediseñado con tabla N:M
--  [11] orden_laboratorio: id_lente_clinico REFERENCES receta(lente_clinico) →
--         corregido a lentes_clinicos(id_lente_clinico)
--  [12] compra: CHECK(estado_venta IN ...) → columna incorrecta, corregido a
--         estado_compra
--  [13] compra: id_proveedor REFERENCES cliente(id_proveedor) → corregido a
--         proveedores(id_proveedor)
--  [14] promocion_descuento: id_descuento REFERENCES promocion(id_descuento)
--         → corregido a descuentos(id_descuento)
--  [15] evaluacion_precision: columna id_lensometria declarada dos veces
--  [16] valor_descuento VARCHAR(5) → corregido a NUMERIC(10,2)
--  [17] monto/total_venta/total_compra REAL → corregido a NUMERIC(10,2)
--  [18] Tabla filtro_lente_clinico con coma sobrante al final
--  [19] Muchas tablas completamente vacías (solo PK): caja, perdida,
--         movimiento_financiero, apertura_caja, cierre_caja, detalle_compra,
--         producto_sucursal, sucursal → completadas
--
-- TABLAS NUEVAS (requeridas por los requisitos):
--  [+]  sucursales           → antes existía vacía
--  [+]  roles                → Módulo 2.8 Gestión de Usuarios
--  [+]  permisos             → Módulo 2.8
--  [+]  roles_permisos       → Relación N:M roles-permisos
--  [+]  usuarios             → CRÍTICO: sin esto no hay autenticación
--  [+]  intentos_login       → Seguridad: máx 3 intentos (Sección 4)
--  [+]  tokens_recuperacion  → Recuperación por correo, expira en 5 min
--  [+]  sesiones             → Control de sesiones activas
--  [+]  logs_sistema         → Registro de eventos (Sección 15)
--  [+]  horarios_disponibles → Módulo 2.3: consulta de horarios disponibles
--  [+]  inventario_sucursal  → antes: producto_sucursal, vacía
--  [+]  movimientos_inventario → Trazabilidad de stock
--  [+]  configuraciones_respaldo → Módulo copias de seguridad (Sección 6)
--  [+]  lentes_clinicos_filtros → Relación N:M lentes-filtros (antes era una
--                                  sola tabla intermedia mal diseñada)
--
-- CAMPOS NUEVOS RELEVANTES:
--  [+]  clientes.correo, clientes.fecha_registro
--  [+]  pacientes.genero (PRIMARY KEY corregido)
--  [+]  empleados.id_sucursal, empleados.activo
--  [+]  tipos_lente.precio_base
--  [+]  materiales_lente.precio_adicional
--  [+]  filtros_lente.precio_adicional
--  [+]  lentes_clinicos.precio_base, precio_total (calculado por trigger)
--  [+]  productos.codigo_producto, precio_venta, precio_compra, activo
--  [+]  marcos_oftalmologicos.modelo, color (requeridos en Sección 2.5)
--  [+]  ventas.subtotal, descuento_aplicado, id_pedido
--  [+]  pedidos.fecha_entrega_estimada, fecha_entrega_real, observaciones
--  [+]  compras.observaciones, estado correcto
--  [+]  proveedores.nombre_empresa, correo, direccion, ruc
--  [+]  promociones.nombre_promocion, descripcion, activa
-- =============================================================================


-- =============================================================================
-- MÓDULO 1: SUCURSALES
-- =============================================================================

CREATE TABLE sucursales (
    id_sucursal   SERIAL       PRIMARY KEY,
    nombre        VARCHAR(50)  NOT NULL CHECK(nombre <> ''),
    direccion     VARCHAR(150),
    telefono      VARCHAR(15),
    correo        VARCHAR(100) CHECK(correo LIKE '%@%'),
    activa        BOOLEAN      NOT NULL DEFAULT TRUE
);


-- =============================================================================
-- MÓDULO 2: USUARIOS, ROLES Y SEGURIDAD
-- =============================================================================

CREATE TABLE roles (
    id_rol       SERIAL      PRIMARY KEY,
    nombre_rol   VARCHAR(30) NOT NULL UNIQUE CHECK(nombre_rol <> ''),
    -- Valores esperados: 'Administrador','Recepcionista','Optometrista','Cajero','Vendedor'
    descripcion  TEXT
);

CREATE TABLE permisos (
    id_permiso     SERIAL      PRIMARY KEY,
    nombre_permiso VARCHAR(80) NOT NULL UNIQUE CHECK(nombre_permiso <> ''),
    modulo         VARCHAR(40) NOT NULL CHECK(modulo <> ''),
    descripcion    TEXT
);

-- Relación N:M entre roles y permisos
CREATE TABLE roles_permisos (
    id_rol     INTEGER NOT NULL REFERENCES roles(id_rol)    ON DELETE CASCADE,
    id_permiso INTEGER NOT NULL REFERENCES permisos(id_permiso) ON DELETE CASCADE,
    PRIMARY KEY (id_rol, id_permiso)
);

CREATE TABLE empleados (
    id_empleado      SERIAL       PRIMARY KEY,
    primer_nombre    VARCHAR(15)  NOT NULL CHECK(primer_nombre <> ''),
    segundo_nombre   VARCHAR(15),
    primer_apellido  VARCHAR(15)  NOT NULL CHECK(primer_apellido <> ''),
    segundo_apellido VARCHAR(15),
    numero_telefono  VARCHAR(15),
    correo           VARCHAR(100) CHECK(correo LIKE '%@%'),
    id_sucursal      INTEGER      REFERENCES sucursales(id_sucursal),
    activo           BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE usuarios (
    id_usuario       SERIAL       PRIMARY KEY,
    nombre_usuario   VARCHAR(50)  NOT NULL UNIQUE CHECK(nombre_usuario <> ''),
    -- Almacenado como hash (bcrypt o argon2); NUNCA en texto plano
    contrasena_hash  VARCHAR(255) NOT NULL CHECK(contrasena_hash <> ''),
    id_empleado      INTEGER      NOT NULL UNIQUE REFERENCES empleados(id_empleado),
    id_rol           INTEGER      NOT NULL REFERENCES roles(id_rol),
    activo           BOOLEAN      NOT NULL DEFAULT TRUE,
    bloqueado        BOOLEAN      NOT NULL DEFAULT FALSE,
    fecha_bloqueo    TIMESTAMP,
    fecha_creacion   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso    TIMESTAMP
);

-- Auditoría de intentos de inicio de sesión (trigger bloquea tras 3 fallidos)
CREATE TABLE intentos_login (
    id_intento             SERIAL      PRIMARY KEY,
    id_usuario             INTEGER     REFERENCES usuarios(id_usuario),
    -- Para registrar intentos con nombre de usuario inexistente
    nombre_usuario_intento VARCHAR(50),
    -- Soporta IPv4 e IPv6
    ip_origen              VARCHAR(45),
    exitoso                BOOLEAN     NOT NULL,
    fecha_intento          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tokens para recuperación de contraseña (expiración de 5 min asignada por trigger)
CREATE TABLE tokens_recuperacion (
    id_token         SERIAL       PRIMARY KEY,
    id_usuario       INTEGER      NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    token            VARCHAR(255) NOT NULL UNIQUE,
    fecha_expiracion TIMESTAMP    NOT NULL,
    utilizado        BOOLEAN      NOT NULL DEFAULT FALSE,
    fecha_creacion   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Sesiones activas de usuarios
CREATE TABLE sesiones (
    id_sesion        SERIAL       PRIMARY KEY,
    id_usuario       INTEGER      NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    token_sesion     VARCHAR(255) NOT NULL UNIQUE,
    ip_origen        VARCHAR(45),
    fecha_inicio     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP    NOT NULL,
    activa           BOOLEAN      NOT NULL DEFAULT TRUE
);

-- Registro de auditoría y eventos del sistema (Sección 15: Registro de logs)
CREATE TABLE logs_sistema (
    id_log       SERIAL       PRIMARY KEY,
    id_usuario   INTEGER      REFERENCES usuarios(id_usuario),
    accion       VARCHAR(100) NOT NULL CHECK(accion <> ''),
    modulo       VARCHAR(50),
    descripcion  TEXT,
    ip_origen    VARCHAR(45),
    fecha_evento TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =============================================================================
-- MÓDULO 3: CLIENTES, PACIENTES Y EMPRESAS
-- =============================================================================

CREATE TABLE clientes (
    id_cliente       SERIAL       PRIMARY KEY,
    cedula           VARCHAR(16)  UNIQUE,
    primer_nombre    VARCHAR(15)  NOT NULL CHECK(primer_nombre <> ''),
    segundo_nombre   VARCHAR(15),
    primer_apellido  VARCHAR(15)  NOT NULL CHECK(primer_apellido <> ''),
    segundo_apellido VARCHAR(15),
    tipo_cliente     VARCHAR(10)  NOT NULL CHECK(tipo_cliente IN ('Persona', 'Empresa')),
    numero_telefono  VARCHAR(15)  NOT NULL CHECK(numero_telefono <> ''),
    correo           VARCHAR(100) CHECK(correo LIKE '%@%'),
    fecha_registro   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Extensión de cliente para personas naturales (herencia por tabla)
CREATE TABLE pacientes (
    id_cliente       INTEGER     PRIMARY KEY REFERENCES clientes(id_cliente) ON DELETE CASCADE,
    ocupacion        VARCHAR(30),
    fecha_nacimiento DATE        NOT NULL CHECK(fecha_nacimiento <= CURRENT_DATE),
    genero           VARCHAR(10) CHECK(genero IN ('Masculino', 'Femenino', 'Otro'))
);

-- Extensión de cliente para personas jurídicas
CREATE TABLE empresas (
    id_cliente   INTEGER      PRIMARY KEY REFERENCES clientes(id_cliente) ON DELETE CASCADE,
    razon_social VARCHAR(100) NOT NULL CHECK(razon_social <> ''),
    ruc          VARCHAR(30)  NOT NULL UNIQUE CHECK(ruc <> '')
);


-- =============================================================================
-- MÓDULO 4: CITAS
-- =============================================================================

-- Horarios disponibles por optometrista (para consulta de disponibilidad)
CREATE TABLE horarios_disponibles (
    id_horario  SERIAL  PRIMARY KEY,
    id_empleado INTEGER NOT NULL REFERENCES empleados(id_empleado),
    -- 1=Lunes, 2=Martes ... 7=Domingo
    dia_semana  INTEGER NOT NULL CHECK(dia_semana BETWEEN 1 AND 7),
    hora_inicio TIME    NOT NULL,
    hora_fin    TIME    NOT NULL,
    activo      BOOLEAN NOT NULL DEFAULT TRUE,
    CHECK(hora_fin > hora_inicio)
);

CREATE TABLE citas (
    id_cita                SERIAL      PRIMARY KEY,
    motivo_cita            VARCHAR(50) NOT NULL CHECK(motivo_cita <> '') DEFAULT 'Chequeo general',
    fecha_hora_cita        TIMESTAMP   NOT NULL,
    estado_cita            VARCHAR(30) NOT NULL CHECK(estado_cita IN (
                               'confirmada', 'cancelada', 'reprogramada',
                               'en_espera_confirmacion', 'completada'
                           )),
    observaciones          TEXT,
    -- Calculada automáticamente por trigger al completar la cita
    fecha_proxima_revision DATE,
    id_cliente             INTEGER     NOT NULL REFERENCES pacientes(id_cliente),
    -- Optometrista asignado
    id_empleado            INTEGER     REFERENCES empleados(id_empleado)
);


-- =============================================================================
-- MÓDULO 5: EXPEDIENTES CLÍNICOS
-- =============================================================================

-- Una historia visual por paciente (expediente maestro permanente)
CREATE TABLE historias_visuales (
    id_historia_visual SERIAL  PRIMARY KEY,
    antecedentes       TEXT,
    fecha_apertura     DATE    NOT NULL DEFAULT CURRENT_DATE
                               CHECK(fecha_apertura <= CURRENT_DATE),
    id_cliente         INTEGER NOT NULL UNIQUE REFERENCES pacientes(id_cliente)
);

-- Cada consulta está vinculada a una cita y a la historia visual del paciente
CREATE TABLE consultas (
    id_consulta         SERIAL    PRIMARY KEY,
    observaciones       TEXT,
    fecha_hora_consulta TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                                  CHECK(fecha_hora_consulta <= CURRENT_TIMESTAMP),
    id_cita             INTEGER   NOT NULL UNIQUE REFERENCES citas(id_cita),
    id_empleado         INTEGER   NOT NULL REFERENCES empleados(id_empleado),
    id_historia_visual  INTEGER   NOT NULL REFERENCES historias_visuales(id_historia_visual)
);

-- Medición de los lentes actuales que porta el paciente al llegar
CREATE TABLE lensometrias_clinicas (
    id_lensometria_clinica SERIAL       PRIMARY KEY,
    od_esfera              NUMERIC(5,2) NOT NULL,
    od_cilindro            NUMERIC(5,2) NOT NULL,
    od_eje                 NUMERIC(5,2) NOT NULL CHECK(od_eje BETWEEN 0 AND 180),
    od_dip                 NUMERIC(5,2),
    od_altura              INTEGER,
    oi_esfera              NUMERIC(5,2) NOT NULL,
    oi_cilindro            NUMERIC(5,2) NOT NULL,
    oi_eje                 NUMERIC(5,2) NOT NULL CHECK(oi_eje BETWEEN 0 AND 180),
    oi_dip                 NUMERIC(5,2),
    oi_altura              INTEGER,
    adicion                NUMERIC(3,2) CHECK(adicion BETWEEN 0.50 AND 4.00),
    id_consulta            INTEGER      NOT NULL REFERENCES consultas(id_consulta)
);

-- Receta emitida por el optometrista al finalizar la consulta
CREATE TABLE recetas (
    id_receta    SERIAL       PRIMARY KEY,
    -- Ojo derecho (OD)
    od_esfera    NUMERIC(5,2) NOT NULL,
    od_cilindro  NUMERIC(5,2) NOT NULL,
    od_eje       NUMERIC(5,2) NOT NULL CHECK(od_eje BETWEEN 0 AND 180),
    -- Agudeza visual: puede ser fracción (20/20) o decimal (1.0)
    od_av        VARCHAR(10),
    -- Distancia interpupilar en mm
    od_dip       NUMERIC(5,2),
    -- Altura del centro óptico en mm
    od_altura    INTEGER,
    -- Ojo izquierdo (OI)
    oi_esfera    NUMERIC(5,2) NOT NULL,
    oi_cilindro  NUMERIC(5,2) NOT NULL,
    oi_eje       NUMERIC(5,2) NOT NULL CHECK(oi_eje BETWEEN 0 AND 180),
    oi_av        VARCHAR(10),
    oi_dip       NUMERIC(5,2),
    oi_altura    INTEGER,
    -- Adición para lentes bifocales y progresivos
    adicion      NUMERIC(3,2) CHECK(adicion BETWEEN 0.50 AND 4.00),
    observaciones TEXT,
    id_consulta  INTEGER      NOT NULL UNIQUE REFERENCES consultas(id_consulta)
);


-- =============================================================================
-- MÓDULO 6: PRODUCTOS COMERCIALES
-- =============================================================================

CREATE TABLE productos (
    id_producto          SERIAL        PRIMARY KEY,
    nombre_producto      VARCHAR(50)   NOT NULL CHECK(nombre_producto <> ''),
    -- SKU o código de barras
    codigo_producto      VARCHAR(30)   UNIQUE,
    descripcion_producto TEXT,
    tipo_producto        VARCHAR(25)   NOT NULL CHECK(tipo_producto IN (
                             'accesorio', 'gafas_sol',
                             'marco_oftalmologico', 'lente_comercial'
                         )),
    precio_venta         NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK(precio_venta >= 0),
    precio_compra        NUMERIC(10,2)           CHECK(precio_compra >= 0),
    activo               BOOLEAN       NOT NULL DEFAULT TRUE
);

-- Monturas oftalmológicas (extiende productos)
CREATE TABLE marcos_oftalmologicos (
    id_marco    SERIAL      PRIMARY KEY,
    marca       VARCHAR(30),
    modelo      VARCHAR(30),
    color       VARCHAR(20),
    material    VARCHAR(30),
    -- Forma eliminada del original ya que no estaba en los requisitos funcionales;
    -- puede reintegrarse como campo adicional si el negocio lo requiere
    id_producto INTEGER     NOT NULL UNIQUE REFERENCES productos(id_producto) ON DELETE CASCADE
);

-- Gafas de sol (extiende productos)
CREATE TABLE gafas_sol (
    id_gafas_sol  SERIAL  PRIMARY KEY,
    polarizado    BOOLEAN NOT NULL DEFAULT FALSE,
    -- Nivel de protección UV: 100, 380 o 400 nm
    proteccion_uv INTEGER CHECK(proteccion_uv IN (100, 380, 400)),
    id_producto   INTEGER NOT NULL UNIQUE REFERENCES productos(id_producto) ON DELETE CASCADE
);

-- Accesorios (estuches, paños, cordones, líquidos, repuestos, etc.)
CREATE TABLE accesorios (
    id_accesorio   SERIAL      PRIMARY KEY,
    compatibilidad VARCHAR(50),
    id_producto    INTEGER     NOT NULL UNIQUE REFERENCES productos(id_producto) ON DELETE CASCADE
);


-- =============================================================================
-- MÓDULO 7: LENTES CLÍNICOS (CONFIGURACIÓN PERSONALIZADA)
-- =============================================================================

-- Tipos de lente: monofocal, bifocal, progresivo, ocupacional
CREATE TABLE tipos_lente (
    id_tipo_lente     SERIAL        PRIMARY KEY,
    nombre_tipo_lente VARCHAR(30)   NOT NULL UNIQUE CHECK(nombre_tipo_lente <> ''),
    descripcion       TEXT,
    precio_base       NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK(precio_base >= 0)
);

-- Materiales: orgánico CR-39, policarbonato, trivex, alto índice, etc.
CREATE TABLE materiales_lente (
    id_material      SERIAL        PRIMARY KEY,
    nombre_material  VARCHAR(30)   NOT NULL UNIQUE CHECK(nombre_material <> ''),
    descripcion      TEXT,
    precio_adicional NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK(precio_adicional >= 0)
);

-- Filtros y tratamientos: antirreflejo, luz azul, fotocromático, UV, etc.
CREATE TABLE filtros_lente (
    id_filtro        SERIAL        PRIMARY KEY,
    nombre_filtro    VARCHAR(30)   NOT NULL UNIQUE CHECK(nombre_filtro <> ''),
    descripcion      TEXT,
    precio_adicional NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK(precio_adicional >= 0)
);

-- Configuración completa de lente clínico vinculado a una receta
CREATE TABLE lentes_clinicos (
    id_lente_clinico SERIAL        PRIMARY KEY,
    -- precio_base viene del tipo de lente (asignado por trigger)
    precio_base      NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK(precio_base >= 0),
    -- precio_total = precio_base + material + suma de filtros (calculado por trigger)
    precio_total     NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK(precio_total >= 0),
    id_receta        INTEGER       NOT NULL REFERENCES recetas(id_receta),
    id_tipo_lente    INTEGER       NOT NULL REFERENCES tipos_lente(id_tipo_lente),
    id_material      INTEGER       NOT NULL REFERENCES materiales_lente(id_material)
);

-- Relación N:M: filtros aplicados a cada lente clínico
CREATE TABLE lentes_clinicos_filtros (
    id_lente_clinico INTEGER NOT NULL REFERENCES lentes_clinicos(id_lente_clinico) ON DELETE CASCADE,
    id_filtro        INTEGER NOT NULL REFERENCES filtros_lente(id_filtro),
    PRIMARY KEY (id_lente_clinico, id_filtro)
);


-- =============================================================================
-- MÓDULO 8: ÓRDENES DE LABORATORIO Y CONTROL DE CALIDAD
-- =============================================================================

CREATE TABLE ordenes_laboratorio (
    id_orden         SERIAL      PRIMARY KEY,
    estado_orden     VARCHAR(20) NOT NULL CHECK(estado_orden IN (
                         'CREADA', 'ENVIADA', 'EN_PROCESO', 'RECIBIDA', 'CANCELADA'
                     )) DEFAULT 'CREADA',
    fecha_creacion   DATE        NOT NULL DEFAULT CURRENT_DATE,
    fecha_enviada    DATE        CHECK(fecha_enviada >= fecha_creacion),
    fecha_completada DATE        CHECK(fecha_completada >= fecha_enviada),
    observaciones    TEXT,
    id_empleado      INTEGER     NOT NULL REFERENCES empleados(id_empleado),
    id_lente_clinico INTEGER     NOT NULL REFERENCES lentes_clinicos(id_lente_clinico)
);

-- Lensometría del lente recibido del laboratorio para control de calidad
CREATE TABLE lensometrias (
    id_lensometria SERIAL       PRIMARY KEY,
    od_esfera      NUMERIC(5,2) NOT NULL,
    od_cilindro    NUMERIC(5,2) NOT NULL,
    od_eje         NUMERIC(5,2) NOT NULL CHECK(od_eje BETWEEN 0 AND 180),
    od_dip         NUMERIC(5,2),
    od_altura      INTEGER,
    oi_esfera      NUMERIC(5,2) NOT NULL,
    oi_cilindro    NUMERIC(5,2) NOT NULL,
    oi_eje         NUMERIC(5,2) NOT NULL CHECK(oi_eje BETWEEN 0 AND 180),
    oi_dip         NUMERIC(5,2),
    oi_altura      INTEGER,
    adicion        NUMERIC(3,2) CHECK(adicion BETWEEN 0.50 AND 4.00),
    id_orden       INTEGER      NOT NULL REFERENCES ordenes_laboratorio(id_orden)
);

-- Evaluación de precisión: compara el lente recibido contra la receta original
CREATE TABLE evaluaciones_precision (
    id_evaluacion          SERIAL       PRIMARY KEY,
    od_esfera_diferencia   NUMERIC(5,2),
    od_cilindro_diferencia NUMERIC(5,2),
    od_eje_diferencia      NUMERIC(5,2),
    od_dip_diferencia      NUMERIC(5,2),
    od_altura_diferencia   NUMERIC(5,2),
    oi_esfera_diferencia   NUMERIC(5,2),
    oi_cilindro_diferencia NUMERIC(5,2),
    oi_eje_diferencia      NUMERIC(5,2),
    oi_dip_diferencia      NUMERIC(5,2),
    oi_altura_diferencia   NUMERIC(5,2),
    adicion_diferencia     NUMERIC(3,2),
    estado_evaluacion      VARCHAR(15)  NOT NULL CHECK(estado_evaluacion IN ('aceptable', 'no_aceptable')),
    id_lensometria         INTEGER      NOT NULL REFERENCES lensometrias(id_lensometria),
    id_receta              INTEGER      NOT NULL REFERENCES recetas(id_receta)
);


-- =============================================================================
-- MÓDULO 9: INVENTARIO POR SUCURSAL
-- =============================================================================

CREATE TABLE inventario_sucursal (
    id_inventario SERIAL  PRIMARY KEY,
    cantidad      INTEGER NOT NULL DEFAULT 0  CHECK(cantidad >= 0),
    stock_minimo  INTEGER NOT NULL DEFAULT 5  CHECK(stock_minimo >= 0),
    id_producto   INTEGER NOT NULL REFERENCES productos(id_producto),
    id_sucursal   INTEGER NOT NULL REFERENCES sucursales(id_sucursal),
    UNIQUE(id_producto, id_sucursal)
);

-- Trazabilidad de todos los movimientos de inventario
CREATE TABLE movimientos_inventario (
    id_movimiento    SERIAL      PRIMARY KEY,
    tipo_movimiento  VARCHAR(20) NOT NULL CHECK(tipo_movimiento IN (
                         'entrada', 'salida', 'ajuste', 'perdida', 'transferencia'
                     )),
    cantidad         INTEGER     NOT NULL,
    motivo           TEXT,
    fecha_movimiento TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_producto      INTEGER     NOT NULL REFERENCES productos(id_producto),
    id_sucursal      INTEGER     NOT NULL REFERENCES sucursales(id_sucursal),
    -- Quién realizó el movimiento
    id_usuario       INTEGER     REFERENCES usuarios(id_usuario)
);


-- =============================================================================
-- MÓDULO 10: PROVEEDORES Y COMPRAS
-- =============================================================================

CREATE TABLE proveedores (
    id_proveedor    SERIAL       PRIMARY KEY,
    nombre_empresa  VARCHAR(50)  NOT NULL CHECK(nombre_empresa <> ''),
    nombre_contacto VARCHAR(40),
    telefono        VARCHAR(15),
    correo          VARCHAR(100) CHECK(correo LIKE '%@%'),
    direccion       TEXT,
    ruc             VARCHAR(30)  UNIQUE,
    activo          BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE compras (
    id_compra     SERIAL        PRIMARY KEY,
    fecha_compra  DATE          NOT NULL DEFAULT CURRENT_DATE,
    estado_compra VARCHAR(20)   NOT NULL CHECK(estado_compra IN (
                      'en_proceso', 'finalizada', 'cancelada'
                  )) DEFAULT 'en_proceso',
    -- Calculado automáticamente por trigger
    total_compra  NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK(total_compra >= 0),
    observaciones TEXT,
    id_proveedor  INTEGER       NOT NULL REFERENCES proveedores(id_proveedor),
    id_empleado   INTEGER       NOT NULL REFERENCES empleados(id_empleado)
);

CREATE TABLE detalles_compra (
    id_detalle_compra SERIAL        PRIMARY KEY,
    cantidad          INTEGER       NOT NULL CHECK(cantidad > 0),
    precio_unitario   NUMERIC(10,2) NOT NULL CHECK(precio_unitario >= 0),
    -- Columna generada: no requiere inserción manual
    subtotal          NUMERIC(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
    id_compra         INTEGER       NOT NULL REFERENCES compras(id_compra),
    id_producto       INTEGER       NOT NULL REFERENCES productos(id_producto)
);


-- =============================================================================
-- MÓDULO 11: VENTAS, PEDIDOS Y PAGOS
-- =============================================================================

CREATE TABLE metodos_pago (
    id_metodo_pago     SERIAL      PRIMARY KEY,
    nombre_metodo_pago VARCHAR(30) NOT NULL CHECK(nombre_metodo_pago <> ''),
    descripcion        TEXT,
    tipo_metodo_pago   VARCHAR(20) NOT NULL CHECK(tipo_metodo_pago IN (
                           'fisico', 'electronico', 'digital'
                       )),
    activo             BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE TABLE pagos (
    id_pago         SERIAL        PRIMARY KEY,
    monto           NUMERIC(10,2) NOT NULL CHECK(monto > 0),
    fecha_pago      DATE          NOT NULL DEFAULT CURRENT_DATE,
    referencia_pago VARCHAR(80),
    notas           TEXT,
    id_metodo_pago  INTEGER       NOT NULL REFERENCES metodos_pago(id_metodo_pago)
);

CREATE TABLE pedidos (
    id_pedido              SERIAL      PRIMARY KEY,
    estado_pedido          VARCHAR(20) NOT NULL CHECK(estado_pedido IN (
                               'en_proceso', 'listo', 'entregado', 'cancelado'
                           )) DEFAULT 'en_proceso',
    tipo_pedido            VARCHAR(20) NOT NULL CHECK(tipo_pedido IN ('comercial', 'clinico')),
    fecha_ingreso          DATE        NOT NULL DEFAULT CURRENT_DATE,
    fecha_entrega_estimada DATE        CHECK(fecha_entrega_estimada >= fecha_ingreso),
    fecha_entrega_real     DATE,
    observaciones          TEXT,
    id_empleado            INTEGER     NOT NULL REFERENCES empleados(id_empleado),
    id_cliente             INTEGER     NOT NULL REFERENCES clientes(id_cliente)
);

CREATE TABLE ventas (
    id_venta           SERIAL        PRIMARY KEY,
    fecha_venta        DATE          NOT NULL DEFAULT CURRENT_DATE,
    estado_venta       VARCHAR(20)   NOT NULL CHECK(estado_venta IN (
                           'en_proceso', 'finalizada', 'cancelada'
                       )) DEFAULT 'en_proceso',
    -- subtotal y total_venta se calculan automáticamente por trigger
    subtotal           NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK(subtotal >= 0),
    descuento_aplicado NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK(descuento_aplicado >= 0),
    total_venta        NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK(total_venta >= 0),
    id_cliente         INTEGER       NOT NULL REFERENCES clientes(id_cliente),
    id_empleado        INTEGER       NOT NULL REFERENCES empleados(id_empleado),
    id_pago            INTEGER       REFERENCES pagos(id_pago),
    -- Vínculo al pedido clínico si aplica (lentes pendientes de entrega)
    id_pedido          INTEGER       REFERENCES pedidos(id_pedido)
);

-- Un detalle puede referenciar un producto comercial O un lente clínico
-- La validación de que al menos uno tenga valor se hace vía trigger
CREATE TABLE detalles_venta (
    id_detalle_venta SERIAL        PRIMARY KEY,
    cantidad         INTEGER       NOT NULL CHECK(cantidad > 0),
    precio_unitario  NUMERIC(10,2) NOT NULL CHECK(precio_unitario >= 0),
    subtotal         NUMERIC(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
    id_venta         INTEGER       NOT NULL REFERENCES ventas(id_venta),
    -- Producto del inventario comercial (opcional)
    id_producto      INTEGER       REFERENCES productos(id_producto),
    -- Lente clínico personalizado (opcional)
    id_lente_clinico INTEGER       REFERENCES lentes_clinicos(id_lente_clinico)
);

CREATE TABLE detalles_pedido (
    id_detalle_pedido SERIAL        PRIMARY KEY,
    cantidad          INTEGER       NOT NULL CHECK(cantidad > 0),
    precio_unitario   NUMERIC(10,2) NOT NULL CHECK(precio_unitario >= 0),
    id_pedido         INTEGER       NOT NULL REFERENCES pedidos(id_pedido),
    id_producto       INTEGER       NOT NULL REFERENCES productos(id_producto)
);


-- =============================================================================
-- MÓDULO 12: PROMOCIONES Y DESCUENTOS
-- =============================================================================

CREATE TABLE promociones (
    id_promocion     SERIAL      PRIMARY KEY,
    nombre_promocion VARCHAR(50) NOT NULL CHECK(nombre_promocion <> ''),
    descripcion      TEXT,
    fecha_inicio     DATE        NOT NULL,
    fecha_fin        DATE        NOT NULL CHECK(fecha_fin >= fecha_inicio),
    tipo_promocion   VARCHAR(10) NOT NULL CHECK(tipo_promocion IN ('descuento', 'regalia', 'mixta')),
    activa           BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE TABLE descuentos (
    id_descuento     SERIAL        PRIMARY KEY,
    tipo_descuento   VARCHAR(20)   NOT NULL CHECK(tipo_descuento IN ('porcentaje', 'monto_fijo')),
    valor_descuento  NUMERIC(10,2) NOT NULL CHECK(valor_descuento > 0),
    descripcion      TEXT,
    estado_descuento VARCHAR(10)   NOT NULL CHECK(estado_descuento IN ('activo', 'inactivo'))
                     DEFAULT 'activo'
);

-- Relación N:M entre promociones y descuentos
CREATE TABLE promociones_descuentos (
    id_promocion INTEGER NOT NULL REFERENCES promociones(id_promocion) ON DELETE CASCADE,
    id_descuento INTEGER NOT NULL REFERENCES descuentos(id_descuento)  ON DELETE CASCADE,
    PRIMARY KEY (id_promocion, id_descuento)
);

-- Regalías asociadas a una promoción
CREATE TABLE regalias (
    id_regalia   SERIAL  PRIMARY KEY,
    cantidad     INTEGER NOT NULL DEFAULT 1 CHECK(cantidad > 0),
    id_promocion INTEGER NOT NULL REFERENCES promociones(id_promocion),
    id_producto  INTEGER NOT NULL REFERENCES productos(id_producto)
);


-- =============================================================================
-- MÓDULO 13: CAJA Y MOVIMIENTOS FINANCIEROS
-- =============================================================================

CREATE TABLE cajas (
    id_caja     SERIAL      PRIMARY KEY,
    nombre_caja VARCHAR(30) NOT NULL CHECK(nombre_caja <> ''),
    id_sucursal INTEGER     NOT NULL REFERENCES sucursales(id_sucursal),
    activa      BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE TABLE aperturas_caja (
    id_apertura    SERIAL        PRIMARY KEY,
    fecha_apertura TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    monto_inicial  NUMERIC(10,2) NOT NULL CHECK(monto_inicial >= 0),
    observaciones  TEXT,
    id_caja        INTEGER       NOT NULL REFERENCES cajas(id_caja),
    id_usuario     INTEGER       NOT NULL REFERENCES usuarios(id_usuario)
);

CREATE TABLE cierres_caja (
    id_cierre      SERIAL        PRIMARY KEY,
    fecha_cierre   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    monto_final    NUMERIC(10,2) NOT NULL CHECK(monto_final >= 0),
    monto_esperado NUMERIC(10,2),
    -- Diferencia calculada automáticamente: positivo = sobrante, negativo = faltante
    diferencia     NUMERIC(10,2) GENERATED ALWAYS AS (monto_final - monto_esperado) STORED,
    observaciones  TEXT,
    -- Una apertura solo puede tener un cierre
    id_apertura    INTEGER       NOT NULL UNIQUE REFERENCES aperturas_caja(id_apertura),
    id_usuario     INTEGER       NOT NULL REFERENCES usuarios(id_usuario)
);

CREATE TABLE movimientos_financieros (
    id_movimiento    SERIAL        PRIMARY KEY,
    tipo_movimiento  VARCHAR(20)   NOT NULL CHECK(tipo_movimiento IN ('ingreso', 'egreso', 'ajuste')),
    monto            NUMERIC(10,2) NOT NULL CHECK(monto > 0),
    descripcion      TEXT,
    fecha_movimiento TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_caja          INTEGER       NOT NULL REFERENCES cajas(id_caja),
    id_venta         INTEGER       REFERENCES ventas(id_venta),
    id_compra        INTEGER       REFERENCES compras(id_compra),
    id_usuario       INTEGER       NOT NULL REFERENCES usuarios(id_usuario)
);

CREATE TABLE perdidas (
    id_perdida               SERIAL        PRIMARY KEY,
    descripcion              TEXT          NOT NULL,
    monto_perdida            NUMERIC(10,2) CHECK(monto_perdida >= 0),
    fecha_perdida            DATE          NOT NULL DEFAULT CURRENT_DATE,
    tipo_perdida             VARCHAR(20)   CHECK(tipo_perdida IN ('producto', 'financiera', 'otro')),
    id_producto              INTEGER       REFERENCES productos(id_producto),
    id_movimiento_financiero INTEGER       REFERENCES movimientos_financieros(id_movimiento),
    id_usuario               INTEGER       NOT NULL REFERENCES usuarios(id_usuario)
);


-- =============================================================================
-- MÓDULO 14: CONFIGURACIÓN DE RESPALDOS AUTOMÁTICOS (Sección 6)
-- =============================================================================

CREATE TABLE configuraciones_respaldo (
    id_configuracion   SERIAL      PRIMARY KEY,
    hora_ejecucion     TIME        NOT NULL DEFAULT '02:00:00',
    frecuencia         VARCHAR(20) NOT NULL CHECK(frecuencia IN ('diario', 'semanal', 'mensual'))
                       DEFAULT 'diario',
    ruta_destino       VARCHAR(255),
    activo             BOOLEAN     NOT NULL DEFAULT TRUE,
    ultima_ejecucion   TIMESTAMP,
    proximo_respaldo   TIMESTAMP,
    fecha_modificacion TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =============================================================================
-- TRIGGERS Y FUNCIONES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TRIGGER 1: Control de intentos de login
-- Bloquea automáticamente al usuario tras 3 intentos fallidos (Sección 4)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_controlar_intentos_login()
RETURNS TRIGGER AS $$
DECLARE
    v_intentos_fallidos INTEGER;
BEGIN
    -- Manejo de intento fallido
    IF NOT NEW.exitoso AND NEW.id_usuario IS NOT NULL THEN
        -- Contar intentos fallidos de los últimos 15 minutos
        SELECT COUNT(*) INTO v_intentos_fallidos
        FROM intentos_login
        WHERE id_usuario  = NEW.id_usuario
          AND exitoso     = FALSE
          AND fecha_intento >= NOW() - INTERVAL '15 minutes';

        -- Al llegar a 2 previos el nuevo completa 3: se bloquea
        IF v_intentos_fallidos >= 2 THEN
            UPDATE usuarios
            SET bloqueado     = TRUE,
                fecha_bloqueo = NOW()
            WHERE id_usuario = NEW.id_usuario;
        END IF;
    END IF;

    -- Inicio de sesión exitoso: desbloquear y actualizar último acceso
    IF NEW.exitoso AND NEW.id_usuario IS NOT NULL THEN
        UPDATE usuarios
        SET bloqueado     = FALSE,
            fecha_bloqueo = NULL,
            ultimo_acceso = NOW()
        WHERE id_usuario = NEW.id_usuario;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_controlar_intentos_login
AFTER INSERT ON intentos_login
FOR EACH ROW EXECUTE FUNCTION fn_controlar_intentos_login();


-- -----------------------------------------------------------------------------
-- TRIGGER 2: Expiración automática de tokens de recuperación (5 minutos)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_expirar_token_recuperacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_expiracion = NOW() + INTERVAL '5 minutes';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_expirar_token_recuperacion
BEFORE INSERT ON tokens_recuperacion
FOR EACH ROW EXECUTE FUNCTION fn_expirar_token_recuperacion();


-- -----------------------------------------------------------------------------
-- TRIGGER 3: Validar token antes de marcarlo como utilizado
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_validar_uso_token()
RETURNS TRIGGER AS $$
DECLARE
    v_expirado   BOOLEAN;
    v_utilizado  BOOLEAN;
BEGIN
    -- Solo actuar cuando se intenta marcar como utilizado
    IF NEW.utilizado = TRUE AND OLD.utilizado = FALSE THEN
        SELECT fecha_expiracion < NOW(), utilizado
        INTO v_expirado, v_utilizado
        FROM tokens_recuperacion
        WHERE id_token = NEW.id_token;

        IF v_utilizado THEN
            RAISE EXCEPTION 'El token ya fue utilizado previamente.';
        END IF;
        IF v_expirado THEN
            RAISE EXCEPTION 'El token de recuperación ha expirado.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_validar_uso_token
BEFORE UPDATE ON tokens_recuperacion
FOR EACH ROW EXECUTE FUNCTION fn_validar_uso_token();


-- -----------------------------------------------------------------------------
-- TRIGGER 4: Calcular precio base y total del lente clínico al insertar/actualizar
-- precio_total = precio del tipo + precio del material
-- (los filtros se suman en el trigger 5)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_calcular_precio_lente()
RETURNS TRIGGER AS $$
DECLARE
    v_precio_tipo     NUMERIC(10,2);
    v_precio_material NUMERIC(10,2);
BEGIN
    SELECT precio_base      INTO v_precio_tipo
    FROM tipos_lente WHERE id_tipo_lente = NEW.id_tipo_lente;

    SELECT precio_adicional INTO v_precio_material
    FROM materiales_lente WHERE id_material = NEW.id_material;

    NEW.precio_base  = COALESCE(v_precio_tipo, 0);
    NEW.precio_total = COALESCE(v_precio_tipo, 0) + COALESCE(v_precio_material, 0);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_calcular_precio_lente
BEFORE INSERT OR UPDATE OF id_tipo_lente, id_material ON lentes_clinicos
FOR EACH ROW EXECUTE FUNCTION fn_calcular_precio_lente();


-- -----------------------------------------------------------------------------
-- TRIGGER 5a: Sumar precio al agregar un filtro al lente clínico
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_sumar_precio_filtro()
RETURNS TRIGGER AS $$
DECLARE
    v_precio_filtro NUMERIC(10,2);
BEGIN
    SELECT precio_adicional INTO v_precio_filtro
    FROM filtros_lente WHERE id_filtro = NEW.id_filtro;

    UPDATE lentes_clinicos
    SET precio_total = precio_total + COALESCE(v_precio_filtro, 0)
    WHERE id_lente_clinico = NEW.id_lente_clinico;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_sumar_precio_filtro
AFTER INSERT ON lentes_clinicos_filtros
FOR EACH ROW EXECUTE FUNCTION fn_sumar_precio_filtro();


-- -----------------------------------------------------------------------------
-- TRIGGER 5b: Restar precio al eliminar un filtro del lente clínico
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_restar_precio_filtro()
RETURNS TRIGGER AS $$
DECLARE
    v_precio_filtro NUMERIC(10,2);
BEGIN
    SELECT precio_adicional INTO v_precio_filtro
    FROM filtros_lente WHERE id_filtro = OLD.id_filtro;

    UPDATE lentes_clinicos
    SET precio_total = precio_total - COALESCE(v_precio_filtro, 0)
    WHERE id_lente_clinico = OLD.id_lente_clinico;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_restar_precio_filtro
AFTER DELETE ON lentes_clinicos_filtros
FOR EACH ROW EXECUTE FUNCTION fn_restar_precio_filtro();


-- -----------------------------------------------------------------------------
-- TRIGGER 6: Descontar inventario al registrar un detalle de venta
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_restar_inventario_venta()
RETURNS TRIGGER AS $$
DECLARE
    v_id_sucursal  INTEGER;
    v_stock_actual INTEGER;
BEGIN
    -- Solo aplica para productos comerciales (no para lentes clínicos)
    IF NEW.id_producto IS NULL THEN
        RETURN NEW;
    END IF;

    -- Obtener la sucursal del empleado que realizó la venta
    SELECT e.id_sucursal INTO v_id_sucursal
    FROM ventas v
    JOIN empleados e ON v.id_empleado = e.id_empleado
    WHERE v.id_venta = NEW.id_venta;

    -- Verificar stock disponible
    SELECT cantidad INTO v_stock_actual
    FROM inventario_sucursal
    WHERE id_producto = NEW.id_producto AND id_sucursal = v_id_sucursal;

    IF v_stock_actual IS NULL OR v_stock_actual < NEW.cantidad THEN
        RAISE EXCEPTION 'Stock insuficiente para producto ID %. Disponible: %, Solicitado: %',
            NEW.id_producto, COALESCE(v_stock_actual, 0), NEW.cantidad;
    END IF;

    -- Actualizar inventario
    UPDATE inventario_sucursal
    SET cantidad = cantidad - NEW.cantidad
    WHERE id_producto = NEW.id_producto AND id_sucursal = v_id_sucursal;

    -- Registrar movimiento
    INSERT INTO movimientos_inventario(tipo_movimiento, cantidad, motivo, id_producto, id_sucursal)
    VALUES('salida', NEW.cantidad, 'Venta ID: ' || NEW.id_venta, NEW.id_producto, v_id_sucursal);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_restar_inventario_venta
AFTER INSERT ON detalles_venta
FOR EACH ROW EXECUTE FUNCTION fn_restar_inventario_venta();


-- -----------------------------------------------------------------------------
-- TRIGGER 7: Incrementar inventario al registrar un detalle de compra
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_sumar_inventario_compra()
RETURNS TRIGGER AS $$
DECLARE
    v_id_sucursal INTEGER;
BEGIN
    SELECT e.id_sucursal INTO v_id_sucursal
    FROM compras c
    JOIN empleados e ON c.id_empleado = e.id_empleado
    WHERE c.id_compra = NEW.id_compra;

    -- Insertar o actualizar el registro de inventario
    INSERT INTO inventario_sucursal(id_producto, id_sucursal, cantidad)
    VALUES(NEW.id_producto, v_id_sucursal, NEW.cantidad)
    ON CONFLICT(id_producto, id_sucursal)
    DO UPDATE SET cantidad = inventario_sucursal.cantidad + NEW.cantidad;

    -- Registrar movimiento
    INSERT INTO movimientos_inventario(tipo_movimiento, cantidad, motivo, id_producto, id_sucursal)
    VALUES('entrada', NEW.cantidad, 'Compra ID: ' || NEW.id_compra, NEW.id_producto, v_id_sucursal);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_sumar_inventario_compra
AFTER INSERT ON detalles_compra
FOR EACH ROW EXECUTE FUNCTION fn_sumar_inventario_compra();


-- -----------------------------------------------------------------------------
-- TRIGGER 8: Calcular subtotal y total_venta automáticamente
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_calcular_totales_venta()
RETURNS TRIGGER AS $$
DECLARE
    v_id_venta INTEGER;
BEGIN
    v_id_venta = CASE TG_OP WHEN 'DELETE' THEN OLD.id_venta ELSE NEW.id_venta END;

    UPDATE ventas
    SET subtotal    = COALESCE((
                          SELECT SUM(subtotal) FROM detalles_venta WHERE id_venta = v_id_venta
                      ), 0),
        total_venta = COALESCE((
                          SELECT SUM(subtotal) FROM detalles_venta WHERE id_venta = v_id_venta
                      ), 0) - descuento_aplicado
    WHERE id_venta = v_id_venta;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_calcular_totales_venta
AFTER INSERT OR UPDATE OR DELETE ON detalles_venta
FOR EACH ROW EXECUTE FUNCTION fn_calcular_totales_venta();


-- -----------------------------------------------------------------------------
-- TRIGGER 9: Calcular total_compra automáticamente
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_calcular_total_compra()
RETURNS TRIGGER AS $$
DECLARE
    v_id_compra INTEGER;
BEGIN
    v_id_compra = CASE TG_OP WHEN 'DELETE' THEN OLD.id_compra ELSE NEW.id_compra END;

    UPDATE compras
    SET total_compra = COALESCE((
                           SELECT SUM(subtotal) FROM detalles_compra WHERE id_compra = v_id_compra
                       ), 0)
    WHERE id_compra = v_id_compra;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_calcular_total_compra
AFTER INSERT OR UPDATE OR DELETE ON detalles_compra
FOR EACH ROW EXECUTE FUNCTION fn_calcular_total_compra();


-- -----------------------------------------------------------------------------
-- TRIGGER 10: Calcular fecha de próxima revisión al completar una cita
-- Revisión anual por defecto (ajustable según criterio clínico)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_calcular_proxima_revision()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado_cita = 'completada' AND (OLD.estado_cita IS DISTINCT FROM 'completada') THEN
        NEW.fecha_proxima_revision = (NEW.fecha_hora_cita::DATE) + INTERVAL '1 year';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_calcular_proxima_revision
BEFORE UPDATE ON citas
FOR EACH ROW EXECUTE FUNCTION fn_calcular_proxima_revision();


-- -----------------------------------------------------------------------------
-- TRIGGER 11: Alerta de stock mínimo al actualizar inventario
-- Registra en logs_sistema cuando el stock alcanza el mínimo configurado
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_alerta_stock_minimo()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.cantidad <= NEW.stock_minimo THEN
        INSERT INTO logs_sistema(accion, modulo, descripcion)
        VALUES(
            'ALERTA_STOCK_MINIMO',
            'inventario',
            'Producto ID '  || NEW.id_producto  ||
            ' en sucursal ID ' || NEW.id_sucursal ||
            ' ha alcanzado el stock mínimo. Actual: ' || NEW.cantidad ||
            ', Mínimo: ' || NEW.stock_minimo
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_alerta_stock_minimo
AFTER UPDATE OF cantidad ON inventario_sucursal
FOR EACH ROW EXECUTE FUNCTION fn_alerta_stock_minimo();


-- -----------------------------------------------------------------------------
-- TRIGGER 12: Validar que detalles_venta referencie producto O lente clínico
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_validar_detalle_venta()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.id_producto IS NULL AND NEW.id_lente_clinico IS NULL THEN
        RAISE EXCEPTION
            'El detalle de venta debe referenciar un producto o un lente clínico.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_validar_detalle_venta
BEFORE INSERT OR UPDATE ON detalles_venta
FOR EACH ROW EXECUTE FUNCTION fn_validar_detalle_venta();


-- -----------------------------------------------------------------------------
-- TRIGGER 13: Auditoría de modificaciones en la tabla usuarios
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_log_cambios_usuario()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO logs_sistema(accion, modulo, descripcion)
    VALUES(
        TG_OP,
        'usuarios',
        CASE TG_OP
            WHEN 'UPDATE' THEN 'Usuario actualizado: ' || NEW.nombre_usuario
            WHEN 'DELETE' THEN 'Usuario eliminado: '   || OLD.nombre_usuario
        END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_log_cambios_usuario
AFTER UPDATE OR DELETE ON usuarios
FOR EACH ROW EXECUTE FUNCTION fn_log_cambios_usuario();


-- =============================================================================
-- ÍNDICES PARA RENDIMIENTO (Sección 5: búsquedas rápidas)
-- =============================================================================

-- Clientes
CREATE INDEX idx_clientes_cedula   ON clientes(cedula);
CREATE INDEX idx_clientes_nombre   ON clientes(primer_apellido, primer_nombre);
CREATE INDEX idx_clientes_tipo     ON clientes(tipo_cliente);

-- Citas
CREATE INDEX idx_citas_fecha       ON citas(fecha_hora_cita);
CREATE INDEX idx_citas_estado      ON citas(estado_cita);
CREATE INDEX idx_citas_cliente     ON citas(id_cliente);
CREATE INDEX idx_citas_empleado    ON citas(id_empleado);

-- Consultas
CREATE INDEX idx_consultas_fecha   ON consultas(fecha_hora_consulta);
CREATE INDEX idx_consultas_historia ON consultas(id_historia_visual);

-- Ventas
CREATE INDEX idx_ventas_fecha      ON ventas(fecha_venta);
CREATE INDEX idx_ventas_estado     ON ventas(estado_venta);
CREATE INDEX idx_ventas_cliente    ON ventas(id_cliente);

-- Compras
CREATE INDEX idx_compras_fecha     ON compras(fecha_compra);
CREATE INDEX idx_compras_proveedor ON compras(id_proveedor);

-- Inventario
CREATE INDEX idx_inventario_producto  ON inventario_sucursal(id_producto);
CREATE INDEX idx_inventario_sucursal  ON inventario_sucursal(id_sucursal);

-- Pedidos
CREATE INDEX idx_pedidos_estado    ON pedidos(estado_pedido);
CREATE INDEX idx_pedidos_cliente   ON pedidos(id_cliente);

-- Órdenes de laboratorio
CREATE INDEX idx_ordenes_estado    ON ordenes_laboratorio(estado_orden);

-- Seguridad
CREATE INDEX idx_intentos_usuario  ON intentos_login(id_usuario, fecha_intento);
CREATE INDEX idx_tokens_token      ON tokens_recuperacion(token);
CREATE INDEX idx_sesiones_token    ON sesiones(token_sesion);
CREATE INDEX idx_sesiones_usuario  ON sesiones(id_usuario);

-- Logs
CREATE INDEX idx_logs_fecha        ON logs_sistema(fecha_evento);
CREATE INDEX idx_logs_usuario      ON logs_sistema(id_usuario);
CREATE INDEX idx_logs_modulo       ON logs_sistema(modulo);

-- Productos
CREATE INDEX idx_productos_tipo    ON productos(tipo_producto);
CREATE INDEX idx_productos_activo  ON productos(activo);


-- =============================================================================
-- DATOS INICIALES (SEED DATA)
-- =============================================================================

-- Sucursal principal
INSERT INTO sucursales (nombre, activa)
VALUES ('Sucursal Principal', TRUE);

-- Roles del sistema (Sección 2.8)
INSERT INTO roles (nombre_rol, descripcion) VALUES
  ('Administrador',  'Acceso completo al sistema'),
  ('Recepcionista',  'Gestión de citas y registro de pacientes'),
  ('Optometrista',   'Gestión clínica, consultas y emisión de recetas'),
  ('Cajero',         'Gestión de pagos, apertura y cierre de caja'),
  ('Vendedor',       'Gestión de ventas y consulta de productos');

-- Tipos de lente (Sección 2.5)
INSERT INTO tipos_lente (nombre_tipo_lente, descripcion, precio_base) VALUES
  ('Monofocal',   'Lente con una sola graduación',                    0.00),
  ('Bifocal',     'Lente con dos zonas de graduación diferenciadas',  0.00),
  ('Progresivo',  'Lente con graduación progresiva continua',         0.00),
  ('Ocupacional', 'Lente diseñado para uso prolongado en pantallas',  0.00);

-- Materiales de lente (Sección 2.5)
INSERT INTO materiales_lente (nombre_material, descripcion, precio_adicional) VALUES
  ('Orgánico CR-39',   'Material estándar, ligero y económico',               0.00),
  ('Policarbonato',    'Alta resistencia a impactos, recomendado para niños', 0.00),
  ('Trivex',           'Liviano, resistente y con óptima claridad visual',    0.00),
  ('Alto índice 1.67', 'Lentes más delgados para graduaciones altas',         0.00),
  ('Alto índice 1.74', 'Lentes muy delgados para graduaciones muy altas',     0.00);

-- Filtros y tratamientos (Sección 2.5)
INSERT INTO filtros_lente (nombre_filtro, descripcion, precio_adicional) VALUES
  ('Antirreflejo',      'Elimina reflejos y halos de luz artificial',  0.00),
  ('Filtro luz azul',   'Protección contra luz azul de pantallas LED', 0.00),
  ('Fotocromático',     'Oscurece automáticamente bajo luz solar',     0.00),
  ('Protección UV 400', 'Bloquea 100% de radiación UV hasta 400 nm',  0.00),
  ('Polarizado',        'Elimina reflejos horizontales intensos',      0.00),
  ('Endurecido',        'Tratamiento antirayadura de alta durabilidad', 0.00);

-- Métodos de pago
INSERT INTO metodos_pago (nombre_metodo_pago, tipo_metodo_pago) VALUES
  ('Efectivo',               'fisico'),
  ('Tarjeta de débito',      'electronico'),
  ('Tarjeta de crédito',     'electronico'),
  ('Transferencia bancaria', 'digital'),
  ('Depósito bancario',      'fisico');

-- Configuración de respaldo diario a las 2:00 AM por defecto (Sección 6)
INSERT INTO configuraciones_respaldo (hora_ejecucion, frecuencia)
VALUES ('02:00:00', 'diario');