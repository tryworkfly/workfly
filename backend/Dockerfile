FROM python:3.12 AS builder-image

# create and activate virtual environment
# using final folder name to avoid path issues with packages
RUN python -m venv /home/docker/venv
ENV PATH="/home/docker/venv/bin:$PATH"

# install requirements
RUN pip3 install --no-cache-dir wheel
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

FROM python:3.12-slim AS runner-image

RUN useradd --create-home docker
COPY --from=builder-image /home/docker/venv /home/docker/venv

USER docker
RUN mkdir /home/docker/code
WORKDIR /home/docker/code
COPY . .

EXPOSE 8000

# make sure all messages always reach console
ENV PYTHONUNBUFFERED=1

# activate virtual environment
ENV VIRTUAL_ENV=/home/docker/venv
ENV PATH="/home/docker/venv/bin:$PATH"

# /dev/shm is mapped to shared memory and should be used for gunicorn heartbeat
# this will improve performance and avoid random freezes
CMD ["python", "main.py"]