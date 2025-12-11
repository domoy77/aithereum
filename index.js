import axios from 'axios';
import gradient from 'gradient-string';
import chalk from 'chalk';
import fs from 'fs/promises';
import readline from 'readline';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import ora from 'ora';

// ================================
// 🌟 KONFIGURASI WARNA & TEMA AITHEREUM
// ================================

const theme = {
  primary: chalk.hex('#00D4FF').bold,
  secondary: chalk.hex('#FF00FF').bold,
  success: chalk.hex('#00FF9D').bold,
  warning: chalk.hex('#FFE600').bold,
  error: chalk.hex('#FF0055').bold,
  info: chalk.hex('#9D4EDD').bold,
  accent: chalk.hex('#FF6B35').bold,
  muted: chalk.hex('#8B8B8B'),
};

// Gradients khusus AITHEREUM
const gradients = {
  title: gradient('cyan', 'magenta', 'blue'),
  subtitle: gradient('#00D4FF', '#9D4EDD'),
  successGradient: gradient('#00FF9D', '#00D4FF'),
  warningGradient: gradient('#FFE600', '#FF6B35'),
  errorGradient: gradient('#FF0055', '#9D4EDD'),
  infoGradient: gradient('#9D4EDD', '#00D4FF'),
};

// ================================
// 🎨 LOGGER DENGAN TAMPILAN AITHEREUM
// ================================

const logger = {
  info: (msg, options = {}) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const emoji = options.emoji || '🤖';
    const context = options.context ? `[${options.context}] ` : '';
    const level = theme.info(' INFO ');
    const formattedMsg = `${theme.muted('╭─')} ${theme.muted(timestamp)} ${gradients.infoGradient('┃')} ${level} ${emoji} ${context}${theme.primary(msg)}`;
    console.log(formattedMsg);
  },
  
  warn: (msg, options = {}) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const emoji = options.emoji || '⚠️ ';
    const context = options.context ? `[${options.context}] ` : '';
    const level = theme.warning(' WARN ');
    const formattedMsg = `${theme.muted('╭─')} ${theme.muted(timestamp)} ${gradients.warningGradient('┃')} ${level} ${emoji} ${context}${theme.warning(msg)}`;
    console.log(formattedMsg);
  },
  
  error: (msg, options = {}) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const emoji = options.emoji || '❌';
    const context = options.context ? `[${options.context}] ` : '';
    const level = theme.error(' ERROR ');
    const formattedMsg = `${theme.muted('╭─')} ${theme.muted(timestamp)} ${gradients.errorGradient('┃')} ${level} ${emoji} ${context}${theme.error(msg)}`;
    console.log(formattedMsg);
  },
  
  success: (msg, options = {}) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const emoji = options.emoji || '✅';
    const context = options.context ? `[${options.context}] ` : '';
    const level = theme.success(' SUCCESS ');
    const formattedMsg = `${theme.muted('╭─')} ${theme.muted(timestamp)} ${gradients.successGradient('┃')} ${level} ${emoji} ${context}${theme.success(msg)}`;
    console.log(formattedMsg);
  }
};

// ================================
// ⚡ FUNGSI UTILITAS
// ================================

function delay(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

function stripAnsi(str) {
  return str.replace(/\x1B\[[0-9;]*m/g, '');
}

function centerText(text, width) {
  const cleanText = stripAnsi(text);
  const textLength = cleanText.length;
  const totalPadding = Math.max(0, width - textLength);
  const leftPadding = Math.floor(totalPadding / 2);
  const rightPadding = totalPadding - leftPadding;
  return `${' '.repeat(leftPadding)}${text}${' '.repeat(rightPadding)}`;
}

function printHeader(title) {
  const width = 80;
  const border = '═'.repeat(width - 4);
  console.log(gradients.title(`╔${border}╗`));
  console.log(gradients.title(`║ ${centerText(title, width - 4)} ║`));
  console.log(gradients.title(`╚${border}╝`));
}

function printInfo(label, value, context) {
  const formattedLabel = theme.accent(`${label}:`.padEnd(20));
  const formattedValue = theme.success(value);
  console.log(`  ${theme.muted('├─')} ${formattedLabel} ${formattedValue}`);
}

function printProfileInfo(userId, email, points, status, context) {
  printHeader(`📊 PROFILE INFO - ${context.toUpperCase()} 📊`);
  
  console.log(`${theme.primary('👤 User ID:')}     ${theme.success(userId || 'N/A')}`);
  console.log(`${theme.primary('📧 Email:')}       ${theme.info(email || 'N/A')}`);
  console.log(`${theme.primary('🏆 Total Points:')} ${theme.success(points.toString())}`);
  console.log(`${theme.primary('🔒 Status:')}       ${status === 'Banned' ? theme.error(status) : theme.success(status)}`);
  console.log(`${theme.muted('─'.repeat(30))}`);
  console.log(`${theme.muted('Last Updated:')} ${new Date().toLocaleTimeString()}\n`);
}

// ================================
// 🌐 KONFIGURASI HTTP & PROXY
// ================================

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/102.0'
];

function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

function getAxiosConfig(proxy, additionalHeaders = {}) {
  const headers = {
    'accept': '*/*',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8,id;q=0.7,fr;q=0.6,ru;q=0.5,zh-CN;q=0.4,zh;q=0.3',
    'cache-control': 'no-cache',
    'pragma': 'no-cache',
    'priority': 'u=1, i',
    'referer': 'https://aithereumnetwork.com/',
    'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Opera";v="124"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': getRandomUserAgent(),
    ...additionalHeaders
  };
  
  const config = {
    headers,
    timeout: 60000
  };
  
  if (proxy) {
    config.httpsAgent = newAgent(proxy);
    config.proxy = false;
  }
  
  return config;
}

function newAgent(proxy) {
  if (proxy.startsWith('http://') || proxy.startsWith('https://')) {
    return new HttpsProxyAgent(proxy);
  } else if (proxy.startsWith('socks4://') || proxy.startsWith('socks5://')) {
    return new SocksProxyAgent(proxy);
  } else {
    logger.warn(`Unsupported proxy: ${proxy}`);
    return null;
  }
}

async function requestWithRetry(method, url, payload = null, config = {}, retries = 3, backoff = 2000, context) {
  for (let i = 0; i < retries; i++) {
    try {
      let response;
      if (method.toLowerCase() === 'get') {
        response = await axios.get(url, config);
      } else if (method.toLowerCase() === 'post') {
        response = await axios.post(url, payload, config);
      } else {
        throw new Error(`Method ${method} not supported`);
      }
      return response;
    } catch (error) {
      if (error.response && error.response.status >= 500 && i < retries - 1) {
        logger.warn(`Retrying ${method.toUpperCase()} ${url} (${i + 1}/${retries}) due to server error`, { emoji: '🔄', context });
        await delay(backoff / 1000);
        backoff *= 1.5;
        continue;
      }
      if (i < retries - 1) {
        logger.warn(`Retrying ${method.toUpperCase()} ${url} (${i + 1}/${retries})`, { emoji: '🔄', context });
        await delay(backoff / 1000);
        backoff *= 1.5;
        continue;
      }
      throw error;
    }
  }
}

// ================================
// 📁 FILE OPERATIONS
// ================================

async function readUsers() {
  try {
    const data = await fs.readFile('user.txt', 'utf-8');
    const users = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (users.length === 0) {
      throw new Error('user.txt is empty');
    }
    logger.success(`Loaded ${users.length} user${users.length === 1 ? '' : 's'}`, { emoji: '🔑' });
    return users;
  } catch (error) {
    logger.error(`Failed to read user.txt: ${error.message}`, { emoji: '❌' });
    return [];
  }
}

async function readProxies() {
  try {
    const data = await fs.readFile('proxy.txt', 'utf-8');
    const proxies = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (proxies.length === 0) {
      logger.warn('No proxies found. Proceeding without proxy.', { emoji: '⚠️' });
    } else {
      logger.success(`Loaded ${proxies.length} prox${proxies.length === 1 ? 'y' : 'ies'}`, { emoji: '🌐' });
    }
    return proxies;
  } catch (error) {
    logger.warn('proxy.txt not found.', { emoji: '⚠️' });
    return [];
  }
}

// ================================
// 🌐 API FUNCTIONS
// ================================

async function getPublicIP(proxy, context) {
  try {
    const config = getAxiosConfig(proxy);
    const response = await requestWithRetry('get', 'https://api.ipify.org?format=json', null, config, 3, 2000, context);
    return response.data.ip || 'Unknown';
  } catch (error) {
    logger.error(`Failed to get IP: ${error.message}`, { emoji: '❌', context });
    return 'Error retrieving IP';
  }
}

async function fetchUserInfo(userId, proxy, context) {
  const url = `https://api.aithereumnetwork.com/api/users/${userId}`;
  const config = getAxiosConfig(proxy);
  const spinner = ora({
    text: gradients.subtitle('Fetching user info...'),
    spinner: {
      interval: 80,
      frames: ['🔄', '⚡', '🚀', '💫', '🌟', '✨']
    },
    color: 'cyan'
  }).start();
  
  try {
    const response = await requestWithRetry('get', url, null, config, 3, 2000, context);
    spinner.stop();
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error('Failed to fetch user info or invalid response');
    }
  } catch (error) {
    spinner.fail(theme.error(`Failed to fetch user info: ${error.message}`));
    logger.error(`Error: ${error.message}`, { context });
    return null;
  }
}

async function executeDailyCheckin(userId, proxy, context) {
  const url = 'https://api.aithereumnetwork.com/api/tasks/complete';
  const payload = {
    userId: userId,
    taskType: 'daily_checkin',
    taskName: 'Daily Check-in'
  };
  
  const config = getAxiosConfig(proxy, { 'Content-Type': 'application/json' });
  config.validateStatus = (status) => status >= 200 && status < 500;
  
  const spinner = ora({
    text: gradients.successGradient('Executing daily check-in...'),
    spinner: {
      interval: 80,
      frames: ['🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛']
    },
    color: 'green'
  }).start();
  
  try {
    const response = await requestWithRetry('post', url, payload, config, 3, 2000, context);
    if (response.data.success) {
      spinner.succeed(theme.success(`✓ Check-in Successful! +${response.data.reward || 0} points`));
      return { success: true, data: response.data };
    } else {
      spinner.warn(theme.warning('! Already checked in today or failed'));
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    spinner.fail(theme.error(`✗ Failed to execute check-in: ${error.message}`));
    return { success: false };
  }
}

// ================================
// 👤 USER PROCESSING
// ================================

async function processUser(userId, index, total, proxy) {
  const context = `USER-${String(index + 1).padStart(3, '0')}`;
  
  printHeader(`🚀 STARTING USER ${index + 1}/${total}`);
  
  const ip = await getPublicIP(proxy, context);
  printInfo('IP Address', ip, context);
  console.log();
  
  try {
    logger.info('Fetching user information...', { emoji: '🔍', context });
    
    let userInfo = await fetchUserInfo(userId, proxy, context);
    if (!userInfo) {
      logger.error('Failed to fetch user info. Skipping.', { emoji: '❌', context });
      return;
    }
    
    let email = userInfo.email || 'N/A';
    let points = userInfo.afdTokens || 0;
    let status = userInfo.isBanned ? 'Banned' : 'Secure';
    
    printInfo('User ID', userId, context);
    printInfo('Email', email, context);
    console.log();
    
    logger.info('Starting daily check-in process...', { emoji: '📅', context });
    
    if (userInfo.isBanned) {
      logger.error('User is banned! Cannot proceed.', { emoji: '❌', context });
      printProfileInfo(userId, email, points, status, context);
      return;
    }
    
    const todayTasks = userInfo.todayTasks || [];
    const hasDailyCheckin = todayTasks.some(task => task.taskType === 'daily_checkin');
    
    let finalUserInfo = userInfo;
    if (hasDailyCheckin) {
      logger.warn('Already checked in today!', { emoji: '✅', context });
    } else {
      const checkinResult = await executeDailyCheckin(userId, proxy, context);
      if (checkinResult && checkinResult.success) {
        await delay(3);
        finalUserInfo = await fetchUserInfo(userId, proxy, context);
        if (finalUserInfo) {
          status = finalUserInfo.isBanned ? 'Banned' : 'Secure';
          points = finalUserInfo.afdTokens || 0;
          email = finalUserInfo.email || 'N/A';
        }
      }
    }
    
    printProfileInfo(userId, email, points, status, context);
    logger.success('User processing completed', { emoji: '🎉', context });
    console.log(gradients.title('═'.repeat(80)));
    
  } catch (error) {
    logger.error(`Error processing user: ${error.message}`, { emoji: '💥', context });
  }
}

// ================================
// ⚙️ CONFIGURATION INITIALIZATION
// ================================

let globalUseProxy = false;
let globalProxies = [];

async function initializeConfig() {
  console.log('\n');
  
  const proxyQuestion = `
${theme.primary('🔌 PROXY CONFIGURATION')}
${theme.muted('Do you want to use proxy for requests?')}
${theme.info('(Recommended for multiple accounts)')}
${theme.accent('Choose: [Y]es / [N]o : ')}`.trim();
  
  console.log(proxyQuestion);
  
  const useProxyAns = await askQuestion('');
  
  if (useProxyAns.trim().toLowerCase() === 'y') {
    globalUseProxy = true;
    globalProxies = await readProxies();
    
    if (globalProxies.length === 0) {
      globalUseProxy = false;
      logger.warn('No proxies available, proceeding without proxy.', { emoji: '⚠️' });
    } else {
      logger.success(`Loaded ${globalProxies.length} proxy servers`, { emoji: '🌐' });
    }
  } else {
    logger.info('Proceeding without proxy.', { emoji: 'ℹ️' });
  }
}

async function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise(resolve => {
    rl.question(query, ans => {
      rl.close();
      resolve(ans);
    });
  });
}

// ================================
// 🔄 MAIN CYCLE FUNCTION
// ================================

async function runCycle() {
  const users = await readUsers();
  if (users.length === 0) {
    logger.error('No users found in user.txt. Exiting cycle.', { emoji: '❌' });
    return;
  }
  
  for (let i = 0; i < users.length; i++) {
    const proxy = globalUseProxy ? globalProxies[i % globalProxies.length] : null;
    try {
      await processUser(users[i], i, users.length, proxy);
    } catch (error) {
      logger.error(`Error processing user: ${error.message}`, { 
        emoji: '💥', 
        context: `USER-${String(i + 1).padStart(3, '0')}` 
      });
    }
    
    if (i < users.length - 1) {
      console.log('\n' + gradients.title('═'.repeat(80)) + '\n');
      await delay(5);
    }
  }
}

// ================================
// 🚀 SPLASH SCREEN AITHEREUM
// ================================

function displaySplashScreen() {
  console.clear();
  
  const width = 80;
  const line = (char = '═') => char.repeat(width);
  
  console.log(gradients.title(line('═')));
  
  const asciiArt = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║      █████╗ ██╗████████╗██╗  ██╗███████╗██████╗ ███████╗██╗   ██╗███╗   ███╗  ║
║     ██╔══██╗██║╚══██╔══╝██║  ██║██╔════╝██╔══██╗██╔════╝██║   ██║████╗ ████║  ║
║     ███████║██║   ██║   ███████║█████╗  ██████╔╝█████╗  ██║   ██║██╔████╔██║  ║
║     ██╔══██║██║   ██║   ██╔══██║██╔══╝  ██╔══██╗██╔══╝  ██║   ██║██║╚██╔╝██║  ║
║     ██║  ██║██║   ██║   ██║  ██║███████╗██║  ██║███████╗╚██████╔╝██║ ╚═╝ ██║  ║
║     ╚═╝  ╚═╝╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝     ╚═╝  ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`;
  
  console.log(gradients.title(asciiArt));
  
  console.log('\n' + gradients.title(centerText('▀▄▀▄▀▄ AITHEREUM AI BLOCKCHAIN PLATFORM v1.0 ▄▀▄▀▄▀', width)));
  console.log(gradients.subtitle(centerText('🤖 Advanced AI-Powered Automation ⚡', width)));
  console.log(gradients.title(line('─')));
  
  console.log(theme.primary(centerText('🚀 Auto Check-in Bot for AIThereum Network', width)));
  console.log(theme.muted(centerText('Automate daily check-ins to maximize your blockchain rewards', width)));
  console.log('\n');
  
  const creditsContent = 
    `${theme.secondary('👨‍💻 Developer : ')}${theme.primary('CHE DOMOY')}\n` +
    `${theme.secondary('🐦 Twitter (X) : ')}${theme.info('@Domoy77')}\n` +
    `${theme.secondary('🚀 Version     : ')}${theme.success('1.0.0 AITHEREUM')}\n` +
    `${theme.secondary('📅 Released    : ')}${theme.muted('December 2025')}`;
  
  console.log(centerText(creditsContent, width));
  
  console.log('\n' + gradients.title(line('═')));
  
  console.log(theme.muted(centerText('💡 Tip: Make sure user.txt and proxy.txt are properly configured', width)));
  console.log(theme.muted(centerText('⚠️  Warning: Use responsibly and comply with AIThereum Terms of Service', width)));
  console.log(gradients.title(line('═')));
}

// ================================
// 🎬 MAIN FUNCTION
// ================================

async function run() {
  try {
    displaySplashScreen();
    await delay(1.5);
    
    await initializeConfig();
    
    let cycleCount = 0;
    while (true) {
      cycleCount++;
      
      console.log('\n');
      printHeader(`🔄 AITHEREUM CYCLE ${cycleCount} STARTING 🚀`);
      
      await runCycle();
      
      console.log('\n');
      logger.success(`✅ AITHEREUM Cycle ${cycleCount} Completed Successfully!`, { emoji: '✅' });
      logger.info(`⏳ Next cycle will start in 24 hours`, { emoji: '⏳' });
      logger.info(`🕐 Scheduled: ${new Date(Date.now() + 86400000).toLocaleString()}`, { emoji: '📅' });
      
      console.log(`\n${theme.muted('─'.repeat(40))}\n`);
      console.log(`${theme.accent('📊 Statistics:')}`);
      console.log(`${theme.muted('• Total cycles completed:')} ${theme.success(cycleCount.toString())}`);
      console.log(`${theme.muted('• Next run:')} ${theme.info(new Date(Date.now() + 86400000).toLocaleTimeString())}\n`);
      
      logger.info('AITHEREUM waiting 24 hours for next cycle...', { emoji: '⏳' });
      await delay(86400);
    }
  } catch (error) {
    logger.error(`Fatal error in main execution: ${error.message}`, { emoji: '💀' });
    
    console.log(`\n${theme.error('❌ AITHEREUM CRITICAL ERROR')}\n`);
    console.log(`${theme.muted('Message:')} ${theme.error(error.message)}`);
    console.log(`${theme.muted('Stack:')} ${theme.muted(error.stack?.split('\n')[1] || 'N/A')}\n`);
    console.log(`${theme.warning('🔄 AITHEREUM will restart in 30 seconds...')}\n`);
    
    await delay(30);
    
    console.clear();
    logger.info('AITHEREUM restarting...', { emoji: '🔄' });
    await run();
  }
}

// ================================
// 🎬 START APPLICATION
// ================================

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`, { emoji: '💥' });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`, { emoji: '💥' });
});

run().catch(error => {
  logger.error(`AITHEREUM failed to start: ${error.message}`, { emoji: '💀' });
  process.exit(1);
});
