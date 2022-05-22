# 🍺 Beer Tally 🍺
A website to keep track of your friend group's evening/night (or day, who am I to judge lol).

This little project is not very polished since I mostly made it in a single day and deemed 'good enough'.

## Getting Started
### Docker
```bash
docker run -e REDIS_HOST=redis://[redis] -p 3000:3000 xenomer/beer-tally
```

### Run locally
First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## License
