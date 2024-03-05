### MongoDB 실행 명령어

```
docker run --name mongodb-container -v $(pwd)/mongoDB:/data/db -d -p 27017:27017 mongo
```
