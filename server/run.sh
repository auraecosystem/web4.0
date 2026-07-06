echo "===== PostgreSQL Version ====="
psql -c "SELECT version();"
echo
echo "===== CPU ====="
lscpu
echo
echo "===== Memory ====="
free -h
echo
echo "===== Storage ====="
lsblk -o NAME,SIZE,TYPE,ROTA,MOUNTPOINT
echo
echo "===== Operating System ====="
cat /etc/os-release
echo
echo "===== PostgreSQL Config File ====="
psql -c "SHOW config_file;"
echo
echo "===== Data Directory ====="
psql -c "SHOW data_directory;"
echo
echo "===== Current Settings ====="
psql -c "SHOW max_connections;"
psql -c "SHOW shared_buffers;"
psql -c "SHOW effective_cache_size;"
psql -c "SHOW work_mem;"
psql -c "SHOW maintenance_work_mem;"
psql -c "SHOW wal_level;"
psql -c "SHOW max_wal_size;"
psql -c "SHOW checkpoint_timeout;"
