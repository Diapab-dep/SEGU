-- ================================
-- Tablas adicionales para carga de CSV (Power Apps)
-- ================================

-- Catálogo tipo_mercancia (para tablas de detalle)
CREATE TABLE IF NOT EXISTS tipo_mercancia (
  id          SERIAL PRIMARY KEY,
  codigo      VARCHAR(50) UNIQUE NOT NULL,
  nombre      VARCHAR(150) NOT NULL
);

-- Guía (cabecera común)
CREATE TABLE IF NOT EXISTS guia (
  id                  SERIAL PRIMARY KEY,
  numero_guia         VARCHAR(30) UNIQUE NOT NULL,
  origen              VARCHAR(10),
  destino             VARCHAR(10),
  remitente           VARCHAR(200),
  destinatario        VARCHAR(200),
  tipo_mercancia_id   INT REFERENCES tipo_mercancia(id),
  resultado_aceptacion VARCHAR(80),
  comentarios         TEXT,
  fecha_envio         TIMESTAMP,
  fecha_inicio        TIMESTAMP
);

-- Bultos por guía
CREATE TABLE IF NOT EXISTS guia_bulto (
  id              SERIAL PRIMARY KEY,
  guia_id         INT NOT NULL REFERENCES guia(id) ON DELETE CASCADE,
  numero_bulto    VARCHAR(50) NOT NULL
);

-- 2.1 Animales vivos - Detalle
CREATE TABLE IF NOT EXISTS detalle_animales_vivos (
  id                     SERIAL PRIMARY KEY,
  guia_bulto_id          INT NOT NULL REFERENCES guia_bulto(id) ON DELETE CASCADE,
  numero_requisito       INT,
  cantidad_animales      INT,
  clase_animal           VARCHAR(100),
  nombre_comun           VARCHAR(150),
  nombre_cientifico      VARCHAR(150),
  cites_apendice         VARCHAR(50),
  raza                   VARCHAR(150),
  edad_meses             NUMERIC(10,2),
  tiene_condicion        BOOLEAN,
  descripcion_condicion  VARCHAR(500),
  proposito_transporte   VARCHAR(200),
  peso_neto_kg           NUMERIC(10,2),
  peso_bruto_kg          NUMERIC(10,2),
  sexo                   VARCHAR(10)
);

-- 2.2 Baterías - Detalle
CREATE TABLE IF NOT EXISTS detalle_baterias (
  id                        SERIAL PRIMARY KEY,
  guia_bulto_id             INT NOT NULL REFERENCES guia_bulto(id) ON DELETE CASCADE,
  numero_onu                VARCHAR(20),
  nombre_expedicion         VARCHAR(200),
  detalle_naturaleza        VARCHAR(200),
  cantidad_baterias_bulto   INT,
  tipo_embalaje             VARCHAR(200),
  peso_neto_kg              NUMERIC(10,2),
  peso_bruto_kg             NUMERIC(10,2),
  instruccion_embalaje      VARCHAR(50),
  fecha_hora_envio_detalle  TIMESTAMP
);

-- 2.3 No radiactivos - Detalle
CREATE TABLE IF NOT EXISTS detalle_no_radiactivos (
  id                        SERIAL PRIMARY KEY,
  guia_id                   INT NOT NULL REFERENCES guia(id) ON DELETE CASCADE,
  numero_onu                VARCHAR(20),
  clase_division            VARCHAR(20),
  peligro_secundario        VARCHAR(50),
  grupo_embalaje            VARCHAR(20),
  cantidad_bultos           NUMERIC(10,3),
  tipo_embalaje             VARCHAR(200),
  peso_neto_mercancia       NUMERIC(10,3),
  unidad_medida_neto        VARCHAR(20),
  peso_bruto_bulto_kg       NUMERIC(10,3),
  instruccion_embalaje      VARCHAR(50),
  autorizaciones            VARCHAR(200),
  disposiciones_especiales  VARCHAR(200),
  info_adicional_manip      VARCHAR(300),
  nombre_expedicion         VARCHAR(200)
);

-- 2.4 Hielo seco - Detalle
CREATE TABLE IF NOT EXISTS detalle_hielo_seco (
  id                        SERIAL PRIMARY KEY,
  guia_bulto_id             INT NOT NULL REFERENCES guia_bulto(id) ON DELETE CASCADE,
  tipo_embalaje             VARCHAR(200),
  detalle_naturaleza        VARCHAR(200),
  peso_neto_hielo_kg        NUMERIC(10,2),
  peso_bruto_bulto_kg       NUMERIC(10,2)
);

-- 2.5 Sustancias biológicas - Detalle
CREATE TABLE IF NOT EXISTS detalle_sustancias_biologicas (
  id                            SERIAL PRIMARY KEY,
  guia_bulto_id                 INT NOT NULL REFERENCES guia_bulto(id) ON DELETE CASCADE,
  unidad_medida_emb_int         VARCHAR(10),
  detalle_sustancia             VARCHAR(200),
  detalle_patogeno              VARCHAR(200),
  cantidad_embalajes_interiores INT,
  estado_fisico                 VARCHAR(50),
  cantidad_neta_por_emb_int     NUMERIC(10,2),
  detalle_sustancia_refrigerante VARCHAR(200),
  numero_onu_refrigerante       VARCHAR(20),
  cantidad_neta_bulto           NUMERIC(10,2),
  unidad_medida_bulto           VARCHAR(10),
  numero_bulto_csv              VARCHAR(20)
);

-- 2.6 Restos humanos - Detalle
CREATE TABLE IF NOT EXISTS detalle_restos_humanos (
  id                            SERIAL PRIMARY KEY,
  guia_bulto_id                 INT NOT NULL REFERENCES guia_bulto(id) ON DELETE CASCADE,
  tipo_restos                   VARCHAR(100),
  tipo_embalaje                 VARCHAR(100),
  lugar_defuncion               VARCHAR(100),
  fecha_defuncion               DATE,
  tipo_documento_fallecido      VARCHAR(100),
  numero_documento_fallecido    VARCHAR(50),
  apellidos_fallecido           VARCHAR(200),
  nombres_fallecido             VARCHAR(200),
  edad_fallecido_anios          NUMERIC(10,2),
  causa_muerte                  VARCHAR(200),
  numero_licencia               VARCHAR(100),
  numero_certificado_defuncion  VARCHAR(100),
  fecha_certificado_defuncion   DATE,
  lugar_certificado_defuncion   VARCHAR(100),
  fecha_certificado_embalsam    DATE,
  dias_preservacion             INT
);

-- 2.7 Radiactivos - Detalle
CREATE TABLE IF NOT EXISTS detalle_radiactivos (
  id                           SERIAL PRIMARY KEY,
  guia_id                      INT NOT NULL REFERENCES guia(id) ON DELETE CASCADE,
  fecha_hora_envio_detalle     TIMESTAMP,
  nombre_expedicion            VARCHAR(200),
  numero_onu                   VARCHAR(20),
  peligro_secundario           VARCHAR(50),
  grupo_embalaje               VARCHAR(20),
  cantidad_bultos              INT,
  tipo_embalaje                VARCHAR(200),
  radionucleido                VARCHAR(50),
  elemento_num_atomico         VARCHAR(20),
  vida_media_horas             NUMERIC(10,2),
  actividad_gbq                NUMERIC(18,4),
  indice_transporte            NUMERIC(10,2),
  categoria_radiactivo         VARCHAR(20),
  peso_bruto_bulto_kg          NUMERIC(10,2),
  altura_bulto_cm              NUMERIC(10,2),
  autorizaciones               VARCHAR(200),
  disposiciones_especiales     VARCHAR(200),
  creado_fecha                 TIMESTAMP,
  creado_por                   VARCHAR(200)
);

-- 3. Modelo genérico de checklists (listas de comprobación)
CREATE TABLE IF NOT EXISTS checklist_tipo (
  id          SERIAL PRIMARY KEY,
  codigo      VARCHAR(50) UNIQUE NOT NULL,
  descripcion VARCHAR(150) NOT NULL
);

CREATE TABLE IF NOT EXISTS checklist_item (
  id                SERIAL PRIMARY KEY,
  checklist_tipo_id INT NOT NULL REFERENCES checklist_tipo(id) ON DELETE CASCADE,
  codigo            VARCHAR(50) NOT NULL,
  texto_pregunta    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS checklist (
  id                SERIAL PRIMARY KEY,
  guia_id           INT NOT NULL REFERENCES guia(id) ON DELETE CASCADE,
  checklist_tipo_id INT NOT NULL REFERENCES checklist_tipo(id),
  fecha_hora        TIMESTAMP,
  origen            VARCHAR(10),
  destino           VARCHAR(10),
  verificado_por    VARCHAR(200),
  resultado         VARCHAR(80),
  comentarios       TEXT,
  extra_json        JSONB
);

CREATE TABLE IF NOT EXISTS checklist_respuesta (
  id                 SERIAL PRIMARY KEY,
  checklist_id       INT NOT NULL REFERENCES checklist(id) ON DELETE CASCADE,
  checklist_item_id  INT NOT NULL REFERENCES checklist_item(id) ON DELETE CASCADE,
  valor_booleano     BOOLEAN,
  valor_texto        TEXT
);

-- 4. Índices
CREATE INDEX IF NOT EXISTS idx_guia_numero ON guia (numero_guia);
CREATE INDEX IF NOT EXISTS idx_bulto_guia ON guia_bulto (guia_id);
CREATE INDEX IF NOT EXISTS idx_det_animales_bulto ON detalle_animales_vivos (guia_bulto_id);
CREATE INDEX IF NOT EXISTS idx_det_baterias_bulto ON detalle_baterias (guia_bulto_id);
CREATE INDEX IF NOT EXISTS idx_det_hielo_bulto ON detalle_hielo_seco (guia_bulto_id);
CREATE INDEX IF NOT EXISTS idx_det_bio_bulto ON detalle_sustancias_biologicas (guia_bulto_id);
CREATE INDEX IF NOT EXISTS idx_det_restos_bulto ON detalle_restos_humanos (guia_bulto_id);

-- 5. Datos iniciales tipo_mercancia
INSERT INTO tipo_mercancia (codigo, nombre) VALUES
  ('ANIMALES_VIVOS', 'Animales vivos'),
  ('BATERIAS', 'Baterías'),
  ('NO_RADIACTIVOS', 'No radiactivos'),
  ('HIELO_SECO', 'Hielo seco'),
  ('SUSTANCIAS_BIOLOGICAS', 'Sustancias biológicas'),
  ('RESTOS_HUMANOS', 'Restos humanos'),
  ('RADIACTIVOS', 'Radiactivos'),
  ('PERECEDEROS', 'Perecederos'),
  ('ARMAS', 'Armas')
ON CONFLICT (codigo) DO NOTHING;
