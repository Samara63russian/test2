/**
 * CryptoStatte — Interactive Logic & Exchange Calculator
 */

document.addEventListener('DOMContentLoaded', () => {
  // Exchange Rates Baseline (Relative to USD/USDT)
  // 1 USD = 0.998 USDT (Buy USDT), 1 USDT = 0.992 USD (Sell USDT)
  const RATES = {
    buy: {
      USD: 0.998,
      EUR: 1.082,
      TRY: 0.0292, // 1 TRY ~ 0.0292 USDT (approx 34.2 TRY per USDT)
      RUB: 0.0108, // 1 RUB ~ 0.0108 USDT (approx 92.5 RUB per USDT)
      KZT: 0.00208, // 1 KZT ~ 0.00208 USDT
      AED: 0.272,
      USDT_TRC20: 1.0,
      USDT_ERC20: 1.0
    },
    sell: {
      USD: 1.002, // 1 USDT = 1.002 USD
      EUR: 0.924, // 1 USDT = 0.924 EUR
      TRY: 34.15, // 1 USDT = 34.15 TRY
      RUB: 92.10, // 1 USDT = 92.10 RUB
      KZT: 480.0,
      AED: 3.67,
      USDT_TRC20: 1.0,
      USDT_ERC20: 1.0
    }
  };

  let currentDirection = 'fiat-to-crypto'; // 'fiat-to-crypto' or 'crypto-to-fiat'

  // DOM Elements
  const header = document.getElementById('header');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const tabBuy = document.getElementById('tab-buy');
  const tabSell = document.getElementById('tab-sell');
  const sendAmountInput = document.getElementById('send-amount');
  const receiveAmountInput = document.getElementById('receive-amount');
  const sendCurrencySelect = document.getElementById('send-currency');
  const receiveCurrencySelect = document.getElementById('receive-currency');
  const swapBtn = document.getElementById('swap-currencies-btn');
  const rateDisplay = document.getElementById('rate-display');
  const quickBtns = document.querySelectorAll('.quick-btn');
  const selectPairBtns = document.querySelectorAll('.select-pair-btn');
  const initiateExchangeBtn = document.getElementById('initiate-exchange-btn');
  
  // Modal DOM Elements
  const orderModal = document.getElementById('order-modal');
  const modalClose = document.getElementById('modal-close');
  const orderForm = document.getElementById('order-form');
  const mSendVal = document.getElementById('m-send-val');
  const mReceiveVal = document.getElementById('m-receive-val');
  const mRateVal = document.getElementById('m-rate-val');
  const orderWallet = document.getElementById('order-wallet');
  const orderTelegram = document.getElementById('order-telegram');
  const orderCity = document.getElementById('order-city');

  // FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');

  // Sticky Header Effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile Menu Toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      mobileToggle.classList.toggle('active');
    });

    // Close mobile menu on link click
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }

  // Direction Switchers
  tabBuy.addEventListener('click', () => setDirection('fiat-to-crypto'));
  tabSell.addEventListener('click', () => setDirection('crypto-to-fiat'));

  function setDirection(dir) {
    currentDirection = dir;
    if (dir === 'fiat-to-crypto') {
      tabBuy.classList.add('active');
      tabSell.classList.remove('active');
      
      // Default to USD -> USDT TRC20
      if (sendCurrencySelect.value.startsWith('USDT')) {
        sendCurrencySelect.value = 'USD';
      }
      if (!receiveCurrencySelect.value.startsWith('USDT')) {
        receiveCurrencySelect.value = 'USDT_TRC20';
      }
      document.getElementById('send-label').textContent = 'Вы отдаете (Фиат)';
      document.getElementById('receive-label').textContent = 'Вы получаете (Криптовалюта)';
    } else {
      tabSell.classList.add('active');
      tabBuy.classList.remove('active');

      // Default to USDT TRC20 -> USD
      if (!sendCurrencySelect.value.startsWith('USDT')) {
        sendCurrencySelect.value = 'USDT_TRC20';
      }
      if (receiveCurrencySelect.value.startsWith('USDT')) {
        receiveCurrencySelect.value = 'USD';
      }
      document.getElementById('send-label').textContent = 'Вы отдаете (Криптовалюта)';
      document.getElementById('receive-label').textContent = 'Вы получаете (Фиат)';
    }
    calculateExchange();
  }

  // Swap Button Functionality
  swapBtn.addEventListener('click', () => {
    const tempVal = sendCurrencySelect.value;
    const tempRec = receiveCurrencySelect.value;
    
    // Toggle current direction
    if (currentDirection === 'fiat-to-crypto') {
      currentDirection = 'crypto-to-fiat';
      tabSell.classList.add('active');
      tabBuy.classList.remove('active');
    } else {
      currentDirection = 'fiat-to-crypto';
      tabBuy.classList.add('active');
      tabSell.classList.remove('active');
    }

    sendCurrencySelect.value = tempRec;
    receiveCurrencySelect.value = tempVal;
    calculateExchange();
  });

  // Calculate Exchange Function
  function calculateExchange() {
    const sendAmount = parseFloat(sendAmountInput.value) || 0;
    const sendCur = sendCurrencySelect.value;
    const recCur = receiveCurrencySelect.value;

    let calculatedReceive = 0;
    let unitRateText = '';

    if (sendCur.startsWith('USDT') && recCur.startsWith('USDT')) {
      // 1:1 cross-chain swap
      calculatedReceive = sendAmount * 0.999;
      unitRateText = `1 USDT = 0.999 USDT`;
    } else if (sendCur.startsWith('USDT')) {
      // USDT -> Fiat
      const rate = RATES.sell[recCur] || 1;
      calculatedReceive = sendAmount * rate;
      unitRateText = `1 USDT = ${rate} ${recCur}`;
    } else if (recCur.startsWith('USDT')) {
      // Fiat -> USDT
      const rate = RATES.buy[sendCur] || 1;
      calculatedReceive = sendAmount * rate;
      unitRateText = `1 ${sendCur} = ${rate} USDT`;
    } else {
      // Fiat -> Fiat cross via USDT
      const rateToUSDT = RATES.buy[sendCur] || 1;
      const usdtAmt = sendAmount * rateToUSDT;
      const fiatRate = RATES.sell[recCur] || 1;
      calculatedReceive = usdtAmt * fiatRate;
      unitRateText = `1 ${sendCur} = ${(rateToUSDT * fiatRate).toFixed(4)} ${recCur}`;
    }

    receiveAmountInput.value = calculatedReceive > 0 ? (calculatedReceive >= 100 ? calculatedReceive.toFixed(2) : calculatedReceive.toFixed(4)) : '0.00';
    rateDisplay.innerHTML = `<span class="highlight">${unitRateText}</span>`;
  }

  // Input Listeners
  sendAmountInput.addEventListener('input', calculateExchange);
  sendCurrencySelect.addEventListener('change', calculateExchange);
  receiveCurrencySelect.addEventListener('change', calculateExchange);

  // Quick Amount Buttons
  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      quickBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sendAmountInput.value = btn.dataset.val;
      calculateExchange();
    });
  });

  // Select Pair from Directions Cards
  selectPairBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const sendVal = btn.dataset.send;
      const recVal = btn.dataset.receive;

      if (sendVal.startsWith('USDT')) {
        setDirection('crypto-to-fiat');
      } else {
        setDirection('fiat-to-crypto');
      }

      sendCurrencySelect.value = sendVal;
      receiveCurrencySelect.value = recVal;
      calculateExchange();

      // Scroll smoothly to calculator
      const calcElem = document.getElementById('calculator');
      if (calcElem) {
        calcElem.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // FAQ Accordion Toggle
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      
      // Close all items
      faqItems.forEach(i => i.classList.remove('active'));
      
      // Open clicked item if not previously open
      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });

  // Modal Open & Populate
  initiateExchangeBtn.addEventListener('click', () => {
    const sendAmt = sendAmountInput.value || '0';
    const sendCur = sendCurrencySelect.options[sendCurrencySelect.selectedIndex].text;
    const recAmt = receiveAmountInput.value || '0';
    const recCur = receiveCurrencySelect.options[receiveCurrencySelect.selectedIndex].text;

    mSendVal.textContent = `${sendAmt} ${sendCur}`;
    mReceiveVal.textContent = `${recAmt} ${recCur}`;
    mRateVal.innerHTML = rateDisplay.innerHTML;

    orderModal.classList.add('open');
    orderModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  });

  // Modal Close
  function closeModal() {
    orderModal.classList.remove('open');
    orderModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  orderModal.addEventListener('click', (e) => {
    if (e.target === orderModal) closeModal();
  });

  // Handle Form Submit and redirect to Telegram
  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const sendAmt = sendAmountInput.value || '0';
    const sendCur = sendCurrencySelect.options[sendCurrencySelect.selectedIndex].text;
    const recAmt = receiveAmountInput.value || '0';
    const recCur = receiveCurrencySelect.options[receiveCurrencySelect.selectedIndex].text;
    const wallet = orderWallet.value.trim();
    const userTg = orderTelegram.value.trim().replace(/^@/, '');
    const city = orderCity.value.trim() || 'Онлайн';

    // Build Telegram pre-filled message
    const tgMessage = `🚀 *Новая заявка с сайта CryptoStatte:*%0A` +
      `━━━━━━━━━━━━━━━━━━%0A` +
      `🔄 *Направление:* ${encodeURIComponent(sendCur)} ➔ ${encodeURIComponent(recCur)}%0A` +
      `💸 *Отдает:* ${sendAmt} ${encodeURIComponent(sendCur)}%0A` +
      `📥 *Получает:* ${recAmt} ${encodeURIComponent(recCur)}%0A` +
      `💳 *Реквизиты:* ${encodeURIComponent(wallet)}%0A` +
      `📍 *Город/Формат:* ${encodeURIComponent(city)}%0A` +
      `👤 *Клиент:* @${encodeURIComponent(userTg)}%0A` +
      `━━━━━━━━━━━━━━━━━━%0A` +
      `⚡️ Готов совершить обмен.`;

    const tgUrl = `https://t.me/cryptostatte_ex?text=${tgMessage}`;

    showToast('Заявка сформирована! Перенаправляем к менеджеру...');

    setTimeout(() => {
      window.open(tgUrl, '_blank');
      closeModal();
      orderForm.reset();
    }, 800);
  });

  // Toast Notification System
  function showToast(message) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas fa-check-circle text-emerald"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Initial Calculation
  calculateExchange();
});
