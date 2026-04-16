/*
  # Aciertos y Desaciertos - Evaluaciones

  ## Descripción
  Tabla para almacenar las evaluaciones de Aciertos y Desaciertos (formato de retroalimentación estructurada).

  ## Estructura
  Cada registro representa una sesión de retroalimentación entre un evaluador (líder/empresa) y un colaborador,
  siguiendo el proceso de 3 secciones:
    1. Resultados: Resultado actual vs objetivo
    2. Escucha y compromisos: Aciertos/desaciertos del colaborador + retroalimentación de la empresa
    3. Compromisos finales: Compromisos de ambas partes con fechas

  ## Tablas

  ### aciertos_desaciertos_sessions
  - `id` - UUID, clave primaria
  - `evaluator_employee_id` - ID del empleado que hace la evaluación (empresa/líder)
  - `target_employee_id` - ID del empleado evaluado
  - `period` - Periodo de evaluación (ej: "Q1 2025", "Marzo 2025")
  - `status` - Estado: 'draft' | 'completed'

  ### Sección 1: Resultados
  - `resultado_actual` - Resultado actual del colaborador
  - `resultado_objetivo` - Objetivo establecido

  ### Sección 2: Aciertos y Desaciertos
  - `aciertos_colaborador` - Aciertos listados por el colaborador (texto libre / array JSON)
  - `desaciertos_colaborador` - Desaciertos del colaborador
  - `retroalimentacion_empresa` - Retroalimentación de la empresa

  ### Sección 3: Compromisos
  - `compromisos` - JSON array con compromisos de ambas partes (tipo, descripcion, fecha)

  - `created_at` - Timestamp de creación
  - `completed_at` - Timestamp de completación

  ## Seguridad
  - RLS habilitado
  - Los registros son accesibles por cualquier usuario autenticado (la app maneja auth por contexto)
*/

CREATE TABLE IF NOT EXISTS aciertos_desaciertos_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluator_employee_id text NOT NULL,
  target_employee_id text NOT NULL,
  period text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  resultado_actual text NOT NULL DEFAULT '',
  resultado_objetivo text NOT NULL DEFAULT '',
  aciertos_colaborador jsonb NOT NULL DEFAULT '[]'::jsonb,
  desaciertos_colaborador jsonb NOT NULL DEFAULT '[]'::jsonb,
  retroalimentacion_empresa jsonb NOT NULL DEFAULT '[]'::jsonb,
  compromisos jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE aciertos_desaciertos_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to aciertos sessions"
  ON aciertos_desaciertos_sessions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert aciertos sessions"
  ON aciertos_desaciertos_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update aciertos sessions"
  ON aciertos_desaciertos_sessions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_aciertos_target ON aciertos_desaciertos_sessions(target_employee_id);
CREATE INDEX IF NOT EXISTS idx_aciertos_evaluator ON aciertos_desaciertos_sessions(evaluator_employee_id);
CREATE INDEX IF NOT EXISTS idx_aciertos_status ON aciertos_desaciertos_sessions(status);
