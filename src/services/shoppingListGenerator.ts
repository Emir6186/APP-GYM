import type { IngredientCategory, ShoppingItem, WeeklyDietPlan } from '../types/nutrition';

export const CATEGORY_LABELS: Record<IngredientCategory, { label: string; icon: string; color: string }> = {
  frutas_verduras: { label: 'Frutería y Verduras', icon: '🥑', color: 'text-emerald-400' },
  carniceria_pescaderia: { label: 'Carnicería y Pescadería', icon: '🥩', color: 'text-rose-400' },
  lacteos_huevos: { label: 'Lácteos, Huevos y Refrigerados', icon: '🥚', color: 'text-amber-400' },
  cereales_legumbres: { label: 'Cereales, Avena y Pastas', icon: '🌾', color: 'text-yellow-400' },
  despensa: { label: 'Aceites, Especias y Despensa', icon: '🧂', color: 'text-blue-400' },
  suplementacion: { label: 'Suplementación Deportiva', icon: '⚡', color: 'text-purple-400' }
};

/**
 * Genera una lista de la compra consolidada a partir de los días del plan nutricional semanal
 */
export function generateShoppingListFromPlan(plan: WeeklyDietPlan, existingItems: ShoppingItem[] = []): ShoppingItem[] {
  const itemMap = new Map<string, { quantity: number; unit: string; category: IngredientCategory; originalName: string }>();

  // Recorremos todos los días y comidas del plan semanal
  Object.values(plan.days).forEach(day => {
    day.meals.forEach(meal => {
      meal.ingredients.forEach(ing => {
        const key = `${ing.name.trim().toLowerCase()}_${ing.unit}`;
        if (itemMap.has(key)) {
          const current = itemMap.get(key)!;
          current.quantity += ing.quantity;
        } else {
          itemMap.set(key, {
            originalName: ing.name.trim(),
            quantity: ing.quantity,
            unit: ing.unit,
            category: ing.category
          });
        }
      });
    });
  });

  // Mantenemos el estado de checked si ya existía un ítem previo
  const existingCheckedMap = new Map<string, boolean>();
  existingItems.forEach(item => {
    if (!item.isCustom) {
      existingCheckedMap.set(item.name.toLowerCase(), item.isChecked);
    }
  });

  // Convertimos a array de ShoppingItem
  const generatedItems: ShoppingItem[] = Array.from(itemMap.entries()).map(([key, data]) => {
    return {
      id: `shop_${key.replace(/[^a-z0-9]/g, '_')}`,
      name: data.originalName,
      quantity: Math.round(data.quantity),
      unit: data.unit,
      category: data.category,
      isChecked: existingCheckedMap.get(data.originalName.toLowerCase()) || false,
      isCustom: false
    };
  });

  // Añadimos los ítems custom que el usuario haya agregado manualmente
  const customItems = existingItems.filter(item => item.isCustom);

  // Ordenamos por categoría
  const categoryOrder: IngredientCategory[] = [
    'frutas_verduras',
    'carniceria_pescaderia',
    'lacteos_huevos',
    'cereales_legumbres',
    'despensa',
    'suplementacion'
  ];

  return [...generatedItems, ...customItems].sort((a, b) => {
    const orderA = categoryOrder.indexOf(a.category);
    const orderB = categoryOrder.indexOf(b.category);
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Formatea la lista de la compra a texto plano / formato WhatsApp para compartir
 */
export function formatShoppingListForWhatsApp(items: ShoppingItem[], planName: string): string {
  const dateStr = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  let text = `🛒 *LISTA DE LA COMPRA - ${planName.toUpperCase()}*\n📅 _Generada el ${dateStr}_\n\n`;

  const categorized: Partial<Record<IngredientCategory, ShoppingItem[]>> = {};

  items.forEach(item => {
    if (!categorized[item.category]) {
      categorized[item.category] = [];
    }
    categorized[item.category]!.push(item);
  });

  (Object.keys(CATEGORY_LABELS) as IngredientCategory[]).forEach(cat => {
    const list = categorized[cat];
    if (list && list.length > 0) {
      const meta = CATEGORY_LABELS[cat];
      text += `${meta.icon} *${meta.label.toUpperCase()}*\n`;
      list.forEach(item => {
        const check = item.isChecked ? '✅ ~' : '◻️ ';
        const close = item.isChecked ? '~' : '';
        text += `${check}${item.name}: ${item.quantity} ${item.unit}${close}\n`;
      });
      text += '\n';
    }
  });

  const totalItems = items.length;
  const completedItems = items.filter(i => i.isChecked).length;
  text += `📊 Progreso: ${completedItems}/${totalItems} comprados.\n💪 ¡A cumplir los objetivos de nutrición!`;

  return text;
}
