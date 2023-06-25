import React from 'react';
import Card from '../Components/Card';

const Home = ({
  items,
  searchValue,
  setSearchValue,
  onChangeSearchInput,
  onAddToFavorite,
  onAddToCart,
  isItemFavorite,
  isLoading,
}) => {
  const renderItems = () => {
    const filteredItems = items.filter(item => item.title.toLowerCase().includes(searchValue.toLowerCase()));
    return (isLoading ? [...Array(8)] : filteredItems).map((item, index) => {
      return (
        <Card
          key={isLoading ? index : item.id}
          onFavorite={obj => onAddToFavorite(obj)}
          onPlus={obj => onAddToCart(obj)}
          favorite={!isLoading && isItemFavorite(item.id)}
          loading={isLoading}
          {...item}
        />
      );
    });
  };

  return (
    <div className="content p-40">
      <div className="d-flex align-center justify-between mb-40">
        <h1>{searchValue ? `Пошук за запитом: "${searchValue}"` : 'Усі кросівки'}</h1>
        <div className="search-block">
          <img src="/img/search.svg" alt="Search" />
          {searchValue && (
            <button className="clear cu-p" onClick={() => setSearchValue('')}>
              <img src="/img/btn-remove.svg" alt="Clear" />
            </button>
          )}
          <input type="text" placeholder="Пошук..." value={searchValue} onChange={onChangeSearchInput} />
        </div>
      </div>
      <div className="d-flex flex-wrap">{renderItems()}</div>
    </div>
  );
};

export default Home;
