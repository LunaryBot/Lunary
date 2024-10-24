FROM postgres:16-bullseye

LABEL maintainer="DataCraze Postgres v.16 images based on postgres:15-bullseye with pg_cron and pg_vector extensions."

RUN apt-get update

RUN apt-get update \
      && apt-get install -y curl \
      && apt-get -y install postgresql-16-pgvector \
      && apt-get -y install postgresql-16-cron

RUN echo "shared_preload_libraries='pg_cron'" >> /usr/share/postgresql/postgresql.conf.sample
RUN echo "cron.database_name='lunarydb'" >> /usr/share/postgresql/postgresql.conf.sample