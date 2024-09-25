import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface CategoryInputProps {
  value: string;
  onChange: (value: string) => void;
  categories: string[];
}

export const CategoryInput: React.FC<CategoryInputProps> = ({
  value,
  onChange,
  categories,
}) => {
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    setIsCustom(!categories.includes(value));
  }, [value, categories]);

  return (
    <div className="flex space-x-2">
      {isCustom ? (
        <Input
          type="text"
          placeholder="New category"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-grow bg-black border-white rounded-none font-mono text-sm"
        />
      ) : (
        <Select value={value} onValueChange={(val) => onChange(val)}>
          <SelectTrigger className="flex-grow bg-black border-white rounded-none font-mono text-sm">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
            <SelectItem value="__new__">Add new category</SelectItem>
          </SelectContent>
        </Select>
      )}
      <button
        onClick={() => setIsCustom(!isCustom)}
        className="px-3 py-2 bg-red-600 text-gray-300 font-mono text-sm"
      >
        {isCustom ? 'Select' : 'Custom'}
      </button>
    </div>
  );
};
