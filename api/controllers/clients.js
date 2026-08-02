const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const clientsFile = path.join(dataDir, 'clients.json');
const historyFile = path.join(dataDir, 'client_history.json');

// Ensure data dir exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function readClients() {
  if (!fs.existsSync(clientsFile)) {
    return [];
  }
  try {
    const data = fs.readFileSync(clientsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to read clients:", error);
    return [];
  }
}

function writeClients(clients) {
  try {
    fs.writeFileSync(clientsFile, JSON.stringify(clients, null, 2), 'utf8');
  } catch (error) {
    console.error("Failed to write clients:", error);
  }
}

function getClients() {
  return readClients();
}

function getClientById(id) {
  const clients = readClients();
  return clients.find(c => c.id === id);
}

function getClientByCredentials(username, password) {
  const clients = readClients();
  return clients.find(c => c.username === username && c.password === password);
}

function saveClient(clientData) {
  const clients = readClients();
  let existingIndex = clients.findIndex(c => c.id === clientData.id);
  
  if (existingIndex >= 0) {
    clients[existingIndex] = {
      ...clients[existingIndex],
      ...clientData,
      updatedAt: new Date().toISOString()
    };
    writeClients(clients);
    return clients[existingIndex];
  } else {
    const newClient = {
      id: 'client_' + Date.now(),
      name: clientData.name || 'Nouveau Client',
      username: clientData.username || '',
      password: clientData.password || '',
      instaHandle: clientData.instaHandle || '',
      logoUrl: clientData.logoUrl || '',
      defaultPrompt: clientData.defaultPrompt || '',
      niche: clientData.niche || '',
      category: clientData.category || '',
      aiStrategy: clientData.aiStrategy || 'neutral',
      awarenessLevel: clientData.awarenessLevel || 'solution_aware',
      uniqueMechanism: clientData.uniqueMechanism || '',
      bigIdea: clientData.bigIdea || '',
      brandDoc: clientData.brandDoc || '',
      referenceImages: clientData.referenceImages || [],
      price: clientData.price || '47',
      currency: clientData.currency || '€',
      createdAt: new Date().toISOString()
    };
    clients.push(newClient);
    writeClients(clients);
    return newClient;
  }
}

function deleteClient(id) {
  const clients = readClients();
  const filtered = clients.filter(c => c.id !== id);
  writeClients(filtered);
}

// Client History Functions
function readClientHistory() {
  if (!fs.existsSync(historyFile)) {
    return [];
  }
  try {
    const data = fs.readFileSync(historyFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to read client history:", error);
    return [];
  }
}

function writeClientHistory(history) {
  try {
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2), 'utf8');
  } catch (error) {
    console.error("Failed to write client history:", error);
  }
}

function getClientHistory(clientId) {
  const history = readClientHistory();
  return history.filter(item => item.clientId === clientId).reverse();
}

function saveClientCreative(item) {
  const history = readClientHistory();
  const newItem = {
    id: 'crea_' + Date.now(),
    date: new Date().toISOString(),
    ...item
  };
  history.push(newItem);
  writeClientHistory(history);
  return newItem;
}

module.exports = {
  getClients,
  getClientById,
  getClientByCredentials,
  saveClient,
  deleteClient,
  getClientHistory,
  saveClientCreative
};
