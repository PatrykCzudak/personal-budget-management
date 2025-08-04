"""Crypto router for fetching Binance balances"""
import os
import time
import hmac
import hashlib
from typing import List, Dict, Any

import requests
from fastapi import APIRouter, HTTPException

router = APIRouter()

BINANCE_API_URL = "https://api.binance.com"


def _sign_query(query: str, secret_key: str) -> str:
    return hmac.new(secret_key.encode(), query.encode(), hashlib.sha256).hexdigest()


@router.get("/crypto/binance")
def get_binance_balances() -> Dict[str, Any]:
    """Return spot balances from Binance with 24h profit/loss."""
    api_key = os.getenv("BINANCE_API_KEY")
    secret_key = os.getenv("BINANCE_SECRET_KEY")
    if not api_key or not secret_key:
        raise HTTPException(status_code=500, detail="Binance API credentials not configured")

    timestamp = int(time.time() * 1000)
    query = f"timestamp={timestamp}"
    signature = _sign_query(query, secret_key)

    headers = {"X-MBX-APIKEY": api_key}
    account_res = requests.get(
        f"{BINANCE_API_URL}/api/v3/account",
        params={"timestamp": timestamp, "signature": signature},
        headers=headers,
        timeout=10,
    )
    account_res.raise_for_status()
    account = account_res.json()

    balances: List[Dict[str, Any]] = []
    for bal in account.get("balances", []):
        total = float(bal.get("free", 0)) + float(bal.get("locked", 0))
        if total <= 0:
            continue
        asset = bal["asset"]
        symbol = f"{asset}USDT"
        ticker_res = requests.get(
            f"{BINANCE_API_URL}/api/v3/ticker/24hr",
            params={"symbol": symbol},
            timeout=10,
        )
        if ticker_res.status_code != 200:
            price = 0.0
            change = 0.0
        else:
            tdata = ticker_res.json()
            price = float(tdata.get("lastPrice", 0))
            change = float(tdata.get("priceChange", 0))
        value = total * price
        pnl_24h = change * total
        balances.append({
            "asset": asset,
            "quantity": total,
            "price": price,
            "value": value,
            "pnl_24h": pnl_24h,
        })

    return {"balances": balances}
