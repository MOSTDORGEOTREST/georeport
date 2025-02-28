cd ~/georeport.ru/report_authentication
docker rm $(docker ps -a -q) -f
docker rmi $(docker images -a -q) -f
docker system prune -a -f
git pull
docker-compose up  --force-recreate --build -d
