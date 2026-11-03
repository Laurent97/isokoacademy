const tm = require('../src/services/tradeMath');

const EURUSD = { pip_location: 4, lot_size: 100000, base_currency: 'EUR', quote_currency: 'USD' };
const XAU = { pip_location: 2, lot_size: 100, base_currency: 'XAU', quote_currency: 'USD' };
const USDJPY = { pip_location: 2, lot_size: 100000, base_currency: 'USD', quote_currency: 'JPY' };

test('EURUSD buy 0.1 lot, 1.1000 -> 1.1010 = +$10.00', () => {
  const pl = tm.profitLossUsd(EURUSD, { order_side: 'buy', entry_price: 1.1000, lot_size: 0.1 }, 1.1010);
  expect(pl.usd).toBeCloseTo(10.00, 2);
  expect(pl.pips).toBeCloseTo(10, 1);
});

test('EURUSD sell 0.1 lot, 1.1000 -> 1.1010 = -$10.00', () => {
  const pl = tm.profitLossUsd(EURUSD, { order_side: 'sell', entry_price: 1.1000, lot_size: 0.1 }, 1.1010);
  expect(pl.usd).toBeCloseTo(-10.00, 2);
});

test('XAU buy 0.01 lot, 2350 -> 2351 = +$0.10 (pip=0.01, 100 pips)', () => {
  const pl = tm.profitLossUsd(XAU, { order_side: 'buy', entry_price: 2350, lot_size: 0.01 }, 2351);
  expect(pl.usd).toBeCloseTo(1.00, 2); // 100 pips * $0.01/pip
  expect(pl.pips).toBeCloseTo(100, 1);
});

test('USDJPY pip value converts to USD', () => {
  const pv = tm.pipValueUsd(USDJPY, 1, 150.0);
  expect(pv).toBeCloseTo(6.6667, 3); // 0.01 * 100000 / 150
});

test('margin: EURUSD 1 lot at 1.10, lev 30 = ~$3667', () => {
  expect(tm.marginRequired(EURUSD, 1, 1.10, 30)).toBeCloseTo(3666.67, 0);
});

test('risk percent: 0.1 lot EURUSD, SL 50 pips, $10k = 0.5%', () => {
  const r = tm.riskPercent(EURUSD, { entry_price: 1.1, stop_loss_price: 1.095, lot_size: 0.1 }, 10000);
  expect(r).toBeCloseTo(0.5, 2);
});
