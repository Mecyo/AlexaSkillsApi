import Fastify from "fastify";
import dotenv from 'dotenv';
import cors from '@fastify/cors';
import { appRoutes } from './routes'


dotenv.config();

const app = Fastify();

app.register(cors);
app.register(appRoutes);


//Porta liberada para o servidor
const port = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 3333;

//Host que será associado ao servidor
const host = process.env.SERVER_HOST || '0.0.0.0';

app.listen({
    host: host,
    port: port,
}).then(() => {
    console.log(`HTTP Server host: ${host} running on port ${port}!`);
});