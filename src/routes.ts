import { FastifyInstance } from "fastify";
import { prisma } from "./lib/prisma";
import dotenv from 'dotenv';
import moment from 'moment';
import { z } from 'zod';

export async function appRoutes(app: FastifyInstance) {

    app.get('/health-check', async () => {
        const databaseDate = await prisma.punishment.count();
        return 'SERVER RUNNING!'
    });
    
    app.get('/punishments', async () => {
        const habits = await prisma.punishment.findMany();

        return habits;
    });

    app.get('/findIdCastigadoActiveByName', async (request) => {
        const getPunishmentParams = z.object({
            nomeCastigado: z.string()
        });
        
        const { nomeCastigado } = getPunishmentParams.parse(request.query);
        
        const castigado = await prisma.punishment.findFirst({
            where: {
                punished_name: {
                    equals: nomeCastigado,
                    mode: 'insensitive'
                },
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

        const punished = getPunishmentBody.parse(request.body);

        const castigado = await prisma.punishment.create({
            data: {
                created_at: punished.createdAt,
                punished_name: punished.punishedName,
                qtt_days: punished.qttDays,
                active: punished.active,
            }
        });

        return castigado;
    });

    app.get('/getValidadeCastigo', async (request) => {
        const getPunishmentParams = z.object({
            nomeCastigado: z.string()
        });
        
        const { nomeCastigado } = getPunishmentParams.parse(request.query);
        
        const castigado = await prisma.punishment.findFirst({
            where: {
                punished_name: {
                    equals: nomeCastigado,
                    mode: 'insensitive'
                },
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
            senha: z.string()
        });
        
        const { nome, senha } = getResetParams.parse(request.query);

        console.log(`Nome: ${nome} - Senha: ${senha} - ENV_PASS: ${process.env.RESET_PASSWORD}`);

        if(senha === process.env.RESET_PASSWORD) {
            await prisma.punishment.updateMany({
                where: {
                    punished_name: {
                        equals: nome,
                        mode: 'insensitive'
                    },
                    active: true
                },
                data: { active: false },
            });
        }

        return reply.status(200).send();
    });
}