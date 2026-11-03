/**
 * Trading math helpers for the sandbox simulator.
 * pair: trading_pairs row { pip_location, lot_size (contract), base_currency, quote_currency }
 */

const pipSize = (pair) => Math.pow(10, -pair.pip_location);

const priceToPips = (pair, diff) => diff / pipSize(pair);

/**
 * Value of 1 pip for `lots` of this pair, in USD.
 * - quote USD:  pipSize * contract * lots
 * - base USD:   pipSize * contract * lots / price
 */
function pipValueUsd(pair, lots, price) {
  const contract = Number(pair.lot_size);
  const perLot = pair.quote_currency === 'USD'
    ? pipSize(pair) * contract
    : (pipSize(pair) * contract) / price;
  return perLot * Number(lots);
}

/** P&L in USD for a closed/filled order at a given exit price. */
function profitLossUsd(pair, order, exitPrice) {
  const entry = Number(order.entry_price);
  const diff = order.order_side === 'buy' ? exitPrice - entry : entry - exitPrice;
  const pips = priceToPips(pair, diff);
  const usd = pips * pipValueUsd(pair, order.lot_size, exitPrice);
  return { pips: round(pips, 1), usd: round(usd, 2) };
}

/** Margin required (USD) to open a position. */
function marginRequired(pair, lots, price, leverage) {
  const contract = Number(pair.lot_size);
  const notionalUsd = pair.quote_currency === 'USD'
    ? contract * Number(lots) * price
    : contract * Number(lots); // base is USD
  return notionalUsd / (leverage || pair.max_leverage || 100);
}

/** Risk % of equity if SL is hit. */
function riskPercent(pair, order, equityUsd) {
  if (!order.stop_loss_price || !equityUsd) return null;
  const diff = Math.abs(Number(order.entry_price) - Number(order.stop_loss_price));
  const riskUsd = priceToPips(pair, diff) * pipValueUsd(pair, order.lot_size, order.entry_price);
  return round((riskUsd / equityUsd) * 100, 2);
}

function round(n, d) {
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
}

module.exports = { pipSize, priceToPips, pipValueUsd, profitLossUsd, marginRequired, riskPercent, round };
