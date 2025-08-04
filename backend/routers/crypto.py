"""Crypto router for fetching Binance data"""

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


def _get_usdt_to_pln_rate() -> float:
    """Fetch current USDT to PLN conversion rate."""
    try:
        res = requests.get(
            f"{BINANCE_API_URL}/api/v3/ticker/price",
            params={"symbol": "USDTPLN"},
            timeout=10,
        )
        res.raise_for_status()
        return float(res.json().get("price", 0))
    except Exception:
        return 0.0


@router.get("/crypto/binance")
def get_binance_balances() -> Dict[str, Any]:
    """Return spot balances from Binance with 24h profit/loss in USDT and PLN."""
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

    usdt_pln = _get_usdt_to_pln_rate()

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
        balances.append(
            {
                "asset": asset,
                "quantity": total,
                "price": price,
                "value": value,
                "pnl_24h": pnl_24h,
                "price_pln": price * usdt_pln,
                "value_pln": value * usdt_pln,
                "pnl_24h_pln": pnl_24h * usdt_pln,
            }
        )

    return {"balances": balances, "usdt_pln": usdt_pln}


@router.get("/crypto/binance/klines/{symbol}")
def get_binance_klines(symbol: str, interval: str = "1h", limit: int = 168) -> Dict[str, Any]:
    """Return candlestick data for a symbol."""
    try:
        res = requests.get(
            f"{BINANCE_API_URL}/api/v3/klines",
            params={"symbol": symbol, "interval": interval, "limit": limit},
            timeout=10,
        )
        res.raise_for_status()
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    data = res.json()
    klines = [
        {
            "open_time": k[0],
            "open": float(k[1]),
            "high": float(k[2]),
            "low": float(k[3]),
            "close": float(k[4]),
        }
        for k in data
    ]
    return {"klines": klines}
