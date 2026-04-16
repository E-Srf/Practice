from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import users, accounts, trades, risk

app = FastAPI(
    title="Risk Management Platform API",
    version="1.0.0",
    description="Backend API for prop trading risk management",
)

# ---- CORS ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # restrict to your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Routers ----
app.include_router(users.router)
app.include_router(accounts.router)
app.include_router(trades.router)
app.include_router(risk.router)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "Risk Management API is running"}
