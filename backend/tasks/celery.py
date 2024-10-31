import os
from celery import Celery

app = Celery(
    "tasks",
    broker=os.getenv("RABBITMQ_BROKER_URL"),
    include=["tasks.tasks"],
)
