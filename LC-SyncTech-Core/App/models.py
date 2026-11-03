from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base
import enum

class DeploymentType(enum.Enum):
    STANDALONE = "Standalone"
    ON_PREMISE = "On-Premise"
    CLOUD_CLUSTER = "Cloud_Cluster"

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    tax_id = Column(String, unique=True) # NIT o RUT
    email = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    projects = relationship("SoftwareProject", back_populates="owner")
    assets = relationship("MiddlewareAsset", back_populates="owner")

class SoftwareProject(Base):
    __tablename__ = "software_projects"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    app_name = Column(String, nullable=False)
    deployment = Column(String) # Standalone, On-Premise, Cloud
    stack = Column(String)
    
    owner = relationship("Customer", back_populates="projects")

class MiddlewareAsset(Base):
    __tablename__ = "middleware_assets"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    server_type = Column(String) # JBoss, Apache, etc.
    env = Column(String) # Prod, Dev, QA
    
    owner = relationship("Customer", back_populates="assets")