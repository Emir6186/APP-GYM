import React, { useState } from 'react';
import { ShoppingCart, Check, Plus, Trash2, RefreshCw, MessageSquare } from 'lucide-react';
import type { IngredientCategory } from '../../types/nutrition';
import { useNutrition } from '../../context/NutritionContext';
import { CATEGORY_LABELS, formatShoppingListForWhatsApp } from '../../services/shoppingListGenerator';
import { AddItemModal } from './AddItemModal';

export const ShoppingListView: React.FC = () => {
  const {
    shoppingList,
    dietPlan,
    toggleShoppingItem,
    addCustomShoppingItem,
    deleteShoppingItem,
    clearCheckedShoppingItems,
    regenerateShoppingList
  } = useNutrition();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  const totalItems = shoppingList.length;
  const completedItems = shoppingList.filter(i => i.isChecked).length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Agrupar ítems por categoría
  const categorized: Partial<Record<IngredientCategory, typeof shoppingList>> = {};
  shoppingList.forEach(item => {
    if (!categorized[item.category]) {
      categorized[item.category] = [];
    }
    categorized[item.category]!.push(item);
  });

  const categoriesOrder = Object.keys(CATEGORY_LABELS) as IngredientCategory[];

  const handleShareWhatsApp = () => {
    const message = formatShoppingListForWhatsApp(shoppingList, dietPlan.name);
    
    // Copiar al portapapeles
    navigator.clipboard.writeText(message).then(() => {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    });

    // Abrir WhatsApp con el texto codificado
    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Toast de copiado */}
      {copiedToast && (
        <div className="fixed top-16 left-4 right-4 z-50 max-w-md mx-auto p-3 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center justify-center gap-2 animate-bounce">
          <Check className="w-4 h-4 stroke-[3]" />
          ¡Lista copiada al portapapeles y abierta en WhatsApp!
        </div>
      )}

      {/* Tarjeta de Resumen y Progreso */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-100 leading-tight">
                  Lista de la Compra
                </h2>
                <p className="text-[11px] text-slate-400">
                  Ingredientes calculados del plan semanal
                </p>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xl font-black text-emerald-400 font-mono-numbers">
              {completedItems} / {totalItems}
            </span>
            <span className="text-[10px] text-slate-400 block -mt-1 font-semibold">artículos</span>
          </div>
        </div>

        {/* Barra de progreso de la compra */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Progreso en el supermercado</span>
            <span className="font-bold text-emerald-400 font-mono-numbers">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Añadir Extra
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="py-2.5 px-3.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 font-bold text-xs border border-emerald-500/40 flex items-center justify-center gap-1.5 transition"
            title="Compartir lista completa por WhatsApp"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={regenerateShoppingList}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Sincronizar con el plan de comidas"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {completedItems > 0 && (
            <button
              onClick={clearCheckedShoppingItems}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
              title="Borrar artículos ya comprados"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Lista de Secciones del Supermercado */}
      <div className="space-y-4">
        {totalItems === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-slate-400">
            <ShoppingCart className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <h3 className="text-sm font-bold text-slate-300">Tu lista está vacía</h3>
            <p className="text-xs text-slate-500 mt-1">Genera un menú semanal en la pestaña "Comidas" o pulsa "Sincronizar".</p>
          </div>
        ) : (
          categoriesOrder.map(catKey => {
            const items = categorized[catKey];
            if (!items || items.length === 0) return null;

            const meta = CATEGORY_LABELS[catKey];
            const catCompleted = items.filter(i => i.isChecked).length;

            return (
              <div
                key={catKey}
                className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-md"
              >
                {/* Cabecera del Pasillo */}
                <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{meta.icon}</span>
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${meta.color}`}>
                      {meta.label}
                    </h3>
                  </div>

                  <span className="text-[11px] font-mono-numbers text-slate-400 font-semibold">
                    {catCompleted}/{items.length}
                  </span>
                </div>

                {/* Ítems del pasillo */}
                <div className="divide-y divide-slate-800/60">
                  {items.map(item => (
                    <div
                      key={item.id}
                      onClick={() => toggleShoppingItem(item.id)}
                      className={`p-3 flex items-center justify-between cursor-pointer transition ${
                        item.isChecked
                          ? 'bg-emerald-950/10 text-slate-500'
                          : 'hover:bg-slate-800/40 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0 pr-2">
                        {/* Checkbox */}
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition flex-shrink-0 ${
                          item.isChecked
                            ? 'bg-emerald-500 text-slate-950 shadow'
                            : 'border border-slate-700 bg-slate-950 text-transparent'
                        }`}>
                          <Check className={`w-3.5 h-3.5 stroke-[3] ${item.isChecked ? 'text-slate-950' : 'hidden'}`} />
                        </div>

                        {/* Nombre del ítem */}
                        <span className={`text-xs font-medium truncate ${
                          item.isChecked ? 'line-through text-slate-500' : 'text-slate-100'
                        }`}>
                          {item.name}
                          {item.isCustom && (
                            <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              Extra
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Cantidad y botón borrar si es custom */}
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className={`text-xs font-bold font-mono-numbers px-2.5 py-1 rounded-lg ${
                          item.isChecked
                            ? 'bg-slate-950 text-slate-600'
                            : 'bg-slate-950 text-emerald-400 border border-slate-800'
                        }`}>
                          {item.quantity} {item.unit}
                        </span>

                        {item.isCustom && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteShoppingItem(item.id);
                            }}
                            className="p-1 text-slate-500 hover:text-rose-400"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Añadir Producto Extra */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddItem={(item) => addCustomShoppingItem(item)}
      />
    </div>
  );
};
