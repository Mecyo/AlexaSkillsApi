import Fastify from "fastify";
import dotenv from 'dotenv';
import cors from '@fastify/cors';
import { appRoutes } from './routes'


dotenv.config();

const app = Fastify();

app.register(cors);
app.register(appRoutes);


//Porta liberada para o servidor
const port = process.env.SERVER_PORT ? Number.parseInt(process.env.SERVER_PORT) : 3333;

app.listen({
    port: port,
}).then(() => {
    console.log(`HTTP Server running on port ${port}!`);
});