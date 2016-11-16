FROM golang:1.7.3 

ADD . /app 

WORKDIR /app/src

RUN go get -v -d
RUN go build -o bin/main .

EXPOSE 8080

ENTRYPOINT bin/main
 
