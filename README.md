# forTest

## Todo

1. namespace 전체적으로 pod 조회하도록
2. DB 다이어그램 작성 및 각각의 데이터 정의 ( pod에서 ip 스키마에서 제외할지 고려중)
3. watch-api로 변경시마다 감지하도록 설정
4. redis 조회 방식 설정, expires 설정

## 시간상 가능하면,

Backstage.io로 검색 가능한 대시보드 작성

### MongoDB 실행 명령어

```
docker run --name mongodb-container -v $(pwd)/mongoDB:/data/db -d -p 27017:27017 mongo
```
