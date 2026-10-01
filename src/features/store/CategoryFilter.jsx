import styles from './CategoryFilter.module.css';

/**
 * 카테고리 칩 필터
 *
 * Props:
 *   categories: string[]                     — 표시할 카테고리 목록 ('전체' 포함)
 *   selectedCategory: string                 — 현재 선택된 카테고리
 *   onSelectCategory: (category: string) => void
 */
function CategoryFilter({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className={styles.chips} role="tablist" aria-label="카테고리">
      {categories.map((category) => {
        const active = category === selectedCategory;
        return (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={active}
            className={`${styles.chip} ${active ? styles.active : ''}`}
            onClick={() => onSelectCategory(category)}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}

export default CategoryFilter;
