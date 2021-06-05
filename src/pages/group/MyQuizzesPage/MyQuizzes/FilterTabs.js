import React from 'react';


const FilterTabs = ({ filters, activeFilter, onSelectFilter }) => (
  <div className="tabs mb-2">
    { 
      filters.map(f => 
        <FilterLink 
          key={ f } 
          name={ f } 
          isActive={ f === activeFilter }
          onClick={ () => onSelectFilter(f) }
        />
      )
    }
  </div>
)

const FilterLink = ({ name, isActive, onClick }) => {
  return (
    <button className={`tabs__button ${isActive ? "tabs__button--active" : ""}`}
      onClick={ onClick }
    >
      { name[0].toUpperCase() + name.slice(1) }
    </button>
  )
}

export default FilterTabs;