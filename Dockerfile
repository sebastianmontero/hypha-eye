FROM node:14.17.0
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections
RUN mkdir /code
WORKDIR /code
COPY . /code
RUN npm install
