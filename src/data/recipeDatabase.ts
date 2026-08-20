import type { MealType } from '../types/nutrition';

export interface RecipeTemplate {
  id: string;
  type: MealType;
  title: string;
  description: string;
  prepTimeMinutes: number;
  photoEmoji: string;
  baseCalories: number;
  baseProtein: number;
  baseCarbs: number;
  baseFat: number;
  ingredients: {
    name: string;
    quantity: number;
    unit: 'g' | 'ml' | 'ud' | 'cda' | 'rebanada' | 'scoop';
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    category: 'frutas_verduras' | 'carniceria_pescaderia' | 'lacteos_huevos' | 'cereales_legumbres' | 'despensa' | 'suplementacion';
  }[];
  instructions: string[];
}

export const RECIPE_DATABASE: RecipeTemplate[] = [
  // DESAYUNOS
  {
    id: 'rec_oat_bowl_protein',
    type: 'breakfast',
    title: 'Porridge de Avena y Proteína con Frutos Rojos',
    description: 'Avena cocida con proteína de suero, leche de almendras y arándanos frescos ricos en antioxidantes.',
    prepTimeMinutes: 8,
    photoEmoji: '🥣',
    baseCalories: 460,
    baseProtein: 38,
    baseCarbs: 54,
    baseFat: 8,
    ingredients: [
      { name: 'Copos de avena integral', quantity: 70, unit: 'g', calories: 260, protein: 9, carbs: 45, fat: 5, category: 'cereales_legumbres' },
      { name: 'Proteína Whey (Sabor Vainilla o Chocolate)', quantity: 30, unit: 'g', calories: 120, protein: 24, carbs: 2, fat: 1, category: 'suplementacion' },
      { name: 'Bebida de almendras sin azúcar', quantity: 200, unit: 'ml', calories: 30, protein: 1, carbs: 1, fat: 2, category: 'lacteos_huevos' },
      { name: 'Arándanos frescos', quantity: 80, unit: 'g', calories: 45, protein: 1, carbs: 10, fat: 0, category: 'frutas_verduras' },
      { name: 'Canela en polvo', quantity: 1, unit: 'cda', calories: 5, protein: 0, carbs: 1, fat: 0, category: 'despensa' }
    ],
    instructions: [
      'Calentar la leche de almendras en un cazo con la avena a fuego medio durante 4 minutos removiendo.',
      'Retirar del fuego, dejar reposar 1 minuto y añadir el scoop de proteína en polvo mezclando bien para evitar grumos.',
      'Servir en un bol y decorar con los arándanos frescos y un toque de canela.'
    ]
  },
  {
    id: 'rec_toast_eggs_avocado',
    type: 'breakfast',
    title: 'Tostadas de Masa Madre con Huevos Poché y Aguacate',
    description: 'Pan integral tostado con aguacate triturado, huevos camperos y semillas de chía.',
    prepTimeMinutes: 10,
    photoEmoji: '🥑',
    baseCalories: 480,
    baseProtein: 26,
    baseCarbs: 42,
    baseFat: 22,
    ingredients: [
      { name: 'Pan 100% integral o masa madre', quantity: 2, unit: 'rebanada', calories: 180, protein: 8, carbs: 32, fat: 2, category: 'cereales_legumbres' },
      { name: 'Huevos enteros camperos', quantity: 2, unit: 'ud', calories: 150, protein: 13, carbs: 1, fat: 10, category: 'lacteos_huevos' },
      { name: 'Aguacate maduro', quantity: 60, unit: 'g', calories: 100, protein: 1, carbs: 3, fat: 9, category: 'frutas_verduras' },
      { name: 'Tomate maduro', quantity: 50, unit: 'g', calories: 10, protein: 1, carbs: 2, fat: 0, category: 'frutas_verduras' },
      { name: 'Semillas de chía o sésamo', quantity: 5, unit: 'g', calories: 25, protein: 1, carbs: 1, fat: 2, category: 'despensa' }
    ],
    instructions: [
      'Tostar las rebanadas de pan de masa madre.',
      'Machacar el aguacate con una pizca de sal marina, pimienta y limón, y untar sobre las tostadas con rodajas finas de tomate.',
      'Cocinar los huevos a la plancha o poché y colocar encima. Espolvorear semillas de chía.'
    ]
  },
  {
    id: 'rec_greek_yogurt_crunch',
    type: 'breakfast',
    title: 'Bowl de Yogur Griego 0%, Plátano y Nueces',
    description: 'Yogur proteico cremoso con fruta fresca y frutos secos para energía sostenida.',
    prepTimeMinutes: 5,
    photoEmoji: '🍌',
    baseCalories: 430,
    baseProtein: 32,
    baseCarbs: 48,
    baseFat: 12,
    ingredients: [
      { name: 'Yogur griego 0% natural o skyr', quantity: 250, unit: 'g', calories: 140, protein: 25, carbs: 9, fat: 0, category: 'lacteos_huevos' },
      { name: 'Plátano maduro', quantity: 1, unit: 'ud', calories: 105, protein: 1, carbs: 27, fat: 0, category: 'frutas_verduras' },
      { name: 'Nueces peladas', quantity: 20, unit: 'g', calories: 135, protein: 3, carbs: 3, fat: 13, category: 'despensa' },
      { name: 'Miel pura de abeja', quantity: 10, unit: 'g', calories: 30, protein: 0, carbs: 8, fat: 0, category: 'despensa' }
    ],
    instructions: [
      'Añadir el yogur griego 0% a un bol.',
      'Cortar el plátano en rodajas y picar las nueces.',
      'Colocar encima del yogur y añadir un hilo de miel pura.'
    ]
  },

  // ALMUERZOS
  {
    id: 'rec_chicken_rice_veggies',
    type: 'lunch',
    title: 'Pechuga de Pollo a la Plancha con Arroz Jazmín y Brócoli',
    description: 'El clásico fitness por excelencia: proteína magra, carbohidrato complejo limpio y micronutrientes.',
    prepTimeMinutes: 20,
    photoEmoji: '🍗',
    baseCalories: 620,
    baseProtein: 52,
    baseCarbs: 68,
    baseFat: 12,
    ingredients: [
      { name: 'Pechuga de pollo fresca', quantity: 200, unit: 'g', calories: 240, protein: 46, carbs: 0, fat: 5, category: 'carniceria_pescaderia' },
      { name: 'Arroz basmati o jazmín (en crudo)', quantity: 80, unit: 'g', calories: 280, protein: 6, carbs: 62, fat: 1, category: 'cereales_legumbres' },
      { name: 'Brócoli fresco', quantity: 150, unit: 'g', calories: 50, protein: 4, carbs: 7, fat: 1, category: 'frutas_verduras' },
      { name: 'Aceite de oliva virgen extra', quantity: 8, unit: 'ml', calories: 72, protein: 0, carbs: 0, fat: 8, category: 'despensa' }
    ],
    instructions: [
      'Cocer el arroz en agua hirviendo con una pizca de sal durante 12-14 minutos.',
      'Cocer el brócoli al vapor durante 5 minutos para mantener sus nutrientes y textura crujiente.',
      'Cocinar la pechuga de pollo en la plancha bien caliente con el AOVE, sal, orégano y pimentón dulce hasta dorar.'
    ]
  },
  {
    id: 'rec_salmon_sweet_potato',
    type: 'lunch',
    title: 'Salmón Noruego al Horno con Boniato Asado y Espárragos',
    description: 'Rico en ácidos grasos Omega-3, carbohidratos de bajo índice glucémico y fibra.',
    prepTimeMinutes: 25,
    photoEmoji: '🐟',
    baseCalories: 650,
    baseProtein: 44,
    baseCarbs: 52,
    baseFat: 28,
    ingredients: [
      { name: 'Lomo de salmón fresco', quantity: 180, unit: 'g', calories: 360, protein: 36, carbs: 0, fat: 23, category: 'carniceria_pescaderia' },
      { name: 'Boniato / Batata dulce', quantity: 200, unit: 'g', calories: 170, protein: 3, carbs: 41, fat: 0, category: 'frutas_verduras' },
      { name: 'Espárragos verdes trigueros', quantity: 120, unit: 'g', calories: 25, protein: 3, carbs: 3, fat: 0, category: 'frutas_verduras' },
      { name: 'Aceite de oliva virgen extra', quantity: 8, unit: 'ml', calories: 72, protein: 0, carbs: 0, fat: 8, category: 'despensa' }
    ],
    instructions: [
      'Precalentar el horno a 200ºC. Cortar el boniato en rodajas finas o dados.',
      'Hornear el boniato durante 20 minutos con una pizca de sal y romero.',
      'Añadir el lomo de salmón y los espárragos en la bandeja, rociar con AOVE y hornear 10-12 minutos más.'
    ]
  },
  {
    id: 'rec_beef_pasta_mediterranean',
    type: 'lunch',
    title: 'Pasta Integral con Ternera Magra y Salsa de Tomate Casera',
    description: 'Carbohidratos de asimilación progresiva con carne de ternera rica en hierro y creatina natural.',
    prepTimeMinutes: 20,
    photoEmoji: '🍝',
    baseCalories: 640,
    baseProtein: 48,
    baseCarbs: 74,
    baseFat: 14,
    ingredients: [
      { name: 'Carne picada de ternera magra (<5% grasa)', quantity: 180, unit: 'g', calories: 235, protein: 38, carbs: 0, fat: 8, category: 'carniceria_pescaderia' },
      { name: 'Pasta integral (plumas o espaguetis en crudo)', quantity: 80, unit: 'g', calories: 280, protein: 10, carbs: 58, fat: 2, category: 'cereales_legumbres' },
      { name: 'Tomate triturado natural', quantity: 150, unit: 'g', calories: 35, protein: 2, carbs: 6, fat: 0, category: 'frutas_verduras' },
      { name: 'Cebolla picada', quantity: 50, unit: 'g', calories: 20, protein: 1, carbs: 4, fat: 0, category: 'frutas_verduras' },
      { name: 'Aceite de oliva virgen extra', quantity: 8, unit: 'ml', calories: 72, protein: 0, carbs: 0, fat: 8, category: 'despensa' }
    ],
    instructions: [
      'Cocer la pasta integral en abundante agua con sal al dente.',
      'Sofreír la cebolla picada con el AOVE y añadir la ternera magra sazonada con ajo y pimienta.',
      'Verter el tomate triturado y orégano, cocinar 5 minutos e integrar con la pasta escurrida.'
    ]
  },

  // MERIENDAS / SNACKS
  {
    id: 'rec_rice_cakes_turkey_cheese',
    type: 'snack',
    title: 'Tortitas de Arroz con Pavo y Queso Fresco Batido',
    description: 'Snack rápido y ligero para recargar glucógeno y aminoácidos entre comidas.',
    prepTimeMinutes: 3,
    photoEmoji: '🥪',
    baseCalories: 280,
    baseProtein: 25,
    baseCarbs: 32,
    baseFat: 4,
    ingredients: [
      { name: 'Tortitas de arroz inflado integral', quantity: 4, unit: 'ud', calories: 120, protein: 3, carbs: 26, fat: 1, category: 'cereales_legumbres' },
      { name: 'Pechuga de pavo (>90% carne)', quantity: 80, unit: 'g', calories: 75, protein: 16, carbs: 1, fat: 1, category: 'carniceria_pescaderia' },
      { name: 'Queso fresco batido 0% o requesón', quantity: 100, unit: 'g', calories: 50, protein: 8, carbs: 4, fat: 0, category: 'lacteos_huevos' },
      { name: 'Manzana verde', quantity: 1, unit: 'ud', calories: 55, protein: 0, carbs: 14, fat: 0, category: 'frutas_verduras' }
    ],
    instructions: [
      'Untar las tortitas de arroz con el queso fresco batido.',
      'Colocar las lonchas de pechuga de pavo encima.',
      'Acompañar con la manzana en gajos crujientes.'
    ]
  },
  {
    id: 'rec_protein_shake_banana_pb',
    type: 'snack',
    title: 'Batido Anabólico de Proteína, Plátano y Crema de Cacahuete',
    description: 'Post-entreno o merienda densa en nutrientes con digestión óptima.',
    prepTimeMinutes: 4,
    photoEmoji: '🥤',
    baseCalories: 380,
    baseProtein: 34,
    baseCarbs: 38,
    baseFat: 10,
    ingredients: [
      { name: 'Proteína Whey Isolate', quantity: 30, unit: 'g', calories: 115, protein: 26, carbs: 1, fat: 1, category: 'suplementacion' },
      { name: 'Plátano mediano', quantity: 1, unit: 'ud', calories: 105, protein: 1, carbs: 27, fat: 0, category: 'frutas_verduras' },
      { name: 'Crema de cacahuete 100% pura', quantity: 15, unit: 'g', calories: 95, protein: 4, carbs: 2, fat: 8, category: 'despensa' },
      { name: 'Leche desnatada o bebida vegetal', quantity: 250, unit: 'ml', calories: 85, protein: 8, carbs: 12, fat: 0, category: 'lacteos_huevos' }
    ],
    instructions: [
      'Colocar todos los ingredientes en el vaso de la batidora con un par de hielos.',
      'Triturar durante 40 segundos a máxima potencia hasta lograr textura cremosa y suave.'
    ]
  },

  // CENAS
  {
    id: 'rec_hake_salad_potato',
    type: 'dinner',
    title: 'Merluza al Horno con Patata Cocida y Ensalada Mediterránea',
    description: 'Cena ligera, digestiva y alta en proteína para optimizar la recuperación nocturna.',
    prepTimeMinutes: 20,
    photoEmoji: '🥗',
    baseCalories: 490,
    baseProtein: 42,
    baseCarbs: 45,
    baseFat: 14,
    ingredients: [
      { name: 'Filete de merluza o bacalao fresco', quantity: 220, unit: 'g', calories: 180, protein: 38, carbs: 0, fat: 2, category: 'carniceria_pescaderia' },
      { name: 'Patata mediana para cocer', quantity: 200, unit: 'g', calories: 150, protein: 4, carbs: 34, fat: 0, category: 'frutas_verduras' },
      { name: 'Mezcla de lechugas y canónigos', quantity: 100, unit: 'g', calories: 18, protein: 1, carbs: 3, fat: 0, category: 'frutas_verduras' },
      { name: 'Tomates cherry', quantity: 80, unit: 'g', calories: 15, protein: 1, carbs: 3, fat: 0, category: 'frutas_verduras' },
      { name: 'Aceite de oliva virgen extra', quantity: 12, unit: 'ml', calories: 108, protein: 0, carbs: 0, fat: 12, category: 'despensa' }
    ],
    instructions: [
      'Cocer la patata con piel en agua hirviendo durante 18 minutos hasta que esté tierna.',
      'Cocinar la merluza a la plancha con unas gotas de limón, sal marina y ajo en polvo.',
      'Servir junto a la patata en rodajas y la ensalada aliñada con el AOVE y vinagre de manzana.'
    ]
  },
  {
    id: 'rec_french_omelette_veggies',
    type: 'dinner',
    title: 'Tortilla Francesa de 3 Huevos con Espinacas y Atún Claro',
    description: 'Baja en carbohidratos, saciante y rica en aminoácidos para la síntesis de proteína nocturna.',
    prepTimeMinutes: 12,
    photoEmoji: '🍳',
    baseCalories: 440,
    baseProtein: 45,
    baseCarbs: 8,
    baseFat: 24,
    ingredients: [
      { name: 'Huevos enteros camperos', quantity: 2, unit: 'ud', calories: 150, protein: 13, carbs: 1, fat: 10, category: 'lacteos_huevos' },
      { name: 'Claras de huevo pasteurizadas', quantity: 100, unit: 'g', calories: 50, protein: 11, carbs: 1, fat: 0, category: 'lacteos_huevos' },
      { name: 'Lata de atún claro al natural', quantity: 80, unit: 'g', calories: 85, protein: 19, carbs: 0, fat: 1, category: 'carniceria_pescaderia' },
      { name: 'Espinacas frescas', quantity: 80, unit: 'g', calories: 18, protein: 2, carbs: 2, fat: 0, category: 'frutas_verduras' },
      { name: 'Aceite de oliva virgen extra', quantity: 8, unit: 'ml', calories: 72, protein: 0, carbs: 0, fat: 8, category: 'despensa' }
    ],
    instructions: [
      'Saltear las espinacas en la sartén con unas gotas de AOVE durante 2 minutos.',
      'Batir los 2 huevos junto con las claras y añadir el atún escurrido y las espinacas.',
      'Cuajar la tortilla en la sartén a fuego medio hasta que quede jugosa por dentro.'
    ]
  }
];
