cd ~/georeport.ru/report_authentication
docker rm $(docker ps -a -q) -f
docker rmi $(docker images -a -q) -f
docker system prune -a -f
git pull
docker-compose -f docker-compose-test.yml up --build -d
