const { readFileSync, writeFileSync } = require('fs');
const protocol = process.env.HTTP || 'http';
const { createServer } = require(protocol);
const path = require('path');

const options = {};
if (protocol === 'https') {
  const certDir = '/etc/nginx/acme.sh';
  options['key'] = readFileSync(`${certDir}/rootdiv.ru/privkey.pem`);
  options['cert'] = readFileSync(`${certDir}/rootdiv.ru/fullchain.pem`);
}

// файл для бази даних
const DB_FILE = process.env.DB_FILE || path.resolve(__dirname, 'db.json');
// Номер порту, на якому буде запущено сервер
const PORT = process.env.PORT || 1721;
// префікс URI всім методів докладання
const URI_PREFIX = '/sneakers';

class ApiError extends Error {
  constructor(statusCode, data) {
    super();
    this.statusCode = statusCode;
    this.data = data;
  }
}

const getItemsList = () => {
  const sneakers = JSON.parse(readFileSync(DB_FILE) || '[]');
  return sneakers;
};

const getItems = (item = 'items') => {
  const sneakers = JSON.parse(readFileSync(DB_FILE) || '[]');
  return sneakers[item];
};

const getJsonData = req => {
  return new Promise(resolve => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      resolve(JSON.parse(data));
    });
  });
};

const createItems = (item, data) => {
  const items = getItemsList();
  items[item].push(data);
  writeFileSync(DB_FILE, JSON.stringify(items), {
    encoding: 'utf8',
  });
  return items[item];
};

const deleteItems = (item, itemId) => {
  const data = getItemsList();
  const itemIndex = data[item].findIndex(({ id }) => id === Number(itemId));
  if (itemIndex === -1) throw new ApiError(404, { message: 'Items Not Found' });
  data[item].splice(itemIndex, 1);
  writeFileSync(DB_FILE, JSON.stringify(data), { encoding: 'utf8' });
  return data[item];
};

// створюємо HTTP сервер, передана функція буде реагувати попри всі запити щодо нього
createServer(options, async (req, res) => {
// req - об'єкт з інформацією про запит, res - об'єкт для управління відповіддю, що відправляється

// цей заголовок відповіді показує, що тіло відповіді буде в форматі JSON
  res.setHeader('Content-Type', 'application/json');

  // CORS заголовки відповіді для підтримки крос-доменних запитів із браузера
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

// запит із методом OPTIONS може надсилати браузер автоматично для перевірки CORS заголовків
  // у цьому випадку достатньо відповісти з порожнім тілом та цими заголовками
  if (req.method === 'OPTIONS') {
    // end = закінчити формувати відповідь і надіслати її клієнту
    res.end();
    return;
  }

// якщо URI не починається з потрібного префікса - можемо відразу віддати 404
  if (!req.url || !req.url.startsWith(URI_PREFIX)) {
    res.statusCode = 404;
    res.end(JSON.stringify({ message: 'Not Found' }));
    return;
  }

  const uri = req.url.substring(URI_PREFIX.length);

  try {
// обробляємо запит та формуємо тіло відповіді
    const body = await (async () => {
      if (uri === '' || uri === '/items') {
        if (req.method === 'GET') return getItems();
      }
      if (uri.includes('favorites')) {
        const [fav, itemId] = uri.substring(1).split('/');
        if (req.method === 'GET') return getItems(fav);
        if (req.method === 'POST') return createItems(fav, await getJsonData(req));
        if (req.method === 'DELETE') return deleteItems(fav, itemId);
      }
      if (uri.includes('orders')) {
        const [orders, itemId] = uri.substring(1).split('/');
        if (req.method === 'GET') return getItems(orders);
        if (req.method === 'POST') return createItems(orders, await getJsonData(req));
        if (req.method === 'DELETE') return deleteItems(orders, itemId);
      }
      if (uri.includes('cart')) {
        const [cart, itemId] = uri.substring(1).split('/');
        if (req.method === 'GET') return getItems(cart);
        if (req.method === 'POST') return createItems(cart, await getJsonData(req));
        if (req.method === 'DELETE') return deleteItems(cart, itemId);
      }
      return null;
    })();
    res.end(JSON.stringify(body));
  } catch (err) {
    // обробляємо згенеровану нами помилку
    if (err instanceof ApiError) {
      res.writeHead(err.statusCode);
      res.end(JSON.stringify(err.data));
    } else {
      // якщо щось пішло не так - пишемо про це в консоль і повертаємо помилку 500 сервера
      res.statusCode = 500;
      res.end(JSON.stringify({ message: 'Server Error' }));
      console.error(err);
    }
  }
})

  .on('listening', () => {
    if (protocol !== 'https') {
      console.log(`Сервер запущен. Вы можете использовать его по адресу http://localhost:${PORT}`);
      console.log('Нажмите CTRL+C, чтобы остановить сервер');
    }
  })
// ...і викликаємо запуск сервера на вказаному порту
  .listen(PORT);
