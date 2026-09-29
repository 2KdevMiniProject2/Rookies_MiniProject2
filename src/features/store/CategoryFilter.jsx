import React from 'react';

const CATEGORIES = ['전체', '카페/디저트', '베이커리', '패스트푸드', '한식'];

function CategoryFilter({ selectedCategory, onSelectCategory }) {
  return (
    <div className="chip-container">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelectCategory(cat)}
          className={`chip ${selectedCategory === cat ? 'active' : ''}`}
        >
          {cat === '전체' && '✨ '}
          {cat === '카페/디저트' && '☕ '}
          {cat === '베이커리' && '🥐 '}
          {cat === '패스트푸드' && '🍔 '}
          {cat === '한식' && '🍲 '}
          {cat}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;
