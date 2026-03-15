import fs from 'fs'
import path from 'path'
import https from 'https'

const CATEGORIES = ['AI Model', 'Microservice', 'Template', 'Database', 'SaaS']

// Fallback real-world APIs
const REAL_APIS = [
  { name: 'PokeAPI', desc: 'All the Pokémon data you\'ll ever need in one place.', url: 'https://pokeapi.co/' },
  { name: 'JSONPlaceholder', desc: 'Free fake API for testing and prototyping.', url: 'https://jsonplaceholder.typicode.com/' },
  { name: 'OpenWeatherMap', desc: 'Simple and fast historical, current and forecasted weather.', url: 'https://openweathermap.org/api' },
  { name: 'The Cat API', desc: 'Cats as a service.', url: 'https://thecatapi.com/' },
  { name: 'CoinGecko', desc: 'Cryptocurrency Data API.', url: 'https://www.coingecko.com/en/api' },
  { name: 'NASA Open APIs', desc: 'NASA data, including imagery, eminently accessible.', url: 'https://api.nasa.gov/' },
  { name: 'Rick and Morty API', desc: 'All the Rick and Morty information.', url: 'https://rickandmortyapi.com/' },
  { name: 'Dog API', desc: 'The internet\'s biggest collection of open source dog pictures.', url: 'https://dog.ceo/dog-api/' },
  { name: 'REST Countries', desc: 'Get information about countries via a RESTful API.', url: 'https://restcountries.com/' },
  { name: 'JigsawStack', desc: 'Every AI model and web scraping tool in one API.', url: 'https://jigsawstack.com/' },
  { name: 'RandomUser', desc: 'Like Lorem Ipsum, but for people.', url: 'https://randomuser.me/' },
  { name: 'SWAPI', desc: 'The Star Wars API.', url: 'https://swapi.dev/' }
]

// Real-world Kaggle/Dataset titles
const REAL_DATASETS = [
  { name: 'Titanic - Machine Learning from Disaster', desc: 'Start here! Predict survival on the Titanic and get familiar with ML basics.', url: 'https://www.kaggle.com/c/titanic' },
  { name: 'Credit Card Fraud Detection', desc: 'Anonymized credit card transactions labeled as fraudulent or genuine.', url: 'https://www.kaggle.com/mlg-ulb/creditcardfraud' },
  { name: 'Netflix Movies and TV Shows', desc: 'Listings of movies and tv shows on Netflix - details and cast.', url: 'https://www.kaggle.com/shivamb/netflix-shows' },
  { name: 'Boston Housing Dataset', desc: 'House prices in Boston, MA.', url: 'https://www.kaggle.com/c/boston-housing' },
  { name: 'Iris Species', desc: 'Classify iris plants into three species in this classic dataset.', url: 'https://www.kaggle.com/uciml/iris' },
  { name: 'COVID-19 Open Research Dataset Challenge (CORD-19)', desc: 'Scholarly articles about COVID-19, SARS-CoV-2, and related coronaviruses.', url: 'https://www.kaggle.com/allen-institute-for-ai/CORD-19-research-challenge' },
  { name: 'Bitcoin Historical Data', desc: 'Bitcoin data at 1-min intervals from select exchanges to Jan 2012 to March 2021', url: 'https://www.kaggle.com/mczielinski/bitcoin-historical-data' },
  { name: 'Heart Disease UCI', desc: '76 attributes, but only 14 are actually used. Predict the presence of heart disease.', url: 'https://www.kaggle.com/ronitf/heart-disease-uci' },
  { name: 'S&P 500 Stock Data', desc: 'Historical stock data for all current S&P 500 companies.', url: 'https://www.kaggle.com/camnugent/sandp500' }
]

const ADJECTIVES = ['Quantum', 'Neural', 'Cyber', 'Astro', 'Synapse', 'Crypto', 'Hyper', 'Meta', 'Omni', 'Nexus', 'Aero', 'Bio', 'Nano', 'Giga', 'Tera', 'Auto', 'Smart', 'Cloud', 'Edge', 'Deep']
const NOUNS = ['Core', 'Forge', 'Hub', 'Net', 'Grid', 'Link', 'Sync', 'Base', 'Vault', 'Sphere', 'Matrix', 'Pulse', 'Wave', 'Stream', 'Flow', 'Engine', 'System', 'Protocol', 'Interface', 'Gateway']
const DESC_PREFIX = ['Advanced', 'Next-gen', 'High-performance', 'Decentralized', 'Scalable', 'Real-time', 'Automated', 'Secure', 'Lightning-fast', 'Intelligent']
const DESC_SUFFIX = ['for modern applications.', 'built for enterprise scale.', 'with zero-knowledge proofs.', 'optimized for low latency.', 'with seamless integration.', 'powered by machine learning.', 'for the Web3 ecosystem.', 'with 99.9% uptime guarantee.']


function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateName(category) {
  return `${randomElement(ADJECTIVES)}${randomElement(NOUNS)}`
}

function generateDescription(category) {
  return `${randomElement(DESC_PREFIX)} ${category.toLowerCase()} solution. ${randomElement(DESC_SUFFIX)}`
}

// Quick helper to fetch from publicapis.org if available, else we generate 500 based on standard names
function fetchPublicApis() {
  return new Promise((resolve) => {
    https.get('https://api.publicapis.org/entries', (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          resolve(json.entries || [])
        } catch {
          resolve([])
        }
      })
    }).on('error', () => resolve([]))
  })
}

async function generateProjects() {
  const projects = []
  let id = 1

  // 1. Generate 4 VERY REAL normal paid projects for other categories
  for (const category of CATEGORIES) {
    let count = 4 // Exactly 4 high quality items
    for (let i = 0; i < count; i++) {
        let aiScore = Math.floor(Math.random() * 40) + 60
        let backendScore = Math.floor(Math.random() * 40) + 60
        let designScore = Math.floor(Math.random() * 40) + 60
        
        if (category === 'AI Model') aiScore = Math.floor(Math.random() * 10) + 90
        if (category === 'Microservice' || category === 'Database') backendScore = Math.floor(Math.random() * 10) + 90
        if (category === 'Template' || category === 'SaaS') designScore = Math.floor(Math.random() * 10) + 90

        const name = `${generateName(category)} PRO`
        
        projects.push({
            id: id++,
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + id,
            name: name,
            category: category,
            description: generateDescription(category),
            price: `$${Math.floor(Math.random() * 300) + 49}`,
            aiScore,
            backendScore,
            designScore,
            link: null // Paid items go to detail page
        })
    }
  }

  // 2. Add realistic APIs (Free & Web Links) - Target 5000+
  console.log('Fetching public APIs...')
  const liveApis = await fetchPublicApis()
  let apiCount = 5050 // generate 5050 APIs
  for (let i = 0; i < apiCount; i++) {
     let source = liveApis.length > i ? liveApis[i] : randomElement(REAL_APIS)
     let name = source.API || source.name
     let desc = source.Description || source.desc
     let url = source.Link || source.url
     
     // Randomize if we run out of unique ones
     if (i >= liveApis.length && i >= REAL_APIS.length) {
         name = `${randomElement(ADJECTIVES)} ${name} API v${Math.floor(Math.random() * 10) + 2}`
     }

     projects.push({
        id: id++,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + id,
        name: name,
        category: 'API',
        description: desc,
        price: 'Free',
        aiScore: Math.floor(Math.random() * 20) + 70,
        backendScore: Math.floor(Math.random() * 10) + 90,
        designScore: Math.floor(Math.random() * 40) + 50,
        link: url // Clicking directs to actual external API docs
     })
  }

  // 3. Add realistic Datasets (Free & Web Links)
  let datasetCount = 5050 // Generate 5050 Datasets
  for (let i = 0; i < datasetCount; i++) {
      let source = randomElement(REAL_DATASETS)
      let name = source.name
      
      if (i >= REAL_DATASETS.length) {
         let subject = randomElement(['Global Finance', 'Climate Variance', 'Social Network Mapping', 'Biometric Identification', 'E-Commerce Transactions', 'Autonomous Sensor Telemetry'])
         name = `${subject} Dataset - ${Math.floor(Math.random() * 1000) + 1}k Samples`
      }

      projects.push({
        id: id++,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + id,
        name: name,
        category: 'Dataset',
        description: source.desc,
        price: 'Free',
        aiScore: Math.floor(Math.random() * 10) + 90,
        backendScore: Math.floor(Math.random() * 30) + 70,
        designScore: Math.floor(Math.random() * 40) + 50,
        link: source.url // Clicking directs to Kaggle or dataset source
     })
  }

  // Shuffle projects so "All" view is mixed
  for (let i = projects.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [projects[i], projects[j]] = [projects[j], projects[i]];
  }

  return projects
}

const outDir = path.join(process.cwd(), 'public', 'mock')
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true })
}

generateProjects().then(projects => {
    fs.writeFileSync(path.join(outDir, 'projects.json'), JSON.stringify(projects, null, 2))
    console.log(`Generated ${projects.length} total projects across all categories.`)
})
