import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type { IngredientCategory, ShoppingItem } from '../../types/nutrition';
import { Modal } from '../common/Modal';
import { CATEGORY_LABELS } from '../../services/shoppingListGenerator';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: Omit<ShoppingItem, 'id' | 'isChecked' | 'isCustom'>) => void;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onAddItem
}) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('ud');
  const [category, setCategory] = useState<IngredientCategory>('despensa');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddItem({
      name: name.trim(),
      quantity: parseFloat(quantity) || 1,
      unit: unit.trim() || 'ud',
      category
    });

    setName('');
    setQuantity('1');
    setUnit('ud');
    setCategory('despensa');
    onClose();
  };

  const categories = Object.keys(CATEGORY_LABELS) as IngredientCategory[];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Añadir Producto a la Compra"
      subtitle="Artículo extra no incluido en la dieta"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Nombre del Producto *
          </label>
          <input
            type="text"
            required
            placeholder="Ej: Café en grano, Agua mineral..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Cantidad y Unidad */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Cantidad
            </label>
            <input
              type="number"
              min="0.1"
              step="any"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono-numbers focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Unidad (g, ml, ud, pack...)
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="ud">Unidades (ud)</option>
              <option value="g">Gramos (g)</option>
              <option value="kg">Kilos (kg)</option>
              <option value="ml">Mililitros (ml)</option>
              <option value="L">Litros (L)</option>
              <option value="pack">Pack / Caja</option>
            </select>
          </div>
        </div>

        {/* Categoría / Pasillo del Supermercado */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Pasillo del Supermercado
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {categories.map(cat => {
              const meta = CATEGORY_LABELS[cat];
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition text-left ${
                    category === cat
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-base">{meta.icon}</span>
                  <span className="truncate text-[11px]">{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Añadir a la Lista
          </button>
        </div>
      </form>
    </Modal>
  );
};
