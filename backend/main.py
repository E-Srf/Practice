import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from backend.routers import auth, users, accounts, trades, risk
from backend.routers import rules, equity_logs, challenges, risk_alerts

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Risk Management Platform API",
    version="1.0.0",
    description="Backend API for prop trading risk management",
)

# ---- CORS ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Global exception handlers — consistent JSON for ALL errors ----

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "data": None, "message": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    # Extract first missing field name for a readable message
    first = errors[0] if errors else {}
    field = first.get("loc", ["unknown"])[-1]
    msg = f"Field '{field}' is required" if first.get("type") == "missing" else str(first.get("msg", "Validation error"))
    return JSONResponse(
        status_code=400,
        content={"success": False, "data": None, "message": msg},
    )


# ---- Routers ----
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(accounts.router)
app.include_router(rules.router)
app.include_router(trades.router)
app.include_router(equity_logs.router)
app.include_router(challenges.router)
app.include_router(risk_alerts.router)
app.include_router(risk.router)


@app.get("/", tags=["Health"])
def health_check():
    return {"success": True, "data": None, "message": "Risk Management API is running"}
