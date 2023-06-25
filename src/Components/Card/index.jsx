import React, { Fragment, useContext } from 'react';
import styles from './Card.module.scss';
import ContentLoader from 'react-content-loader';
import AppContext from '../../context';

const Card = ({ id, title, imageUrl, price, onFavorite, onPlus, favorite = false, loading = false }) => {
  const { isItemAdded } = useContext(AppContext);
  const obj = { id, parentId: id, title, imageUrl, price };

  const onClickPlus = () => onPlus(obj);

  const onClickFavorite = () => {
    onFavorite(obj);
  };

  return (
    <div className={styles.card}>
      {loading ? (
        <ContentLoader
          speed={2}
          width={155}
          height={250}
          viewBox="0 0 155 265"
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb">
          <rect x="0" y="0" rx="10" ry="10" width="155" height="140" />
          <rect x="0" y="167" rx="5" ry="5" width="155" height="15" />
          <rect x="0" y="187" rx="5" ry="5" width="100" height="15" />
          <rect x="0" y="234" rx="5" ry="5" width="80" height="25" />
          <rect x="124" y="230" rx="10" ry="10" width="32" height="32" />
        </ContentLoader>
      ) : (
        <Fragment>
          {onFavorite && (
            <button className={`button ${styles.favorite}`} onClick={onClickFavorite}>
              <img src={`/img/${favorite ? 'liked.svg' : 'unlike.svg'}`} alt={favorite ? 'Liked' : 'Unlike'} />
            </button>
          )}
          <img width="100%" height={130} src={imageUrl} alt="Sneakers" />
          <h5>{title}</h5>
          <div className="d-flex justify-between align-center">
            <div className="d-flex flex-column">
              <span>Ціна:</span>
              <b>{price} Грн.</b>
            </div>
            {onPlus && (
              <button className="button" onClick={onClickPlus}>
                <img
                  src={`/img/btn-${isItemAdded(id) ? 'checked.svg' : 'plus.svg'}`}
                  alt={isItemAdded(id) ? 'Checked' : 'Plus'}
                />
              </button>
            )}
          </div>
        </Fragment>
      )}
    </div>
  );
};

export default Card;
