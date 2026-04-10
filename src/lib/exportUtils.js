import * as XLSX from 'xlsx';

/**
 * Exports a single session to an Excel file.
 * @param {Object} session - The session object to export.
 * @param {Array} playersRoster - The global roster of players to resolve names.
 */
export const exportSessionToExcel = (session, playersRoster) => {
  const dealerFee = Number(session.dealerFee) || 0;
  const dealerParticipant = session.participants.find(p => p.isDealer);
  const numOthers = session.participants.length - (dealerParticipant ? 1 : 0);
  const totalFeesCollected = numOthers * dealerFee;

  const data = session.participants.map(p => {
    const playerName = playersRoster.find(r => r.id === p.playerId)?.name || 'Unknown';
    const buyIn = Number(p.buyIn) || 0;
    const cashOut = Number(p.cashOut) || 0;
    
    let profit = cashOut - buyIn;
    if (dealerFee > 0 && dealerParticipant) {
      if (p.isDealer) {
        profit += totalFeesCollected;
      } else {
        profit -= dealerFee;
      }
    }

    return {
      'Player Name': p.isDealer ? `${playerName} (Dealer)` : playerName,
      'Buy In': buyIn,
      'Cash Out': cashOut,
      'Profit/Loss': profit,
      'ROI %': buyIn > 0 ? `${((profit / buyIn) * 100).toFixed(1)}%` : '0%'
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Session Data");
  
  // Clean filename
  const safeName = (session.name || 'Session').replace(/[/\\?%*:|"<>]/g, '-');
  const dateStr = new Date(session.timestamp).toISOString().split('T')[0];
  XLSX.writeFile(wb, `${safeName}_${dateStr}.xlsx`);
};

/**
 * Exports multiple sessions into a single Excel file with multiple sheets.
 * @param {Array} sessions - The list of sessions to export.
 * @param {Array} playersRoster - The global roster of players.
 */
export const exportBulkToExcel = (sessions, playersRoster) => {
  if (!sessions || sessions.length === 0) return;

  const wb = XLSX.utils.book_new();

  sessions.forEach((session, index) => {
    const dealerFee = Number(session.dealerFee) || 0;
    const dealerParticipant = session.participants.find(p => p.isDealer);
    const numOthers = session.participants.length - (dealerParticipant ? 1 : 0);
    const totalFeesCollected = numOthers * dealerFee;

    const data = session.participants.map(p => {
      const playerName = playersRoster.find(r => r.id === p.playerId)?.name || 'Unknown';
      const buyIn = Number(p.buyIn) || 0;
      const cashOut = Number(p.cashOut) || 0;
      
      let profit = cashOut - buyIn;
      if (dealerFee > 0 && dealerParticipant) {
        if (p.isDealer) {
          profit += totalFeesCollected;
        } else {
          profit -= dealerFee;
        }
      }

      return {
        'Player Name': p.isDealer ? `${playerName} (Dealer)` : playerName,
        'Buy In': buyIn,
        'Cash Out': cashOut,
        'Profit/Loss': profit,
        'ROI %': buyIn > 0 ? `${((profit / buyIn) * 100).toFixed(1)}%` : '0%'
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    
    // Sheet names must be <= 31 chars and unique
    let sheetName = (session.name || `Session ${index + 1}`).substring(0, 25);
    const dateStr = new Date(session.timestamp).toLocaleDateString().replace(/\//g, '-');
    sheetName = `${sheetName} (${dateStr})`;
    sheetName = sheetName.substring(0, 31).replace(/[/\\?%*:|"<>]/g, '-');

    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `PokerSessions_Export_${dateStr}.xlsx`);
};
