const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const historyFile = path.join(dataDir, 'history.json');

// Ensure data dir exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function readHistory() {
  if (!fs.existsSync(historyFile)) {
    return [];
  }
  try {
    const data = fs.readFileSync(historyFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to read history:", error);
    return [];
  }
}

function writeHistory(data) {
  try {
    fs.writeFileSync(historyFile, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error("Failed to write history:", error);
  }
}

function getHistory() {
  const history = readHistory();
  // Return without full heavy data payload to save bandwidth for the list
  return history.map(item => ({
    id: item.id,
    date: item.date,
    productName: item.productName,
    bucketCount: item.buckets?.length || 0
  })).reverse();
}

function getHistoryById(id) {
  const history = readHistory();
  return history.find(item => item.id === id);
}

function saveHistory(data) {
  const history = readHistory();
  const newItem = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    ...data
  };
  history.push(newItem);
  writeHistory(history);
  return newItem;
}

function deleteHistory(id) {
  const history = readHistory();
  const filtered = history.filter(item => item.id !== id);
  writeHistory(filtered);
}

module.exports = {
  getHistory,
  getHistoryById,
  saveHistory,
  deleteHistory
};
