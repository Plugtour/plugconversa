// caminho: front/src/pages/automacao/store.js
const LS_KEY = 'plugconversa:automations:v1'

export function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16)
}

export function defaultDB() {
  return {
    palavras: [
      {
        id: uid(),
        name: 'Início-aula',
        origin: 'GPT',
        matchType: 'começa_com',
        phrases: ['123'],
        executions: 16,
        enabled: false
      },
      {
        id: uid(),
        name: '(1) Boas Vindas',
        origin: 'Site - plugtour.com.br',
        matchType: 'contém',
        phrases: ['Estava vendo o site aqui'],
        executions: 70,
        enabled: false
      },
      {
        id: uid(),
        name: '1º Atendimento',
        origin: 'Suporte',
        matchType: 'começa_com',
        phrases: ['oi', 'olá', 'ola', 'Bom Dia', 'Boa tarde', 'Boa Noite', 'Bom Dia!', 'Boa tarde!', '5+'],
        executions: 189,
        enabled: false
      }
    ],
    sequencias: [],
    webhooks: []
  }
}

export function readDB() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data || typeof data !== 'object') return null
    return data
  } catch {
    return null
  }
}

export function writeDB(data) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}

// arquivo: store.js
// caminho: front/src/pages/automacao/store.js
