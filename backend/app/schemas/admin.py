from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AdminStatsOut(BaseModel):
    total_users: int
    total_products: int
    active_listings: int
    sold_listings: int
    total_tutors: int


class AdminUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    username: str
    email: str
    university: str
    department: str
    is_admin: bool
    created_at: datetime
