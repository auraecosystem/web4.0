createdb gucs && \
pg_restore -d gucs -x -O -U postgres gucs.pgdump && \
psql -d gucs -U postgres -f script.odp
