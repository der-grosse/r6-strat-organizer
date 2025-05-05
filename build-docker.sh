npm run build
docker build -t dergrosse/r6-strat-organizer:latest .

read -p "Press [Enter] to push image to docker hub ..."

docker push dergrosse/r6-strat-organizer:latest