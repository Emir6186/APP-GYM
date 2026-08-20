import type { Exercise } from '../types/workout';

export const DEFAULT_EXERCISES: Exercise[] = [
  // PECHO
  {
    id: 'ex_bench_press',
    name: 'Press de Banca Plano',
    category: 'Pecho',
    defaultRestSeconds: 90,
    description: 'Empuje con barra en banco plano para pectoral mayor, tríceps y deltoides anterior.',
    machinePhotoUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 'ex_incline_dumbbell_press',
    name: 'Press Inclinado con Mancuernas',
    category: 'Pecho',
    defaultRestSeconds: 75,
    description: 'Enfocado en el haz clavicular (pectoral superior) a 30-45 grados.',
    machinePhotoUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 'ex_cable_crossover',
    name: 'Cruces en Polea para Pecho',
    category: 'Pecho',
    defaultRestSeconds: 60,
    description: 'Aislamiento y contracción máxima del pectoral en máquina de poleas dobles.',
    machinePhotoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 'ex_chest_dips',
    name: 'Fondos en Paralelas (Dips)',
    category: 'Pecho',
    defaultRestSeconds: 90,
    description: 'Excelente constructor de pectoral inferior y fuerza en tren superior.',
    machinePhotoUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&auto=format&fit=crop&q=60'
  },

  // ESPALDA
  {
    id: 'ex_lat_pulldown',
    name: 'Jalón al Pecho en Polea Alta',
    category: 'Espalda',
    defaultRestSeconds: 75,
    description: 'Máquina de jalón dorsal para amplitud de espalda y dorsal ancho.',
    machinePhotoUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 'ex_barbell_row',
    name: 'Remo con Barra 90º',
    category: 'Espalda',
    defaultRestSeconds: 90,
    description: 'Ejercicio multiarticular para densidad de espalda media y alta.',
    machinePhotoUrl: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 'ex_seated_cable_row',
    name: 'Remo en Polea Baja Sentado',
    category: 'Espalda',
    defaultRestSeconds: 60,
    description: 'Máquina de remo sentado con agarre neutro o cerrado.',
    machinePhotoUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 'ex_deadlift',
    name: 'Peso Muerto Convencional',
    category: 'Espalda',
    defaultRestSeconds: 120,
    description: 'Fuerza total para cadena posterior, erectores espinales y glúteos.',
    machinePhotoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=60'
  },

  // PIERNAS
  {
    id: 'ex_barbell_squat',
    name: 'Sentadilla Trasera con Barra',
    category: 'Piernas',
    defaultRestSeconds: 120,
    description: 'Ejercicio rey de tren inferior para cuádriceps, glúteos y core.',
    machinePhotoUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 'ex_leg_press',
    name: 'Prensa Inclinada a 45º',
    category: 'Piernas',
    defaultRestSeconds: 90,
    description: 'Máquina de prensa para sobrecarga pesada y segura de piernas.',
    machinePhotoUrl: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 'ex_leg_extension',
    name: 'Extensiones de Cuádriceps en Máquina',
    category: 'Piernas',
    defaultRestSeconds: 60,
    description: 'Aislamiento directo de cuádriceps en máquina sentada.',
    machinePhotoUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 'ex_leg_curl',
    name: 'Curl Femoral Tumbado',
    category: 'Piernas',
    defaultRestSeconds: 60,
    description: 'Máquina de flexión de rodilla para isquiosurales.',
    machinePhotoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 'ex_calf_raise',
    name: 'Elevación de Talones en Máquina',
    category: 'Piernas',
    defaultRestSeconds: 45,
    description: 'Trabajo de gemelos y sóleo de pie o sentado.',
    machinePhotoUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400&auto=format&fit=crop&q=60'
  },

  // HOMBROS
  {
    id: 'ex_overhead_press',
    name: 'Press Militar con Barra',
    category: 'Hombros',
    defaultRestSeconds: 90,
    description: 'Empuje vertical para hombro completo y estabilidad escapular.',
    machinePhotoUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 'ex_lateral_raises',
    name: 'Elevaciones Laterales con Mancuernas',
    category: 'Hombros',
    defaultRestSeconds: 45,
    description: 'Aislamiento del deltoides lateral para amplitud visual de hombros.',
    machinePhotoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 'ex_face_pull',
    name: 'Face Pull en Polea con Cuerda',
    category: 'Hombros',
    defaultRestSeconds: 60,
    description: 'Salud articular del manguito rotador y deltoides posterior.',
    machinePhotoUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&auto=format&fit=crop&q=60'
  },

  // BRAZOS
  {
    id: 'ex_bicep_curl_barbell',
    name: 'Curl de Bíceps con Barra Z',
    category: 'Brazos',
    defaultRestSeconds: 60,
    description: 'Constructor principal del bíceps braquial.',
    machinePhotoUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 'ex_tricep_rope_pushdown',
    name: 'Extensión de Tríceps en Polea Alta',
    category: 'Brazos',
    defaultRestSeconds: 60,
    description: 'Aislamiento de la cabeza lateral y medial del tríceps.',
    machinePhotoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 'ex_hammer_curl',
    name: 'Curl Martillo con Mancuernas',
    category: 'Brazos',
    defaultRestSeconds: 60,
    description: 'Enfocado en braquiorradial y grosor del brazo.',
    machinePhotoUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&auto=format&fit=crop&q=60'
  },

  // CORE
  {
    id: 'ex_hanging_leg_raise',
    name: 'Elevación de Piernas Colgado en Barra',
    category: 'Core',
    defaultRestSeconds: 45,
    description: 'Flexión de cadera y activación de abdomen inferior.',
    machinePhotoUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 'ex_cable_crunch',
    name: 'Crunch Abdominal en Polea Alta',
    category: 'Core',
    defaultRestSeconds: 45,
    description: 'Flexión de columna con carga progresiva para recto abdominal.',
    machinePhotoUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&auto=format&fit=crop&q=60'
  }
];
