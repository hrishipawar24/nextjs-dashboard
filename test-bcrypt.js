const bcrypt = require('bcrypt');

const password = '123456';
const hash = '$2b$10$ebeXt7yXlHuhRa.IbClUDunEIc3P14PQ35TvdJ7MEuBiKu1X8NDcO';

async function test() {
  try {
    const match = await bcrypt.compare(password, hash);
    console.log('Match:', match);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
