import React from 'react';

export function DamageTypeIndicator({ type, showLabel = true }) {
  const getDamageColor = (damageType) => {
    const type = typeof damageType === 'string' ? parseInt(damageType, 10) : damageType;
    switch (type) {
      case 0: return '#22c55e'; // Scratch - green
      case 1: return '#eab308'; // Dent - yellow
      case 2: return '#ef4444'; // Broken - red
      default: return '#22c55e';
    }
  };

  const getDamageLabel = (damageType) => {
    const type = typeof damageType === 'string' ? parseInt(damageType, 10) : damageType;
    switch (type) {
      case 0: return 'Scratch';
      case 1: return 'Dent';
      case 2: return 'Broken';
      default: return `Type ${damageType}`;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div 
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: getDamageColor(type) }}
      />
      {showLabel && (
        <span className="text-sm text-gray-600">
          {getDamageLabel(type)}
        </span>
      )}
    </div>
  );
}