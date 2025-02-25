import React, { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { getGenreCategories } from '../data/genres';

interface GenreMatrixProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: string, category: string, subgenre: string) => void;
  selectedCategory?: string;
  selectedSubgenre?: string;
}

const GenreMatrix: React.FC<GenreMatrixProps> = ({ 
  isOpen, 
  onClose, 
  onSelect,
  selectedCategory,
  selectedSubgenre 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const categories = getGenreCategories();
  
  const filteredGenres = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    
    return Object.entries(categories)
      .map(([category, subgenres]) => ({
        category,
        subgenres: subgenres.filter(subgenre => {
          const fullName = `${category} ${subgenre}`.toLowerCase();
          return fullName.includes(searchLower);
        }),
        totalItems: subgenres.length + 1
      }))
      .filter(genre => genre.subgenres.length > 0)
      .sort((a, b) => b.totalItems - a.totalItems);
  }, [categories, searchTerm]);

  const { columns } = useMemo(() => {
    const cols: typeof filteredGenres[] = [[], [], [], []];
    const columnHeights = [0, 0, 0, 0];

    filteredGenres.forEach((genre) => {
      const minHeight = Math.min(...columnHeights);
      const columnIndex = columnHeights.indexOf(minHeight);
      cols[columnIndex].push(genre);
      columnHeights[columnIndex] += genre.totalItems;
    });

    return { columns: cols };
  }, [filteredGenres]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="surface-secondary max-w-7xl mx-auto">
          <div className="p-4 border-b border-[#1F1F1F] flex items-center justify-between">
            <h2 className="text-2xl font-bold">Genre Templates</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#1F1F1F] rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 border-b border-[#1F1F1F]">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search templates..."
                className="w-full px-4 py-2 pl-10 bg-[#1F1F1F] text-[#E0E0E0] placeholder-[#808080] focus:outline-none focus:ring-2 focus:ring-[#03A9F4]"
              />
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#808080]" />
            </div>
          </div>
          
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {columns.map((column, columnIndex) => (
              <div key={columnIndex} className="space-y-4">
                {column.map(({ category, subgenres }) => (
                  <div key={category} className="surface-tertiary">
                    <h3 className="font-semibold px-3 py-2 bg-[#1F1F1F]">
                      {category}
                    </h3>
                    <div className="divide-y divide-[#1F1F1F]">
                      {subgenres.map((subgenre) => {
                        const isSelected = category === selectedCategory && subgenre === selectedSubgenre;
                        return (
                          <button
                            key={subgenre}
                            className={`w-full text-left px-3 py-2 text-sm ${
                              isSelected 
                                ? 'bg-[#03A9F4] text-white hover:bg-[#29B6F6]' 
                                : 'text-secondary hover:bg-[#1F1F1F] hover:text-[#E0E0E0]'
                            } transition-colors`}
                            onClick={() => {
                              onSelect(`${category} - ${subgenre}`, category, subgenre);
                            }}
                          >
                            {subgenre}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          {filteredGenres.length === 0 && (
            <div className="p-8 text-center text-secondary">
              No templates found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenreMatrix;