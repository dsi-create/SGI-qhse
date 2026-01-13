// Script pour générer un hash bcrypt pour un mot de passe
const bcrypt = require('bcryptjs');

const password = process.argv[2] || 'employe123';

bcrypt.hash(password, 10)
  .then(hash => {
    console.log(`Mot de passe: ${password}`);
    console.log(`Hash bcrypt: ${hash}`);
  })
  .catch(err => {
    console.error('Erreur:', err);
  });

