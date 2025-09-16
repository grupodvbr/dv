// /api/vendas.js
export default async function handler(req, res) {
  try {
    const { inicio, fim, token } = req.query;

    let accessToken = token;

    // 1. Se não recebeu token no link, busca no endpoint interno /api/auth
    if (!accessToken) {
      const authResp = await fetch(`${process.env.VERCEL_URL}/api/auth`, {
        method: "POST",
      });
      const authData = await authResp.json();

      if (!authData.accessToken) {
        return res.status(401).json({ error: "Falha ao autenticar", raw: authData });
      }
      accessToken = authData.accessToken;
    }

    // 2. Chamar cupons fiscais com o token
    const apiResp = await fetch("https://mercatto.varejofacil.com/api/v1/venda/cupons-fiscais", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJOQUxCRVJUIFNPVVpBIiwiY3JlYXRlZCI6MTc1ODA2MTYxNzY0MSwic2Vzc2lvblRva2VuIjpudWxsLCJmb3JjZVBhc3N3b3JkUmVzZXQiOmZhbHNlLCJleHAiOjE3NTgwNjM0MTd9.LJ0EG8cNjCJK8-xz3vbq4fHVjknVduZSlkDAxXWiFZAQ2S8fO82yvgzIEaZcxCEcZYA-sJSOSxa4HY0U0zqq_w": accessToken, // usa o token direto
      },
      body: JSON.stringify({
        filtro: {
          tipoDeData: "DATA_MOVIMENTO",
          periodo: {
            inicio: inicio,
            termino: fim,
          },
          formato: "FORMA_DE_PAGAMENTO",
          tipoQuebra: "LOJA",
        },
      }),
    });

    const raw = await apiResp.text();

    // 3. Retornar o JSON cru ou texto se não for válido
    try {
      const data = JSON.parse(raw);
      return res.status(apiResp.status).json(data);
    } catch (e) {
      return res.status(apiResp.status).json({ raw });
    }
  } catch (err) {
    return res.status(500).json({
      error: "Erro ao buscar cupons fiscais",
      details: err.message,
    });
  }
}
