from sqlalchemy import Column, Integer, String, Date
from datetime import date
from .database import Base

class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    company = Column(String, index=True)
    role = Column(String, index=True)
    status = Column(String, default="Applied")  # Applied, Interview, Offer, Rejected
    date_applied = Column(Date, default=date.today)
    notes = Column(String, nullable=True)
