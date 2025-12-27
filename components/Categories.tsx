import React, { useState } from 'react';
import { Category } from '../types';
import { Plus, Trash2, Tag } from 'lucide-react';
import { generateId, cn } from '../utils';

interface CategoriesProps {
  categories: Category[];
  onAdd: (category: Category) => void;
  onDelete: (id: string) => void;
}

const COLORS = [
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Orange', value: 'bg-orange-500' },
  { name: 'Amber', value: 'bg-amber-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Emerald', value: 'bg-emerald-500' },
  { name: 'Teal', value: 'bg-teal-500' },
  { name: 'Cyan', value: 'bg-cyan-500' },
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Indigo', value: 'bg-indigo-500' },
  { name: 'Violet', value: 'bg-violet-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Fuchsia', value: 'bg-fuchsia-500' },
  { name: 'Pink', value: 'bg-pink-500' },
  { name: 'Rose', value: 'bg-rose-500' },
  { name: 'Slate', value: 'bg-slate-500' },
];

const Categories: React.FC<CategoriesProps> = ({ categories, onAdd, onDelete }) => {
  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAdd({
      id: generateId(),
      name: newName.trim(),
      color: selectedColor
    });
    setNewName('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Center of Categories</h2>
        <p className="text-slate-500 text-sm dark:text-slate-400">Organize your thoughts and tasks by tags.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Create Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800 h-fit">
          <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2">
            <Plus className="w-5 h-5" /> New Category
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Work, Personal, Project X"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-red-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">Color Tag</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setSelectedColor(c.value)}
                    className={cn(
                      "w-6 h-6 rounded-full transition-transform hover:scale-110",
                      c.value,
                      selectedColor === c.value ? "ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-600 scale-110" : ""
                    )}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!newName.trim()}
              className="w-full bg-slate-900 text-white py-2 rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-red-600 dark:hover:bg-red-700"
            >
              Create Category
            </button>
          </form>
        </div>

        {/* List */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold mb-4 dark:text-white">Existing Tags</h3>
          {categories.length === 0 && (
             <p className="text-slate-400 text-sm italic">No categories defined yet.</p>
          )}
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800 group">
              <div className="flex items-center gap-3">
                <div className={cn("w-4 h-4 rounded-full", cat.color)} />
                <span className="font-medium text-slate-700 dark:text-slate-200">{cat.name}</span>
              </div>
              <button
                onClick={() => onDelete(cat.id)}
                className="text-slate-400 hover:text-red-500 transition-colors p-2"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;