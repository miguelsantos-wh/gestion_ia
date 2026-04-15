import type { EvaluationTemplate } from '../types/evaluation';

const opt = (
  v: 1 | 2 | 3 | 4 | 5,
  text: string
): { value: 1 | 2 | 3 | 4 | 5; text: string } => ({ value: v, text });

export const DEFAULT_360_TEMPLATE_ID = 'tpl-competencias-generales';

export const EVALUATION_360_TEMPLATES: EvaluationTemplate[] = [
  {
    id: DEFAULT_360_TEMPLATE_ID,
    name: 'Competencias generales (liderazgo y colaboración)',
    description:
      'Plantilla reutilizable para distintos perfiles. Cada ítem usa escala 1–5; el promedio orienta la posición en la matriz 9-Box según los ejes resultados y valores definidos en el sistema.',
    applicableTo: 'Colaboradores, líderes y perfiles operativos con roles de equipo.',
    items: [
      {
        id: 'c1',
        order: 1,
        statement: 'Logra contagiar entusiasmo y motivar a los demás para dar lo mejor de sí.',
        options: [
          opt(1, 'Considero que casi nunca motiva ni impulsa al equipo.'),
          opt(2, 'Considero que a veces intenta motivar, pero le falta constancia.'),
          opt(3, 'Considero que motiva de forma aceptable y cumple lo esperado.'),
          opt(4, 'Considero que motiva con energía y logra buenos resultados.'),
          opt(5, 'Considero que es una inspiración constante para todo el equipo.'),
        ],
      },
      {
        id: 'c2',
        order: 2,
        statement: 'Colabora y participa activamente con los demás para alcanzar metas comunes.',
        options: [
          opt(1, 'Considero que no suele trabajar en equipo.'),
          opt(2, 'Considero que colabora poco y solo cuando se le pide.'),
          opt(3, 'Considero que trabaja en equipo la mayoría de las veces.'),
          opt(4, 'Considero que colabora siempre y aporta ideas.'),
          opt(5, 'Considero que es ejemplo de trabajo en equipo y apoyo constante.'),
        ],
      },
      {
        id: 'c3',
        order: 3,
        statement: 'Propone ideas creativas para resolver los retos que surgen.',
        options: [
          opt(1, 'Considero que evita proponer soluciones y prefiere señalar excusas.'),
          opt(2, 'Considero que no propone ni participa.'),
          opt(3, 'Considero que plantea soluciones pero no son útiles.'),
          opt(4, 'Considero que propone soluciones útiles, creativas y prácticas.'),
          opt(5, 'Considero que busca siempre la forma de resolver y entregar sus resultados de forma creativa.'),
        ],
      },
      {
        id: 'c4',
        order: 4,
        statement: 'Aprende rápido nuevas herramientas, procesos o formas de trabajar.',
        options: [
          opt(1, 'Considero que le cuesta aprender cosas nuevas.'),
          opt(2, 'Considero que aprende, pero necesita mucho tiempo o apoyo.'),
          opt(3, 'Considero que aprende al ritmo esperado.'),
          opt(4, 'Considero que aprende rápido y sin problemas.'),
          opt(5, 'Considero que aprende muy rápido y enseña a otros.'),
        ],
      },
      {
        id: 'c5',
        order: 5,
        statement: 'Cumple objetivos en tiempo y forma.',
        options: [
          opt(1, 'Casi nunca cumple con lo que se le pide.'),
          opt(2, 'Cumple, pero a veces se retrasa o no es constante.'),
          opt(3, 'Cumple la mayoría de las veces y en buen tiempo.'),
          opt(4, 'Cumple siempre y con buen nivel de calidad.'),
          opt(5, 'Cumple siempre, rápido y con resultados sobresalientes.'),
        ],
      },
      {
        id: 'c6',
        order: 6,
        statement: 'Búsqueda de mejorar y proactividad.',
        options: [
          opt(1, 'No mejora nada: entrega las cosas igual o peor de como estaban.'),
          opt(2, 'Mejora ocasionalmente: solo realiza mejoras puntuales cuando se le solicita.'),
          opt(3, 'Mejora regularmente: busca dejar las cosas un poco mejor de lo que estaban.'),
          opt(4, 'Mejora de forma proactiva: identifica áreas de oportunidad y propone mejoras visibles.'),
          opt(
            5,
            'Transforma significativamente: deja consistentemente procesos y tareas en mucho mejores condiciones y contagia esa práctica al equipo.'
          ),
        ],
      },
      {
        id: 'c7',
        order: 7,
        statement: 'Busca información y recursos para mejorar.',
        options: [
          opt(1, 'No busca aprender por sí mismo.'),
          opt(2, 'Busca aprender de vez en cuando.'),
          opt(3, 'Busca aprender lo necesario.'),
          opt(4, 'Busca aprender con frecuencia.'),
          opt(5, 'Siempre busca y aplica nuevos conocimientos.'),
        ],
      },
      {
        id: 'c8',
        order: 8,
        statement: 'Responde rápidamente a situaciones.',
        options: [
          opt(1, 'No responde rápido.'),
          opt(2, 'Responde lento a lo urgente.'),
          opt(3, 'Responde a tiempo.'),
          opt(4, 'Responde rápido y bien.'),
          opt(5, 'Responde de inmediato y de forma efectiva.'),
        ],
      },
      {
        id: 'c9',
        order: 9,
        statement: 'Respeto y cortesía.',
        options: [
          opt(1, 'Con frecuencia es descortés o irrespetuoso.'),
          opt(2, 'Generalmente es correcto, pero le falta cordialidad.'),
          opt(3, 'Es respetuoso y cortés en la mayoría de las interacciones.'),
          opt(4, 'Demuestra amabilidad genuina y ayuda de forma voluntaria.'),
          opt(5, 'Se distingue por su amabilidad excepcional y contagia un ambiente positivo en todo momento.'),
        ],
      },
      {
        id: 'c10',
        order: 10,
        statement: 'Supera expectativas del cliente.',
        options: [
          opt(1, 'No cumple con lo esperado.'),
          opt(2, 'Cumple pero sin superar expectativas.'),
          opt(3, 'Cumple con lo esperado.'),
          opt(4, 'Supera las expectativas.'),
          opt(5, 'Siempre sorprende al cliente con su trabajo.'),
        ],
      },
      {
        id: 'c11',
        order: 11,
        statement: 'Expresa ideas con respeto y claridad.',
        options: [
          opt(1, 'No expresa ideas claramente.'),
          opt(2, 'Expresa ideas de forma confusa.'),
          opt(3, 'Expresa ideas con claridad aceptable.'),
          opt(4, 'Expresa ideas con respeto y claridad.'),
          opt(5, 'Siempre expresa ideas de forma clara y respetuosa.'),
        ],
      },
    ],
  },
];

export function getTemplateById(id: string): EvaluationTemplate | undefined {
  return EVALUATION_360_TEMPLATES.find((t) => t.id === id);
}
