/**
 * ChooseRegion  (CSChooseRegionReq -> CSChooseRegionRes)
 *
 * Corrigido para evitar o travamento por falta de token (missing/invalid token).
 */

'use strict';

const { getRepo } = require('../db/repo');
const player = require('../db/player');
const { DEFAULT_REGION } = require('./_shared');

async function handleChooseRegion(reqObj, ctx) {
  const region = reqObj.region || DEFAULT_REGION || 'BR';
  
  ctx.logger.info(`[router] ChooseRegion recebido para a região: ${region}`);

  try {
    // Tenta derivar o openId para salvar a região no banco se a conta já existir
    const openId = player.deriveOpenId(reqObj);
    if (openId) {
      const account = await getRepo().getByOpenId(openId);
      if (account) {
        account.region = region;
        await getRepo().save(account);
        ctx.logger.info(`[router] Região "${region}" salva para a conta UID: ${account.uid}`);
      }
    }
  } catch (err) {
    // Evita derrubar o servidor caso a derivação de ID falhe nesta requisição
    ctx.logger.warn(`[router] Não foi possível salvar a região no banco: ${err.message}`);
  }

  // Retorna a região com sucesso para o cliente fechar o pop-up e prosseguir
  return { region };
}

module.exports = {
  endpoint: 'ChooseRegion',
  reqType: 'CSChooseRegionReq',
  resType: 'CSChooseRegionRes',
  handler: handleChooseRegion
};
