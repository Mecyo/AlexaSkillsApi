import { FastifyInstance } from "fastify";
import { prisma } from "./lib/prisma";
import dotenv from 'dotenv';
import moment, { now } from 'moment';
import { z } from 'zod';

dotenv.config();

export async function appRoutes(app: FastifyInstance) {

    app.get('/health-check', async () => {
        const databaseDate = await prisma.punishment.count();
        return 'SERVER RUNNING!'
    });

    /*
        
    
     
    
    async function verifyPassword(password, userId)*/

    app.get('/verifyPassword', async (request) => {
        const getUserParams = z.object({
            userId: z.coerce.number(),
            password: z.string()
        });

        const { userId, password } = getUserParams.parse(request.query);

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            }
        });

        return user && user.senha === password;
    });
    
    app.put('/createUser', async (request) => {
        const getUserParams = z.object({
            username: z.string(),
            password: z.string()
        });

        const { username, password } = getUserParams.parse(request.query);

        const user = await prisma.user.create({
            data:{
                created_at: new Date(),
                name: username,
                senha: password,
                active: true
            }
        });

        return user;
    });

    app.get('/punishments', async () => {
        const punishments = await prisma.punishment.findMany();

        return punishments;
    });

    app.get('/findIdCastigadoActiveByName', async (request) => {
        const getPunishmentParams = z.object({
            nomeCastigado: z.string(),
            userId: z.coerce.number()
        });
        
        const { nomeCastigado, userId } = getPunishmentParams.parse(request.query);
        
        const castigado = await prisma.punishment.findFirst({
            where: {
                punished_name: {
                    equals: nomeCastigado,
                    mode: 'insensitive'
                },
                userId: userId,
                active: true
            },
            select: {
                id: true,
            },
        });

        const idCastigado = castigado ? castigado.id : undefined;
        
        return idCastigado;
    });

    app.patch('/incrementCastigoById', async (request) => {
        const getPunishmentParams = z.object({
            idCastigado: z.coerce.number(),
            diasCastigo: z.coerce.number(),
        });
        
        const { idCastigado, diasCastigo } = getPunishmentParams.parse(request.query);
        
        const castigado = await prisma.punishment.update({
            where: {
                id: idCastigado,
            },
            data: {
                qtt_days: {
                    increment: diasCastigo
                },
            },
        });

        return castigado.qtt_days;
    });

    app.patch('/updateCastigo', async (request) => {
        const getPunishmentBody = z.object({
            id: z.number(),
            created_at: z.coerce.date().optional(),
            punished_name: z.string().optional(),
            qtt_days: z.number().optional(),
            active: z.boolean().optional()
        });

        const punished = getPunishmentBody.parse(request.body);

        const castigado = await prisma.punishment.update({
            where: {
                id: punished.id,
            },
            data: punished,
        });

        return castigado.qtt_days;
    });

    app.post('/insertCastigo', async (request) => {
        const getPunishmentBody = z.object({
            createdAt: z.coerce.date().optional().default(new Date()),
            punishedName: z.string(),
            qttDays: z.number(),
            active: z.boolean().optional().default(true)
        });

        const getPunishmentParams = z.object({
            userId: z.coerce.number()
        });

        const punished = getPunishmentBody.parse(request.body);

        const { userId } = getPunishmentParams.parse(request.query);

        const castigado = await prisma.punishment.create({
            data: {
                created_at: punished.createdAt,
                punished_name: punished.punishedName,
                qtt_days: punished.qttDays,
                active: punished.active,
                userId: userId
            }
        });

        return castigado;
    });

    app.get('/getValidadeCastigo', async (request) => {
        const getPunishmentParams = z.object({
            nomeCastigado: z.string(),
            userId: z.coerce.number()
        });
        
        const { nomeCastigado, userId } = getPunishmentParams.parse(request.query);
        
        const castigado = await prisma.punishment.findFirst({
            where: {
                punished_name: {
                    equals: nomeCastigado,
                    mode: 'insensitive'
                },
                userId: userId,
                active: true
            },
            select: {
                created_at: true,
                qtt_days: true
            },
        });

        if(castigado) {
            const startDate = castigado.created_at;
            startDate.setDate(startDate.getDate() + castigado.qtt_days);

            const validadeCastigo = moment(startDate.toISOString().split("T")[0]).format('DD/MM/YYYY');
            
            return validadeCastigo;
        }

        return;
    });

    app.get('/getAllValidadeCastigo', async (request) => {
        const getPunishmentParams = z.object({
            userId: z.coerce.number()
        });
        
        const { userId } = getPunishmentParams.parse(request.query);
        const castigados = await prisma.punishment.findMany({
            where: {
                active: true,
                userId: userId
            },
            select: {
                punished_name: true,
                created_at: true,
                qtt_days: true
            },
        });

        if(castigados && Array.isArray(castigados)) {
            castigados.forEach(castigado => {
                const startDate = castigado.created_at;
                startDate.setDate(startDate.getDate() + castigado.qtt_days);
    
                Object.assign(castigado, {validadeCastigo: moment(startDate.toISOString().split("T")[0]).format('DD/MM/YYYY')});
            });
        }
        
        return castigados;
    });

    app.get('/resetAllPunishments', async (request, reply) => {
        const getResetParams = z.object({
            senha: z.string()
        });
        
        const { senha } = getResetParams.parse(request.query);

        if(senha === process.env.RESET_PASSWORD) {
            await prisma.punishment.updateMany({
                data: { active: false },
            });
        }

        return reply.status(200).send();
    });

    app.get('/resetPunishmentByName', async (request, reply) => {
        const getResetParams = z.object({
            nome: z.string(),
            userId: z.coerce.number()
        });
        
        const { nome, userId } = getResetParams.parse(request.query);

        await prisma.punishment.updateMany({
            where: {
                punished_name: {
                    equals: nome,
                    mode: 'insensitive'
                },
                userId: userId,
                active: true
            },
            data: { active: false },
        });

        return reply.status(200).send();
    });
}