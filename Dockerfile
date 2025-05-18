FROM node:lts-buster
USER root
RUN apt-get update && \
    apt-get install -y ffmpeg webp git && \
    apt-get upgrade -y && \
    rm -rf /var/lib/apt/lists/*
USER node
RUN git clone https://github.com/MRSHABAN40/SHABAN-MD.git /home/node/SHABAN-MD
WORKDIR /home/node/SHABAN-MD
RUN chmod -R 777 /home/node/SHABAN-MD/
RUN yarn install --network-concurrency 1
EXPOSE 7860
ENV NODE_ENV=production
CMD ["npm", "start"]
