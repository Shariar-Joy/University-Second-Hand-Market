import os

from mangum import Mangum

from app.main import app

# If API Gateway is configured with a stage name baked into the path (e.g. a REST API's
# "/prod" stage, or an HTTP API custom stage instead of $default), set API_GATEWAY_BASE_PATH
# to that prefix (e.g. "/prod") so Mangum strips it before FastAPI's router sees the path.
# Leave unset when using an HTTP API with the $default stage — no prefix is added in that case
# and endpoint paths reach FastAPI exactly as-is (e.g. /api/v1/products).
_base_path = os.environ.get("API_GATEWAY_BASE_PATH", "")

handler = Mangum(app, lifespan="auto", api_gateway_base_path=_base_path or None)
